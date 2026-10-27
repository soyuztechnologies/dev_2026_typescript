const cds = require('@sap/cds')

const KIND = 'anubhav-attachments'
const LOG = cds.log('attachments')

const DEFAULTS = { maxFileSize: '100MB', allowedMimeTypes: ['*/*'], maxCount: 0, inline: true, bucketName: 'attachments' }

/** Plugin options from cds.requires["anubhav-attachments"] */
const options = () => ({ ...DEFAULTS, ...cds.env.requires?.[KIND] })

const UNITS = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3 }

/** '20MB' | '512 KB' | 1048576 -> bytes, 0 / falsy = unlimited */
function bytes(v) {
  if (!v) return 0
  if (typeof v === 'number') return v
  const m = /^\s*(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)?\s*$/i.exec(v)
  if (!m) throw cds.error(`Invalid file size "${v}" - use e.g. 500KB, 20MB or 1GB`)
  return Math.round(Number(m[1]) * UNITS[(m[2] || 'B').toUpperCase()])
}

/** 1048576 -> '1 MB' */
function pretty(n) {
  const [unit, f] = Object.entries(UNITS).reverse().find(([, f]) => n >= f) ?? ['B', 1]
  return `${Math.round((n / f) * 10) / 10} ${unit}`
}

/** The attachment entity (also for drafts and service projections) */
const isAttachments = e => !!(e?.isDraft ? e.actives : e)?.['@_anubhav_attachments']

const _singles = new WeakMap()

/** A single attachment: the target of a `Composition of one Attachments` */
function isSingle(e) {
  const model = cds.model
  if (!model) return false
  let singles = _singles.get(model)
  if (!singles) {
    _singles.set(model, (singles = new Set()))
    for (const d of Object.values(model.definitions))
      for (const c of Object.values(d.compositions ?? {})) if (!c.is2many && isAttachments(c._target)) singles.add(c._target.name)
  }
  return singles.has((e?.isDraft ? e.actives : e)?.name)
}

/** Maximum file size of an attachment entity: @Validation.Maximum on content, else the configured maxFileSize */
const maxFileSize = e => bytes(e?.elements?.content?.['@Validation.Maximum'] ?? options().maxFileSize)

/** Allowed media types: @Core.AcceptableMediaTypes on content, else the configured allowedMimeTypes */
function allowedMimeTypes(e) {
  const a = e?.elements?.content?.['@Core.AcceptableMediaTypes'] ?? options().allowedMimeTypes
  return [].concat(a ?? '*/*')
}

module.exports = { KIND, LOG, options, bytes, pretty, isAttachments, isSingle, maxFileSize, allowedMimeTypes }
