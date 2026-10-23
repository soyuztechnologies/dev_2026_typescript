const { unsupported, error } = require('./errors')

/**
 * Metadata layer: maps (service level) CDS entities to MongoDB collections.
 *
 * SQL databases deploy views for projections. MongoDB has no updatable views, so every projection
 * (e.g. `entity Books as projection on db.Books { *, title as name } where stock > 0`) is resolved
 * down to its persisted base entity at runtime:
 *  - the base entity determines the collection,
 *  - element renames are resolved to the stored field names,
 *  - projection where clauses become additional filters,
 *  - calculated elements and expression columns are evaluated by the query compiler.
 */

const CACHE = new WeakMap()

/** @returns {EntityInfo} */
function infoOf(entity, model) {
  let info = CACHE.get(entity)
  if (!info) CACHE.set(entity, (info = new EntityInfo(entity, model)))
  return info
}

/**
 * Default collection name: like SQL table names, e.g. my.bookshop.Books -> my_bookshop_Books.
 * Draft entities (X.drafts) inherit all annotations from their active entity via the prototype,
 * so they always get their own collection X_drafts.
 */
const collectionName4 = entity => {
  if (entity.isDraft && entity.actives) return collectionName4(entity.actives) + '_drafts'
  return entity['@mongo.collection'] || entity['@cds.persistence.name'] || entity.name.replace(/^localized\./, '').replace(/\./g, '_')
}

/** Query of a view / projection, undefined for entities stored in their own collection (incl. drafts) */
const query4 = entity => (entity.isDraft || entity['@cds.persistence.table'] ? undefined : entity.projection || entity.query?.SELECT)

class EntityInfo {
  constructor(entity, model) {
    this.entity = entity
    this.model = model
    this.name = entity.name
    const q = query4(entity)
    if (q) {
      const { from } = q
      if (!from?.ref || from.ref.length !== 1 || from.join || from.SET || from.args || from.ref[0].args)
        throw unsupported(`Views with joins, unions, parameters or path expressions in FROM (${entity.name})`)
      const f0 = from.ref[0]
      const src = model.definitions[f0.id || f0]
      if (!src) throw unsupported(`View ${entity.name} on unknown source ${f0.id || f0}`)
      this.alias = from.as
      this.columns = q.columns
      this.layerWhere = [f0.where, q.where].filter(w => w?.length)
      this.source = infoOf(src, model)
      this.base = this.source.base
    } else {
      this.base = this
    }
    this._resolved = new Map()
  }

  get isBase() {
    return this.base === this
  }

  get collection() {
    return (this._collection ??= collectionName4(this.base.entity))
  }

  /** Throws if the entity has no persistence (e.g. @cds.persistence.skip, remote entities) */
  assertPersistent() {
    const b = this.base.entity
    if (b['@cds.persistence.skip'] === true || b.kind !== 'entity')
      throw error(501, 'MONGO_NOT_PERSISTED', `Entity "${this.name}" is not persisted in MongoDB (@cds.persistence.skip or external entity)`)
    return this
  }

  /** Projection filters from this entity down to the base: [{ scope, where }] */
  get filters() {
    if (this._filters) return this._filters
    const filters = []
    for (let i = this; !i.isBase; i = i.source) for (const where of i.layerWhere) filters.push({ scope: i.source, where })
    return (this._filters = filters)
  }

  /** Foreign key element name -> { assoc, key } for managed associations */
  get foreignKeys() {
    if (this._fks) return this._fks
    const fks = new Map()
    for (const a of Object.values(this.entity.elements || {})) {
      if (!a.isAssociation || !a.keys) continue
      for (const k of a.keys) fks.set(fk4(a, k), { assoc: a, key: k })
    }
    return (this._fks = fks)
  }

  /**
   * Resolves an element of this entity to its storage, returning one of
   *   { kind: 'field', path, element }          stored field (path in the document)
   *   { kind: 'assoc', element, sourceName }    association / composition
   *   { kind: 'expr', scope, expr, element }    calculated element or expression column
   *   { kind: 'val', val, element }             constant column
   *   { kind: 'virtual', element }              virtual / not persisted
   *   undefined                                 unknown element
   */
  resolve(name) {
    if (this._resolved.has(name)) return this._resolved.get(name)
    const r = this._resolve(name)
    this._resolved.set(name, r)
    return r
  }

  _resolve(name) {
    const el = this.entity.elements?.[name]
    if (this.isBase) {
      if (!el) return
      if (el.virtual) return { kind: 'virtual', element: el }
      if (el.value && !el.value.stored) return { kind: 'expr', scope: this, expr: el.value, element: el }
      if (el.isAssociation) return { kind: 'assoc', element: el, sourceName: name }
      return { kind: 'field', path: name, element: el }
    }

    if (el?.virtual) return { kind: 'virtual', element: el }
    const c = this._column4(name)
    if (c) {
      if (c.ref) {
        const ref = this._strip(c.ref)
        if (ref.some(r => typeof r !== 'string')) return { kind: 'expr', scope: this.source, expr: { ref }, element: el }
        if (el?.isAssociation) return { kind: 'assoc', element: el, sourceName: ref.length === 1 ? ref[0] : undefined }
        const flat = ref.join('_')
        if (ref.length === 1 || this.source.entity.elements?.[flat]) {
          const r = this.source.resolve(flat)
          return r && { ...r, element: el || r.element }
        }
        return { kind: 'expr', scope: this.source, expr: { ref }, element: el }
      }
      if ('val' in c) return { kind: 'val', val: c.val, element: el }
      if (c.xpr || c.func || c.list) return { kind: 'expr', scope: this.source, expr: this._stripDeep(c), element: el }
      return { kind: 'virtual', element: el } // sub-selects, expand/inline in projections
    }
    if (el?.isAssociation) return { kind: 'assoc', element: el, sourceName: this.source.entity.elements?.[name] ? name : undefined }

    // foreign key of a (potentially renamed) managed association, e.g. writer_ID for `author as writer`
    const fk = this.foreignKeys.get(name)
    if (fk) {
      const a = this.resolve(fk.assoc.name)
      if (a?.sourceName && a.sourceName !== fk.assoc.name) {
        const r = this.source.resolve(a.sourceName + name.slice(fk.assoc.name.length))
        if (r) return { ...r, element: el || r.element }
      }
    }

    if (!el && !this.source.entity.elements?.[name]) return
    const r = this.source.resolve(name)
    return r && el ? { ...r, element: r.kind === 'field' || r.kind === 'expr' ? el : r.element } : r
  }

  _column4(name) {
    if (!this.columns) return
    for (const c of this.columns) {
      if (c === '*' || c.ref?.[0] === '*') continue
      const alias = c.as || (c.ref && c.ref.at(-1)) || c.func
      if ((alias?.id || alias) === name) return c
    }
  }

  _strip(ref) {
    return this.alias && ref.length > 1 && ref[0] === this.alias ? ref.slice(1) : ref
  }

  _stripDeep(x) {
    if (Array.isArray(x)) return x.map(y => this._stripDeep(y))
    if (!x || typeof x !== 'object') return x
    const r = { ...x }
    if (r.ref) r.ref = this._strip(r.ref)
    if (r.xpr) r.xpr = this._stripDeep(r.xpr)
    if (r.args) r.args = this._stripDeep(r.args)
    if (r.list) r.list = this._stripDeep(r.list)
    delete r.as
    return r
  }

  /** Stored field path of an element, or undefined if it's not a plain stored field */
  fieldPath(name) {
    const r = this.resolve(name)
    return r?.kind === 'field' ? r.path : undefined
  }

  /** Names of all elements returned for SELECT * */
  get starColumns() {
    if (this._star) return this._star
    const cols = []
    for (const [name, el] of Object.entries(this.entity.elements || {})) {
      if (el.isAssociation || el.virtual) continue
      const r = this.resolve(name)
      if (!r || r.kind === 'virtual' || r.kind === 'assoc') continue
      cols.push(name)
    }
    return (this._star = cols)
  }
}

/** Generated foreign key element name, e.g. author_ID */
const fk4 = (assoc, key) => key.$generatedFieldName || `${assoc.name}_${key.as || key.ref.join('_')}`

/**
 * Determines how source and target of an association are related:
 *   { pairs: [{ src, tgt }], tgtFilters: [{ ref, op, val | session }] }
 * where src are element names of the source entity and tgt element names of the target entity.
 */
function joinSpec(assoc) {
  if (assoc._mongoJoin) return assoc._mongoJoin
  const spec = { pairs: [], tgtFilters: [] }
  const name = assoc.name
  if (assoc.keys) {
    for (const k of assoc.keys) spec.pairs.push({ src: fk4(assoc, k), tgt: k.ref.join('_') })
  } else if (assoc.on) {
    const terms = _conjuncts(assoc.on, assoc)
    const side = x => {
      if (x.ref) {
        const [h, ...rest] = x.ref
        if (h === name && rest.length) return { tgt: rest }
        if (h === '$self') return rest.length ? { src: rest } : { self: true }
        if (typeof h === 'string' && h.startsWith('$')) return { session: x.ref.join('.') }
        return { src: x.ref }
      }
      if ('val' in x) return { val: x.val }
      throw unsupported(`On-condition of association ${assoc.parent?.name}.${name}`)
    }
    for (const [l, op, r] of terms) {
      let L = side(l), R = side(r)
      if (!L.tgt && R.tgt) [L, R] = [R, L]
      if (!L.tgt) throw unsupported(`On-condition of association ${assoc.parent?.name}.${name}`)
      if (R.self) {
        // backlink, e.g. books.author = $self -> use the foreign keys of the backlink association
        const target = assoc._target
        const back = target.elements[L.tgt.join('_')] || target.elements[L.tgt[0]]
        if (!back?.isAssociation || !back.keys) throw unsupported(`On-condition of association ${assoc.parent?.name}.${name}`)
        if (op !== '=') throw unsupported(`On-condition of association ${assoc.parent?.name}.${name}`)
        for (const k of back.keys) spec.pairs.push({ src: k.ref.join('_'), tgt: fk4(back, k) })
      } else if (R.src) {
        if (op !== '=' && op !== '==') throw unsupported(`Operator ${op} in on-condition of association ${assoc.parent?.name}.${name}`)
        spec.pairs.push({ src: R.src.join('_'), tgt: L.tgt.join('_') })
      } else {
        spec.tgtFilters.push({ ref: L.tgt, op, val: R.val, session: R.session })
      }
    }
  } else {
    throw unsupported(`Unmanaged association without on-condition (${assoc.parent?.name}.${name})`)
  }
  Object.defineProperty(assoc, '_mongoJoin', { value: spec, configurable: true })
  return spec
}

function _conjuncts(on, assoc) {
  const terms = []
  for (let i = 0; i < on.length; ) {
    const x = on[i]
    if (x.xpr) {
      terms.push(..._conjuncts(x.xpr, assoc))
      i++
    } else {
      terms.push([on[i], on[i + 1], on[i + 2]])
      i += 3
    }
    const conj = on[i]
    if (conj === undefined) break
    if (String(conj).toLowerCase() !== 'and') throw unsupported(`"${conj}" in on-condition of association ${assoc.parent?.name}.${assoc.name}`)
    i++
  }
  return terms
}

/** All entities that are stored in MongoDB (one collection each), including draft tables */
function persistedEntities(model) {
  const result = new Map()
  const add = e => {
    if (!e || e.kind !== 'entity' || e['@cds.persistence.skip'] === true || e.abstract) return
    if (e.name.startsWith('localized.')) return
    if (query4(e) || (!e.isDraft && e.query && !e['@cds.persistence.table'])) return
    result.set(collectionName4(e), e)
  }
  for (const name in model.definitions) {
    const d = model.definitions[name]
    if (d.kind !== 'entity') continue
    add(d)
    if (d.drafts) add(d.drafts) // drafts are not enumerable in the linked model
  }
  return result
}

module.exports = { infoOf, joinSpec, fk4, collectionName4, persistedEntities, EntityInfo }
