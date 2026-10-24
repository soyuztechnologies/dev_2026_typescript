const { Parser, and, isEmpty, tupleIn, keyOf, AGGREGATES, cast, castType } = require('./cqn2mongo')
const { joinSpec, fk4 } = require('./model')
const { fromBSON } = require('./converters')
const { unsupported, badInput } = require('./errors')

const HIDDEN = Symbol('anubhav.mongo.hidden')

/**
 * Executes CQN SELECT queries with aggregation pipelines:
 *
 *   $match  (where, search, projection filters, navigation)
 *   $lookup (to-one path expressions in order by)  ->  $sort  ->  $skip  ->  $limit
 *   $lookup (to-one path expressions in columns, e.g. author.name as authorName)
 *   $project
 *
 * Expands ($expand, deep reads) are fetched with one additional query per expanded association
 * and level (batched with $in), localized texts with one additional query on the .texts collection.
 */
class Select {
  /** @param {import('./cqn2mongo').CQN2Mongo} compiler */
  constructor(compiler) {
    this.c = compiler
    this.srv = compiler.srv
  }

  async run(query) {
    const S = query.SELECT
    if (S.from?.SELECT) return this._fromSubSelect(S)
    if (S.from?.join || S.from?.SET) throw unsupported('SELECT with joins or unions')

    const { scope, filter: fromFilter, alias } = await this.c.from(S.from)
    const q = alias ? _stripAlias(S, alias) : S
    const filter = and(fromFilter, await this.c.where(scope, q.where), this.c.search(scope, q.search))
    const one = !!S.one || S.from?.ref?.[0]?.cardinality?.max === 1
    const { rows: max, offset } = _limit(S.limit)
    const opts = {
      columns: q.columns,
      orderBy: q.orderBy,
      groupBy: q.groupBy,
      having: q.having,
      distinct: S.distinct,
      localized: S.localized,
      rows: one ? 1 : max,
      offset
    }
    const rows = await this.fetch(scope, filter, opts)
    if (S.count) {
      const n = rows.length
      const count =
        max === undefined || (n < max && (n || !offset)) ? n + (offset || 0) : opts.grouped ? await this._countGroups(scope, filter, opts) : await this.srv._count(scope.collection, filter)
      return _withCount(rows, count)
    }
    return one ? rows[0] : rows
  }

  /** Fetches rows of an entity (scope) matching a filter; the core of SELECT and $expand */
  async fetch(scope, filter, opts, joinPaths = []) {
    const cols = this.columns(scope, opts.columns)
    const grouped = (opts.grouped = !!(opts.groupBy?.length || opts.distinct || cols.some(c => c.kind === 'agg')))
    if (opts.rows === 0) return [] // e.g. $top=0 with $count - MongoDB rejects { $limit: 0 }
    const hidden = [...joinPaths]
    const hide = path => {
      let i = hidden.indexOf(path)
      if (i < 0) i = hidden.push(path) - 1
      return i
    }

    const pipeline = isEmpty(filter) ? [] : [{ $match: filter }]
    if (grouped) {
      // to-one path expressions, e.g. product.category -> $lookup before $group
      for (const [i, c] of cols.entries()) {
        if (c.kind === 'path') {
          const l = await this._lookup(scope, c.nav, '__p' + i)
          pipeline.push(...l.stages)
          Object.assign(c, { kind: 'expr', expr: '$__p' + i, element: c.element ?? l.element })
        } else if (c.kind === 'expand') {
          // OData $apply=groupby((product/category)) -> columns: product { category }, grouped by product.category
          if (!c.one || !c.columns?.every(x => x.ref)) throw unsupported('$expand combined with aggregations')
          c.kind = 'nested'
          c.parts = []
          for (const [j, x] of c.columns.entries()) {
            const ref = [...c.ref, ...x.ref]
            const o = this.c.ref(scope, ref)
            const part = { as: _alias(x), ref, element: o.element }
            if (o.kind === 'field') part.expr = '$' + o.path
            else if (o.kind === 'nav') {
              const l = await this._lookup(scope, o, `__e${i}_${j}`)
              pipeline.push(...l.stages)
              Object.assign(part, { expr: `$__e${i}_${j}`, element: l.element })
            } else throw unsupported('$expand combined with aggregations')
            c.parts.push(part)
          }
        }
      }
      await this._grouped(scope, cols, opts, pipeline)
    } else {
      for (const c of cols) if (c.kind === 'expand') c.src = joinSpec(c.assoc).pairs.map(p => hide(_required(scope, p.src, c.assoc)))
      const loc = this._localized(scope, cols, opts, hide)
      await this._sort(scope, cols, opts.orderBy, pipeline)
      if (opts.offset) pipeline.push({ $skip: opts.offset })
      if (opts.rows !== undefined) pipeline.push({ $limit: opts.rows })
      const project = { _id: 0 }
      for (const [i, c] of cols.entries()) {
        if (c.kind === 'field') project['c' + i] = '$' + c.path
        else if (c.kind === 'expr') project['c' + i] = c.expr
        else if (c.kind === 'path') {
          const l = await this._lookup(scope, c.nav, '__p' + i)
          pipeline.push(...l.stages)
          c.element ??= l.element
          project['c' + i] = '$__p' + i
        }
      }
      hidden.forEach((p, j) => (project['h' + j] = '$' + p))
      pipeline.push({ $project: project })
      opts._loc = loc
    }

    const docs = await this.srv._aggregate(scope.collection, pipeline)
    // aggregates over nothing -> one row, with count() = 0 and null for all other aggregates (like SQL)
    if (grouped && !docs.length && !opts.groupBy?.length && !opts.distinct)
      docs.push(Object.fromEntries(cols.map((c, i) => [`c${i}`, c.kind === 'agg' && /^count/i.test(c.col?.func) ? 0 : null])))
    const rows = docs.map(d => this._row(cols, d, hidden.length, grouped))

    if (!grouped && rows.length) {
      for (const c of cols) if (c.kind === 'expand') await this._expand(rows, c, opts.localized)
      if (opts._loc) await this._overlayTexts(rows, opts._loc)
    }
    return rows
  }

  // --- columns --------------------------------------------------------------------------------

  /** Normalizes CQN columns into descriptors { kind, as, ... } */
  columns(scope, columns) {
    const list = columns?.length ? columns : ['*']
    const out = []
    const explicit = new Set(list.map(c => (c === '*' ? '*' : _alias(c))))
    for (const col of list) {
      if (col === '*' || (col?.ref?.length === 1 && col.ref[0] === '*' && !col.expand)) {
        for (const n of scope.starColumns) if (!explicit.has(n)) out.push(...this._column(scope, { ref: [n] }))
        continue
      }
      out.push(...this._column(scope, col))
    }
    return out
  }

  _column(scope, col) {
    const as = _alias(col)
    if (typeof col === 'string') col = { ref: col.split('.') }
    const castEl = col.cast?.type ? { type: castType(col.cast.type) } : undefined
    if (col.expand) {
      if (!col.ref) throw unsupported('Expand without association path')
      const o = this.c.ref(scope, col.ref)
      if (o.kind !== 'assoc') throw unsupported(`Expand on ${col.ref.map(r => r.id || r).join('.')}`)
      const where = [o.where, col.where].filter(w => w?.length)
      return [
        {
          kind: 'expand',
          as,
          ref: col.ref,
          assoc: o.assoc,
          where: where.length === 2 ? [{ xpr: where[0] }, 'and', { xpr: where[1] }] : where[0],
          columns: col.expand.length === 1 && col.expand[0] === '*' ? undefined : col.expand,
          orderBy: col.orderBy,
          limit: col.limit,
          one: col.one ?? !o.assoc.is2many
        }
      ]
    }
    if (col.inline) {
      const o = this.c.ref(scope, col.ref)
      if (o.kind !== 'assoc') throw unsupported(`Inline on ${col.ref.join('.')}`)
      const t = this.c.info(o.assoc._target)
      return col.inline.flatMap(i =>
        i === '*' || i.ref?.[0] === '*'
          ? t.starColumns.flatMap(n => this._column(scope, { ref: [...col.ref, n], as: `${as}_${n}` }))
          : this._column(scope, { ...i, ref: i.ref && [...col.ref, ...i.ref], as: `${as}_${_alias(i)}` })
      )
    }
    if (col.ref) {
      const o = this.c.ref(scope, col.ref)
      switch (o.kind) {
        case 'field':
          if (castEl) return [{ kind: 'expr', as, expr: cast({ $ifNull: ['$' + o.path, null] }, castEl.type), element: castEl }]
          return [{ kind: 'field', as, path: o.path, element: o.element }]
        case 'val':
          return [{ kind: 'val', as, val: o.val }]
        case 'expr':
          return [{ kind: 'expr', as, expr: castEl ? cast(this.c.expr(o.scope, o.node), castEl.type) : this.c.expr(o.scope, o.node), element: castEl || o.element }]
        case 'virtual':
          // e.g. IsActiveEntity (default true) of active draft-enabled entities
          return [{ kind: 'val', as, val: o.element?.default?.val ?? null }]
        case 'nav':
          if (o.assoc.is2many) throw unsupported(`To-many path expression ${col.ref.join('.')} in columns (use $expand)`)
          return [{ kind: 'path', as, nav: o, ref: col.ref, element: castEl }]
        case 'assoc':
          // association without expand -> its foreign keys (like SQL)
          if (!o.assoc.keys) return []
          return o.assoc.keys.flatMap(k => this._column(scope, { ref: [fk4(o.assoc, k)], as: `${as}_${k.as || k.ref.join('_')}` }))
      }
    }
    if ('val' in col) return [{ kind: 'val', as, val: col.val }]
    if (col.func && AGGREGATES.has(col.func.toLowerCase())) return [{ kind: 'agg', as, col, element: castEl }]
    if (col.func || col.xpr || col.list) {
      if (_hasAggregate(col)) return [{ kind: 'agg', as, col, element: castEl }]
      return [{ kind: 'expr', as, expr: this.c.expr(scope, Parser.operand(col)), element: castEl }]
    }
    if (col.SELECT) throw unsupported('Sub queries in the column list')
    throw unsupported(`Column ${JSON.stringify(col)}`)
  }

  _row(cols, d, hiddenCount, grouped) {
    const row = {}
    for (const [i, c] of cols.entries()) {
      if (c.kind === 'val') row[c.as] = c.val
      else if (c.kind === 'nested') row[c.as] = Object.fromEntries(c.parts.map((p, j) => [p.as, fromBSON(p.element, d[`c${i}_${j}`])]))
      else if (c.kind === 'expand') row[c.as] = c.one ? null : []
      else row[c.as] = fromBSON(c.element, d['c' + i])
    }
    if (hiddenCount && !grouped) {
      const h = new Array(hiddenCount)
      for (let j = 0; j < hiddenCount; j++) h[j] = d['h' + j] ?? null
      Object.defineProperty(row, HIDDEN, { value: h, configurable: true })
    }
    return row
  }

  // --- order by -------------------------------------------------------------------------------

  async _sort(scope, cols, orderBy, pipeline) {
    if (!orderBy?.length) return
    const sort = {}
    for (const [i, o] of orderBy.entries()) {
      const dir = String(o.sort || 'asc').toLowerCase() === 'desc' ? -1 : 1
      const tmp = '__s' + i
      let key
      if (o.ref) {
        const name = o.ref.map(r => r.id || r).join('_')
        const col = cols.find(c => c.as === name)
        if (col?.kind === 'field') key = col.path
        else if (col?.kind === 'expr') {
          pipeline.push({ $set: { [tmp]: col.expr } })
          key = tmp
        } else if (col?.kind === 'path') {
          const l = await this._lookup(scope, col.nav, tmp)
          pipeline.push(...l.stages)
          key = tmp
        } else if (col?.kind === 'val') continue
        else {
          const r = this.c.ref(scope, o.ref)
          if (r.kind === 'field') key = r.path
          else if (r.kind === 'nav') {
            const l = await this._lookup(scope, r, tmp)
            pipeline.push(...l.stages)
            key = tmp
          } else if (r.kind === 'expr') {
            pipeline.push({ $set: { [tmp]: this.c.expr(r.scope, r.node) } })
            key = tmp
          } else if (r.kind === 'val' || r.kind === 'virtual') continue
          else throw unsupported(`Order by association ${name}`)
        }
      } else {
        pipeline.push({ $set: { [tmp]: this.c.expr(scope, Parser.operand(o)) } })
        key = tmp
      }
      if (!(key in sort)) sort[key] = dir
    }
    if (Object.keys(sort).length) pipeline.push({ $sort: sort })
  }

  /** $lookup stages fetching the value of a to-one path expression, e.g. author.name */
  async _lookup(scope, nav, as) {
    if (nav.assoc.is2many) throw unsupported(`To-many path expression via ${nav.assoc.name}`)
    const spec = joinSpec(nav.assoc)
    const t = this.c.info(nav.assoc._target).assertPersistent()
    // the join elements belong to the layer which declares the path, e.g. `author.name as author` in a
    // projection of a projection -> author_ID is resolved there (nav.scope), not in the outer entity
    const src = nav.scope || scope
    const vars = {}
    const conds = spec.pairs.map((p, i) => {
      vars['k' + i] = '$' + _required(src, p.src, nav.assoc)
      return { $eq: ['$' + _required(t, p.tgt, nav.assoc), '$$k' + i] }
    })
    const sub = [{ $match: { $expr: conds.length === 1 ? conds[0] : { $and: conds } } }]
    const tf = and(await this.c.targetFilters(t, spec), await this.c.where(t, nav.where))
    if (!isEmpty(tf)) sub.push({ $match: tf })
    sub.push({ $limit: 1 })
    let value, element
    const inner = this.c.ref(t, nav.rest)
    if (inner.kind === 'field') [value, element] = ['$' + inner.path, inner.element]
    else if (inner.kind === 'expr') [value, element] = [this.c.expr(inner.scope, inner.node), inner.element]
    else if (inner.kind === 'val') value = { $literal: inner.val }
    else if (inner.kind === 'nav') {
      const l = await this._lookup(t, inner, '__v')
      sub.push(...l.stages)
      ;[value, element] = ['$__v', l.element]
    } else throw unsupported(`Path expression ending in association ${nav.rest.join('.')}`)
    sub.push({ $project: { _id: 0, v: value } })
    return {
      stages: [{ $lookup: { from: t.collection, let: vars, pipeline: sub, as } }, { $set: { [as]: { $arrayElemAt: ['$' + as + '.v', 0] } } }],
      element
    }
  }

  // --- expand ---------------------------------------------------------------------------------

  async _expand(rows, c, localized) {
    const spec = joinSpec(c.assoc)
    const t = this.c.info(c.assoc._target).assertPersistent()
    const tgtPaths = spec.pairs.map(p => _required(t, p.tgt, c.assoc))
    const key4 = tuple => tuple.map(keyOf).join('|')
    const tuples = new Map()
    for (const r of rows) {
      const tuple = c.src.map(j => r[HIDDEN][j])
      if (tuple.every(v => v !== null && v !== undefined)) tuples.set(key4(tuple), tuple)
    }
    if (!tuples.size) return

    const filter = and(tupleIn(tgtPaths, [...tuples.values()]), await this.c.targetFilters(t, spec), await this.c.where(t, c.where))
    const children = await this.fetch(t, filter, { columns: c.columns, orderBy: c.orderBy, localized }, tgtPaths)
    const groups = new Map()
    for (const ch of children) {
      const k = key4(ch[HIDDEN].slice(0, tgtPaths.length))
      let g = groups.get(k)
      if (!g) groups.set(k, (g = []))
      g.push(ch)
    }
    const { rows: max, offset = 0 } = _limit(c.limit)
    for (const r of rows) {
      const tuple = c.src.map(j => r[HIDDEN][j])
      const list = groups.get(key4(tuple)) || []
      if (c.one) r[c.as] = list[0] ?? null
      else r[c.as] = max !== undefined || offset ? list.slice(offset, max !== undefined ? offset + max : undefined) : list
    }
  }

  // --- localized texts ------------------------------------------------------------------------

  /** Prepares overlaying translated texts for localized elements, like coalesce(texts.x, x) in SQL */
  _localized(scope, cols, opts, hide) {
    if (!opts.localized || scope.name.endsWith('.drafts')) return
    const base = scope.base
    const loc = base.entity.elements?.localized
    if (!loc?.isAssociation) return
    const locCols = cols.filter(c => c.kind === 'field' && base.entity.elements[c.path]?.localized)
    if (!locCols.length) return
    const spec = joinSpec(loc)
    return { base, loc, spec, locCols, src: spec.pairs.map(p => hide(_required(base, p.src, loc))) }
  }

  async _overlayTexts(rows, { loc, spec, locCols, src }) {
    const t = this.c.info(loc._target)
    const tgtPaths = spec.pairs.map(p => _required(t, p.tgt, loc))
    const tuples = new Map()
    for (const r of rows) {
      const tuple = src.map(j => r[HIDDEN][j])
      tuples.set(tuple.map(keyOf).join('|'), tuple)
    }
    const filter = and(tupleIn(tgtPaths, [...tuples.values()]), await this.c.targetFilters(t, spec))
    const project = { _id: 0 }
    tgtPaths.forEach((p, i) => (project['k' + i] = '$' + p))
    const fields = [...new Set(locCols.map(c => c.path))]
    fields.forEach((p, i) => (project['f' + i] = '$' + p))
    const texts = await this.srv._aggregate(t.collection, [{ $match: filter }, { $project: project }])
    if (!texts.length) return
    const byKey = new Map(texts.map(x => [tgtPaths.map((_, i) => keyOf(x['k' + i])).join('|'), x]))
    for (const r of rows) {
      const x = byKey.get(src.map(j => keyOf(r[HIDDEN][j])).join('|'))
      if (!x) continue
      for (const c of locCols) {
        const v = x['f' + fields.indexOf(c.path)]
        if (v !== null && v !== undefined) r[c.as] = fromBSON(c.element, v)
      }
    }
  }

  // --- aggregations ---------------------------------------------------------------------------

  async _grouped(scope, cols, opts, pipeline) {
    const groupBy = (opts.groupBy || []).map(g => ({ g, node: Parser.operand(g) }))
    const id = {}
    for (const [i, { node }] of groupBy.entries()) {
      const o = node.t === 'ref' ? this.c.ref(scope, node.ref) : undefined
      if (o?.kind === 'nav') {
        // group by a to-one path, e.g. product.category
        const l = await this._lookup(scope, o, '__g' + i)
        pipeline.push(...l.stages)
        id['g' + i] = '$__g' + i
      } else id['g' + i] = this.c.expr(scope, node)
    }
    const sameRef = (a, b) => a?.ref && b?.ref && a.ref.map(r => r.id || r).join('.') === b.ref.map(r => r.id || r).join('.')

    const group = { _id: null }
    const project = { _id: 0 }
    const signature = new Map() // aggregate signature -> output field
    for (const [i, c] of cols.entries()) {
      if (c.kind === 'agg') {
        const { acc, final } = this._accumulator(scope, c.col, `a${i}`)
        Object.assign(group, acc)
        project['c' + i] = final
        signature.set(_sig(c.col), 'c' + i)
      } else if (c.kind === 'field' || c.kind === 'expr') {
        const src = c.kind === 'field' ? '$' + c.path : c.expr
        const gi = groupBy.findIndex(
          ({ g, node }) => g.as === c.as || sameRef(g, c) || sameRef(g, { ref: c.as.split('_') }) || (node.t === 'ref' && this._isSame(scope, node, c))
        )
        if (gi >= 0) project['c' + i] = '$_id.g' + gi
        else if (opts.distinct) {
          id['d' + i] = src
          project['c' + i] = '$_id.d' + i
        } else {
          group['a' + i] = { $first: src }
          project['c' + i] = '$a' + i
        }
      } else if (c.kind === 'nested') {
        for (const [j, p] of c.parts.entries()) {
          const key = `${i}_${j}`
          const gi = groupBy.findIndex(({ g }) => sameRef(g, p))
          if (gi >= 0) project['c' + key] = '$_id.g' + gi
          else {
            group['a' + key] = { $first: p.expr }
            project['c' + key] = '$a' + key
          }
        }
      }
    }
    if (Object.keys(id).length) group._id = id

    // having: references to columns / aggregates
    let having
    if (opts.having?.length) {
      const resolve = node => {
        if (node.t === 'func' && AGGREGATES.has(node.name)) {
          const sig = _sig({ func: node.name, args: node.args })
          let out = signature.get(sig)
          if (!out) {
            const k = 'x' + signature.size
            const { acc, final } = this._accumulator(scope, node, k, true)
            Object.assign(group, acc)
            project[k] = final
            signature.set(sig, (out = k))
          }
          return { t: 'raw', expr: '$' + out }
        }
        if (node.t === 'ref') {
          const name = node.ref.join('_')
          const i = cols.findIndex(c => c.as === name)
          if (i >= 0) return { t: 'raw', expr: '$c' + i }
          const gi = groupBy.findIndex(({ g }) => sameRef(g, node))
          if (gi >= 0) {
            project['g' + gi] = '$_id.g' + gi
            return { t: 'raw', expr: '$g' + gi }
          }
        }
        return _mapNode(node, resolve)
      }
      having = this.c.bool(scope, resolve(Parser.parse(opts.having)))
    }

    pipeline.push({ $group: group }, { $project: project })
    if (having) pipeline.push({ $match: { $expr: having } })

    if (opts.orderBy?.length) {
      const sort = {}
      for (const o of opts.orderBy) {
        const dir = String(o.sort || 'asc').toLowerCase() === 'desc' ? -1 : 1
        let key
        if (o.ref) {
          const name = o.ref.map(r => r.id || r).join('_')
          const i = cols.findIndex(c => c.as === name || sameRef(c, o) || (c.kind === 'field' && this._isSame(scope, { t: 'ref', ref: o.ref }, c)))
          if (i >= 0) key = 'c' + i
          else {
            // a grouped element which is not part of the columns, e.g. groupBy('author.name').orderBy('author.name')
            const gi = groupBy.findIndex(({ g }) => sameRef(g, o))
            if (gi >= 0) project[(key = 'g' + gi)] = '$_id.g' + gi
          }
        } else if (o.func) key = signature.get(_sig(o))
        if (!key) throw unsupported('Order by elements which are neither grouped nor aggregated')
        sort[key] = dir
      }
      pipeline.push({ $sort: sort })
    }
    if (opts.offset) pipeline.push({ $skip: opts.offset })
    if (opts.rows !== undefined) pipeline.push({ $limit: opts.rows })
    opts._groupPipelineLength = pipeline.length
  }

  _isSame(scope, node, col) {
    try {
      const o = this.c.ref(scope, node.ref)
      return o.kind === 'field' && col.kind === 'field' && o.path === col.path
    } catch {
      return false
    }
  }

  _accumulator(scope, col, key, isNode) {
    const node = isNode ? col : Parser.operand(col)
    if (node.t !== 'func') {
      // expressions containing aggregates, e.g. sum(price) * 2
      const accs = {}
      let n = 0
      const replace = x => {
        if (x.t === 'func' && AGGREGATES.has(x.name)) {
          const k = `${key}_${n++}`
          const { acc, final } = this._accumulator(scope, x, k, true)
          Object.assign(accs, acc)
          return { t: 'raw', expr: final }
        }
        return _mapNode(x, replace)
      }
      const final = this.c.expr(scope, replace(node))
      return { acc: accs, final }
    }
    const name = node.name
    const arg = node.args[0]
    const isStar = !arg || arg.t === 'star' || (arg.t === 'val' && arg.val !== null)
    const x = !isStar && this.c.expr(scope, arg)
    switch (name) {
      case 'count':
        if (node.distinct && x) return { acc: { [key]: { $addToSet: x } }, final: _sizeNonNull('$' + key) }
        return { acc: { [key]: { $sum: isStar ? 1 : { $cond: [{ $eq: [x, null] }, 0, 1] } } }, final: '$' + key }
      case 'countdistinct':
        return { acc: { [key]: { $addToSet: x } }, final: _sizeNonNull('$' + key) }
      case 'sum':
        return { acc: { [key]: { $sum: x }, [key + '_n']: { $sum: { $cond: [{ $eq: [x, null] }, 0, 1] } } }, final: { $cond: [{ $eq: ['$' + key + '_n', 0] }, null, '$' + key] } }
      case 'avg':
      case 'average':
        return { acc: { [key]: { $avg: x } }, final: '$' + key }
      case 'min':
        return { acc: { [key]: { $min: x } }, final: '$' + key }
      case 'max':
        return { acc: { [key]: { $max: x } }, final: '$' + key }
    }
    throw unsupported(`Aggregate function ${name}()`)
  }

  async _countGroups(scope, filter, opts) {
    const cols = this.columns(scope, opts.columns)
    const pipeline = isEmpty(filter) ? [] : [{ $match: filter }]
    await this._grouped(scope, cols, { ...opts, orderBy: undefined, rows: undefined, offset: undefined }, pipeline)
    pipeline.push({ $count: 'n' })
    const [r] = await this.srv._aggregate(scope.collection, pipeline)
    return r?.n ?? 0
  }

  // --- SELECT from (SELECT ...) ---------------------------------------------------------------

  async _fromSubSelect(S) {
    if (S.where?.length || S.groupBy?.length || S.having?.length || S.search?.length)
      throw unsupported('SELECT from a sub query with where, group by, having or search')
    let rows = await this.run(S.from)
    if (!Array.isArray(rows)) rows = rows ? [rows] : []
    const cols = S.columns?.filter(c => c !== '*') || []
    let result
    if (cols.length && cols.every(c => c.func?.toLowerCase() === 'count')) result = [Object.fromEntries(cols.map(c => [_alias(c), rows.length]))]
    else if (!cols.length) result = rows
    else if (cols.every(c => c.ref || 'val' in c))
      result = rows.map(r => Object.fromEntries(cols.map(c => [_alias(c), c.ref ? r[c.ref.at(-1)] ?? r[c.ref.join('_')] ?? null : c.val])))
    else throw unsupported('Calculated columns in SELECT from a sub query')
    const { rows: max, offset = 0 } = _limit(S.limit)
    if (max !== undefined || offset) result = result.slice(offset, max !== undefined ? offset + max : undefined)
    return S.one ? result[0] : result
  }
}

const _alias = c => {
  if (typeof c === 'string') return c.replace(/\./g, '_')
  if (c.as) return c.as
  if (c.ref) return c.ref.map(r => r.id || r).join('_')
  if (c.func) return c.func
  if ('val' in c) return String(c.val)
  return 'xpr'
}

const _limit = limit => {
  if (!limit) return {}
  const v = x => (x === undefined || x === null ? undefined : typeof x === 'object' ? x.val : x)
  const rows = v(limit.rows)
  const offset = v(limit.offset)
  if (rows !== undefined && (!Number.isInteger(rows) || rows < 0)) throw badInput(`Invalid limit ${rows}`)
  if (offset !== undefined && (!Number.isInteger(offset) || offset < 0)) throw badInput(`Invalid offset ${offset}`)
  return { rows, offset: offset || undefined }
}

const _required = (scope, name, assoc) => {
  const p = scope.fieldPath(name)
  if (!p) throw unsupported(`Association ${assoc.parent?.name}.${assoc.name} - join element "${name}" is not a stored field of ${scope.name}`)
  return p
}

const _sizeNonNull = v => ({ $size: { $filter: { input: v, cond: { $ne: ['$$this', null] } } } })

const _sig = x => JSON.stringify([String(x.func || x.name).toLowerCase(), x.args, x.distinct])

const _hasAggregate = x => {
  if (!x || typeof x !== 'object') return false
  if (x.func && AGGREGATES.has(x.func.toLowerCase())) return true
  return (x.xpr || x.args || x.list || []).some?.(_hasAggregate)
}

function _mapNode(n, fn) {
  const r = { ...n }
  if (n.args) r.args = n.args.map(fn)
  if (n.l) r.l = fn(n.l)
  if (n.r) r.r = fn(n.r)
  if (n.arg) r.arg = fn(n.arg)
  if (n.x) r.x = fn(n.x)
  if (n.lo) r.lo = fn(n.lo)
  if (n.hi) r.hi = fn(n.hi)
  if (n.items) r.items = n.items.map(fn)
  if (n.whens) r.whens = n.whens.map(w => ({ c: fn(w.c), v: fn(w.v) }))
  if (n.else) r.else = fn(n.else)
  if (n.base) r.base = fn(n.base)
  return r
}

/** Removes the table alias from references, e.g. b.title -> title for SELECT from Books as b */
function _stripAlias(S, alias) {
  const strip = x => {
    if (Array.isArray(x)) return x.map(strip)
    if (!x || typeof x !== 'object') return x
    const r = { ...x }
    if (r.ref?.length > 1 && (r.ref[0] === alias || r.ref[0]?.id === alias)) r.ref = r.ref.slice(1)
    if (r.xpr) r.xpr = strip(r.xpr)
    if (r.args && Array.isArray(r.args)) r.args = strip(r.args)
    if (r.list) r.list = strip(r.list)
    return r
  }
  return { ...S, where: strip(S.where), columns: strip(S.columns), orderBy: strip(S.orderBy), having: strip(S.having), groupBy: strip(S.groupBy) }
}

/** Arrays with non-enumerable $count, preserved by .map() (same as @cap-js/db-service) */
function _withCount(a, count) {
  const _map = a.map
  const map = function (...args) {
    return _withCount(_map.call(a, ...args), count)
  }
  return Object.defineProperties(a, {
    $count: { value: count, enumerable: false, configurable: true, writable: true },
    map: { value: map, enumerable: false, configurable: true, writable: true }
  })
}

module.exports = { Select, HIDDEN, _withCount }
