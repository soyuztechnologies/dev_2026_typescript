import { describe, test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import cds from '@sap/cds'
import { MongoMemoryServer } from 'mongodb-memory-server'

const impl = path.join(import.meta.dirname, '..', 'index.js')
cds.model = cds.linked(cds.compile.for.nodejs(cds.compile.to.csn(`entity test.Items { key ID: Integer; name: String; }`)))
const connect = (name, o) => cds.connect.to(name, { impl, autoDeploy: false, ...o })

describe('connection errors', () => {
  test('unreachable server -> 503 MONGO_CONNECTION_FAILED with hint', async () => {
    const srv = await connect('unreachable', { url: 'mongodb://127.0.0.1:1/x', client: { serverSelectionTimeoutMS: 300 } })
    await assert.rejects(srv.run(SELECT.from('test.Items')), e => {
      assert.equal(e.status, 503)
      assert.equal(e.code, 'MONGO_CONNECTION_FAILED')
      assert.match(e.message, /Cannot reach MongoDB at mongodb:\/\/127\.0\.0\.1:1\/x/)
      assert.match(e.message, /IP Access List/)
      return true
    })
    await srv.disconnect()
  })

  test('unknown host fails fast at startup when autoDeploy is on', async () => {
    await assert.rejects(connect('badhost', { url: 'mongodb://does-not-exist.invalid:27017/x', autoDeploy: true, client: { serverSelectionTimeoutMS: 300 } }), e => e.code === 'MONGO_CONNECTION_FAILED')
  })
})

describe('authentication', () => {
  let server
  before(async () => {
    server = await MongoMemoryServer.create({ auth: { enable: true, customRootName: 'root', customRootPwd: 'right-password' } })
  })
  after(() => server?.stop())

  test('wrong password -> 503 MONGO_AUTHENTICATION_FAILED', async () => {
    const srv = await connect('wrongpw', { url: server.getUri(), credentials: { user: 'root', password: 'wrong', authSource: 'admin' } })
    await assert.rejects(srv.run(SELECT.from('test.Items')), e => {
      assert.equal(e.status, 503)
      assert.equal(e.code, 'MONGO_AUTHENTICATION_FAILED')
      assert.match(e.message, /Database Access/)
      assert.ok(!e.message.includes('wrong'), 'password must not be part of the message')
      return true
    })
    await srv.disconnect()
  })

  test('right password works, also with special characters handled by the driver', async () => {
    const srv = await connect('rightpw', { url: server.getUri(), credentials: { user: 'root', password: 'right-password', authSource: 'admin', database: 'authdb' } })
    await srv.run(INSERT.into('test.Items').entries({ ID: 1, name: 'a' }))
    assert.deepEqual(await srv.run(SELECT.from('test.Items')), [{ ID: 1, name: 'a' }])
    await srv.disconnect()
  })
})

describe('standalone server (no replica set)', () => {
  let server
  before(async () => {
    server = await MongoMemoryServer.create()
  })
  after(() => server?.stop())

  test('transactions are switched off automatically', async () => {
    const srv = await connect('standalone', { url: server.getUri('standalone') })
    await srv.run(INSERT.into('test.Items').entries([{ ID: 1, name: 'a' }, { ID: 2, name: 'b' }]))
    await srv.run(UPDATE('test.Items', 2).with({ name: 'B' }))
    assert.deepEqual(await srv.run(SELECT.from('test.Items').orderBy('ID')), [
      { ID: 1, name: 'a' },
      { ID: 2, name: 'B' }
    ])
    assert.equal(srv._useTransactions, false)
    await srv.disconnect()
  })

  test('transactions: true on a standalone server gives a clear error', async () => {
    const srv = await connect('forcedtx', { url: server.getUri('forced'), transactions: true })
    await assert.rejects(srv.run(INSERT.into('test.Items').entries({ ID: 1 })), e => e.code === 'MONGO_TRANSACTIONS_UNSUPPORTED' && /replica set/.test(e.message))
    await srv.disconnect()
  })
})

describe('query errors', () => {
  let server, srv
  before(async () => {
    server = await MongoMemoryServer.create()
    srv = await connect('queries', { url: server.getUri('q') })
  })
  after(async () => {
    await srv?.disconnect()
    await server?.stop()
  })

  test('unknown elements -> 400', async () => {
    await assert.rejects(srv.run(SELECT.from('test.Items').where({ foo: 1 })), e => e.status === 400 && /Element "foo" does not exist/.test(e.message))
  })

  test('invalid values -> 400 MONGO_INVALID_VALUE', async () => {
    await assert.rejects(srv.run(INSERT.into('test.Items').entries({ ID: 'not a number' })), e => e.status === 400 && e.code === 'MONGO_INVALID_VALUE')
  })

  test('missing keys -> 400', async () => {
    await assert.rejects(srv.run(INSERT.into('test.Items').entries({ name: 'no key' })), e => e.status === 400 && /key element "ID"/.test(e.message))
  })

  test('unsupported features -> 501 with feature name', async () => {
    await assert.rejects(srv.run(SELECT.from('test.Items').where('soundex(name) = 1')), e => e.status === 501 && /soundex/.test(e.message))
  })
})
