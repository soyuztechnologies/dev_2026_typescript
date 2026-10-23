const cds = require('@sap/cds')
const { Readable } = require('stream')
const consumers = require('stream/consumers')
const { Decimal128, Binary, Long, ObjectId } = require('mongodb')
const { badInput } = require('./errors')

/**
 * Type mapping CDS <-> BSON
 *
 *   cds.UUID, String, LargeString   string
 *   cds.Boolean                     boolean
 *   cds.Integer, Int16/32, UInt8    int / double
 *   cds.Int64                       number (Long if outside of the safe integer range)
 *   cds.Double                      double
 *   cds.Decimal                     Decimal128 (exact, no floating point rounding errors)
 *   cds.Date / cds.Time             'YYYY-MM-DD' / 'HH:MM:SS' strings (like SQLite)
 *   cds.DateTime / cds.Timestamp    BSON Date (native MongoDB dates -> TTL indexes, date operators)
 *   cds.Binary, cds.LargeBinary     BSON Binary
 *   cds.Vector, arrayed, cds.Map    arrays / sub documents
 */

const BUILTINS = ['UUID', 'Boolean', 'Int64', 'Int32', 'Int16', 'UInt8', 'Integer', 'Double', 'Decimal', 'Date', 'Time', 'Timestamp', 'DateTime', 'LargeBinary', 'Binary', 'Vector', 'LargeString', 'String', 'Map']

/** Returns the builtin cds type name of an element, e.g. 'cds.Decimal' */
function typeOf(el) {
  if (!el) return undefined
  if (typeof el.type === 'string' && el.type.startsWith('cds.')) return el.type
  const classes = cds.builtin.classes
  for (const t of BUILTINS) if (classes[t] && el instanceof classes[t]) return 'cds.' + t
  if (el.items) return 'array'
  return el.type
}

const isStream = v => v instanceof Readable || (v && typeof v.pipe === 'function' && typeof v.on === 'function')

const _invalid = (v, el, what = typeOf(el)) =>
  badInput(`Invalid value "${v}" for element "${el?.name}" of type ${what}`, { target: el?.name })

const _date = (v, el) => {
  const d = v instanceof Date ? new Date(v.getTime()) : new Date(v)
  if (Number.isNaN(d.getTime())) throw _invalid(v, el)
  return d
}

const _num = (v, el) => {
  if (typeof v === 'number') return v
  const n = Number(v)
  if (v === '' || typeof v === 'boolean' || Number.isNaN(n)) throw _invalid(v, el)
  return n
}

const _numberToString = n =>
  Number.isInteger(n) || Math.abs(n) >= 1e21 || (n !== 0 && Math.abs(n) < 1e-6)
    ? n.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 })
    : String(n)

/**
 * Converts a (non-stream) value written by CAP or used in a filter into its BSON representation.
 */
function toBSON(el, v) {
  if (v === undefined || v === null) return null
  switch (typeOf(el)) {
    case 'cds.Boolean':
      if (typeof v === 'string') return v === 'true' || v === '1'
      return !!v
    case 'cds.Integer':
    case 'cds.Int16':
    case 'cds.Int32':
    case 'cds.UInt8':
    case 'cds.Double':
      return _num(v, el)
    case 'cds.Int64': {
      if (typeof v === 'bigint') return Long.fromBigInt(v)
      if (v instanceof Long) return v
      const n = _num(v, el)
      return Number.isSafeInteger(n) || !Number.isInteger(n) ? n : Long.fromString(String(v))
    }
    case 'cds.Decimal':
      if (v instanceof Decimal128) return v
      try {
        return Decimal128.fromString(typeof v === 'number' ? _numberToString(v) : String(v).trim())
      } catch {
        throw _invalid(v, el)
      }
    case 'cds.Date':
      if (v instanceof Date) return v.toISOString().slice(0, 10)
      return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v) ? _date(v, el).toISOString().slice(0, 10) : String(v)
    case 'cds.Time':
      if (v instanceof Date) return v.toISOString().slice(11, 19)
      return String(v)
    case 'cds.DateTime': {
      const d = _date(v, el)
      d.setUTCMilliseconds(0)
      return d
    }
    case 'cds.Timestamp':
      return _date(v, el)
    case 'cds.Binary':
    case 'cds.LargeBinary':
      if (v instanceof Binary) return v
      if (typeof v === 'string') return new Binary(Buffer.from(v, 'base64'))
      if (v instanceof Uint8Array) return new Binary(v)
      return v
    case 'cds.String':
    case 'cds.LargeString':
    case 'cds.UUID':
      if (typeof v === 'string') return v
      if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'bigint') return String(v)
      if (v instanceof Date) return v.toISOString()
      if (Buffer.isBuffer(v)) return v.toString('utf8')
      // SECURITY: no objects / arrays for string elements - prevents storing or querying
      // with operator objects like { $gt: '' } (type confusion, NoSQL injection)
      throw _invalid(typeof v === 'object' ? JSON.stringify(v) : v, el)
    default:
      return v
  }
}

/** Like toBSON, but also consumes streams (media data, LargeString/LargeBinary uploads) */
async function toBSONAsync(el, v) {
  if (isStream(v)) {
    const t = typeOf(el)
    v = t === 'cds.LargeString' || t === 'cds.String' ? await consumers.text(v) : await consumers.buffer(v)
  }
  return toBSON(el, v)
}

/** Converts a value read from MongoDB into what CAP expects */
function fromBSON(el, v, { streams = true } = {}) {
  if (v === undefined || v === null) return null
  const t = typeOf(el)
  if (v instanceof Decimal128) {
    // decimal elements: strings with ieee754compatible (CAP default), aggregates etc. without element: numbers (like SQLite)
    const s = v.toString()
    return el && cds.env.features.ieee754compatible ? _scaled(s, el.scale) : Number(s)
  }
  if (v instanceof Long)
    return cds.env.features.ieee754compatible || v.greaterThan(Number.MAX_SAFE_INTEGER) || v.lessThan(Number.MIN_SAFE_INTEGER) ? v.toString() : v.toNumber()
  if (v instanceof Date) {
    if (t === 'cds.Date') return v.toISOString().slice(0, 10)
    if (t === 'cds.Time') return v.toISOString().slice(11, 19)
    if (t === 'cds.DateTime') return v.toISOString().replace(/\.\d{3}Z$/, 'Z')
    return v.toISOString()
  }
  if (v instanceof ObjectId) return v.toHexString()
  if (v instanceof Binary) v = Buffer.from(v.buffer)
  if (Buffer.isBuffer(v)) return t === 'cds.LargeBinary' && streams ? Readable.from([v]) : v
  if (typeof v === 'number' && cds.env.features.ieee754compatible && (t === 'cds.Int64' || t === 'cds.Decimal')) return String(v)
  if (t === 'cds.Boolean' && typeof v !== 'boolean') return v === 1 || v === 'true'
  if (typeof v === 'object') return _plain(v)
  return v
}

/** Formats a decimal string with the element's scale, e.g. '14' -> '14.00' for Decimal(9,2), like SQL databases */
function _scaled(s, scale) {
  if (/[eE]/.test(s)) s = _numberToString(Number(s))
  if (!Number.isInteger(scale) || scale <= 0 || /nan|inf/i.test(s)) return s
  const [int, frac = ''] = s.split('.')
  return frac.length >= scale ? s : `${int}.${frac.padEnd(scale, '0')}`
}

/** Converts nested BSON values in plain sub documents / arrays (cds.Map, arrayed elements) */
function _plain(v) {
  if (v === null || typeof v !== 'object') return v
  if (v instanceof Decimal128) return Number(v.toString())
  if (v instanceof Long) return v.toNumber()
  if (v instanceof Date) return v.toISOString()
  if (v instanceof ObjectId) return v.toHexString()
  if (v instanceof Binary) return Buffer.from(v.buffer)
  if (Array.isArray(v)) return v.map(_plain)
  const r = {}
  for (const k of Object.keys(v)) {
    // SECURITY: never let stored keys like "__proto__" change the prototype of returned objects
    if (k === '__proto__') continue
    r[k] = _plain(v[k])
  }
  return r
}

module.exports = { typeOf, toBSON, toBSONAsync, fromBSON, isStream }
