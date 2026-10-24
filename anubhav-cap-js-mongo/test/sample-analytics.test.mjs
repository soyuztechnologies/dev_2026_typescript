/**
 * The analytics functions and the freestyle sap.viz app (app/analyticapp) of samples/bookshop.
 */
import { describe, test, after } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import fs from 'node:fs'
import cds from '@sap/cds'
import { MongoMemoryReplSet } from 'mongodb-memory-server'

const app = path.join(import.meta.dirname, '..', 'samples', 'bookshop')

const link = path.join(app, 'node_modules', '@anubhav-cap-js', 'mongo')
if (!fs.existsSync(link)) {
  fs.mkdirSync(path.dirname(link), { recursive: true })
  fs.symlinkSync(path.join(import.meta.dirname, '..'), link, 'junction')
}

// CDS_CONFIG wins over a local .cdsrc-private.json -> the tests never touch a real cluster
const rs = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } })
process.env.CDS_CONFIG = JSON.stringify({ requires: { 'anubhav-mongo': { url: rs.getUri(), credentials: null } } })
const { GET } = cds.test(app)
after(() => rs.stop())

const call = async fn => (await GET(`/analytics/${fn}()`)).data.value
const sum = (rows, k) => Math.round(rows.reduce((s, r) => s + r[k], 0) * 100) / 100

describe('analytics functions of the sample', () => {
  test('salesByRegion: totals per region, ordered by amount', async () => {
    const rows = await call('salesByRegion')
    assert.deepEqual(rows.map(r => r.region), ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa'])
    assert.deepEqual(rows[0], { region: 'North America', quantity: 258, amount: 3261.75 })
    assert.equal(sum(rows, 'amount'), 10188.85)
    assert.equal(sum(rows, 'quantity'), 880)
  })

  test('salesByDay: one row per day, ordered by date', async () => {
    const rows = await call('salesByDay')
    assert.equal(rows.length, 14)
    assert.deepEqual(rows[0], { date: '2026-10-01', quantity: 40, amount: 474.45 })
    assert.deepEqual(rows.map(r => r.date), [...rows.map(r => r.date)].sort())
    assert.equal(sum(rows, 'amount'), 10188.85)
  })

  test('salesByBook: book titles resolved via $lookup, ordered by amount', async () => {
    const rows = await call('salesByBook')
    assert.deepEqual(rows.map(r => r.book), ['Eleonora', 'The Raven', 'Jane Eyre', 'Wuthering Heights', 'Catweazle'])
    assert.deepEqual(rows[0], { book: 'Eleonora', quantity: 206, amount: 3296 })
    assert.equal(sum(rows, 'quantity'), 880)
  })

  test('stockByBook: stock per book, ordered by stock', async () => {
    const rows = await call('stockByBook')
    assert.deepEqual(rows, [
      { book: 'Eleonora', stock: 555 },
      { book: 'The Raven', stock: 333 },
      { book: 'Catweazle', stock: 22 },
      { book: 'Wuthering Heights', stock: 12 },
      { book: 'Jane Eyre', stock: 11 }
    ])
  })

  test('Sales can be read and aggregated with OData $apply', async () => {
    const { data } = await GET('/analytics/Sales?$apply=groupby((region),aggregate(quantity with sum as units))&$orderby=units desc&$top=1')
    assert.equal(data.value[0].region, 'Europe')
    assert.equal(data.value[0].units, 270)
  })
})

describe('analyticapp', () => {
  test('is served as static web app with a sap.viz dependency', async () => {
    const { data: html } = await GET('/analyticapp/webapp/index.html')
    assert.match(html, /sap-ui-core\.js/)
    const { data: manifest } = await GET('/analyticapp/webapp/manifest.json')
    assert.equal(manifest['sap.app'].dataSources.analytics.uri, '/analytics/')
    assert.ok(manifest['sap.ui5'].dependencies.libs['sap.viz'])
  })

  test('every function used by the controller exists in the service', async () => {
    const { data: controller } = await GET('/analyticapp/webapp/controller/Main.controller.js')
    const used = [...controller.matchAll(/'(\w+)'(?=[,\]])/g)].map(m => m[1]).filter(n => /^(sales|stock)By/.test(n))
    assert.deepEqual(used, ['salesByRegion', 'stockByBook', 'salesByDay', 'salesByBook'])
    const { data: metadata } = await GET('/analytics/$metadata')
    for (const fn of used) assert.match(metadata, new RegExp(`<FunctionImport Name="${fn}"`))
  })
})
