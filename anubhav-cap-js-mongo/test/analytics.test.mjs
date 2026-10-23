/**
 * Analytical CQL and OData $apply queries on MongoDB must return the same results as on SQLite.
 * The reference results in analytics/expected.json were produced with @cap-js/sqlite.
 */
import { describe, test, after } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import cds from '@sap/cds'
import { MongoMemoryReplSet } from 'mongodb-memory-server'

const require = createRequire(import.meta.url)
const app = path.join(import.meta.dirname, 'analytics')
const { cql, odata, unordered } = require('./analytics/queries.cjs')
const expected = JSON.parse(fs.readFileSync(path.join(app, 'expected.json'), 'utf8'))

const link = path.join(app, 'node_modules', '@anubhav-cap-js', 'mongo')
if (!fs.existsSync(link)) {
  fs.mkdirSync(path.dirname(link), { recursive: true })
  fs.symlinkSync(path.join(import.meta.dirname, '..'), link, 'junction')
}

const rs = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } })
process.env.MONGODB_URI = rs.getUri()
const { GET } = cds.test(app)
after(() => rs.stop())

/** deep equality, numbers compared with tolerance (SQLite sums decimals as floating point numbers) */
function assertClose(actual, wanted, where = '') {
  if (typeof wanted === 'number' && typeof actual === 'number') {
    const ok = Math.abs(actual - wanted) <= Math.max(1e-6, Math.abs(wanted) * 1e-9)
    return assert.ok(ok, `${where}: ${actual} != ${wanted}`)
  }
  if (Array.isArray(wanted)) {
    assert.ok(Array.isArray(actual), `${where}: expected an array, got ${JSON.stringify(actual)}`)
    assert.equal(actual.length, wanted.length, `${where}: length ${JSON.stringify(actual)} vs ${JSON.stringify(wanted)}`)
    return wanted.forEach((w, i) => assertClose(actual[i], w, `${where}[${i}]`))
  }
  if (wanted && typeof wanted === 'object') {
    assert.ok(actual && typeof actual === 'object', `${where}: expected object, got ${JSON.stringify(actual)}`)
    assert.deepEqual(Object.keys(actual).sort(), Object.keys(wanted).sort(), `${where}: keys of ${JSON.stringify(actual)}`)
    return Object.keys(wanted).forEach(k => assertClose(actual[k], wanted[k], `${where}.${k}`))
  }
  assert.equal(actual, wanted, where)
}

const sorted = rows => [...rows].sort((a, b) => (JSON.stringify(a) < JSON.stringify(b) ? -1 : 1))

describe('analytical CQL queries (same results as SQLite)', () => {
  for (const [name, fn] of Object.entries(cql)) {
    test(name, async () => {
      const db = await cds.connect.to('db')
      const ref = expected.cql[name]
      const result = await db.run(fn(cds.ql))
      const plain = JSON.parse(JSON.stringify(result ?? null))
      assertClose(unordered.has(name) ? sorted(plain) : plain, unordered.has(name) ? sorted(ref.result) : ref.result, name)
      if (ref.$count !== undefined) assert.equal(result.$count, ref.$count, `${name}: $count`)
    })
  }
})

describe('OData $apply, $orderby, $top, $skip (same results as SQLite)', () => {
  for (const [name, url] of Object.entries(odata)) {
    test(name, async () => {
      const { status, data } = await GET(url)
      delete data['@odata.context']
      assert.equal(status, expected.odata[name].status)
      assertClose(data, expected.odata[name].body, name)
    })
  }
})
