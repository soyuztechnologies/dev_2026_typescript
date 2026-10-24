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
const round = n => Math.round(n * 100) / 100
const sum = (rows, k) => round(rows.reduce((s, r) => s + r[k], 0))
const admin = { auth: { username: 'alice' } }

// expected values are computed from the csv files of the sample
const csv = name => {
  const [header, ...lines] = fs
    .readFileSync(path.join(app, 'db', 'data', `anubhav.bookshop-${name}.csv`), 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
  const split = line => [...line.matchAll(/(?:^|;)("(?:[^"]|"")*"|[^;]*)/g)].map(m => m[1].replace(/^"|"$/g, '').replace(/""/g, '"'))
  const cols = split(header)
  return lines.map(line => Object.fromEntries(split(line).map((v, i) => [cols[i], v])))
}
const books = csv('Books')
const sales = csv('Sales')
const titles = Object.fromEntries(books.map(b => [b.ID, b.title]))
const totals = key => {
  const by = {}
  for (const s of sales) {
    const t = (by[key(s)] ??= { quantity: 0, amount: 0 })
    t.quantity += +s.quantity
    t.amount += +s.amount
  }
  return Object.entries(by).map(([k, t]) => ({ key: k, quantity: t.quantity, amount: round(t.amount) }))
}
const byAmount = rows => rows.toSorted((a, b) => b.amount - a.amount)
const totalQuantity = sales.reduce((s, r) => s + +r.quantity, 0)
const totalAmount = round(sales.reduce((s, r) => s + +r.amount, 0))
const rounded = rows => rows.map(r => ({ ...r, amount: round(r.amount) }))

describe('analytics functions of the sample', () => {
  test('salesByRegion: totals per region, ordered by amount', async () => {
    const rows = rounded(await call('salesByRegion'))
    const expected = byAmount(totals(s => s.region)).map(({ key, ...t }) => ({ region: key, ...t }))
    assert.deepEqual(rows, expected)
    assert.equal(sum(rows, 'amount'), totalAmount)
    assert.equal(sum(rows, 'quantity'), totalQuantity)
  })

  test('salesByDay: one row per day, ordered by date', async () => {
    const rows = rounded(await call('salesByDay'))
    const expected = totals(s => s.date)
      .map(({ key, ...t }) => ({ date: key, ...t }))
      .sort((a, b) => a.date.localeCompare(b.date))
    assert.equal(rows.length, expected.length)
    assert.deepEqual(rows, expected)
    assert.equal(sum(rows, 'amount'), totalAmount)
  })

  test('salesByBook: book titles resolved via $lookup, ordered by amount', async () => {
    const rows = rounded(await call('salesByBook'))
    const expected = byAmount(totals(s => titles[s.book_ID])).map(({ key, ...t }) => ({ book: key, ...t }))
    assert.deepEqual(rows, expected)
    assert.equal(sum(rows, 'quantity'), totalQuantity)
  })

  test('stockByBook: stock per book, ordered by stock', async () => {
    const rows = await call('stockByBook')
    assert.equal(rows.length, books.length)
    for (let i = 1; i < rows.length; i++) assert.ok(rows[i - 1].stock >= rows[i].stock, 'ordered by stock desc')
    const key = r => `${r.book}|${r.stock}`
    assert.deepEqual(rows.map(key).sort(), books.map(b => key({ book: b.title, stock: +b.stock })).sort())
  })

  test('Sales can be read and aggregated with OData $apply', async () => {
    const { data } = await GET('/analytics/Sales?$apply=groupby((region),aggregate(quantity with sum as units))&$orderby=units desc&$top=1')
    const [top] = totals(s => s.region).sort((a, b) => b.quantity - a.quantity)
    assert.equal(data.value[0].region, top.key)
    assert.equal(data.value[0].units, top.quantity)
  })
})

describe('test data of the sample', () => {
  test('books, orders, order items and sales are loaded completely', async () => {
    const count = async (url, opts) => (await GET(`${url}?$count=true&$top=0`, opts)).data['@odata.count']
    assert.equal(await count('/browse/Books'), books.length)
    assert.equal(await count('/analytics/Sales'), sales.length)
    assert.equal(await count('/admin/Orders', admin), csv('Orders').length)
    const { OrderItems } = cds.entities('anubhav.bookshop')
    assert.equal((await SELECT.one.from(OrderItems).columns('count(*) as n')).n, csv('OrderItems').length)
  })

  test('every order has 2-5 items and its total is the sum of the item amounts', async () => {
    const { OrderItems } = cds.entities('anubhav.bookshop')
    const rows = await SELECT.from(OrderItems).columns('parent_ID', 'count(*) as items', 'sum(amount) as amount').groupBy('parent_ID')
    const orders = csv('Orders')
    assert.equal(rows.length, orders.length)
    const total = Object.fromEntries(orders.map(o => [o.ID, +o.total]))
    for (const r of rows) {
      assert.ok(r.items >= 2 && r.items <= 5, `order ${r.parent_ID} has ${r.items} items`)
      assert.equal(round(r.amount), total[r.parent_ID])
    }
  })

  test('an order can be read with its items as a deep document', async () => {
    const [order] = csv('Orders')
    const { data } = await GET(`/admin/Orders(ID=${order.ID},IsActiveEntity=true)?$expand=items($expand=book($select=title))`, admin)
    assert.equal(data.OrderNo, order.OrderNo)
    assert.equal(data.buyer, order.buyer)
    assert.ok(data.items.length >= 2 && data.items.length <= 5)
    assert.ok(data.items.every(i => i.book?.title))
  })

  test('books and genres have Hindi translations', async () => {
    const hi = { headers: { 'accept-language': 'hi' } }
    const texts = csv('Books_texts').filter(t => t.locale === 'hi')
    assert.deepEqual(texts.map(t => t.ID).sort(), books.map(b => b.ID).sort(), 'one Hindi text per book')
    for (const t of [texts[0], texts.at(-1), texts[42]]) {
      const { data } = await GET(`/browse/Books(${t.ID})?$select=title,descr`, hi)
      assert.ok(data.title.startsWith(t.title), `${data.title} is the Hindi title`)
      assert.equal(data.descr, t.descr)
    }
    const { data } = await GET('/admin/Genres(32)', { ...admin, ...hi })
    assert.equal(data.name, 'इलेक्ट्रॉनिक्स एवं संचार')
    const { data: en } = await GET('/browse/Books(1001)?$select=title')
    assert.ok(!/[\u0900-\u097F]/.test(en.title), 'English without accept-language')
  })

  test('stockByGenre covers the new engineering genres', async () => {
    const rows = await call('stockByGenre')
    const genres = rows.map(r => r.genre)
    for (const g of ['Algorithms & Programming', 'Signals & Communication', 'VLSI & Embedded Systems']) assert.ok(genres.includes(g), g)
    assert.equal(rows.reduce((s, r) => s + r.books, 0), books.length)
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
