import { describe, test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { resolveConnection, projectDatabaseName } = require('../lib/connection')
const { maskUrl, translate } = require('../lib/errors')

const env = { ...process.env }
beforeEach(() => {
  for (const k of ['MONGODB_URI', 'destinations', 'VCAP_SERVICES']) delete process.env[k]
  Object.assign(process.env, Object.fromEntries(Object.entries(env).filter(([k]) => !['MONGODB_URI', 'destinations', 'VCAP_SERVICES'].includes(k))))
})

describe('connection from url / credentials', () => {
  test('url with database in path', async () => {
    const c = await resolveConnection({ url: 'mongodb+srv://cluster0.abc.mongodb.net/bookshop?retryWrites=true' })
    assert.equal(c.database, 'bookshop')
    assert.equal(c.clientOptions.auth, undefined)
    assert.equal(c.source, 'credentials')
  })

  test('credentials object, database option wins over url', async () => {
    const c = await resolveConnection({
      url: 'mongodb+srv://cluster0.abc.mongodb.net/other',
      credentials: { user: 'dbuser', password: 'p@ss:word/with#special', database: 'shop' }
    })
    assert.equal(c.database, 'shop')
    assert.deepEqual(c.clientOptions.auth, { username: 'dbuser', password: 'p@ss:word/with#special' })
  })

  test('credentials as "user:password" string and as connection string', async () => {
    let c = await resolveConnection({ url: 'mongodb://localhost:27017', credentials: 'scott:tiger' })
    assert.deepEqual(c.clientOptions.auth, { username: 'scott', password: 'tiger' })
    assert.equal(c.database, projectDatabaseName()) // no database configured -> project name
    c = await resolveConnection({ credentials: 'mongodb://u:p@localhost:27017/db1' })
    assert.equal(c.url, 'mongodb://u:p@localhost:27017/db1')
    assert.equal(c.database, 'db1')
    assert.ok(!c.display.includes(':p@'), 'password must be masked in display')
  })

  test('user-provided service style credentials (uri, username, dbname)', async () => {
    const c = await resolveConnection({ credentials: { uri: 'mongodb+srv://x.mongodb.net', username: 'u', password: 'p', dbname: 'prod' } })
    assert.equal(c.database, 'prod')
    assert.equal(c.clientOptions.auth.username, 'u')
  })

  test('MONGODB_URI environment variable', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/fromenv'
    const c = await resolveConnection({})
    assert.equal(c.database, 'fromenv')
    assert.equal(c.source, 'environment')
  })

  test('client options are passed through', async () => {
    const c = await resolveConnection({ url: 'mongodb://localhost', client: { maxPoolSize: 5 } })
    assert.equal(c.clientOptions.maxPoolSize, 5)
    assert.equal(c.clientOptions.appName, '@anubhav-cap-js/mongo')
  })
})

describe('database name (dbName)', () => {
  const fs = require('node:fs')
  const os = require('node:os')
  const path = require('node:path')
  const project = name => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'capapp-'))
    if (name !== undefined) fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name }))
    return dir
  }

  test('dbName is used as database name', async () => {
    const c = await resolveConnection({ url: 'mongodb+srv://cluster0.abc.mongodb.net', dbName: 'anubhav' })
    assert.equal(c.database, 'anubhav')
    assert.match(c.display, /\(database: anubhav\)/)
  })

  test('dbName wins over database, credentials.database and the url path', async () => {
    const c = await resolveConnection({ url: 'mongodb://localhost/fromurl', dbName: 'anubhav', database: 'legacy', credentials: { database: 'creds' } })
    assert.equal(c.database, 'anubhav')
  })

  test('database is still supported as an alias', async () => {
    assert.equal((await resolveConnection({ url: 'mongodb://localhost', database: 'legacy' })).database, 'legacy')
  })

  test('the database of a BTP destination (mongo.database) overrides dbName', async () => {
    process.env.destinations = JSON.stringify([{ name: 'MONGO', url: 'https://c.mongodb.net', user: 'u', password: 'p', 'mongo.database': 'ops' }])
    assert.equal((await resolveConnection({ destination: 'MONGO', dbName: 'anubhav' })).database, 'ops')
    process.env.destinations = JSON.stringify([{ name: 'MONGO', url: 'https://c.mongodb.net', user: 'u', password: 'p' }])
    assert.equal((await resolveConnection({ destination: 'MONGO', dbName: 'anubhav' })).database, 'anubhav')
  })

  test('without any database configuration the project name is used', async () => {
    assert.equal(projectDatabaseName(project('bookshop')), 'bookshop')
    assert.equal(projectDatabaseName(project('@my-org/bookshop.app')), 'my-org_bookshop_app')
    assert.equal(projectDatabaseName(project('my app $1')), 'my_app_1')
    assert.match(projectDatabaseName(project(undefined)), /^capapp-/) // no package.json -> folder name
    assert.equal(projectDatabaseName(project('x'.repeat(100))).length, 63)
    assert.equal((await resolveConnection({ url: 'mongodb://localhost' })).database, projectDatabaseName())
  })

  test('invalid database names are rejected', async () => {
    for (const dbName of ['bad.name', 'a/b', 'a\\b', 'x$y', 'with space', 'x'.repeat(64)])
      await assert.rejects(resolveConnection({ url: 'mongodb://localhost', dbName }), e => e.code === 'MONGO_CONFIG_INVALID' && /dbName/.test(e.message), dbName)
  })
})

describe('configuration errors', () => {
  const rejects = (o, re) => assert.rejects(resolveConnection(o), e => e.code === 'MONGO_CONFIG_INVALID' && re.test(e.message))

  test('nothing configured', () => rejects({}, /No MongoDB connection configured/))
  test('invalid scheme', () => rejects({ url: 'https://cluster0.mongodb.net' }, /must start with mongodb:\/\//))
  test('placeholders from Atlas', () => rejects({ url: 'mongodb+srv://<username>:<password>@cluster0.abc.mongodb.net' }, /placeholder/))
  test('user without password', () => rejects({ url: 'mongodb://localhost', credentials: { user: 'u' } }, /without a password/))
  test('destination without binding and without fallback', () => rejects({ destination: 'MONGO' }, /no destination service instance is bound/))
})

describe('connection from SAP BTP destination', () => {
  const dest = d => (process.env.destinations = JSON.stringify([{ name: 'MONGO', ...d }]))

  test('destination with mongodb+srv URL and BasicAuthentication', async () => {
    dest({ url: 'mongodb+srv://cluster0.abc.mongodb.net', user: 'btpuser', password: 'secret', 'mongo.database': 'prod' })
    const c = await resolveConnection({ destination: 'MONGO', url: 'mongodb://localhost/dev' })
    assert.equal(c.source, 'destination "MONGO"')
    assert.equal(c.url, 'mongodb+srv://cluster0.abc.mongodb.net')
    assert.equal(c.database, 'prod')
    assert.deepEqual(c.clientOptions.auth, { username: 'btpuser', password: 'secret' })
  })

  test('destination with https URL (BTP cockpit) and mongo.options', async () => {
    dest({ url: 'https://cluster0.abc.mongodb.net', user: 'u', password: 'p', 'mongo.options': 'retryWrites=true&w=majority' })
    const c = await resolveConnection({ destination: 'MONGO', database: 'shop' })
    assert.equal(c.url, 'mongodb+srv://cluster0.abc.mongodb.net/?retryWrites=true&w=majority')
    assert.equal(c.database, 'shop')
  })

  test('destination with mongo.url property and mongo.srv=false', async () => {
    dest({ url: 'http://db.internal:27017', 'mongo.srv': 'false', user: 'u', password: 'p' })
    let c = await resolveConnection({ destination: 'MONGO' })
    assert.equal(c.url, 'mongodb://db.internal:27017')
    dest({ url: 'https://db.example.com:27017', 'mongo.srv': 'false', user: 'u', password: 'p' })
    c = await resolveConnection({ destination: 'MONGO' })
    assert.equal(c.url, 'mongodb://db.example.com:27017/?tls=true', 'https destinations must keep TLS')
    dest({ url: 'https://ignored', 'mongo.url': 'mongodb://a:27017,b:27017/x?replicaSet=rs0' })
    c = await resolveConnection({ destination: 'MONGO' })
    assert.equal(c.url, 'mongodb://a:27017,b:27017/x?replicaSet=rs0')
    assert.equal(c.database, 'x')
  })

  test('falls back to credentials if the destination does not exist', async () => {
    process.env.destinations = JSON.stringify([{ name: 'OTHER', url: 'mongodb://x' }])
    const c = await resolveConnection({ destination: 'MONGO', url: 'mongodb://localhost/dev' })
    assert.equal(c.database, 'dev')
  })

  test('reads the destination from the bound Destination service (REST, without Cloud SDK)', async () => {
    const http = require('node:http')
    const calls = []
    const server = http.createServer((req, res) => {
      calls.push(`${req.method} ${req.url} ${req.headers.authorization?.split(' ')[0]}`)
      res.setHeader('content-type', 'application/json')
      if (req.url === '/oauth/token') return res.end(JSON.stringify({ access_token: 'T0KEN' }))
      if (req.url === '/destination-configuration/v1/destinations/MONGO' && req.headers.authorization === 'Bearer T0KEN')
        return res.end(
          JSON.stringify({
            destinationConfiguration: { Name: 'MONGO', Type: 'HTTP', URL: 'https://cluster9.xyz.mongodb.net', Authentication: 'BasicAuthentication', User: 'btp', Password: 'pw', 'mongo.database': 'live' }
          })
        )
      res.statusCode = 404
      res.end('{}')
    })
    await new Promise(r => server.listen(0, r))
    const base = `http://localhost:${server.address().port}`
    process.env.VCAP_SERVICES = JSON.stringify({ destination: [{ label: 'destination', credentials: { clientid: 'c', clientsecret: 's', url: base, uri: base } }] })
    try {
      const c = await resolveConnection({ destination: 'MONGO' })
      assert.equal(c.url, 'mongodb+srv://cluster9.xyz.mongodb.net')
      assert.equal(c.database, 'live')
      assert.deepEqual(c.clientOptions.auth, { username: 'btp', password: 'pw' })
      assert.deepEqual(calls, ['POST /oauth/token Basic', 'GET /destination-configuration/v1/destinations/MONGO Bearer'])
      await assert.rejects(resolveConnection({ destination: 'MISSING' }), e => e.code === 'MONGO_DESTINATION_FAILED' && /not found/.test(e.message))
    } finally {
      server.closeAllConnections()
      server.close()
    }
  })

  test('uses credentials when no destination service is available (local development)', async () => {
    const c = await resolveConnection({ destination: 'MONGO', url: 'mongodb://localhost/dev', credentials: { user: 'u', password: 'p' } })
    assert.equal(c.source, 'credentials')
  })
})

describe('error translation', () => {
  test('masks passwords', () => {
    assert.equal(maskUrl('mongodb+srv://user:secret@host/db'), 'mongodb+srv://user:***@host/db')
  })

  test('duplicate key errors', () => {
    const pk = translate(Object.assign(new Error('E11000 duplicate key error collection: x index: cap_pk dup key'), { name: 'MongoServerError', code: 11000 }))
    assert.equal(pk.status, 400)
    assert.equal(pk.code, 'ENTITY_ALREADY_EXISTS')
    const uq = translate(Object.assign(new Error('E11000 duplicate key error collection: x index: cap_uq_isbn dup key'), { name: 'MongoServerError', code: 11000 }))
    assert.equal(uq.code, 'UNIQUE_CONSTRAINT_VIOLATION')
  })

  test('network and authentication errors carry hints', () => {
    const net = translate(Object.assign(new Error('getaddrinfo ENOTFOUND cluster0'), { name: 'MongoServerSelectionError' }), { url: 'mongodb+srv://u:pw@cluster0' })
    assert.equal(net.status, 503)
    assert.equal(net.code, 'MONGO_CONNECTION_FAILED')
    assert.match(net.message, /IP Access List/)
    assert.ok(!net.message.includes(':pw@'))
    const auth = translate(Object.assign(new Error('Authentication failed.'), { name: 'MongoServerError', code: 18 }))
    assert.equal(auth.code, 'MONGO_AUTHENTICATION_FAILED')
    assert.match(auth.message, /Database Access/)
  })
})

describe('mongodb+srv:// when the DNS server of Node.js fails', () => {
  const { _srv } = require('../lib/connection')
  const dns = require('dns')
  const srvError = code => Object.assign(new Error(`querySrv ${code} _mongodb._tcp.cluster0.abc.mongodb.net`), { code, syscall: 'querySrv' })

  test('only unreachable DNS servers are retried, not wrong hosts', () => {
    const url = 'mongodb+srv://cluster0.abc.mongodb.net'
    assert.equal(_srv.isSrvLookupFailure(srvError('ECONNREFUSED'), url), true)
    assert.equal(_srv.isSrvLookupFailure(srvError('ETIMEOUT'), url), true)
    assert.equal(_srv.isSrvLookupFailure({ cause: srvError('ECONNREFUSED') }, url), true)
    assert.equal(_srv.isSrvLookupFailure(srvError('ENOTFOUND'), url), false)
    assert.equal(_srv.isSrvLookupFailure(srvError('ECONNREFUSED'), 'mongodb://localhost:27017'), false)
    assert.equal(_srv.isSrvLookupFailure(new Error('Authentication failed.'), url), false)
  })

  const { resolveSrv, resolveTxt, setServers } = dns.promises.Resolver.prototype
  const mock = (srv, txt) => {
    let servers
    Object.assign(dns.promises.Resolver.prototype, {
      setServers: s => (servers = s),
      resolveSrv: async () => srv,
      resolveTxt: async () => txt
    })
    return () => servers
  }
  const restore = () => Object.assign(dns.promises.Resolver.prototype, { resolveSrv, resolveTxt, setServers })

  test('resolves to a mongodb:// seed list with TLS and the TXT options', async t => {
    t.after(restore)
    const servers = mock(
      [{ name: 'shard-00-00.abc.mongodb.net', port: 27017 }, { name: 'shard-00-01.abc.mongodb.net.', port: 27017 }],
      [['authSource=admin&replicaSet=atlas-1-shard-0&evil=1']]
    )
    const url = await _srv.resolveSrvUrl('mongodb+srv://u:p%40ss@cluster0.abc.mongodb.net/shop?retryWrites=true&authSource=other', ['9.9.9.9'])
    assert.deepEqual(servers(), ['9.9.9.9'])
    const u = { searchParams: new URLSearchParams(url.split("?")[1]) }
    assert.equal(url.split('?')[0], 'mongodb://u:p%40ss@shard-00-00.abc.mongodb.net:27017,shard-00-01.abc.mongodb.net:27017/shop')
    assert.equal(u.searchParams.get('tls'), 'true')
    assert.equal(u.searchParams.get('replicaSet'), 'atlas-1-shard-0')
    assert.equal(u.searchParams.get('authSource'), 'other') // options of the URL win
    assert.equal(u.searchParams.get('retryWrites'), 'true')
    assert.equal(u.searchParams.has('evil'), false) // TXT records may only set authSource, replicaSet, loadBalanced
  })

  test('rejects SRV records pointing to other domains', async t => {
    t.after(restore)
    mock([{ name: 'attacker.example.com', port: 27017 }], [])
    await assert.rejects(_srv.resolveSrvUrl('mongodb+srv://cluster0.abc.mongodb.net', ['9.9.9.9']), /outside of abc\.mongodb\.net/)
  })
})
