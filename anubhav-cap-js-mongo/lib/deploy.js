const cds = require('@sap/cds')
const path = require('path')
const { persistedEntities, collectionName4, fk4 } = require('./model')
const { typeOf } = require('./converters')
const { LOG, translate } = require('./errors')

/**
 * Schema deployment for MongoDB:
 *  - one collection per persisted entity (including draft tables and .texts entities)
 *  - unique index "cap_pk" on the primary key elements
 *  - unique indexes "cap_uq_<name>" for @assert.unique constraints
 *  - indexes "cap_fk_<assoc>" on foreign keys of managed associations (fast $expand / navigation)
 */

/** Returns the index definitions for an entity */
function indexes4(entity) {
  const list = []
  const keys = Object.values(entity.keys || {}).filter(k => !k.virtual && !k.isAssociation && !(k.value && !k.value.stored))
  if (keys.length) list.push({ key: Object.fromEntries(keys.map(k => [k.name, 1])), name: 'cap_pk', unique: true })

  if (!entity.isDraft) {
    for (const anno in entity) {
      const value = entity[anno]
      if (!anno.startsWith('@assert.unique.') || !Array.isArray(value)) continue
      const fields = value.flatMap(v => _uniqueFields(entity, v))
      if (!fields.length) continue
      // like SQL unique constraints, rows with NULL values are not considered duplicates
      const partialFilterExpression = Object.fromEntries(fields.map(f => [f, { $type: _bsonType(entity.elements[f]) }]))
      list.push({ key: Object.fromEntries(fields.map(f => [f, 1])), name: `cap_uq_${anno.slice(15)}`, unique: true, partialFilterExpression })
    }
  }

  for (const a of Object.values(entity.elements || {})) {
    if (!a.isAssociation || !a.keys?.length || a.virtual) continue
    const fks = a.keys.map(k => fk4(a, k)).filter(n => entity.elements[n] && !entity.keys?.[n])
    if (!fks.length) continue
    const key = Object.fromEntries(fks.map(f => [f, 1]))
    if (list.some(i => JSON.stringify(Object.keys(i.key).slice(0, fks.length)) === JSON.stringify(fks))) continue
    list.push({ key, name: `cap_fk_${a.name}` })
  }
  return list
}

const _bsonType = el => {
  switch (typeOf(el)) {
    case 'cds.Boolean':
      return 'bool'
    case 'cds.Integer':
    case 'cds.Int16':
    case 'cds.Int32':
    case 'cds.UInt8':
    case 'cds.Int64':
    case 'cds.Double':
      return 'number'
    case 'cds.Decimal':
      return 'decimal'
    case 'cds.DateTime':
    case 'cds.Timestamp':
      return 'date'
    case 'cds.Binary':
    case 'cds.LargeBinary':
      return 'binData'
    default:
      return 'string'
  }
}

function _uniqueFields(entity, v) {
  const name = v?.['='] || v?.ref?.join('_') || (typeof v === 'string' ? v : undefined)
  if (!name) return []
  const el = entity.elements[name] || entity.elements[name.replace(/\./g, '_')]
  if (!el) return []
  if (el.isAssociation && el.keys) return el.keys.map(k => fk4(el, k))
  return [el.name]
}

/**
 * Creates collections and indexes for all persisted entities of the model.
 * @param {import('mongodb').Db} db
 * @param {object} model - linked model (cds.compile.for.nodejs)
 * @param {{ drop?: boolean, dry?: boolean, log?: Function }} [o]
 */
async function deploySchema(db, model, o = {}) {
  const entities = persistedEntities(model)
  if (o.dry) {
    const out = o.log || console.log // eslint-disable-line no-console
    for (const [coll, e] of entities)
      out(`db.createCollection("${coll}")  // ${e.name}\n` + indexes4(e).map(({ key, ...o }) => `db.${coll}.createIndex(${JSON.stringify(key)}, ${JSON.stringify(o)})`).join('\n'))
    return entities
  }
  const existing = new Set((await db.listCollections({}, { nameOnly: true }).toArray()).map(c => c.name))
  for (const [coll, entity] of entities) {
    try {
      if (o.drop && existing.has(coll)) {
        await db.collection(coll).drop()
        existing.delete(coll)
      }
      if (!existing.has(coll)) await db.createCollection(coll).catch(e => (e.code === 48 ? null : Promise.reject(e)))
      const wanted = indexes4(entity)
      if (!wanted.length) continue
      const current = new Map((await db.collection(coll).indexes()).map(i => [i.name, i]))
      for (const { key, ...options } of wanted) {
        const cur = current.get(options.name)
        const same =
          cur &&
          JSON.stringify(cur.key) === JSON.stringify(key) &&
          !!cur.unique === !!options.unique &&
          JSON.stringify(cur.partialFilterExpression) === JSON.stringify(options.partialFilterExpression)
        if (same) continue
        if (cur) await db.collection(coll).dropIndex(options.name)
        await db.collection(coll).createIndex(key, options)
      }
    } catch (e) {
      const err = translate(e, { entity: entity.name, operation: 'deployment' })
      if (e.code === 11000 || e.code === 11001)
        err.message = `Cannot create unique index on collection "${coll}" (${entity.name}) because it contains duplicate key values. Clean up the data or redeploy with drop.`
      throw err
    }
  }
  return entities
}

/**
 * Loads initial data (.csv, .json) from db/data, db/csv, test/data (development) into collections
 * which are still empty. Never overwrites existing data.
 * @param {import('./MongoService')} tx - transactional MongoService instance
 * @returns {Promise<string[]>} names of seeded entities
 */
async function seedIfEmpty(tx, model) {
  const resources = await cds.deploy.resources(model)
  const files = Object.entries(resources).reverse()
  if (!files.length) return []

  const byEntity = new Map()
  for (const [file, entity] of files) {
    if (entity === '*') {
      LOG.debug?.(`Skipping ${cds.utils.local(file)} - init.js/ts files are only executed by an explicit deployment`)
      continue
    }
    if (!byEntity.has(entity)) byEntity.set(entity, [])
    byEntity.get(entity).push(file)
  }

  const csvs = {}
  const others = []
  const seeded = []
  for (const [name, list] of byEntity) {
    const def = model.definitions[name]
    if (!def) continue
    const coll = collectionName4(def)
    const any = await tx._aggregate(coll, [{ $limit: 1 }, { $project: { _id: 1 } }])
    if (any.length) continue
    seeded.push(name)
    for (const file of list) {
      if (path.extname(file) === '.csv') csvs[file] = await cds.utils.read(file, 'utf8')
      else others.push([file, name])
    }
  }
  if (Object.keys(csvs).length) await cds.deploy.data(tx, model, {}, csvs, f => LOG.debug?.('init from', cds.utils.local(f)))
  for (const [file, name] of others) {
    const src = await cds.utils.read(file, 'utf8')
    const records = path.extname(file) === '.json' ? JSON.parse(src) : cds.utils.yaml?.parse(src)
    if (records?.length) await tx.run(cds.ql.INSERT.into(name).entries(records))
  }
  return seeded
}

module.exports = { deploySchema, seedIfEmpty, indexes4 }
