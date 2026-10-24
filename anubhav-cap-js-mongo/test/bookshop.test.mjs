import { describe, test, after } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import cds from '@sap/cds'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import fs from 'node:fs'

// the test app uses the plugin like an installed npm package -> link it into its node_modules
const link = path.join(import.meta.dirname, 'bookshop', 'node_modules', '@anubhav-cap-js', 'mongo')
if (!fs.existsSync(link)) {
  fs.mkdirSync(path.dirname(link), { recursive: true })
  fs.symlinkSync(path.join(import.meta.dirname, '..'), link, 'junction')
}

// in-memory MongoDB replica set (with transaction support) for the tests
const rs = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } })
process.env.MONGODB_URI = rs.getUri()
const { GET, POST, PATCH, PUT, DELETE: DEL } = cds.test(path.join(import.meta.dirname, 'bookshop'))
after(() => rs.stop()) // after cds.test's shutdown hook, which disconnects from MongoDB
const admin = { auth: { username: 'alice' } }

describe('reading data', () => {
  test('initial data was loaded from csv files', async () => {
    const { data } = await GET('/browse/Books?$orderby=ID')
    assert.equal(data.value.length, 5)
    assert.deepEqual(
      data.value.map(b => b.ID),
      [201, 207, 251, 252, 271]
    )
  })

  test('projection with path expression column (author.name as author)', async () => {
    const { data } = await GET('/browse/Books(201)')
    assert.equal(data.title, 'Wuthering Heights')
    assert.equal(data.author, 'Emily Brontë')
    assert.equal(data.price, '11.11')
    assert.equal(data.currency_code, 'GBP')
    assert.equal(data.createdBy, undefined)
  })

  test('calculated element (value = price * stock)', async () => {
    const { data } = await GET('/browse/Books(251)?$select=ID,value')
    assert.equal(Number(data.value), 4372.29)
  })

  test('$filter, $orderby, $top, $skip, $count', async () => {
    const { data } = await GET(`/browse/Books?$filter=stock gt 20 and contains(title,'e')&$orderby=price desc&$top=2&$skip=0&$count=true`)
    assert.equal(data['@odata.count'], 3)
    assert.deepEqual(
      data.value.map(b => b.ID),
      [271, 252]
    )
  })

  test('projection on a projection with path expression (ListOfBooks on Books { author.name as author })', async () => {
    let { data } = await GET(`/browse/ListOfBooks?$select=ID,title,author&$orderby=ID&$top=2`)
    assert.deepEqual(data.value, [
      { ID: 201, title: 'Wuthering Heights', author: 'Emily Brontë' },
      { ID: 207, title: 'Jane Eyre', author: 'Charlotte Brontë' }
    ])
    ;({ data } = await GET(`/browse/ListOfBooks(251)?$select=author`))
    assert.equal(data.author, 'Edgar Allen Poe')
    ;({ data } = await GET(`/browse/ListOfBooks?$filter=author eq 'Edgar Allen Poe'&$orderby=author,ID&$select=ID`))
    assert.deepEqual(data.value.map(b => b.ID), [251, 252])
    ;({ data } = await GET(`/browse/ListOfBooks?$apply=groupby((author),aggregate(stock with sum as stock))&$orderby=stock desc&$top=1`))
    assert.deepEqual(data.value, [{ author: 'Edgar Allen Poe', stock: 888 }])
  })

  test('$top=0 with $count returns only the count', async () => {
    const { data } = await GET(`/browse/Books?$filter=stock gt 20&$top=0&$count=true`)
    assert.equal(data['@odata.count'], 3)
    assert.deepEqual(data.value, [])
  })

  test('$filter on path expressions (author/name)', async () => {
    const { data } = await GET(`/admin/Books?$filter=author/name eq 'Edgar Allen Poe' and IsActiveEntity eq true&$select=ID`, admin)
    assert.deepEqual(data.value.map(b => b.ID).sort(), [251, 252])
  })

  test('$filter with any() lambda', async () => {
    const { data } = await GET(`/admin/Authors?$filter=books/any(b:b/stock gt 500)&$select=ID`, admin)
    assert.deepEqual(
      data.value.map(a => a.ID),
      [150]
    )
  })

  test('$filter with any() / all() lambdas: negation, nesting, paths, $apply, $count, $expand', async () => {
    const ids = async (url, user = admin) => (await GET(url, user)).data.value.map(a => a.ID)
    const authors = f => ids(`/admin/Authors?$filter=${f}&$select=ID&$orderby=ID`)
    assert.deepEqual(await authors('books/any()'), [101, 107, 150, 170])
    assert.deepEqual(await authors('not books/any(b:b/stock gt 500)'), [101, 107, 170])
    assert.deepEqual(await authors('books/all(b:b/stock gt 100)'), [150])
    assert.deepEqual(await authors('not books/all(b:b/stock gt 100)'), [101, 107, 170])
    assert.deepEqual(await authors('books/all(b:b/stock gt 1000)'), [])
    assert.deepEqual(await authors('books/any(b:b/stock gt 100 and b/price lt 14) or ID eq 101'), [101, 150])
    assert.deepEqual(await authors(`books/any(b:contains(b/title,'Rav'))`), [150])
    assert.deepEqual(await authors('books/any(b:b/isbn eq null)'), [170])
    assert.deepEqual(await authors('books/any(b:b/ID in (201,252))'), [101, 150])
    assert.deepEqual(await authors(`books/all(b:b/currency/code eq 'GBP')`), [101, 107])
    assert.deepEqual(await authors(`books/any(b:b/genre/name eq 'Drama')`), [101, 107])
    assert.deepEqual(await authors(`books/all(b:b/genre/name eq 'Mystery')`), [150])
    assert.deepEqual(await authors('books/any(b:b/author/books/any(c:c/stock gt 500))'), [150])
    assert.deepEqual(await authors('books/any(b:b/genre/children/any())'), [])
    assert.deepEqual(await authors('books/any(b:b/stock gt 500) and books/all(b:b/price gt 13)'), [150])
    // all() is true for an empty collection: Genres without children
    assert.deepEqual(await ids(`/admin/Genres?$filter=children/all(c:c/name ne 'Drama')&$select=ID&$orderby=ID`), [11, 12, 13, 16, 20, 21])
    // lambda after a to-one navigation, in a projection with renamed association (InStock.writer)
    assert.deepEqual(await ids(`/admin/Books?$filter=IsActiveEntity eq true and author/books/all(b:b/stock gt 100)&$select=ID&$orderby=ID`), [251, 252])
    assert.deepEqual(await ids(`/browse/InStock?$filter=writer/books/all(b:b/stock gt 100)&$select=ID&$orderby=ID`), [251, 252])
    // combined with instance based authorization (carol: address_city = Haworth)
    assert.deepEqual(await ids(`/restricted/Authors?$filter=books/any(b:b/stock gt 1)&$select=ID&$orderby=ID`, { auth: { username: 'carol' } }), [101, 107])

    let { data } = await GET(`/admin/Authors?$filter=books/any(b:b/stock gt 500)&$count=true&$top=0`, admin)
    assert.equal(data['@odata.count'], 1)
    ;({ data } = await GET(`/admin/Authors/$count?$filter=books/all(b:b/stock gt 100)`, admin))
    assert.equal(data, 1)
    ;({ data } = await GET(`/admin/Authors?$apply=filter(books/all(b:b/stock gt 100))/aggregate($count as n)`, admin))
    assert.equal(data.value[0].n, 1)
    ;({ data } = await GET(`/admin/Authors?$filter=ID ge 150&$select=ID&$orderby=ID&$expand=books($filter=author/books/any(x:x/stock gt 500);$select=ID;$orderby=ID)`, admin))
    assert.deepEqual(data.value.map(a => [a.ID, a.books.map(b => b.ID)]), [[150, [251, 252]], [170, []]])
  })

  test('$filter with any() / all() lambdas on compositions, incl. drafts', async () => {
    const { Orders } = cds.entities('sap.capire.bookshop')
    await INSERT.into(Orders).entries(
      { OrderNo: 'L-1', items: [{ pos: 1, book_ID: 201, quantity: 1 }, { pos: 2, book_ID: 251, quantity: 3 }], notes: [{ text: 'urgent delivery' }] },
      { OrderNo: 'L-2', items: [{ pos: 1, book_ID: 252, quantity: 2 }, { pos: 2, book_ID: 251, quantity: 5 }] },
      { OrderNo: 'L-3', notes: [{ text: 'gift' }] },
      { OrderNo: 'L-4', items: [{ pos: 1, book_ID: 207, quantity: 2 }] }
    )
    const orders = async (f, active = 'IsActiveEntity eq true') =>
      (await GET(`/orders/Orders?$filter=${active} and startswith(OrderNo,'L-') and ${f}&$select=OrderNo&$orderby=OrderNo`, admin)).data.value.map(o => o.OrderNo)
    assert.deepEqual(await orders('items/any(i:i/quantity gt 2)'), ['L-1', 'L-2'])
    assert.deepEqual(await orders('items/all(i:i/quantity gt 1)'), ['L-2', 'L-3', 'L-4'])
    assert.deepEqual(await orders(`items/any(i:i/book/author/name eq 'Edgar Allen Poe')`), ['L-1', 'L-2'])
    assert.deepEqual(await orders('items/all(i:i/book/stock gt 100)'), ['L-2', 'L-3'])
    assert.deepEqual(await orders(`notes/any(n:contains(n/text,'urgent'))`), ['L-1'])
    assert.deepEqual(await orders('not notes/any()'), ['L-2', 'L-4'])

    // drafts: the lambda is evaluated on the draft items - L-5 new draft, L-4 edited (quantity 2 -> 9)
    const { data: d } = await POST('/orders/Orders', { OrderNo: 'L-5', items: [{ pos: 1, book_ID: 201, quantity: 9 }, { pos: 2, book_ID: 207, quantity: 10 }] }, admin)
    const { ID } = (await GET(`/orders/Orders?$filter=OrderNo eq 'L-4' and IsActiveEntity eq true&$select=ID`, admin)).data.value[0]
    await POST(`/orders/Orders(ID=${ID},IsActiveEntity=true)/OrdersService.draftEdit`, { PreserveChanges: true }, admin)
    await PATCH(`/orders/Orders_items(up__ID=${ID},pos=1,IsActiveEntity=false)`, { quantity: 9 }, admin)
    const fiori = '(IsActiveEntity eq false or SiblingEntity/IsActiveEntity eq null)'
    assert.deepEqual(await orders('items/any(i:i/quantity gt 8)', fiori), ['L-4', 'L-5'])
    assert.deepEqual(await orders('items/all(i:i/quantity gt 8)', fiori), ['L-3', 'L-4', 'L-5'])
    assert.deepEqual(await orders('items/all(i:i/quantity gt 8)', 'IsActiveEntity eq false'), ['L-4', 'L-5'])
    assert.deepEqual(await orders('items/any(i:i/quantity gt 8)'), [])

    await DEL(`/orders/Orders(ID=${d.ID},IsActiveEntity=false)`, admin)
    await DEL(`/orders/Orders(ID=${ID},IsActiveEntity=false)`, admin)
    await DELETE.from(Orders).where(`OrderNo like 'L-%'`)
    assert.equal((await SELECT.from('sap.capire.bookshop.Orders.items').where({ up__ID: ID })).length, 0)
  })

  test('$filter functions and null handling', async () => {
    let { data } = await GET(`/browse/Books?$filter=startswith(title,'The') or endswith(title,'Eyre')&$select=ID&$orderby=ID`)
    assert.deepEqual(
      data.value.map(b => b.ID),
      [207, 251]
    )
    ;({ data } = await GET(`/browse/Books?$filter=isbn eq null&$select=ID`))
    assert.deepEqual(
      data.value.map(b => b.ID),
      [271]
    )
    ;({ data } = await GET(`/browse/Books?$filter=isbn ne null&$select=ID`))
    assert.equal(data.value.length, 4)
    ;({ data } = await GET(`/browse/Books?$filter=tolower(title) eq 'the raven'&$select=ID`))
    assert.deepEqual(
      data.value.map(b => b.ID),
      [251]
    )
    ;({ data } = await GET(`/browse/Books?$filter=ID in (201,207)&$select=ID&$orderby=ID desc`))
    assert.deepEqual(
      data.value.map(b => b.ID),
      [207, 201]
    )
  })

  test('decimal comparisons are exact', async () => {
    const { data } = await GET(`/browse/Books?$filter=price eq 11.11&$select=ID`)
    assert.deepEqual(
      data.value.map(b => b.ID),
      [201]
    )
  })

  test('$search', async () => {
    const { data } = await GET(`/browse/Books?$search=raven&$select=ID`)
    assert.deepEqual(
      data.value.map(b => b.ID),
      [251]
    )
  })

  test('$expand to-one and to-many with nested options', async () => {
    let { data } = await GET(`/admin/Authors(150)?$expand=books($select=ID,title;$orderby=ID desc;$top=1)`, admin)
    assert.equal(data.name, 'Edgar Allen Poe')
    assert.deepEqual(data.books, [{ ID: 252, title: 'Eleonora' }])
    ;({ data } = await GET(`/admin/Books(ID=201,IsActiveEntity=true)?$select=ID&$expand=author($select=name),genre($expand=parent)`, admin))
    assert.equal(data.author.name, 'Emily Brontë')
    assert.equal(data.genre.name, 'Drama')
    assert.equal(data.genre.parent.name, 'Fiction')
  })

  test('navigation paths', async () => {
    const { data } = await GET(`/admin/Authors(101)/books?$select=ID,title`, admin)
    assert.deepEqual(
      data.value.map(b => b.ID),
      [201]
    )
  })

  test('localized texts', async () => {
    let { data } = await GET(`/browse/Books(201)?$select=title`, { headers: { 'accept-language': 'de' } })
    assert.equal(data.title, 'Sturmhöhe')
    ;({ data } = await GET(`/browse/Books(251)?$select=title`, { headers: { 'accept-language': 'de' } }))
    assert.equal(data.title, 'The Raven')
    ;({ data } = await GET(`/browse/Books(201)?$select=title`))
    assert.equal(data.title, 'Wuthering Heights')
  })

  test('projection with renamed elements and where clause', async () => {
    const { data } = await GET(`/browse/InStock?$orderby=ID`)
    assert.deepEqual(
      data.value.map(b => [b.ID, b.name, b.writer_ID]),
      [
        [251, 'The Raven', 150],
        [252, 'Eleonora', 150]
      ]
    )
  })

  test('aggregation via $apply', async () => {
    const { data } = await GET(`/browse/Books?$apply=groupby((currency_code),aggregate(stock with sum as total))&$orderby=currency_code`)
    assert.deepEqual(
      data.value.map(r => [r.currency_code, r.total]),
      [
        ['GBP', 23],
        ['JPY', 22],
        ['USD', 888]
      ]
    )
  })

  test('$count endpoint', async () => {
    const { data } = await GET(`/browse/Books/$count?$filter=stock gt 100`)
    assert.equal(data, 2)
  })

  test('structured elements (address)', async () => {
    const { data } = await GET(`/admin/Authors(101)?$select=address_city`, admin)
    assert.equal(data.address_city ?? data.address?.city, 'Haworth')
  })
})

describe('writing data', () => {
  test('actions with UPDATE ... with (stock -= quantity)', async () => {
    const { data } = await POST('/browse/submitOrder', { book: 201, quantity: 2 }, admin)
    assert.equal(data.stock, 10)
    await assert.rejects(POST('/browse/submitOrder', { book: 201, quantity: 200 }, admin), /exceeds stock/)
  })

  test('create, update, delete (non draft)', async () => {
    const { status } = await POST('/admin/Authors', { ID: 999, name: 'Test Author', address_city: 'Delhi' }, admin)
    assert.equal(status, 201)
    let { data } = await GET('/admin/Authors(999)', admin)
    assert.equal(data.name, 'Test Author')
    assert.equal(data.createdBy, 'alice')
    assert.match(data.createdAt, /^\d{4}-\d{2}-\d{2}T/)
    await PATCH('/admin/Authors(999)', { name: 'Renamed' }, admin)
    ;({ data } = await GET('/admin/Authors(999)', admin))
    assert.equal(data.name, 'Renamed')
    await DEL('/admin/Authors(999)', admin)
    await assert.rejects(GET('/admin/Authors(999)', admin), /404|Not Found/i)
  })

  test('duplicate keys are reported as 400 ENTITY_ALREADY_EXISTS', async () => {
    await assert.rejects(POST('/admin/Authors', { ID: 101, name: 'Duplicate' }, admin), e => {
      assert.equal(e.response?.status ?? e.status, 400)
      return true
    })
  })

  test('@assert.unique is enforced by a unique index', async () => {
    await assert.rejects(cds.run(INSERT.into('sap.capire.bookshop.Books').entries({ ID: 900, title: 'X', author_ID: 101, isbn: '978-0141439556' })), e => {
      assert.equal(e.code, 'UNIQUE_CONSTRAINT_VIOLATION')
      return true
    })
  })

  test('draft: create, edit, activate, discard', async () => {
    // create a new draft
    let { data } = await POST('/admin/Books', { ID: 301, title: 'Draft Book', author_ID: 101, stock: 5, price: '9.99' }, admin)
    assert.equal(data.IsActiveEntity, false)
    await PATCH('/admin/Books(ID=301,IsActiveEntity=false)', { title: 'Draft Book v2' }, admin)
    ;({ data } = await GET('/admin/Books?$filter=IsActiveEntity eq false&$select=ID,title', admin))
    assert.deepEqual(
      data.value.map(b => b.title),
      ['Draft Book v2']
    )
    // activate
    await POST('/admin/Books(ID=301,IsActiveEntity=false)/AdminService.draftActivate', {}, admin)
    ;({ data } = await GET('/admin/Books(ID=301,IsActiveEntity=true)', admin))
    assert.equal(data.title, 'Draft Book v2')
    assert.equal(data.price, '9.99')
    // edit
    await POST('/admin/Books(ID=301,IsActiveEntity=true)/AdminService.draftEdit', { PreserveChanges: true }, admin)
    await PATCH('/admin/Books(ID=301,IsActiveEntity=false)', { stock: 7 }, admin)
    ;({ data } = await GET('/admin/Books(ID=301,IsActiveEntity=true)?$select=stock,HasDraftEntity', admin))
    assert.equal(data.stock, 5)
    assert.equal(data.HasDraftEntity, true)
    // list report: actives and own drafts
    ;({ data } = await GET('/admin/Books?$filter=(IsActiveEntity eq false or SiblingEntity/IsActiveEntity eq null)&$select=ID,IsActiveEntity&$orderby=ID', admin))
    assert.equal(data.value.find(b => b.ID === 301).IsActiveEntity, false)
    // discard
    await DEL('/admin/Books(ID=301,IsActiveEntity=false)', admin)
    ;({ data } = await GET('/admin/Books(ID=301,IsActiveEntity=true)?$select=stock,HasDraftEntity', admin))
    assert.equal(data.HasDraftEntity, false)
    // delete active
    await DEL('/admin/Books(ID=301,IsActiveEntity=true)', admin)
  })

  test('deep insert / deep update / deep delete with compositions (draft)', async () => {
    let { data } = await POST(
      '/orders/Orders',
      { OrderNo: 'A-1', buyer: 'alice', items: [{ pos: 1, book_ID: 201, quantity: 1, amount: '11.11' }, { pos: 2, book_ID: 207, quantity: 2, amount: '24.68' }], notes: [{ text: 'fast please' }] },
      admin
    )
    const ID = data.ID
    await POST(`/orders/Orders(ID=${ID},IsActiveEntity=false)/OrdersService.draftActivate`, {}, admin)
    ;({ data } = await GET(`/orders/Orders(ID=${ID},IsActiveEntity=true)?$expand=items($orderby=pos),notes`, admin))
    assert.equal(data.items.length, 2)
    assert.equal(data.items[1].amount, '24.68')
    assert.equal(data.notes[0].text, 'fast please')
    // deep update via draft edit
    await POST(`/orders/Orders(ID=${ID},IsActiveEntity=true)/OrdersService.draftEdit`, { PreserveChanges: true }, admin)
    await DEL(`/orders/Orders_items(up__ID=${ID},pos=2,IsActiveEntity=false)`, admin)
    await POST(`/orders/Orders(ID=${ID},IsActiveEntity=false)/OrdersService.draftActivate`, {}, admin)
    ;({ data } = await GET(`/orders/Orders(ID=${ID},IsActiveEntity=true)?$expand=items`, admin))
    assert.deepEqual(
      data.items.map(i => i.pos),
      [1]
    )
    // deep delete
    await DEL(`/orders/Orders(ID=${ID},IsActiveEntity=true)`, admin)
    const db = await cds.connect.to('db')
    const left = await db.run(SELECT.from('sap.capire.bookshop.Orders.items').where({ up__ID: ID }))
    assert.equal(left.length, 0)
    const notes = await db.run(SELECT.from('sap.capire.bookshop.Notes').where({ order_ID: ID }))
    assert.equal(notes.length, 0)
  })

  test('PUT / UPSERT', async () => {
    await PUT('/admin/Genres(99)', { name: 'Upserted' }, admin)
    const { data } = await GET('/admin/Genres(99)', admin)
    assert.equal(data.name, 'Upserted')
    await cds.run(UPSERT.into('sap.capire.bookshop.Genres').entries({ ID: 99, descr: 'with descr' }))
    const g = await cds.run(SELECT.one.from('sap.capire.bookshop.Genres', 99))
    assert.equal(g.name, 'Upserted')
    assert.equal(g.descr, 'with descr')
  })

  test('transactions are rolled back on errors', async () => {
    await assert.rejects(
      cds.tx(async tx => {
        await tx.run(INSERT.into('sap.capire.bookshop.Genres').entries({ ID: 98, name: 'rolled back' }))
        throw new Error('fail')
      }),
      /fail/
    )
    const g = await cds.run(SELECT.one.from('sap.capire.bookshop.Genres', 98))
    assert.equal(g, undefined)
  })

  test('media data (LargeBinary)', async () => {
    const png = Buffer.from('89504e470d0a1a0a', 'hex')
    await PUT('/admin/Books(ID=207,IsActiveEntity=true)/image', png, { ...admin, headers: { 'content-type': 'image/png' } })
    const res = await GET('/admin/Books(ID=207,IsActiveEntity=true)/image', { ...admin, responseType: 'arraybuffer' })
    assert.equal(Buffer.from(res.data).toString('hex'), '89504e470d0a1a0a')
  })
})

describe('cql', () => {
  test('SELECT with sub query, exists, group by / having', async () => {
    const { Books, Authors } = cds.entities('sap.capire.bookshop')
    const authors = await SELECT.from(Authors, a => {
      a.ID, a.name
    }).where({ ID: { in: SELECT('author_ID').from(Books).where({ stock: { '>': 100 } }) } })
    assert.deepEqual(
      authors.map(a => a.ID),
      [150]
    )
    const withBooks = await SELECT.from(Authors).columns('ID').where('exists books[stock > 500]')
    assert.deepEqual(
      withBooks.map(a => a.ID),
      [150]
    )
    const grouped = await SELECT.from(Books).columns('author_ID', 'count(*) as n', 'max(price) as maxPrice').where('ID < 300').groupBy('author_ID').having('count(*) > 1')
    assert.deepEqual(grouped, [{ author_ID: 150, n: 2, maxPrice: 14 }])
    const [{ total }] = await SELECT.from(Books).columns('sum(stock) as total')
    assert.equal(typeof total, 'number')
  })

  test('native access', async () => {
    const db = await cds.connect.to('db')
    const n = await db.native(({ collection, session }) => collection('sap.capire.bookshop.Books').countDocuments({}, { session }))
    assert.ok(n >= 5)
    assert.equal(db.collectionName('AdminService.Books'), 'sap_capire_bookshop_Books')
  })

  test('unsupported native SQL gives a clear error', async () => {
    const db = await cds.connect.to('db')
    await assert.rejects(db.run('SELECT * FROM Books'), e => e.code === 'MONGO_NOT_SUPPORTED' && e.status === 501)
  })

  test('expressions: case, functions, arithmetic, cast', async () => {
    const rows = await SELECT.from('sap.capire.bookshop.Books')
      .columns(
        'ID',
        `case when stock > 100 then 'many' else 'few' end as level`,
        'concat(title, author_ID) as tid',
        'length(title) as len',
        'stock * 2 as doubled',
        'year(createdAt) as year',
        'tolower(title) as lower'
      )
      .where({ ID: { in: [201, 251] } })
      .orderBy('ID')
    assert.equal(rows[0].level, 'few')
    assert.equal(rows[1].level, 'many')
    assert.equal(rows[0].tid, 'Wuthering Heights101')
    assert.equal(rows[0].len, 17)
    assert.equal(rows[1].doubled, 666)
    assert.equal(rows[0].year, new Date().getUTCFullYear())
    assert.equal(rows[1].lower, 'the raven')
    const [{ s }] = await SELECT.from('sap.capire.bookshop.Books').columns(`cast(stock as String) as s`).where({ ID: 251 })
    assert.equal(s, '333')
  })

  test('order by path expressions and calculated elements, inline, distinct', async () => {
    let rows = await SELECT.from('sap.capire.bookshop.Books').columns('ID', 'author.name as an').where('ID < 300').orderBy('author.name desc', 'ID')
    assert.deepEqual(
      rows.map(r => r.ID),
      [271, 201, 251, 252, 207]
    )
    assert.equal(rows[0].an, 'Richard Carpenter')
    rows = await SELECT.from('sap.capire.bookshop.Books').columns('ID', 'value').where('ID < 300').orderBy('value desc').limit(1)
    assert.equal(rows[0].ID, 252)
    rows = await SELECT.from('sap.capire.bookshop.Books', b => {
      b.ID, b.author(a => a.name)
    }).where({ ID: 201 })
    assert.deepEqual(rows, [{ ID: 201, author: { name: 'Emily Brontë' } }])
    rows = await cds.run({ SELECT: { from: { ref: ['sap.capire.bookshop.Books'] }, columns: [{ ref: ['ID'] }, { ref: ['author'], inline: [{ ref: ['name'] }] }], where: [{ ref: ['ID'] }, '=', { val: 207 }] } })
    assert.deepEqual(rows, [{ ID: 207, author_name: 'Charlotte Brontë' }])
    rows = await SELECT.distinct.from('sap.capire.bookshop.Books').columns('currency_code').orderBy('currency_code')
    assert.deepEqual(
      rows.map(r => r.currency_code),
      ['GBP', 'JPY', 'USD']
    )
  })

  test('multi-hop path expressions and exists', async () => {
    let rows = await SELECT.from('sap.capire.bookshop.Books').columns('ID').where(`author.books.title = 'Eleonora'`).orderBy('ID')
    assert.deepEqual(
      rows.map(r => r.ID),
      [251, 252]
    )
    rows = await SELECT.from('sap.capire.bookshop.Books').columns('ID').where(`exists author.books[stock > 500]`).orderBy('ID')
    assert.deepEqual(
      rows.map(r => r.ID),
      [251, 252]
    )
    rows = await SELECT.from('sap.capire.bookshop.Genres').columns('ID').where(`exists children[name = 'Drama']`)
    assert.deepEqual(
      rows.map(r => r.ID),
      [10]
    )
    rows = await SELECT.from('sap.capire.bookshop.Books').columns('ID').where(`not exists genre`).orderBy('ID')
    assert.deepEqual(rows, [])
  })

  test('path insert, INSERT ... AS SELECT, UPSERT with rows', async () => {
    const db = await cds.connect.to('db')
    await db.run(INSERT.into({ ref: [{ id: 'sap.capire.bookshop.Authors', where: [{ ref: ['ID'] }, '=', { val: 170 }] }, 'books'] }).entries({ ID: 401, title: 'Path Insert' }))
    let b = await SELECT.one.from('sap.capire.bookshop.Books', 401)
    assert.equal(b.author_ID, 170)
    assert.equal(b.createdBy, 'anonymous')
    await db.run(INSERT.into('sap.capire.bookshop.Genres').columns('ID', 'name').from(SELECT.from('sap.capire.bookshop.Genres').columns('ID + 1000 as ID', 'name').where({ ID: { '<': 12 } })))
    const copies = await SELECT.from('sap.capire.bookshop.Genres').where({ ID: { '>': 1000 } }).orderBy('ID')
    assert.deepEqual(
      copies.map(g => [g.ID, g.name]),
      [
        [1010, 'Fiction'],
        [1011, 'Drama']
      ]
    )
    await db.run(UPSERT.into('sap.capire.bookshop.Genres').columns('ID', 'name').rows([1010, 'Fiction2'], [1012, 'New']))
    const g = await SELECT.from('sap.capire.bookshop.Genres').where({ ID: { in: [1010, 1012] } }).orderBy('ID')
    assert.deepEqual(
      g.map(x => x.name),
      ['Fiction2', 'New']
    )
    const n = await db.run(DELETE.from('sap.capire.bookshop.Genres').where({ ID: { '>': 1000 } }))
    assert.equal(n, 3)
    await db.run(DELETE.from('sap.capire.bookshop.Books', 401))
  })

  test('deep insert and cascading delete via CQL', async () => {
    const db = await cds.connect.to('db')
    const { Orders } = cds.entities('sap.capire.bookshop')
    await db.run(INSERT.into(Orders).entries({ ID: 'a0000000-0000-0000-0000-000000000001', OrderNo: 'D-1', items: [{ pos: 1, quantity: 3 }], notes: [{ text: 'n1' }, { text: 'n2' }] }))
    const o = await SELECT.one.from(Orders, 'a0000000-0000-0000-0000-000000000001', o => {
      o.OrderNo, o.items(i => i.pos), o.notes(n => n.text)
    })
    assert.deepEqual(o.items, [{ pos: 1 }])
    assert.equal(o.notes.length, 2)
    await db.run(UPDATE(Orders, 'a0000000-0000-0000-0000-000000000001').with({ items: [{ pos: 1, quantity: 4 }, { pos: 2, quantity: 1 }] }))
    const items = await SELECT.from('sap.capire.bookshop.Orders.items').where({ up__ID: 'a0000000-0000-0000-0000-000000000001' }).orderBy('pos')
    assert.deepEqual(
      items.map(i => [i.pos, i.quantity]),
      [
        [1, 4],
        [2, 1]
      ]
    )
    await db.run(DELETE.from(Orders, 'a0000000-0000-0000-0000-000000000001'))
    assert.equal((await SELECT.from('sap.capire.bookshop.Notes').where({ order_ID: 'a0000000-0000-0000-0000-000000000001' })).length, 0)
    assert.equal((await SELECT.from('sap.capire.bookshop.Orders.items').where({ up__ID: 'a0000000-0000-0000-0000-000000000001' })).length, 0)
  })

  test('session variables ($user, $now) and update expressions', async () => {
    await cds.tx({ user: new cds.User('bob') }, async tx => {
      await tx.run(INSERT.into('sap.capire.bookshop.Authors').entries({ ID: 501, name: 'Bob' }))
      const mine = await tx.run(SELECT.from('sap.capire.bookshop.Authors').columns('ID').where('createdBy = $user'))
      assert.deepEqual(
        mine.map(a => a.ID),
        [501]
      )
      await tx.run(UPDATE('sap.capire.bookshop.Books', 252).with({ price: { xpr: [{ ref: ['price'] }, '*', { val: 2 }] } }))
      const b = await tx.run(SELECT.one.from('sap.capire.bookshop.Books', 252).columns('price', 'modifiedBy'))
      assert.equal(b.price, '28.00')
      assert.equal(b.modifiedBy, 'bob')
      await tx.run(UPDATE('sap.capire.bookshop.Books', 252).with({ price: 14 }))
      await tx.run(DELETE.from('sap.capire.bookshop.Authors', 501))
    })
  })

  test('streaming results with for await', async () => {
    const ids = []
    for await (const row of SELECT.from('sap.capire.bookshop.Genres').columns('ID').where({ ID: { '<': 20 } }).orderBy('ID')) ids.push(row.ID)
    assert.deepEqual(ids, [10, 11, 12, 13, 16])
  })

  test('count with limit and offset', async () => {
    const rows = await SELECT.from('sap.capire.bookshop.Books').columns('ID').where('ID < 300').orderBy('ID').limit(2, 1)
    assert.deepEqual(
      rows.map(r => r.ID),
      [207, 251]
    )
    const q = SELECT.from('sap.capire.bookshop.Books').columns('ID').where('ID < 300').limit(2)
    q.SELECT.count = true
    const r = await q
    assert.equal(r.$count, 5)
  })
})

