/**
 * Security tests: authorization filters, NoSQL injection, prototype pollution, type confusion,
 * regex abuse and information disclosure.
 */
import { describe, test, after } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import cds from '@sap/cds'
import { MongoMemoryReplSet } from 'mongodb-memory-server'

const require = createRequire(import.meta.url)
const link = path.join(import.meta.dirname, 'bookshop', 'node_modules', '@anubhav-cap-js', 'mongo')
if (!fs.existsSync(link)) {
  fs.mkdirSync(path.dirname(link), { recursive: true })
  fs.symlinkSync(path.join(import.meta.dirname, '..'), link, 'junction')
}

const rs = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } })
process.env.MONGODB_URI = rs.getUri()
const { GET, POST } = cds.test(path.join(import.meta.dirname, 'bookshop'))
after(() => rs.stop())

const Authors = 'sap.capire.bookshop.Authors'
const Books = 'sap.capire.bookshop.Books'
const ids = rows => rows.map(r => r.ID).sort()

describe('authorization filters (@restrict where with $user attributes)', () => {
  test('user with the attribute sees only matching rows', async () => {
    const { data } = await GET('/restricted/Authors?$select=ID', { auth: { username: 'carol' } })
    assert.deepEqual(ids(data.value), [101, 107])
  })

  test('user WITHOUT the attribute sees no rows (not the rows where the column is null)', async () => {
    const { data } = await GET('/restricted/Authors?$select=ID', { auth: { username: 'alice' } })
    assert.deepEqual(data.value, [])
  })

  test('CQL: comparing with a missing session attribute matches nothing, like SQL', async () => {
    const rows = await cds.tx({ user: new cds.User({ id: 'x', attr: {} }) }, tx => tx.run(SELECT.from(Authors).columns('ID').where('address_city = $user.city')))
    assert.deepEqual(rows, [])
  })

  test('literal null still means "is null"', async () => {
    const rows = await SELECT.from(Authors).columns('ID').where({ address_city: null })
    assert.deepEqual(ids(rows), [170])
  })
})

describe('NoSQL injection', () => {
  test('operator objects as filter values are compared literally', async () => {
    for (const evil of [{ $ne: null }, { $gt: '' }, { $regex: '.*' }, { $where: 'true' }]) {
      const rows = await cds.run(SELECT.from(Authors).columns('ID').where({ name: { '=': evil } })).catch(e => e)
      assert.ok(rows instanceof Error || rows.length === 0, `${JSON.stringify(evil)} must not match all rows`)
    }
  })

  test('OData string values with operator syntax are plain strings', async () => {
    const { data } = await GET(`/browse/Books?$filter=title eq '{"$ne":null}'&$select=ID`)
    assert.deepEqual(data.value, [])
  })

  test('$search terms and contains() are escaped (no regex injection)', async () => {
    let { data } = await GET(`/browse/Books?$search=.*&$select=ID`)
    assert.deepEqual(data.value, [])
    ;({ data } = await GET(`/browse/Books?$filter=contains(title,'.*')&$select=ID`))
    assert.deepEqual(data.value, [])
  })

  test('unknown or $-prefixed field names are rejected', async () => {
    await assert.rejects(cds.run(SELECT.from(Authors).where({ $where: 'sleep(1000)' })), e => e.status === 400)
    await assert.rejects(cds.run({ SELECT: { from: { ref: [Authors] }, where: [{ ref: ['address', '$where'] }, '=', { val: 1 }] } }), e => e.status === 400)
  })

  test('operator objects in data are rejected for string elements', async () => {
    await assert.rejects(cds.run(INSERT.into(Authors).entries({ ID: 9001, name: { $gt: '' } })), e => e.status === 400)
    const r = await SELECT.one.from(Authors, 9001)
    assert.equal(r, undefined)
  })

  test('unknown fields in data (e.g. _id, $set) are ignored', async () => {
    await INSERT.into(Authors).entries({ ID: 9002, name: 'x', _id: 'evil', $set: { name: 'hacked' } })
    const doc = await cds.db.native(({ collection, session }) => collection(Authors).findOne({ ID: 9002 }, { session }))
    assert.notEqual(doc._id, 'evil')
    assert.equal(doc.$set, undefined)
    await DELETE.from(Authors, 9002)
  })
})

describe('prototype pollution', () => {
  test('__proto__ keys in stored sub-documents do not change returned objects', async () => {
    await cds.db.native(({ collection, session }) =>
      collection(Authors).insertOne({ ID: 9003, name: 'proto', address_street: { ['__proto__']: { isAdmin: true }, constructor: { prototype: { x: 1 } } } }, { session })
    )
    const { fromBSON } = require('../lib/converters')
    const doc = await cds.db.native(({ collection, session }) => collection(Authors).findOne({ ID: 9003 }, { session }))
    const v = fromBSON(undefined, doc.address_street)
    assert.equal(v.isAdmin, undefined)
    assert.equal({}.isAdmin, undefined)
    assert.equal(Object.getPrototypeOf(v), Object.prototype)
    await DELETE.from(Authors, 9003)
  })
})

describe('regular expressions from clients', () => {
  test('invalid patterns give 400, not 500', async () => {
    await assert.rejects(cds.run({ SELECT: { from: { ref: [Books] }, where: [{ func: 'matchesPattern', args: [{ ref: ['title'] }, { val: '([a-z' }] }] } }), e => e.status === 400)
  })

  test('overly long patterns are rejected', async () => {
    await assert.rejects(cds.run({ SELECT: { from: { ref: [Books] }, where: [{ func: 'matchesPattern', args: [{ ref: ['title'] }, { val: 'a'.repeat(5000) }] }] } }), e => e.status === 400)
  })
})

describe('information disclosure', () => {
  test('error responses contain no internal properties', async () => {
    const res = await POST('/admin/Authors', { ID: 101, name: 'dup' }, { auth: { username: 'alice' } }).catch(e => e.response)
    assert.equal(res.status, 400)
    const body = JSON.stringify(res.data)
    assert.ok(!/cause|keyValue|stack|MongoServerError|E11000/.test(body), body)
  })

  test('connection errors never contain credentials or url parameters', async () => {
    const { maskUrl, translate } = require('../lib/errors')
    const url = 'mongodb+srv://user:topsecret@cluster0.x.mongodb.net/db?authMechanismProperties=AWS_SESSION_TOKEN:tok123'
    assert.ok(!/topsecret|tok123/.test(maskUrl(url)))
    const e = translate(Object.assign(new Error('querySrv ENOTFOUND'), { name: 'MongoServerSelectionError' }), { url })
    assert.ok(!/topsecret|tok123/.test(e.message), e.message)
  })

  test('the connection is described without credentials', async () => {
    assert.ok(!/:[^/@*]+@/.test(cds.db.url4()), cds.db.url4())
  })
})
