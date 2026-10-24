const cds = require('@sap/cds')

/**
 * @anubhav-cap-js/mongo - CDS plugin bootstrap
 *
 * Configure MongoDB in package.json (or .cdsrc.json / .cdsrc-private.json):
 *
 *   "cds": { "requires": {
 *     "anubhav-mongo": {
 *       "url": "mongodb+srv://cluster0.xxxxx.mongodb.net",
 *       "credentials": { "user": "...", "password": "...", "database": "bookshop" },
 *       "destination": "MONGO_ATLAS"
 *     }
 *   }}
 *
 * With that, MongoDB becomes the primary database (cds.db) of the application. Set
 * "primary": false to keep another primary database and use cds.connect.to('anubhav-mongo').
 */

const KIND = 'anubhav-mongo'
const LOG = cds.log('mongo')
const { requires } = cds.env
const conf = requires?.[KIND]

if (conf && conf.primary !== false && requires.db !== conf) {
  if (requires.db?.kind && requires.db.kind !== KIND) LOG.debug?.(`using ${KIND} instead of "${requires.db.kind}" as primary database`)
  requires.db = conf
}

// cds.requires.db = { kind: 'anubhav-mongo' } with connection details in cds.requires['anubhav-mongo']
const db = requires?.db
if (db?.kind === KIND && conf && db !== conf) {
  for (const k of ['url', 'credentials', 'destination', 'dbName', 'database', 'client', 'autoDeploy', 'replaceMode', 'maxTimeMS', 'dnsServers']) if (db[k] === undefined && conf[k] !== undefined) db[k] = conf[k]
}

// `cds deploy` creates collections and indexes instead of SQL tables
if (db?.kind === KIND || conf) require('./lib/patch-deploy')()
