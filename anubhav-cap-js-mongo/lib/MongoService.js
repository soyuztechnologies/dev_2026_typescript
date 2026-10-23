const cds = require('@sap/cds')
const { Readable } = require('stream')
const { DatabaseService } = require('@cap-js/db-service')
const fillInKeys = require('@cap-js/db-service/lib/fill-in-keys')
const { onDeep } = require('@cap-js/db-service/lib/deep-queries')
const InsertResults = require('@cap-js/db-service/lib/InsertResults')

const { resolveConnection, acquireClient, releaseClient } = require('./connection')
const { canResolveDestinations } = require('./destination')
const { CQN2Mongo, Parser, and, isNever, tupleIn } = require('./cqn2mongo')
const { Select } = require('./select')
const { joinSpec, fk4, persistedEntities } = require('./model')
const { toBSON, toBSONAsync, fromBSON, typeOf, isStream } = require('./converters')
const { deploySchema, seedIfEmpty } = require('./deploy')
const { translate, unsupported, badInput, error, maskUrl, LOG } = require('./errors')

const DEBUG = cds.debug('mongo')

/**
 * A pooled "connection": MongoDB clients have their own socket pool, so a connection in the
 * CAP pool is a light-weight handle on the shared client plus the session of the current
 * transaction. Operations of one transaction are serialized, as MongoDB sessions do not
 * support concurrent operations.
 */
class MongoConnection {
  constructor(entry, conn, srv) {
    this.entry = entry
    this.client = entry.client
    this.db = entry.client.db(conn.database)
    this.conn = conn
    this.useTx = srv._state.useTransactions
    this.txOptions = srv.options.transactionOptions
    this.session = null
    this.vars = {}
    this._queue = Promise.resolve()
  }

  /** Runs fn(session) after all previously queued operations of this connection */
  run(fn, { write = false } = {}) {
    const p = this._queue.then(() => {
      if (write && this.useTx && !this.session) {
        this.session = this.client.startSession()
        this.session.startTransaction(this.txOptions)
      }
      return fn(this.session || undefined)
    })
    this._queue = p.catch(() => {})
    return p
  }

  async end(commit) {
    return this.run(async () => {
      const s = this.session
      if (!s) return
      try {
        if (s.inTransaction()) {
          if (commit) await s.commitTransaction()
          else await s.abortTransaction().catch(() => {}) // never hide the error which caused the rollback
        }
      } finally {
        this.session = null
        await s.endSession().catch(() => {})
      }
    })
  }
}

class MongoService extends DatabaseService {
  init() {
    // Connection state lives in an object owned by the root service, as transactions are
    // derived from it (Object.create) and would otherwise store their own copies.
    this._state = { entry: null, conn: null, useTransactions: undefined, logged: false }
    // same generic handlers as @cap-js/db-service SQLService: UUID keys, foreign keys, deep insert/update
    this.on(['INSERT', 'UPSERT', 'UPDATE'], fillInKeys)
    this.on(['INSERT', 'UPSERT', 'UPDATE'], onDeep)
    this.on('SELECT', this.onSELECT)
    this.on('INSERT', this.onINSERT)
    this.on('UPSERT', this.onUPSERT)
    this.on('UPDATE', this.onUPDATE)
    this.on('DELETE', this.onDELETE)
    this.on(['BEGIN', 'COMMIT', 'ROLLBACK'], this.onEVENT)
    this.on('*', this.onPlainQuery)
    require('./patch-deploy')()
    const done = super.init()
    const mode = autoDeployMode(this.options.autoDeploy) // validates the option at boot, also when switched off
    if (!mode || !this.model?.definitions || cds.requires.multitenancy) return done
    return Promise.resolve(done).then(() => this.autoDeploy())
  }

  get isMongoService() {
    return true
  }

  /** Optional server-side time limit for queries: cds.requires["anubhav-mongo"].maxTimeMS */
  get _limits() {
    const ms = this.options.maxTimeMS
    return ms > 0 ? { maxTimeMS: ms } : undefined
  }

  // --- connection handling --------------------------------------------------------------------

  /** Pool factory as expected by @cap-js/db-service */
  get factory() {
    return {
      options: { min: 0, max: 100, acquireTimeoutMillis: 10000, ...this.options.pool },
      create: async () => {
        const entry = await this._client()
        return new MongoConnection(entry, this._state.conn, this)
      },
      destroy: dbc => dbc.end(false),
      validate: () => true
    }
  }

  /** True if MongoDB transactions are used (replica sets / Atlas), known after connecting */
  get _useTransactions() {
    return this._state?.useTransactions
  }

  /** Resolves the connection (credentials or destination) and connects the shared MongoClient */
  _client() {
    const state = this._state
    if (state.entry) return state.entry
    return (state.entry = (async () => {
      const conn = (state.conn = await resolveConnection(this.options))
      const entry = await acquireClient(conn)
      const t = this.options.transactions ?? 'auto'
      if (t === 'auto') {
        try {
          const hello = await entry.client.db('admin').command({ hello: 1 })
          state.useTransactions = !!(hello.setName || hello.msg === 'isdbgrid')
        } catch {
          state.useTransactions = false
        }
        if (!state.useTransactions) LOG.info('MongoDB server is a standalone instance -> running without transactions')
      } else state.useTransactions = t === true || t === 'true'
      if (!state.logged) LOG.info(`connected to ${conn.display} via ${conn.source}`)
      state.logged = true
      return entry
    })().catch(e => {
      state.entry = null
      throw translate(e, { url: state.conn?.url })
    }))
  }

  async disconnect(tenant) {
    await super.disconnect(tenant)
    const state = this._state
    if (tenant || !state?.entry) return
    const entry = await state.entry.catch(() => null)
    state.entry = null
    if (entry) await releaseClient(entry)
  }

  url4() {
    if (this._state?.conn?.display) return this._state.conn.display
    // not connected yet -> describe what will be used, following the precedence in resolveConnection()
    const o = this.options
    const url = o.url || o.credentials?.url || o.credentials?.uri || process.env.MONGODB_URI
    if (o.destination && (canResolveDestinations() || !url)) return `destination ${o.destination}`
    return maskUrl(url || 'mongodb').replace(/\?.*$/, '')
  }

  set(variables) {
    if (this.dbc) this.dbc.vars = variables
  }

  release() {
    if (this.dbc) this.dbc.vars = {}
    return super.release()
  }

  ensureDBC() {
    return this.dbc || cds.error`Database connection is ${this._done || 'disconnected'}`
  }

  /** Begins the transaction lazily (same as cds does on the first dispatch) and returns the connection */
  async _dbc() {
    if (this.dbc) return this.dbc
    if (this.context && !this.ready) this.ready = this.begin().then(() => true)
    if (this.ready) await this.ready
    return this.ensureDBC()
  }

  async onEVENT({ event }) {
    DEBUG?.(event)
    if (event === 'BEGIN') return
    const dbc = this.ensureDBC()
    try {
      await dbc.end(event === 'COMMIT')
    } catch (e) {
      throw translate(e, { url: dbc.conn.url, operation: event.toLowerCase() })
    }
  }

  // --- low level operations (used by the query compilers) ---------------------------------------

  async _op(collection, operation, fn, write) {
    const dbc = await this._dbc()
    return dbc.run(async session => {
      try {
        return await fn(dbc.db.collection(collection), session ? { session } : {})
      } catch (e) {
        throw translate(e, { url: dbc.conn.url, entity: collection, operation })
      }
    }, { write })
  }

  _aggregate(collection, pipeline) {
    DEBUG?.(`db.${collection}.aggregate(${_json(pipeline)})`)
    return this._op(collection, 'read', (c, o) => c.aggregate(pipeline, { ...o, ...this._limits, allowDiskUse: true }).toArray())
  }

  _count(collection, filter) {
    DEBUG?.(`db.${collection}.countDocuments(${_json(filter)})`)
    return this._op(collection, 'count', (c, o) => c.countDocuments(filter, { ...o, ...this._limits }))
  }

  /** Distinct value tuples of the given fields: [[v1, v2], ...] */
  async _distinct(collection, paths, filter) {
    if (isNever(filter)) return []
    const id = paths.length === 1 ? '$' + paths[0] : Object.fromEntries(paths.map((p, i) => ['k' + i, '$' + p]))
    const docs = await this._aggregate(collection, [{ $match: filter }, { $group: { _id: id } }])
    const tuples = docs.map(d => (paths.length === 1 ? [d._id] : paths.map((_, i) => d._id?.['k' + i])))
    return tuples.filter(t => t.every(v => v !== null && v !== undefined))
  }

  _write(collection, operation, fn) {
    return this._op(collection, operation, fn, true)
  }

  /** Runs a SELECT query (used for sub queries) and always returns an array */
  async _select(query) {
    const q = query.SELECT ? query : { SELECT: query }
    const r = await new Select(new CQN2Mongo(this)).run(q)
    return Array.isArray(r) ? r : r ? [r] : []
  }

  // --- CRUD handlers ------------------------------------------------------------------------------

  async onSELECT({ query, iterator, objectMode }) {
    const result = await new Select(new CQN2Mongo(this)).run(query)
    if (!iterator) return result
    const rows = Array.isArray(result) ? result : result ? [result] : []
    if (objectMode) return Readable.from(rows, { objectMode: true })
    return Readable.from([JSON.stringify(query.SELECT.one ? (rows[0] ?? null) : rows)])
  }

  async onINSERT({ query }) {
    const I = query.INSERT
    const c = new CQN2Mongo(this)
    const { scope, parentKeys } = await this._insertTarget(c, I.into)
    let entries
    if (I.entries) entries = I.entries
    else if (I.rows || I.values) {
      const cols = I.columns || scope.starColumns
      entries = (I.rows || [I.values]).map(row => Object.fromEntries(cols.map((col, i) => [col, row[i]])))
    } else if (I.as || I.from) {
      const rows = await this._select(I.as || I.from)
      entries = I.columns ? rows.map(r => Object.fromEntries(I.columns.map((col, i) => [col, Object.values(r)[i]]))) : rows
    }
    if (!entries?.length) return new InsertResults(query, [{ changes: 0 }])
    const docs = []
    for (const e of entries) docs.push(await this._document(c, scope, parentKeys ? { ...parentKeys, ...e } : e, 'insert'))
    DEBUG?.(`db.${scope.collection}.insertMany(${_json(docs)})`)
    await this._write(scope.collection, 'insert', (col, o) => col.insertMany(docs, { ...o, ordered: true }))
    return new InsertResults(query, [{ changes: docs.length }])
  }

  async onUPSERT({ query }) {
    const U = query.UPSERT
    const c = new CQN2Mongo(this)
    const { scope, parentKeys } = await this._insertTarget(c, U.into)
    let entries = U.entries
    if (!entries && (U.rows || U.values)) {
      const cols = U.columns || scope.starColumns
      entries = (U.rows || [U.values]).map(row => Object.fromEntries(cols.map((col, i) => [col, row[i]])))
    }
    if (!entries?.length) return this._return_affected(0)
    const base = scope.base.entity
    const keys = Object.values(base.keys || {}).filter(k => !k.virtual && !k.isAssociation).map(k => k.name)
    if (!keys.length) throw unsupported(`UPSERT on entity ${scope.name} without primary key`)
    const ops = []
    for (const e of entries) {
      const data = parentKeys ? { ...parentKeys, ...e } : e
      const set = await this._document(c, scope, data, 'update')
      const filter = {}
      for (const k of keys) {
        if (set[k] === undefined || set[k] === null) throw badInput(`UPSERT into ${scope.name} requires a value for key element "${k}"`)
        filter[k] = set[k]
        delete set[k]
      }
      this._onUpdate(c, base, set)
      const onInsert = this._defaults(c, scope, { ...set, ...filter })
      const setOnInsert = {}
      for (const f in onInsert) if (!(f in set) && !(f in filter)) setOnInsert[f] = onInsert[f]
      const update = {}
      if (Object.keys(set).length) update.$set = set
      update.$setOnInsert = Object.keys(setOnInsert).length ? setOnInsert : filter
      ops.push({ updateOne: { filter, update, upsert: true } })
    }
    DEBUG?.(`db.${scope.collection}.bulkWrite(${_json(ops)})`)
    const res = await this._write(scope.collection, 'upsert', (col, o) => col.bulkWrite(ops, { ...o, ordered: true }))
    return this._return_affected((res.upsertedCount || 0) + (res.matchedCount || 0))
  }

  async onUPDATE({ query }) {
    const U = query.UPDATE
    const c = new CQN2Mongo(this)
    const { scope, filter: f0 } = await c.from(U.entity)
    const filter = and(f0, await c.where(scope, U.where))
    const set = U.data ? await this._document(c, scope, U.data, 'update') : {}
    const exprs = {}
    for (const [k, v] of Object.entries(U.with || {})) {
      if (_isExpression(v)) {
        if ('val' in v && Object.keys(v).length === 1) Object.assign(set, await this._document(c, scope, { [k]: v.val }, 'update'))
        else {
          const r = scope.resolve(k)
          if (r?.kind !== 'field') throw badInput(`Cannot update element "${k}" of entity ${scope.name}`)
          exprs[r.path] = c.expr(scope, Parser.operand(v), r.element)
        }
      } else Object.assign(set, await this._document(c, scope, { [k]: v }, 'update'))
    }
    for (const k in exprs) delete set[k]
    if (!Object.keys(set).length && !Object.keys(exprs).length && !_hasOnUpdate(scope.base.entity)) return this._return_affected(0)
    this._onUpdate(c, scope.base.entity, set, exprs)
    if (isNever(filter)) return this._return_affected(0)
    const update = Object.keys(exprs).length ? [{ $set: { ..._literals(set), ...exprs } }] : { $set: set }
    DEBUG?.(`db.${scope.collection}.updateMany(${_json(filter)}, ${_json(update)})`)
    const res = await this._write(scope.collection, 'update', (col, o) => col.updateMany(filter, update, o))
    return this._return_affected(res.matchedCount)
  }

  async onDELETE({ query }) {
    const D = query.DELETE
    const c = new CQN2Mongo(this)
    const { scope, filter: f0 } = await c.from(D.from)
    const filter = and(f0, await c.where(scope, D.where))
    return this._return_affected(await this._deleteDeep(c, scope.base, filter, 0))
  }

  /** Deletes documents including their compositions (depth-first), like deep delete in SQL services */
  async _deleteDeep(c, base, filter, depth) {
    if (isNever(filter)) return 0
    if (depth > 64) throw error(500, 'MONGO_DEEP_DELETE', `Deep delete exceeded maximum depth for ${base.name}`)
    for (const comp of Object.values(base.entity.elements || {})) {
      if (!comp.isComposition || comp._target?.['@cds.persistence.skip'] === true) continue
      const t = c.info(comp._target).base
      const spec = joinSpec(comp)
      const src = spec.pairs.map(p => base.fieldPath(p.src))
      const tgt = spec.pairs.map(p => t.fieldPath(p.tgt))
      if (src.some(p => !p) || tgt.some(p => !p)) continue
      const tuples = await this._distinct(base.collection, src, filter)
      if (!tuples.length) continue
      await this._deleteDeep(c, t, and(tupleIn(tgt, tuples), await c.targetFilters(t, spec)), depth + 1)
    }
    DEBUG?.(`db.${base.collection}.deleteMany(${_json(filter)})`)
    const res = await this._write(base.collection, 'delete', (col, o) => col.deleteMany(filter, o))
    return res.deletedCount
  }

  /** Target of INSERT/UPSERT; for path inserts like Authors(1)/books the parent's keys */
  async _insertTarget(c, into) {
    const ref = typeof into === 'string' ? [into] : into?.ref || [into?.name]
    if (!ref?.[0]) throw unsupported('INSERT without target entity')
    if (ref.length === 1) return { scope: c.info(ref[0].id || ref[0]).assertPersistent() }
    const parent = await c.from({ ref: ref.slice(0, -1) })
    const name = ref.at(-1).id || ref.at(-1)
    const r = parent.scope.resolve(name)
    if (r?.kind !== 'assoc') throw badInput(`"${name}" is not an association of entity "${parent.scope.name}"`)
    const scope = c.info(r.element._target).assertPersistent()
    const spec = joinSpec(r.element)
    const src = spec.pairs.map(p => parent.scope.fieldPath(p.src))
    const tuples = await this._distinct(parent.scope.collection, src, parent.filter)
    if (tuples.length !== 1) throw error(404, 'MONGO_PARENT_NOT_FOUND', `Parent entity ${parent.scope.name} for insert into ${name} not found`)
    const parentKeys = {}
    spec.pairs.forEach((p, i) => (parentKeys[p.tgt] = fromBSON(scope.resolve(p.tgt)?.element, tuples[0][i], { streams: false })))
    for (const f of spec.tgtFilters) if (f.op === '=' && f.ref.length === 1) parentKeys[f.ref[0]] = f.session ? c.session(f.session) : f.val
    return { scope, parentKeys }
  }

  /**
   * Converts CAP data into a MongoDB document with stored field names and BSON types.
   * mode 'insert' also applies defaults, @cds.on.insert values and generated UUID keys.
   */
  async _document(c, scope, data, mode) {
    const doc = {}
    const elements = scope.entity.elements || {}
    const put = async (name, value) => {
      const r = scope.resolve(name)
      if (r?.kind !== 'field') return
      _set(doc, r.path, await toBSONAsync(r.element, value))
    }
    const visit = async (prefix, obj) => {
      for (const k in obj) {
        const v = obj[k]
        const name = prefix + k
        if (v === undefined) continue
        const el = elements[name]
        if (el?.isAssociation) {
          // managed to-one given as object, e.g. author: { ID: 1 }
          if (el.keys && !el.is2many && v && typeof v === 'object' && !Array.isArray(v))
            for (const key of el.keys) {
              const fk = fk4(el, key)
              const kv = v[key.ref.join('_')] ?? v[key.ref[0]]
              if (kv !== undefined && obj[fk] === undefined) await put(fk, kv)
            }
          else if (el.keys && v === null && !el.is2many) for (const key of el.keys) if (obj[fk4(el, key)] === undefined) await put(fk4(el, key), null)
          continue
        }
        if (el) await put(name, v)
        else if (v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date) && !Buffer.isBuffer(v) && !isStream(v)) await visit(name + '_', v)
      }
    }
    await visit('', data)
    return mode === 'insert' ? this._defaults(c, scope, doc) : doc
  }

  /** Applies defaults, @cds.on.insert values and generated UUID keys to a new document */
  _defaults(c, scope, doc) {
    for (const el of Object.values(scope.base.entity.elements || {})) {
      if (el.isAssociation || el.virtual || (el.value && !el.value.stored) || (el.elements && !el.items)) continue
      if (doc[el.name] !== undefined) continue
      const managed = el['@cds.on.insert']
      if (managed) doc[el.name] = toBSON(el, _managed(c, managed))
      else if (el.default && 'val' in el.default) doc[el.name] = toBSON(el, el.default.val)
      else if (el.default?.ref || el.default?.func) doc[el.name] = toBSON(el, _managed(c, el.default))
      else if (el.key && typeOf(el) === 'cds.UUID') doc[el.name] = cds.utils.uuid()
      else if (el.key) throw badInput(`Value for key element "${el.name}" of entity ${scope.name} is missing`, { target: el.name })
      else if (el.notNull) throw error(400, 'ASSERT_NOT_NULL', `Value for element "${el.name}" of entity ${scope.name} must not be null`, undefined, { target: el.name })
    }
    return doc
  }

  _onUpdate(c, base, set, exprs = {}) {
    for (const el of Object.values(base.elements || {})) {
      const managed = el['@cds.on.update']
      if (managed && set[el.name] === undefined && !(el.name in exprs)) set[el.name] = toBSON(el, _managed(c, managed))
    }
  }

  // --- deployment -------------------------------------------------------------------------------

  /**
   * Deploys the model on boot of the application if cds.requires["anubhav-mongo"].autoDeploy is
   * true (default): creates missing collections and indexes, and loads initial data from csv files
   * into empty collections. Never deletes or changes existing data.
   * With autoDeploy: "schema" only collections and indexes are created.
   */
  async autoDeploy() {
    const mode = autoDeployMode(this.options.autoDeploy) || 'full'
    const t0 = Date.now()
    let seeded = []
    await this.tx(async tx => {
      await tx.deploySchema(this.model, { drop: false })
      if (mode === 'full') seeded = await seedIfEmpty(tx, this.model)
    })
    LOG.info(
      `${persistedEntities(this.model).size} collections ready in ${Date.now() - t0} ms` + (seeded.length ? `, initial data loaded into: ${seeded.join(', ')}` : '')
    )
  }

  /** Creates collections and indexes; used by cds deploy (drop: true), autoDeploy and the CLI */
  async deploySchema(csn = this.model, o = {}) {
    const model = csn === this.model ? csn : cds.linked(cds.compile.for.nodejs(csn))
    if (o.dry) return deploySchema(null, model, { dry: true })
    const db = (await this._client()).client.db(this._state.conn.database)
    try {
      await deploySchema(db, model, { drop: o.drop })
    } catch (e) {
      throw translate(e, { url: this._state.conn?.url, operation: 'deployment' })
    }
    return true
  }

  // --- native access ------------------------------------------------------------------------------

  /**
   * Run native MongoDB operations within the current transaction:
   *   await cds.db.native(async ({ db, session, collection }) => collection(Books).find({}, { session }).toArray())
   */
  async native(fn) {
    if (!this.context) return this.tx(tx => tx.native(fn))
    const dbc = await this._dbc()
    return dbc.run(
      session =>
        fn({
          db: dbc.db,
          client: dbc.client,
          session,
          collection: e => dbc.db.collection(typeof e === 'string' && !this.model?.definitions[e] ? e : new CQN2Mongo(this).info(e).collection)
        }),
      { write: true }
    )
  }

  /** Name of the MongoDB collection used for an entity */
  collectionName(entity) {
    return new CQN2Mongo(this).info(entity).collection
  }

  // --- plain queries ------------------------------------------------------------------------------

  async onPlainQuery({ query, data }, next) {
    if (Array.isArray(query)) {
      const results = []
      for (const q of query) results.push(await this.run(q, data))
      return results
    }
    if (typeof query !== 'string') return next()
    // SECURITY: plain strings are never interpreted (no DDL/DROP via db.run('...')) - schema changes
    // only happen through cds deploy / autoDeploy, which create collections and indexes directly
    throw unsupported(`Native SQL ("${query.slice(0, 40)}...")`, { hint: 'Use CQL, or cds.db.native() for native MongoDB operations' })
  }
}

/**
 * Normalizes the autoDeploy option: false | 'schema' | 'full'.
 * Accepts booleans as well as strings, as values from environment variables (e.g. CDS_CONFIG)
 * arrive as strings - "false" must not switch deployment on.
 */
function autoDeployMode(value) {
  if (value === undefined || value === null || value === true) return 'full' // default: deploy on boot
  if (value === false) return false
  const v = String(value).trim().toLowerCase()
  if (['true', '1', 'yes', 'on', 'full'].includes(v)) return 'full'
  if (['false', '0', 'no', 'off', ''].includes(v)) return false
  if (v === 'schema') return 'schema'
  throw error(500, 'MONGO_CONFIG_INVALID', `Invalid value ${JSON.stringify(value)} for cds.requires["anubhav-mongo"].autoDeploy - use true, false or "schema"`)
}

const _json = x => {
  try {
    return JSON.stringify(x)
  } catch {
    return String(x)
  }
}

const _isExpression = v => v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date) && !Buffer.isBuffer(v) && ('val' in v || v.ref || v.xpr || v.func || v.list || v.SELECT)

const _hasOnUpdate = e => Object.values(e.elements || {}).some(el => el['@cds.on.update'])

const _literals = set => Object.fromEntries(Object.entries(set).map(([k, v]) => [k, v === null ? null : { $literal: v }]))

function _managed(c, spec) {
  const v = spec?.['='] ?? (spec?.ref ? spec.ref.join('.') : spec?.func ? spec.func : spec)
  if (typeof v !== 'string') return v?.val ?? v
  if (v === '$uuid') return cds.utils.uuid()
  if (v === 'now' || v === 'current_timestamp' || v === 'CURRENT_TIMESTAMP') return c.session('$now')
  if (v.startsWith('$')) return c.session(v)
  return v
}

function _set(doc, path, v) {
  if (!path.includes('.')) return void (doc[path] = v)
  const segs = path.split('.')
  let o = doc
  for (const s of segs.slice(0, -1)) o = o[s] ??= {}
  o[segs.at(-1)] = v
}

module.exports = MongoService
module.exports.MongoService = MongoService
module.exports.autoDeployMode = autoDeployMode
