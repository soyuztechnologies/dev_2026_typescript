const cds = require('@sap/cds')
const { infoOf, joinSpec, fk4 } = require('./model')
const { toBSON, typeOf } = require('./converters')
const { unsupported, badInput } = require('./errors')

/**
 * Compiles CQN (CAP's query notation) into MongoDB filters and aggregation pipelines.
 *
 * Joins (path expressions, exists predicates, navigation in FROM, $expand) are resolved with
 * additional, batched queries (`$in` on the join fields) or `$lookup` stages - never one query per row.
 */

// ---------------------------------------------------------------------------------------------
//  Expression parser: CQN token streams -> AST
// ---------------------------------------------------------------------------------------------

const CMP = { '=': '=', '==': '=', '!=': '!=', '<>': '<>', '<': '<', '>': '>', '<=': '<=', '>=': '>=' }
const FLIP = { '=': '=', '!=': '!=', '<>': '<>', '<': '>', '>': '<', '<=': '>=', '>=': '<=' }
const AGGREGATES = new Set(['count', 'sum', 'avg', 'average', 'min', 'max', 'countdistinct'])
const BOOLEAN_FUNCS = new Set(['contains', 'startswith', 'endswith', 'matchespattern'])

class Parser {
  constructor(tokens) {
    this.t = tokens
    this.i = 0
  }
  static parse(tokens) {
    if (!Array.isArray(tokens)) tokens = [tokens]
    const p = new Parser(tokens)
    const ast = p.or()
    if (p.i < tokens.length) throw unsupported(`Expression token "${_show(tokens[p.i])}"`)
    return ast
  }
  peek(o = 0) {
    const x = this.t[this.i + o]
    return typeof x === 'string' ? x.toLowerCase() : x
  }
  next() {
    return this.t[this.i++]
  }
  expect(kw) {
    if (this.peek() !== kw) throw unsupported(`Expression - expected "${kw}" but found "${_show(this.t[this.i])}"`)
    this.i++
  }
  or() {
    let l = this.and()
    while (this.peek() === 'or') {
      this.i++
      l = { t: 'or', args: [l, this.and()] }
    }
    return l
  }
  and() {
    let l = this.not()
    while (this.peek() === 'and') {
      this.i++
      l = { t: 'and', args: [l, this.not()] }
    }
    return l
  }
  not() {
    if (this.peek() === 'not') {
      this.i++
      return { t: 'not', arg: this.not() }
    }
    return this.predicate()
  }
  predicate() {
    if (this.peek() === 'exists') {
      this.i++
      return { t: 'exists', x: this.next() }
    }
    const l = this.additive()
    let p = this.peek()
    if (p === 'is') {
      this.i++
      let not = false
      if (this.peek() === 'not') {
        this.i++
        not = true
      }
      if (this.peek() === 'distinct') {
        // is [not] distinct from
        this.i++
        this.expect('from')
        return { t: 'cmp', op: not ? '==' : '!=', l, r: this.additive(), nullSafe: true }
      }
      this.expect('null')
      return { t: 'null', not, arg: l }
    }
    let not = false
    if (p === 'not' && ['in', 'like', 'between'].includes(this.peek(1))) {
      this.i++
      not = true
      p = this.peek()
    }
    if (p === 'in') {
      this.i++
      return { t: 'in', not, l, r: this.additive() }
    }
    if (p === 'like') {
      this.i++
      const r = this.additive()
      let esc
      if (this.peek() === 'escape') {
        this.i++
        esc = this.additive()
      }
      return { t: 'like', not, l, r, esc }
    }
    if (p === 'between') {
      this.i++
      const lo = this.additive()
      this.expect('and')
      return { t: 'between', not, x: l, lo, hi: this.additive() }
    }
    if (typeof p === 'string' && CMP[p]) {
      this.i++
      return { t: 'cmp', op: CMP[p], l, r: this.additive() }
    }
    return l
  }
  additive() {
    let l = this.multiplicative()
    for (let p = this.peek(); p === '+' || p === '-' || p === '||'; p = this.peek()) {
      this.i++
      l = { t: 'arith', op: p, l, r: this.multiplicative() }
    }
    return l
  }
  multiplicative() {
    let l = this.unary()
    for (let p = this.peek(); p === '*' || p === '/' || p === '%'; p = this.peek()) {
      this.i++
      l = { t: 'arith', op: p, l, r: this.unary() }
    }
    return l
  }
  unary() {
    if (this.peek() === '-') {
      this.i++
      return { t: 'neg', arg: this.unary() }
    }
    if (this.peek() === '+') this.i++
    return this.primary()
  }
  primary() {
    const x = this.next()
    if (x === undefined) throw unsupported('Incomplete expression')
    if (typeof x === 'string') {
      const k = x.toLowerCase()
      if (k === 'case') return this.case()
      if (k === 'null') return { t: 'val', val: null }
      if (k === 'true' || k === 'false') return { t: 'val', val: k === 'true' }
      if (k === '(') {
        const e = this.or()
        this.expect(')')
        return e
      }
      if (/^-?\d+(\.\d+)?$/.test(k)) return { t: 'val', val: Number(k) }
      throw unsupported(`Expression token "${x}"`)
    }
    return Parser.operand(x)
  }
  case() {
    const node = { t: 'case', whens: [] }
    if (this.peek() !== 'when') node.base = this.additive()
    while (this.peek() === 'when') {
      this.i++
      const c = this.or()
      this.expect('then')
      node.whens.push({ c, v: this.or() })
    }
    if (this.peek() === 'else') {
      this.i++
      node.else = this.or()
    }
    this.expect('end')
    return node
  }
  static operand(x) {
    let node
    if (x === null || typeof x !== 'object') node = { t: 'val', val: x }
    else if ('val' in x) node = { t: 'val', val: x.val }
    else if (x.ref) node = { t: 'ref', ref: x.ref }
    else if (x.func) node = { t: 'func', name: x.func.toLowerCase(), args: _args(x.args), distinct: x.distinct }
    else if (x.xpr) node = Parser.parse(x.xpr)
    else if (x.list) node = { t: 'list', items: x.list.map(Parser.operand) }
    else if (x.SELECT) node = { t: 'select', q: x }
    else if (x['#'] !== undefined) node = { t: 'val', val: x['#'] }
    else if (x.param || x.ref === '?') throw unsupported('Query parameters (placeholders)')
    else throw unsupported(`Expression ${_show(x)}`)
    if (x?.cast?.type) node = { t: 'cast', type: x.cast.type, arg: node }
    return node
  }
}

const _args = args => {
  if (!args) return []
  if (!Array.isArray(args)) return Object.values(args).map(Parser.operand) // named args
  return args.map(a => (a === '*' ? { t: 'star' } : Parser.operand(a)))
}

const _show = x => (typeof x === 'string' ? x : JSON.stringify(x))

// ---------------------------------------------------------------------------------------------
//  Filter helpers
// ---------------------------------------------------------------------------------------------

/** Filter matching no documents */
const NEVER = Object.freeze({ _id: { $exists: false } })
const isNever = f => f === NEVER
const isEmpty = f => !f || Object.keys(f).length === 0

const and = (...filters) => {
  const list = []
  for (const f of filters.flat()) {
    if (isEmpty(f)) continue
    if (isNever(f)) return NEVER
    if (f.$and && Object.keys(f).length === 1) list.push(...f.$and)
    else list.push(f)
  }
  if (!list.length) return {}
  return list.length === 1 ? list[0] : { $and: list }
}

const or = (...filters) => {
  const list = []
  for (const f of filters.flat()) {
    if (isEmpty(f)) return {}
    if (isNever(f)) continue
    if (f.$or && Object.keys(f).length === 1) list.push(...f.$or)
    else list.push(f)
  }
  if (!list.length) return NEVER
  return list.length === 1 ? list[0] : { $or: list }
}

const not = f => (isEmpty(f) ? NEVER : isNever(f) ? {} : { $nor: [f] })

/** Comparison of a stored field with a (converted) value, with CAP's null semantics */
function compare(path, op, v) {
  switch (op) {
    case '=':
      return v === null ? { [path]: null } : { [path]: { $eq: v } }
    case '!=': // null-safe in CAP, i.e. "is distinct from"
      return v === null ? { [path]: { $ne: null } } : { [path]: { $ne: v } }
    case '==': // is not distinct from
      return v === null ? { [path]: null } : { [path]: { $eq: v } }
    case '<>': // SQL semantic: nulls never match
      return v === null ? NEVER : { [path]: { $nin: [v, null] } }
    case '<':
      return v === null ? NEVER : { [path]: { $lt: v } }
    case '>':
      return v === null ? NEVER : { [path]: { $gt: v } }
    case '<=':
      return v === null ? NEVER : { [path]: { $lte: v } }
    case '>=':
      return v === null ? NEVER : { [path]: { $gte: v } }
  }
  throw unsupported(`Operator ${op}`)
}

/** Tuple IN: fields in [[v1, v2], ...] */
function tupleIn(paths, tuples) {
  if (!tuples.length) return NEVER
  if (paths.length === 1) return { [paths[0]]: { $in: tuples.map(t => (Array.isArray(t) ? t[0] : t)) } }
  return or(tuples.map(t => Object.fromEntries(paths.map((p, i) => [p, t[i] ?? null]))))
}

const escapeRegex = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function likeToRegex(pattern, esc) {
  let re = ''
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i]
    if (esc && c === esc && i + 1 < pattern.length) re += escapeRegex(pattern[++i])
    else if (c === '%') re += '.*'
    else if (c === '_') re += '.'
    else re += escapeRegex(c)
  }
  return `^${re}$`
}

/** Normalized key for matching BSON values in JS (used to join expanded rows) */
const keyOf = v => {
  if (v === null || v === undefined) return 'null'
  if (v instanceof Date) return 't' + v.getTime()
  if (v?._bsontype === 'Decimal128') return 'n' + Number(v.toString())
  if (v?._bsontype === 'Long') return 'n' + v.toString()
  if (v?._bsontype === 'Binary') return 'b' + Buffer.from(v.buffer).toString('base64')
  if (v?._bsontype === 'ObjectId') return 'o' + v.toHexString()
  if (typeof v === 'number') return 'n' + v
  return JSON.stringify(v)
}

const lit = v => (v === null || v === undefined ? null : { $literal: v })

// ---------------------------------------------------------------------------------------------
//  Compiler
// ---------------------------------------------------------------------------------------------

class CQN2Mongo {
  /** @param {import('./MongoService')} srv - the (transactional) service instance executing the query */
  constructor(srv) {
    this.srv = srv
    this.model = srv.model
    this.lookups = 0
  }

  info(def) {
    if (typeof def === 'string') {
      const d = this.model.definitions[def] || this.model.definitions[def.replace(/^localized\./, '')]
      if (!d) throw badInput(`Entity "${def}" is not defined in the model`)
      def = d
    } else if (def?.name && this.model.definitions[def.name] && this.model.definitions[def.name] !== def) {
      def = this.model.definitions[def.name] // e.g. definitions from a different (compiled) model during deploy
    }
    return infoOf(def, this.model)
  }

  // --- session variables ---------------------------------------------------------------------

  session(name) {
    const vars = this.srv.dbc?.vars || {}
    const ctx = cds.context
    switch (name) {
      case '$user':
      case '$user.id':
        return vars['$user.id'] ?? ctx?.user?.id ?? 'anonymous'
      case '$user.locale':
      case '$locale':
        return vars['$user.locale'] ?? ctx?.locale ?? cds.env.i18n.default_language
      case '$now':
      case '$at':
        return new Date(vars.$now ?? ctx?.timestamp ?? Date.now())
      case '$tenant':
        return ctx?.tenant ?? null
      case '$valid.from':
        return new Date(vars['$valid.from'] ?? Date.now())
      case '$valid.to':
        return new Date(vars['$valid.to'] ?? Date.now() + 1)
      case '$session.locale':
        return vars['$user.locale'] ?? ctx?.locale ?? null
    }
    if (name.startsWith('$user.') && /^\$user\.[A-Za-z_][\w]*$/.test(name)) {
      // user attributes, e.g. $user.country for instance-based authorization (own properties only)
      const k = name.slice(6)
      const attr = ctx?.user?.attr && Object.hasOwn(ctx.user.attr, k) ? ctx.user.attr[k] : undefined
      return attr === undefined ? null : attr
    }
    throw badInput(`Unknown element or session variable "${name}"`)
  }

  // --- references -----------------------------------------------------------------------------

  /**
   * Resolves a reference in the given scope, returns one of
   *   { kind: 'field', path, element }
   *   { kind: 'val', val }
   *   { kind: 'expr', scope, node }
   *   { kind: 'assoc', scope, assoc, where }
   *   { kind: 'nav', scope, assoc, where, rest }
   *   { kind: 'virtual', element }
   */
  ref(scope, ref) {
    const head = ref[0]
    const h = head?.id || head
    if (typeof h === 'string' && h.startsWith('$') && h !== '$self') {
      // session values follow SQL semantics: a missing value (null) never equals anything
      return { kind: 'val', val: this.session(ref.map(r => r.id || r).join('.')), session: true }
    }
    if (h === '$self' && ref.length > 1) return this.ref(scope, ref.slice(1))

    // support flattened structs: ['address','city'] -> address_city
    let k = 1
    let name = h
    if (ref.length > 1 && ref.every(r => typeof r === 'string')) {
      for (let j = ref.length; j > 1; j--) {
        const n = ref.slice(0, j).join('_')
        if (scope.entity.elements?.[n]) {
          name = n
          k = j
          break
        }
      }
    }
    const r = scope.resolve(name)
    if (!r) throw badInput(`Element "${name}" does not exist in entity "${scope.name}"`)
    const rest = ref.slice(k)
    switch (r.kind) {
      case 'field':
        if (rest.length) {
          // sub path into a structured / Map element - must be a plain name (no $ operators, no dots)
          const segs = rest.map(x => x.id || x)
          for (const s of segs) if (typeof s !== 'string' || !/^[A-Za-z_][\w]*$/.test(s)) throw badInput(`Invalid path "${name}.${s}" in entity "${scope.name}"`)
          return { kind: 'field', path: [r.path, ...segs].join('.'), element: undefined }
        }
        return { kind: 'field', path: r.path, element: r.element }
      case 'val':
        return { kind: 'val', val: r.val }
      case 'virtual':
        return { kind: 'virtual', element: r.element }
      case 'expr': {
        if (rest.length) throw unsupported(`Path expression into calculated element ${name}`)
        // projection columns like `author.name as author` -> path expression in the source entity
        if (r.expr.ref && !r.expr.cast) {
          const inner = this.ref(r.scope, r.expr.ref)
          return inner.kind === 'nav' || inner.kind === 'field' ? { ...inner, element: r.element || inner.element } : inner
        }
        return { kind: 'expr', scope: r.scope, node: Parser.operand(r.expr), element: r.element }
      }
      case 'assoc': {
        const assoc = r.element
        const where = head?.where
        if (!rest.length) return { kind: 'assoc', scope, assoc, where }
        // foreign key short cut: author.ID -> author_ID
        if (assoc.keys && !where && rest.length === 1 && typeof rest[0] === 'string') {
          const key = assoc.keys.find(k => k.ref.join('_') === rest[0])
          const fk = key && scope.resolve(fk4(assoc, key))
          if (fk?.kind === 'field') return { kind: 'field', path: fk.path, element: fk.element }
        }
        return { kind: 'nav', scope, assoc, where, rest }
      }
    }
  }

  operand(scope, node) {
    if (node.t === 'val') return { kind: 'val', val: node.val }
    if (node.t === 'ref') return this.ref(scope, node.ref)
    return { kind: 'expr', scope, node }
  }

  /**
   * Resolves the target of a query, including navigation paths like Authors(1)/books:
   * returns the target entity (scope) and a filter selecting the addressed documents.
   */
  async from(from) {
    if (typeof from === 'string') from = { ref: [from] }
    if (!from?.ref) throw unsupported('Queries without an entity reference (joins, unions)')
    const [head, ...path] = from.ref
    let scope = this.info(head.id || head).assertPersistent()
    let filter = and(await this.projectionFilters(scope), await this.where(scope, head.where))
    for (const seg of path) {
      const name = seg.id || seg
      const r = scope.resolve(name)
      if (r?.kind !== 'assoc') throw badInput(`"${name}" is not an association of entity "${scope.name}"`)
      const spec = joinSpec(r.element)
      const t = this.info(r.element._target).assertPersistent()
      const src = spec.pairs.map(p => _required(scope, p.src, r.element))
      const tgt = spec.pairs.map(p => _required(t, p.tgt, r.element))
      const tuples = isNever(filter) ? [] : await this.srv._distinct(scope.collection, src, filter)
      filter = and(tupleIn(tgt, tuples), await this.targetFilters(t, spec), await this.where(t, seg.where))
      scope = t
    }
    return { scope, filter, alias: from.as, isPath: path.length > 0 }
  }

  // --- filters --------------------------------------------------------------------------------

  /** Compiles a CQN where clause (token array) into a MongoDB filter */
  async where(scope, tokens) {
    if (!tokens || (Array.isArray(tokens) && !tokens.length)) return {}
    return this.filter(scope, Parser.parse(tokens))
  }

  async filter(scope, n) {
    switch (n.t) {
      case 'and': {
        const fs = []
        for (const a of n.args) fs.push(await this.filter(scope, a))
        return and(fs)
      }
      case 'or': {
        const fs = []
        for (const a of n.args) fs.push(await this.filter(scope, a))
        return or(fs)
      }
      case 'not':
        return not(await this.filter(scope, n.arg))
      case 'null':
        return this._null(scope, n)
      case 'cmp':
        return this._cmp(scope, n)
      case 'in':
        return this._in(scope, n)
      case 'like':
        return this._like(scope, n)
      case 'between': {
        const f = and(await this._cmp(scope, { t: 'cmp', op: '>=', l: n.x, r: n.lo }), await this._cmp(scope, { t: 'cmp', op: '<=', l: n.x, r: n.hi }))
        return n.not ? not(f) : f
      }
      case 'exists':
        return this._exists(scope, n.x)
      case 'func':
        if (BOOLEAN_FUNCS.has(n.name)) return this._boolFunc(scope, n)
        break
      case 'val':
        return n.val ? {} : NEVER
      case 'ref': {
        const o = this.ref(scope, n.ref)
        if (o.kind === 'field') return { [o.path]: true }
        if (o.kind === 'nav') return this._navPredicate(o, { t: 'cmp', op: '=', l: { t: 'ref', ref: o.rest }, r: { t: 'val', val: true } })
        if (o.kind === 'val') return o.val ? {} : NEVER
      }
    }
    return { $expr: this.bool(scope, n) }
  }

  async _null(scope, n) {
    const o = this.operand(scope, n.arg)
    if (o.kind === 'field') return n.not ? { [o.path]: { $ne: null } } : { [o.path]: null }
    if (o.kind === 'val') return (o.val === null) !== n.not ? {} : NEVER
    if (o.kind === 'virtual') return n.not ? NEVER : {}
    if (o.kind === 'assoc' && o.assoc.keys && o.assoc.keys.length) {
      // author is null -> all foreign keys are null
      const paths = o.assoc.keys.map(k => o.scope.fieldPath(fk4(o.assoc, k))).filter(Boolean)
      if (paths.length === o.assoc.keys.length) return n.not ? or(paths.map(p => ({ [p]: { $ne: null } }))) : and(paths.map(p => ({ [p]: null })))
    }
    if (o.kind === 'assoc') {
      const f = await this._existsAssoc(o.scope, o.assoc, o.where)
      return n.not ? f : not(f)
    }
    if (o.kind === 'nav') {
      // author.name is null <=> not exists author[name is not null]
      const f = await this._navPredicate(o, { t: 'null', not: true, arg: { t: 'ref', ref: o.rest } })
      return n.not ? f : not(f)
    }
    const e = this.expr(scope, n.arg)
    return { $expr: n.not ? { $ne: [e, null] } : { $eq: [e, null] } }
  }

  async _cmp(scope, n) {
    let { op, l, r } = n
    let L = this.operand(scope, l)
    let R = this.operand(scope, r)
    if (L.kind === 'val' && R.kind !== 'val') {
      ;[L, R] = [R, L]
      ;[l, r] = [r, l]
      op = FLIP[op]
    }
    // SECURITY: `x = $user.attr` with a missing attribute must match nothing (SQL: x = NULL is never true),
    // otherwise instance-based authorization like @restrict where: 'country = $user.country' would expose
    // all rows with an empty country to users without that attribute. Only literal nulls mean "is null".
    if (op === '=' && ((R.kind === 'val' && R.session && R.val == null) || (L.kind === 'val' && L.session && L.val == null))) return NEVER
    // boolean functions compared with true/false, e.g. contains(title,'x') eq true
    if (l.t === 'func' && BOOLEAN_FUNCS.has(l.name) && R.kind === 'val' && typeof R.val === 'boolean' && (op === '=' || op === '!=')) {
      const f = await this._boolFunc(scope, l)
      return R.val === (op === '=') ? f : not(f)
    }
    if (L.kind === 'field' && R.kind === 'val') return compare(L.path, op, this._value(L.element, R.val))
    if (L.kind === 'nav' && R.kind === 'val') return this._navPredicate(L, { t: 'cmp', op, l: { t: 'ref', ref: L.rest }, r })
    if (L.kind === 'val' && R.kind === 'val') return _evalCmp(op, L.val, R.val) ? {} : NEVER
    if (L.kind === 'virtual' || R.kind === 'virtual') {
      const other = L.kind === 'virtual' ? R : L
      // virtual elements are never stored (null in the database)
      if (other.kind === 'val') return _evalCmp(op, null, other.val) ? {} : NEVER
    }
    if (L.kind === 'nav' || R.kind === 'nav') throw unsupported('Comparing two path expressions')
    return { $expr: this.bool(scope, { t: 'cmp', op, l, r }) }
  }

  _value(element, v) {
    if (Array.isArray(v)) return v.map(x => toBSON(element, x))
    return element ? toBSON(element, v) : v
  }

  async _in(scope, n) {
    const { l, r } = n
    let values
    let lefts = l.t === 'list' ? l.items : [l]
    const operands = lefts.map(x => this.operand(scope, x))

    if (r.t === 'select') {
      const rows = await this.srv._select(r.q)
      const cols = rows.length ? Object.keys(rows[0]) : []
      values = rows.map(row => (lefts.length === 1 ? [row[cols[0]]] : cols.slice(0, lefts.length).map(c => row[c])))
    } else if (r.t === 'list') {
      values = r.items.map(i => (i.t === 'list' ? i.items.map(x => this._const(scope, x)) : [this._const(scope, i)]))
    } else if (r.t === 'val' && Array.isArray(r.val)) {
      values = r.val.map(v => (Array.isArray(v) ? v : [v]))
    } else if (r.t === 'val') {
      values = [[r.val]]
    } else throw unsupported('IN with a non-constant right hand side')

    if (operands.length === 1 && operands[0].kind === 'nav') {
      const o = operands[0]
      return this._navPredicate(o, { t: 'in', not: n.not, l: { t: 'ref', ref: o.rest }, r: { t: 'list', items: values.map(([v]) => ({ t: 'val', val: v })) } })
    }
    if (operands.every(o => o.kind === 'field')) {
      const paths = operands.map(o => o.path)
      const tuples = values
        .map(t => t.map((v, i) => this._value(operands[i].element, v)))
        .filter(t => t.every(v => v !== null && v !== undefined))
      if (paths.length === 1) {
        const vals = tuples.map(t => t[0])
        if (n.not) return { [paths[0]]: { $nin: [...vals, null] } }
        return vals.length ? { [paths[0]]: { $in: vals } } : NEVER
      }
      const f = tupleIn(paths, tuples)
      return n.not ? and(not(f), ...paths.map(p => ({ [p]: { $ne: null } }))) : f
    }
    // generic fallback with $expr
    const exprs = lefts.map(x => this.expr(scope, x))
    const f = { $expr: or(values.map(t => ({ $and: t.map((v, i) => ({ $eq: [exprs[i], lit(v)] })) }))) }
    return n.not ? not(f) : f
  }

  _const(scope, node) {
    const o = this.operand(scope, node)
    if (o.kind !== 'val') throw unsupported('IN lists with non-constant values')
    return o.val
  }

  async _like(scope, n) {
    const P = this.operand(scope, n.r)
    if (P.kind !== 'val' || typeof P.val !== 'string') throw unsupported('LIKE with a non-constant pattern')
    const esc = n.esc && this.operand(scope, n.esc).val
    const regex = likeToRegex(P.val, esc)
    return this._regex(scope, n.l, regex, '', n.not)
  }

  /**
   * Applies a regex to an operand. tolower()/toupper() wrappers are turned into a case insensitive
   * match, so the filter can still use the field (and its index) directly.
   */
  _regex(scope, node, regex, flags = '', negate = false) {
    let ci = false
    while (node.t === 'func' && (node.name === 'tolower' || node.name === 'toupper') && node.args.length === 1) {
      ci = true
      node = node.args[0]
    }
    const opts = [...new Set((ci ? 'i' : '') + flags + 's')].join('')
    const o = this.operand(scope, node)
    if (o.kind === 'field') {
      if (negate) return { [o.path]: { $not: new RegExp(regex, opts), $ne: null } }
      return { [o.path]: { $regex: regex, $options: opts } }
    }
    if (o.kind === 'nav') {
      const inner = { t: 'func', name: 'matchespattern', args: [{ t: 'ref', ref: o.rest }, { t: 'val', val: regex }], opts, internal: true }
      return this._navPredicate(o, negate ? { t: 'not', arg: inner } : inner)
    }
    const e = { $regexMatch: { input: { $toString: this.expr(scope, node) }, regex, options: opts } }
    return { $expr: negate ? { $not: [e] } : e }
  }

  async _boolFunc(scope, n) {
    const [a, b] = n.args
    if (!a || !b) throw unsupported(`Function ${n.name} with less than 2 arguments`)
    const B = this.operand(scope, b)
    if (B.kind === 'val' && typeof B.val === 'string') {
      if (n.name === 'matchespattern' && !n.internal) _assertSafeRegex(B.val)
      const s = n.name === 'matchespattern' ? B.val : escapeRegex(B.val)
      const regex = n.name === 'startswith' ? '^' + s : n.name === 'endswith' ? s + '$' : s
      return this._regex(scope, a, regex, n.opts || '')
    }
    return { $expr: this.bool(scope, n) }
  }

  /**
   * Evaluates a predicate on the target of a path expression, e.g. author.name = 'x' becomes
   * exists author[name = 'x']. Longer paths recurse naturally, as the predicate's reference
   * (o.rest) is compiled within the target entity again.
   */
  _navPredicate(o, predicate) {
    return this._existsAssoc(o.scope, o.assoc, o.where, predicate)
  }

  async _exists(scope, x) {
    if (x?.SELECT) {
      const rows = await this.srv._select({ SELECT: { ...x.SELECT, one: false, limit: { rows: { val: 1 } }, columns: [{ val: 1, as: '_' }] } })
      return rows?.length ? {} : NEVER
    }
    if (!x?.ref) throw unsupported('EXISTS without association path or sub query')
    const o = this.ref(scope, x.ref)
    if (o.kind === 'assoc') return this._existsAssoc(o.scope, o.assoc, o.where)
    if (o.kind === 'nav') return this._navPredicate(o, { t: 'exists', x: { ref: o.rest } })
    throw unsupported(`EXISTS on ${x.ref.map(r => r.id || r).join('.')}`)
  }

  /**
   * Translates exists assoc[where] into a filter on the source:
   * collects the join values of matching target documents and returns `src IN (values)`
   */
  async _existsAssoc(scope, assoc, where, predicate) {
    const spec = joinSpec(assoc)
    const t = this.info(assoc._target).assertPersistent()
    let filter = and(await this.targetFilters(t, spec), await this.where(t, where))
    if (predicate) filter = and(filter, await this.filter(t, predicate))
    if (isNever(filter)) return NEVER
    const srcPaths = spec.pairs.map(p => _required(scope, p.src, assoc))
    const tgtPaths = spec.pairs.map(p => _required(t, p.tgt, assoc))
    const tuples = await this.srv._distinct(t.collection, tgtPaths, filter)
    return tupleIn(srcPaths, tuples)
  }

  /** Filters from the association's on-condition (constant parts) plus the target's projection filters */
  async targetFilters(t, spec) {
    const fs = [await this.projectionFilters(t)]
    for (const f of spec?.tgtFilters || []) {
      const o = this.ref(t, f.ref)
      const v = f.session ? this.session(f.session) : f.val
      if (f.session && v == null && (CMP[f.op] || f.op) === '=') return NEVER // see _cmp: session nulls never match
      if (o.kind === 'field') fs.push(compare(o.path, CMP[f.op] || f.op, toBSON(o.element, v)))
      else if (o.kind === 'virtual') continue
      else fs.push(await this.filter(t, { t: 'cmp', op: CMP[f.op] || f.op, l: { t: 'ref', ref: f.ref }, r: { t: 'val', val: v } }))
    }
    return and(fs)
  }

  async projectionFilters(scope) {
    const fs = []
    for (const { scope: s, where } of scope.filters) fs.push(await this.where(s, where))
    return and(fs)
  }

  /** Full text search ($search, Fiori search field) */
  search(scope, tokens) {
    if (!tokens?.length) return {}
    const fields = searchableFields(scope)
    if (!fields.length) return {}
    const term = v => or(fields.map(p => ({ [p]: { $regex: escapeRegex(v), $options: 'i' } })))
    const compile = toks => {
      let result,
        conj = 'and',
        neg = false
      for (const x of toks) {
        if (typeof x === 'string') {
          const k = x.toLowerCase()
          if (k === 'and' || k === 'or') conj = k
          else if (k === 'not') neg = true
          continue
        }
        let f = x.xpr ? compile(x.xpr) : x.val !== undefined ? term(x.val) : x.list ? or(x.list.map(i => term(i.val))) : {}
        if (neg) f = not(f)
        neg = false
        result = result === undefined ? f : conj === 'or' ? or(result, f) : and(result, f)
        conj = 'and'
      }
      return result ?? {}
    }
    return compile(tokens)
  }

  // --- aggregation expressions ----------------------------------------------------------------

  /** Compiles an AST node into an aggregation expression (used in $expr, $project, $sort, ...) */
  expr(scope, n, hint) {
    switch (n.t) {
      case 'val':
        return lit(hint ? toBSON(hint, n.val) : n.val)
      case 'ref': {
        const o = this.ref(scope, n.ref)
        if (o.kind === 'field') return { $ifNull: ['$' + o.path, null] }
        if (o.kind === 'val') return lit(hint ? toBSON(hint, o.val) : o.val)
        if (o.kind === 'expr') return this.expr(o.scope, o.node, hint)
        if (o.kind === 'virtual') return null
        throw unsupported(`Path expression ${n.ref.map(r => r.id || r).join('.')} in calculated values or sort criteria`)
      }
      case 'func':
        return this._func(scope, n)
      case 'arith': {
        const a = this.expr(scope, n.l)
        const b = this.expr(scope, n.r)
        if (n.op === '||') return { $concat: [{ $ifNull: [{ $toString: a }, ''] }, { $ifNull: [{ $toString: b }, ''] }] }
        const op = { '+': '$add', '-': '$subtract', '*': '$multiply', '/': '$divide', '%': '$mod' }[n.op]
        return { $cond: [{ $or: [{ $eq: [a, null] }, { $eq: [b, null] }] }, null, { [op]: [a, b] }] }
      }
      case 'neg':
        return { $multiply: [-1, this.expr(scope, n.arg)] }
      case 'case': {
        const branches = n.whens.map(w => ({
          case: n.base ? { $eq: [this.expr(scope, n.base), this.expr(scope, w.c)] } : this.bool(scope, w.c),
          then: this.expr(scope, w.v, hint)
        }))
        return { $switch: { branches, default: n.else ? this.expr(scope, n.else, hint) : null } }
      }
      case 'cast':
        return _cast(this.expr(scope, n.arg), n.type)
      case 'list':
        return n.items.map(i => this.expr(scope, i))
      case 'select':
        throw unsupported('Sub queries in calculated values')
      case 'star':
        return 1
      case 'raw': // pre-compiled expression (aggregations)
        return n.expr
      default:
        return this.bool(scope, n)
    }
  }

  /** Compiles a predicate AST into a boolean aggregation expression */
  bool(scope, n) {
    switch (n.t) {
      case 'and':
        return { $and: n.args.map(a => this.bool(scope, a)) }
      case 'or':
        return { $or: n.args.map(a => this.bool(scope, a)) }
      case 'not':
        return { $not: [this.bool(scope, n.arg)] }
      case 'null': {
        const e = this.expr(scope, n.arg)
        return n.not ? { $ne: [e, null] } : { $eq: [e, null] }
      }
      case 'cmp': {
        const L = n.l.t === 'ref' ? this.ref(scope, n.l.ref) : {}
        const R = n.r.t === 'ref' ? this.ref(scope, n.r.ref) : {}
        const a = this.expr(scope, n.l, R.element)
        const b = this.expr(scope, n.r, L.element)
        const op = { '=': '$eq', '==': '$eq', '!=': '$ne', '<>': '$ne', '<': '$lt', '>': '$gt', '<=': '$lte', '>=': '$gte' }[n.op]
        // missing session values never match with '=' (see _cmp)
        if (n.op === '=' && ((L.session && L.val == null) || (R.session && R.val == null))) return false
        if (n.op === '=' || n.op === '!=' || n.op === '==') return { [op]: [a, b] }
        // SQL semantics: comparisons with null are never true
        return { $and: [{ $ne: [a, null] }, { $ne: [b, null] }, { [op]: [a, b] }] }
      }
      case 'in': {
        const e = this.expr(scope, n.l)
        if (n.r.t !== 'list') throw unsupported('IN with sub queries inside calculated values')
        const f = { $in: [e, n.r.items.map(i => this.expr(scope, i))] }
        return n.not ? { $and: [{ $ne: [e, null] }, { $not: [f] }] } : f
      }
      case 'like': {
        const P = this.operand(scope, n.r)
        if (P.kind !== 'val') throw unsupported('LIKE with a non-constant pattern')
        const f = { $regexMatch: { input: { $toString: this.expr(scope, n.l) }, regex: likeToRegex(P.val, n.esc && this.operand(scope, n.esc).val), options: 's' } }
        return n.not ? { $not: [f] } : f
      }
      case 'between': {
        const f = { $and: [this.bool(scope, { t: 'cmp', op: '>=', l: n.x, r: n.lo }), this.bool(scope, { t: 'cmp', op: '<=', l: n.x, r: n.hi })] }
        return n.not ? { $not: [f] } : f
      }
      case 'val':
        return !!n.val
      case 'ref':
        return { $eq: [this.expr(scope, n), true] }
      case 'func':
        if (BOOLEAN_FUNCS.has(n.name)) return this._func(scope, n)
        return this._func(scope, n)
      case 'exists':
        throw unsupported('EXISTS inside calculated values or case expressions')
    }
    return this.expr(scope, n)
  }

  _func(scope, n) {
    const name = n.name
    const args = n.args
    const e = i => this.expr(scope, args[i])
    const str = i => ({ $ifNull: [{ $toString: e(i) }, null] })
    const date = i => {
      const o = args[i].t === 'ref' ? this.ref(scope, args[i].ref) : {}
      const t = typeOf(o.element)
      if (t === 'cds.Date') return { $dateFromString: { dateString: e(i), onNull: null } }
      if (t === 'cds.Time') return { $dateFromString: { dateString: { $concat: ['1970-01-01T', e(i), 'Z'] }, onNull: null } }
      return e(i)
    }
    const nullSafe = (x, ...vals) => ({ $cond: [{ $or: vals.map(v => ({ $eq: [v, null] })) }, null, x] })
    switch (name) {
      case 'tolower':
        return nullSafe({ $toLower: e(0) }, e(0))
      case 'toupper':
        return nullSafe({ $toUpper: e(0) }, e(0))
      case 'length':
        return nullSafe({ $strLenCP: str(0) }, e(0))
      case 'trim':
        return nullSafe({ $trim: { input: str(0) } }, e(0))
      case 'ltrim':
        return nullSafe({ $ltrim: { input: str(0) } }, e(0))
      case 'rtrim':
        return nullSafe({ $rtrim: { input: str(0) } }, e(0))
      case 'concat':
        return nullSafe({ $concat: args.map((_, i) => str(i)) }, ...args.map((_, i) => e(i)))
      case 'substring':
      case 'substr': {
        // OData semantics: zero-based start index
        const len = args[2] ? e(2) : { $strLenCP: str(0) }
        return nullSafe({ $substrCP: [str(0), e(1), len] }, e(0))
      }
      case 'indexof':
        return nullSafe({ $indexOfCP: [str(0), str(1)] }, e(0))
      case 'contains':
        return { $gte: [{ $indexOfCP: [{ $ifNull: [str(0), ''] }, { $ifNull: [str(1), ''] }] }, 0] }
      case 'startswith':
        return { $eq: [{ $indexOfCP: [{ $ifNull: [str(0), ''] }, { $ifNull: [str(1), ''] }] }, 0] }
      case 'endswith': {
        const s = { $ifNull: [str(0), ''] }
        const x = { $ifNull: [str(1), ''] }
        const pos = { $subtract: [{ $strLenCP: s }, { $strLenCP: x }] }
        return { $and: [{ $gte: [pos, 0] }, { $eq: [{ $substrCP: [s, { $max: [pos, 0] }, { $strLenCP: x }] }, x] }] }
      }
      case 'matchespattern': {
        const P = this.operand(scope, args[1])
        if (P.kind !== 'val' || typeof P.val !== 'string') throw unsupported('matchesPattern with a non-constant pattern')
        if (!n.internal) _assertSafeRegex(P.val)
        return { $regexMatch: { input: { $ifNull: [str(0), ''] }, regex: P.val, options: n.opts || '' } }
      }
      case 'year':
        return nullSafe({ $year: date(0) }, e(0))
      case 'month':
        return nullSafe({ $month: date(0) }, e(0))
      case 'day':
      case 'dayofmonth':
        return nullSafe({ $dayOfMonth: date(0) }, e(0))
      case 'hour':
        return nullSafe({ $hour: date(0) }, e(0))
      case 'minute':
        return nullSafe({ $minute: date(0) }, e(0))
      case 'second':
        return nullSafe({ $second: date(0) }, e(0))
      case 'date':
        return nullSafe({ $dateToString: { format: '%Y-%m-%d', date: date(0) } }, e(0))
      case 'time':
        return nullSafe({ $dateToString: { format: '%H:%M:%S', date: date(0) } }, e(0))
      case 'now':
      case 'current_timestamp':
        return lit(this.session('$now'))
      case 'current_date':
        return lit(this.session('$now').toISOString().slice(0, 10))
      case 'current_time':
        return lit(this.session('$now').toISOString().slice(11, 19))
      case 'round':
        return nullSafe({ $round: [e(0), args[1] ? e(1) : 0] }, e(0))
      case 'floor':
        return nullSafe({ $floor: e(0) }, e(0))
      case 'ceiling':
      case 'ceil':
        return nullSafe({ $ceil: e(0) }, e(0))
      case 'abs':
        return nullSafe({ $abs: e(0) }, e(0))
      case 'coalesce':
      case 'ifnull':
        return args.length === 1 ? e(0) : { $ifNull: args.map((_, i) => e(i)) }
      case 'nullif':
        return { $cond: [{ $eq: [e(0), e(1)] }, null, e(0)] }
      case 'cast':
        return e(0)
    }
    if (AGGREGATES.has(name)) throw unsupported(`Aggregate function ${name}() outside of a column list`)
    throw unsupported(`Function ${name}()`)
  }
}

/** cast types may be given with or without namespace, e.g. { type: 'String' } in CQN from cds.parse */
const castType = t => (typeof t === 'string' && !t.includes('.') ? 'cds.' + t : t)

function _cast(e, type) {
  switch (castType(type)) {
    case 'cds.String':
    case 'cds.LargeString':
    case 'cds.UUID':
      return { $cond: [{ $eq: [e, null] }, null, { $toString: e }] }
    case 'cds.Integer':
    case 'cds.Int16':
    case 'cds.Int32':
    case 'cds.UInt8':
      return { $toInt: e }
    case 'cds.Int64':
      return { $toLong: e }
    case 'cds.Double':
      return { $toDouble: e }
    case 'cds.Decimal':
      return { $toDecimal: e }
    case 'cds.Boolean':
      return { $toBool: e }
    case 'cds.DateTime':
    case 'cds.Timestamp':
      return { $toDate: e }
  }
  return e
}

function _evalCmp(op, a, b) {
  if (op === '=' || op === '==') return a === b || (a === null && b === null)
  if (op === '!=') return a !== b
  if (a === null || b === null) return false
  switch (op) {
    case '<>':
      return a !== b
    case '<':
      return a < b
    case '>':
      return a > b
    case '<=':
      return a <= b
    case '>=':
      return a >= b
  }
}

/**
 * SECURITY: regular expressions from clients (OData matchesPattern) are executed by the database.
 * Limit their size and reject invalid patterns with 400 instead of passing them on.
 */
const MAX_PATTERN_LENGTH = 512
function _assertSafeRegex(pattern) {
  if (pattern.length > MAX_PATTERN_LENGTH) throw badInput(`Regular expression too long (max. ${MAX_PATTERN_LENGTH} characters)`)
  try {
    new RegExp(pattern)
  } catch (e) {
    throw badInput(`Invalid regular expression: ${e.message}`)
  }
}

function _required(scope, name, assoc) {
  const p = scope.fieldPath(name)
  if (!p) throw unsupported(`Association ${assoc.parent?.name}.${assoc.name} - join element "${name}" is not a stored field of ${scope.name}`)
  return p
}

/** Fields searched by $search: @cds.search or all string elements */
function searchableFields(scope) {
  if (scope._searchable) return scope._searchable
  const e = scope.entity
  const annotated = Object.entries(e)
    .filter(([k]) => k.startsWith('@cds.search.'))
    .map(([k, v]) => [k.slice(12), v])
  const explicit = annotated.filter(([, v]) => v === true).map(([k]) => k)
  const excluded = new Set(annotated.filter(([, v]) => v === false).map(([k]) => k))
  let names
  if (explicit.length) names = explicit
  else
    names = Object.values(e.elements || {})
      .filter(el => {
        const t = typeOf(el)
        return (t === 'cds.String' || t === 'cds.LargeString') && !el.virtual && !el.isAssociation
      })
      .map(el => el.name)
  const fields = []
  for (const n of names) {
    if (excluded.has(n)) continue
    const p = scope.fieldPath(n)
    if (p) fields.push(p)
  }
  return (scope._searchable = fields)
}

module.exports = { CQN2Mongo, Parser, and, or, not, compare, tupleIn, NEVER, isNever, isEmpty, keyOf, escapeRegex, likeToRegex, lit, AGGREGATES, searchableFields, cast: _cast, castType }
