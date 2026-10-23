const dns = require('dns')
const fs = require('fs')
const path = require('path')
const cds = require('@sap/cds')
const { MongoClient } = require('mongodb')
const { readDestination, canResolveDestinations } = require('./destination')
const { configError, translate, maskUrl, LOG } = require('./errors')

const MONGO_URL = /^mongodb(\+srv)?:\/\//i
const DEFAULT_DATABASE = 'cap'
const INVALID_DB_CHARS = /[\/\\. "$*<>:|?\0]/g // not allowed in MongoDB database names
const MAX_DB_NAME = 63

/**
 * Determines how to connect to MongoDB from the service configuration, i.e. cds.requires['anubhav-mongo']:
 *
 *   {
 *     url: 'mongodb+srv://cluster0.xxxx.mongodb.net',           // connection string
 *     credentials: { user, password, database } | 'user:pass',  // hardcoded credentials (local development)
 *     destination: 'MONGO_ATLAS',                               // SAP BTP destination (deployed app)
 *     dbName: 'bookshop',                                       // database name (default: project name)
 *     client: { ...MongoClient options }
 *   }
 *
 * Precedence:
 *   1. destination - if configured and a destination service is reachable (bound / `destinations` env variable)
 *   2. url + credentials - hardcoded, from .cdsrc-private.json, from a bound user-provided service (tag "mongodb"),
 *      or from the MONGODB_URI environment variable
 */
async function resolveConnection(options) {
  const local = _fromOptions(options)

  if (options.destination) {
    if (canResolveDestinations()) {
      try {
        return await _fromDestination(options.destination, options)
      } catch (e) {
        if (!local.url) throw e
        LOG.warn(`${e.message}\n  -> falling back to url/credentials configured for anubhav-mongo`)
        return local
      }
    }
    if (!local.url)
      throw configError(
        `Destination "${options.destination}" is configured, but no destination service instance is bound to the application ` +
          `and no url/credentials are configured as fallback. Bind a destination service (cf bind-service / cds bind) ` +
          `or set the "destinations" environment variable for local testing`
      )
    LOG.debug?.(`Destination "${options.destination}" configured but no destination service bound -> using url/credentials`)
  }

  if (!local.url)
    throw configError('No MongoDB connection configured: neither "url", "credentials.url", "destination" nor environment variable MONGODB_URI is set')
  return local
}

function _fromOptions(options) {
  let creds = options.credentials
  if (typeof creds === 'string') {
    if (MONGO_URL.test(creds)) creds = { url: creds }
    else if (creds.includes(':')) {
      const i = creds.indexOf(':')
      creds = { user: creds.slice(0, i), password: creds.slice(i + 1) }
    } else throw configError('"credentials" must be an object { user, password }, a "user:password" string or a mongodb:// connection string')
  }
  creds ??= {}
  const url = options.url || creds.url || creds.uri || creds.connectionString || creds.connection_string || process.env.MONGODB_URI
  return _connection({
    source: options.url || creds.url || creds.uri ? 'credentials' : 'environment',
    url,
    user: creds.user ?? creds.username,
    password: creds.password,
    database: options.dbName || options.database || creds.database || creds.dbname || creds.db,
    authSource: creds.authSource,
    options
  })
}

async function _fromDestination(name, options) {
  const d = await readDestination(name, { useCache: options.destinationCache !== false })
  const p = d.properties || {}
  const prop = (...keys) => keys.map(k => p[k]).find(v => v !== undefined && v !== '')

  let url = prop('mongo.url', 'mongodb.url') || d.url
  if (!url) throw configError(`Destination "${name}" has no URL`)
  if (/^https?:\/\//i.test(url)) {
    // BTP cockpit only accepts http(s) URLs for HTTP destinations -> derive the mongo URL from the host name
    const srv = String(prop('mongo.srv') ?? 'true') !== 'false'
    const https = /^https:/i.test(url)
    url = url.replace(/^https?:\/\//i, srv ? 'mongodb+srv://' : 'mongodb://').replace(/\/+$/, '')
    // SECURITY: an https:// destination means encrypted transport (mongodb+srv:// implies TLS anyway)
    if (https && !srv) url += (url.includes('?') ? '&' : /^mongodb:\/\/[^/]+\//i.test(url) ? '?' : '/?') + 'tls=true'
  }
  const extra = prop('mongo.options')
  if (extra) url += (url.includes('?') ? '&' : /^mongodb(\+srv)?:\/\/[^/]+\//i.test(url) ? '?' : '/?') + extra.replace(/^\?/, '')

  return _connection({
    source: `destination "${name}"`,
    url,
    user: d.user,
    password: d.password,
    database: prop('mongo.database', 'database') || options.dbName || options.database,
    authSource: prop('mongo.authSource'),
    options
  })
}

function _connection({ source, url, user, password, database, authSource, options }) {
  if (!url) return { source }
  if (!MONGO_URL.test(url)) throw configError(`Invalid MongoDB connection string "${maskUrl(url)}" - it must start with mongodb:// or mongodb+srv://`)
  if (/<[^>]*>/.test(url) || /^<.*>$/.test(password || ''))
    throw configError(`The MongoDB connection still contains a placeholder like <password> or <cluster> ("${maskUrl(url)}") - replace it with real values`)
  if (user && password === undefined) throw configError(`MongoDB user "${user}" is configured without a password`)

  database ||= _databaseFromUrl(url) || projectDatabaseName()
  _assertDatabaseName(database)
  if ((user || /\/\/[^/@]+@/.test(url)) && _withoutTLS(url, options.client))
    LOG.warn(`Credentials are sent to ${maskUrl(url)} without TLS - add tls=true to the connection string (mongodb+srv:// uses TLS automatically)`)
  const clientOptions = {
    appName: '@anubhav-cap-js/mongo',
    serverSelectionTimeoutMS: 15000,
    ...options.client
  }
  if (user) clientOptions.auth = { username: user, password }
  if (authSource) clientOptions.authSource = authSource
  return {
    source,
    url,
    database,
    clientOptions,
    dnsServers: options.dnsServers,
    display: `${maskUrl(url).replace(/\?.*$/, '')} (database: ${database})`
  }
}

/** True for plain mongodb:// connections to remote hosts without TLS */
const _withoutTLS = (url, client = {}) => {
  if (/^mongodb\+srv:/i.test(url) || /[?&](tls|ssl)=true/i.test(url) || client.tls || client.ssl) return false
  const hosts = /^mongodb:\/\/(?:[^@/]*@)?([^/?]+)/i.exec(url)?.[1] || ''
  return hosts.split(',').some(h => !/^(localhost|127\.\d+\.\d+\.\d+|\[::1\])(:\d+)?$/i.test(h))
}

/**
 * Default database name: the name of the CAP project (package.json in cds.root), made a valid
 * MongoDB database name, e.g. "@my-org/bookshop.app" -> "my-org_bookshop_app"
 */
function projectDatabaseName(root = cds.root) {
  let name
  try {
    name = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).name
  } catch {
    /* no package.json */
  }
  name ||= path.basename(root || '')
  const db = String(name || '')
    .replace(/^@/, '')
    .replace(INVALID_DB_CHARS, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, MAX_DB_NAME)
  return db || DEFAULT_DATABASE
}

function _assertDatabaseName(name) {
  if (typeof name !== 'string' || !name || name.length > MAX_DB_NAME || new RegExp(INVALID_DB_CHARS.source).test(name))
    throw configError(`Invalid MongoDB database name ${JSON.stringify(name)} - use up to ${MAX_DB_NAME} characters without / \\ . " $ * < > : | ? or spaces (option "dbName")`)
}

const _databaseFromUrl = url => {
  const m = /^mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)/i.exec(url)
  return m && decodeURIComponent(m[1])
}

/**
 * MongoClient instances are expensive (each has its own socket pool) -> share them between
 * service instances using the same connection, with reference counting.
 */
const clients = new Map()

async function acquireClient(conn) {
  const key = JSON.stringify([conn.url, conn.clientOptions])
  let entry = clients.get(key)
  if (!entry) {
    entry = { key, refs: 0, client: null, ready: null }
    entry.ready = _connect(conn).then(
      client => (entry.client = client),
      e => {
        clients.delete(key)
        throw translate(e, { url: conn.url })
      }
    )
    clients.set(key, entry)
  }
  entry.refs++
  try {
    await entry.ready
  } catch (e) {
    entry.refs--
    throw e
  }
  return entry
}

async function releaseClient(entry) {
  if (!entry || --entry.refs > 0) return
  clients.delete(entry.key)
  await entry.client?.close().catch(e => LOG.debug?.('Error closing MongoClient', e))
}

async function _connect(conn) {
  try {
    return await _connectTo(conn.url, conn.clientOptions)
  } catch (e) {
    if (!_isSrvLookupFailure(e, conn.url)) throw e
    const servers = conn.dnsServers?.length ? conn.dnsServers : PUBLIC_DNS
    let url
    try {
      url = await _resolveSrvUrl(conn.url, servers)
    } catch (e2) {
      LOG.debug?.(`DNS SRV lookup via ${servers} failed as well`, e2)
      throw e
    }
    LOG.warn(
      `DNS SRV lookup of ${maskUrl(conn.url).replace(/\?.*$/, '')} failed with the DNS server of Node.js (${dns.getServers()}): ${e.code} ` +
        `- resolved it via ${servers} instead. Set option "dnsServers" or use the standard connection string (mongodb://) of your cluster to avoid this warning`
    )
    return _connectTo(url, conn.clientOptions)
  }
}

async function _connectTo(url, options) {
  const client = new MongoClient(url, options)
  try {
    return await client.connect()
  } catch (e) {
    await client.close().catch(() => {}) // stop the topology monitors, otherwise the process does not exit
    throw e
  }
}

/**
 * mongodb+srv:// needs a DNS SRV lookup. Node.js on Windows sometimes uses an unreachable DNS server
 * (e.g. 127.0.0.1) for it, while the OS resolves the host fine -> querySrv ECONNREFUSED / ETIMEOUT.
 * A wrong cluster host (ENOTFOUND / ENODATA) is not retried.
 */
const PUBLIC_DNS = ['8.8.8.8', '1.1.1.1']
const SRV_RETRY_CODES = new Set(['ECONNREFUSED', 'ETIMEOUT', 'ETIMEDOUT', 'ECONNRESET', 'EREFUSED', 'ESERVFAIL'])
const _isSrvLookupFailure = (e, url) => {
  if (!/^mongodb\+srv:/i.test(url)) return false
  const err = [e, e?.cause].find(x => x && (x.syscall === 'querySrv' || /querySrv/.test(x.message)))
  return !!err && SRV_RETRY_CODES.has(err.code)
}

/** Resolves a mongodb+srv:// URL to the equivalent mongodb:// seed list URL, like the MongoDB driver does */
async function _resolveSrvUrl(url, servers) {
  const m = /^mongodb\+srv:\/\/([^@/]*@)?([^/?,:]+)(\/[^?]*)?(\?.*)?$/i.exec(url)
  if (!m) throw new Error('Invalid mongodb+srv:// URL')
  const [, auth = '', host, db = '/', query = ''] = m
  const domain = host.split('.').slice(1).join('.')
  if (host.split('.').length < 3) throw new Error(`mongodb+srv:// host "${host}" needs at least 3 parts`)
  const resolver = new dns.promises.Resolver({ timeout: 5000, tries: 2 })
  resolver.setServers(servers)
  const [srv, txt] = await Promise.all([resolver.resolveSrv(`_mongodb._tcp.${host}`), resolver.resolveTxt(host).catch(() => [])])
  // SECURITY: like the driver, only accept hosts of the same domain as the cluster
  const hosts = srv.map(r => r.name.replace(/\.$/, ''))
  if (!hosts.length || hosts.some(h => !h.toLowerCase().endsWith(`.${domain.toLowerCase()}`)))
    throw new Error(`DNS SRV records of ${host} point to hosts outside of ${domain}`)
  const params = new URLSearchParams(txt.map(t => t.join('')).join('&'))
  for (const k of [...params.keys()]) if (!['authSource', 'replicaSet', 'loadBalanced'].includes(k)) params.delete(k)
  for (const [k, v] of new URLSearchParams(query.slice(1))) params.set(k, v) // options of the URL win
  if (!params.has('tls') && !params.has('ssl')) params.set('tls', 'true') // mongodb+srv:// implies TLS
  return `mongodb://${auth}${srv.map(r => `${r.name.replace(/\.$/, '')}:${r.port}`).join(',')}${db}?${params}`
}

module.exports = { resolveConnection, acquireClient, releaseClient, projectDatabaseName, DEFAULT_DATABASE, _srv: { isSrvLookupFailure: _isSrvLookupFailure, resolveSrvUrl: _resolveSrvUrl } }
