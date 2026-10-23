/**
 * cds.requires["anubhav-mongo"].autoDeploy - deploy the model on boot of the application
 */
import { describe, test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { createRequire } from 'node:module'
import cds from '@sap/cds'
import { MongoClient } from 'mongodb'
import { MongoMemoryReplSet } from 'mongodb-memory-server'

const require = createRequire(import.meta.url)
const { autoDeployMode } = require('../lib/MongoService')
const impl = path.join(import.meta.dirname, '..', 'index.js')

let rs, client, n = 0
before(async () => {
  rs = await MongoMemoryReplSet.create({ replSet: { count: 1 } })
  client = await new MongoClient(rs.getUri()).connect()
  cds.model = cds.linked(cds.compile.for.nodejs(await cds.load(path.join(import.meta.dirname, 'bookshop', 'db'))))
})
after(async () => {
  await client?.close()
  await rs?.stop()
})

/** boots a MongoDB service like an application start, each one with its own database */
async function boot(autoDeploy, database = `boot_${++n}`) {
  const srv = await cds.connect.to(`mongo_${n}_${Math.random().toString(36).slice(2)}`, { impl, url: rs.getUri(), database, autoDeploy })
  const db = client.db(database)
  const collections = (await db.listCollections({}, { nameOnly: true }).toArray()).map(c => c.name)
  const books = collections.includes('sap_capire_bookshop_Books') ? await db.collection('sap_capire_bookshop_Books').countDocuments() : 0
  return { srv, db, database, collections, books }
}

describe('autoDeploy option', () => {
  test('true: collections, indexes and initial data are created on boot', async () => {
    const { srv, db, collections, books } = await boot(true)
    assert.ok(collections.includes('sap_capire_bookshop_Books'))
    assert.ok(collections.includes('sap_capire_bookshop_Books_texts'))
    assert.equal(books, 5)
    const indexes = (await db.collection('sap_capire_bookshop_Books').indexes()).map(i => i.name)
    assert.ok(indexes.includes('cap_pk') && indexes.includes('cap_uq_isbn'), indexes.join())
    await srv.disconnect()
  })

  test('false: nothing is deployed on boot', async () => {
    const { srv, collections } = await boot(false)
    assert.deepEqual(collections, [])
    await srv.disconnect()
  })

  test('"schema": collections and indexes only, no initial data', async () => {
    const { srv, collections, books } = await boot('schema')
    assert.ok(collections.includes('sap_capire_bookshop_Books'))
    assert.equal(books, 0)
    await srv.disconnect()
  })

  test('string values from environment variables: "false" switches it off, "true" on', async () => {
    let r = await boot('false')
    assert.deepEqual(r.collections, [])
    await r.srv.disconnect()
    r = await boot('true')
    assert.equal(r.books, 5)
    await r.srv.disconnect()
  })

  test('not configured: deploys on boot (default)', async () => {
    const { srv, books } = await boot(undefined)
    assert.equal(books, 5)
    await srv.disconnect()
  })

  test('a second boot keeps existing data (never overwrites or duplicates)', async () => {
    const first = await boot(true, 'boot_again')
    await first.db.collection('sap_capire_bookshop_Books').updateOne({ ID: 201 }, { $set: { title: 'changed by user' } })
    await first.db.collection('sap_capire_bookshop_Books').deleteOne({ ID: 207 })
    await first.srv.disconnect()
    const second = await boot(true, 'boot_again')
    assert.equal(second.books, 4)
    assert.equal((await second.db.collection('sap_capire_bookshop_Books').findOne({ ID: 201 })).title, 'changed by user')
    await second.srv.disconnect()
  })

  test('invalid values fail the boot with a clear error', async () => {
    await assert.rejects(boot('sometimes'), e => e.code === 'MONGO_CONFIG_INVALID' && /autoDeploy/.test(e.message))
  })

  test('dbName: the database is created with that name on boot', async () => {
    const srv = await cds.connect.to('mongo_dbname', { impl, url: rs.getUri(), dbName: 'anubhav', autoDeploy: true })
    const dbs = (await client.db().admin().listDatabases()).databases.map(d => d.name)
    assert.ok(dbs.includes('anubhav'), dbs.join())
    assert.equal(await client.db('anubhav').collection('sap_capire_bookshop_Books').countDocuments(), 5)
    assert.match(srv.url4(), /\(database: anubhav\)/)
    await srv.disconnect()
  })

  test('no dbName: the database is named after the project', async () => {
    const { projectDatabaseName } = require('../lib/connection')
    const expected = projectDatabaseName() // package.json of cds.root
    const srv = await cds.connect.to('mongo_project', { impl, url: rs.getUri(), autoDeploy: true })
    const dbs = (await client.db().admin().listDatabases()).databases.map(d => d.name)
    assert.ok(dbs.includes(expected), `${expected} not in ${dbs}`)
    assert.equal(await client.db(expected).collection('sap_capire_bookshop_Books').countDocuments(), 5)
    await srv.disconnect()
  })

  test('value parsing', () => {
    for (const v of [true, 'true', 'TRUE', '1', 'yes', 'on', undefined, null]) assert.equal(autoDeployMode(v), 'full', String(v))
    for (const v of [false, 'false', 'False', '0', 'no', 'off', '']) assert.equal(autoDeployMode(v), false, String(v))
    assert.equal(autoDeployMode('schema'), 'schema')
  })
})
