const cds = require('@sap/cds')
const { options, isAttachments, isSingle, maxFileSize, allowedMimeTypes, pretty } = require('./config')
const { mimeTypeOf, isAllowed, isInlineSafe } = require('./mime')
const { attachmentPaths, eachAttachment } = require('./db-handlers')

/**
 * Handlers on application services: validate uploads (media type, size, number of attachments)
 * and decide whether files are shown inline in the browser or downloaded.
 */
module.exports = function registerServiceHandlers(srv) {
  const relevant = Object.values(srv.entities).some(e => attachmentPaths(e).length)
  if (!relevant) return
  srv.before(['NEW', 'CREATE'], '*', onCreate)
  srv.before('EDIT', '*', onEdit)
  srv.before(['UPDATE', 'PATCH'], '*', onUpload)
  srv.after('READ', '*', onReadContent)
}

/** Media type from the file name - unknown extensions fall back to the type sent by the client */
const mimeType4 = (filename, sent) => mimeTypeOf(filename) ?? (sent && sent !== 'application/octet-stream' ? sent : undefined) ?? 'application/octet-stream'

function checkMimeType(req, entity, row) {
  const allowed = allowedMimeTypes(entity)
  if (!isAllowed(row.mimeType, allowed)) req.reject(415, 'ATTACHMENT_MIME_TYPE_NOT_ALLOWED', [row.mimeType, row.filename ?? '', allowed.join(', ')])
}

/** POST of attachments (also deep): media type from the file name, allowed types, max. number of attachments */
async function onCreate(req) {
  // url and size are @Core.Computed - CAP ignores them in client input and keeps them on draft activation
  if (!req.target || !attachmentPaths(req.target).length || req._?.event === 'draftActivate') return
  addSingles(req.target, req.data)
  eachAttachment(req.target, req.data, (entity, row) => {
    if (row.filename || row.mimeType) {
      row.mimeType = mimeType4(row.filename, row.mimeType)
      checkMimeType(req, entity, row)
    }
  })
  if (isAttachments(req.target)) await checkMaxCount(req)
  else for (const [name, c] of Object.entries(req.target.compositions ?? {})) if (isAttachments(c._target)) maxCount(c) && count(req.data?.[name]) > maxCount(c) && tooMany(req, c)
}

const singlesOf = entity => Object.entries(entity.compositions ?? {}).filter(([, c]) => !c.is2many && isAttachments(c._target))

/**
 * Single attachments (Composition of one Attachments) are created together with their parent, so
 * that Fiori can upload into them - Fiori can't create the target of a to-one composition itself.
 */
function addSingles(entity, data) {
  for (const row of Array.isArray(data) ? data : [data]) {
    if (!row || typeof row !== 'object' || isAttachments(entity)) continue
    for (const [name, c] of Object.entries(entity.compositions ?? {})) {
      if (!c.is2many && isAttachments(c._target)) row[name] ??= {}
      else if (row[name] && attachmentPaths(c._target).length) addSingles(c._target, row[name])
    }
  }
}

/** Edit of entities created before a single attachment was added to the model: create the missing ones */
async function onEdit(req) {
  const singles = singlesOf(req.target)
  if (!singles.length) return
  const keys = Object.keys(req.target.keys).filter(k => k !== 'IsActiveEntity' && !req.target.keys[k].isAssociation)
  const p = req.params?.at(-1)
  const values = { ...(p && typeof p === 'object' ? p : { [keys[0]]: p }), ...req.data }
  if (keys.some(k => values[k] === undefined)) return
  const up = Object.fromEntries(keys.map(k => [`up__${k}`, values[k]]))
  for (const [, c] of singles) {
    const target = c._target.isDraft ? c._target.actives : c._target
    if (!(await SELECT.one.from(target).columns('ID').where(up))) await INSERT.into(target).entries({ ...up })
  }
}

const maxCount = comp => comp?.['@Validation.MaxItems'] ?? options().maxCount
const count = rows => (Array.isArray(rows) ? rows.length : 0)
const tooMany = (req, comp) => req.reject(400, 'ATTACHMENT_MAX_COUNT', [maxCount(comp)])

/** POST /Parent(...)/attachments: not more than @Validation.MaxItems / maxCount attachments */
async function checkMaxCount(req) {
  const ref = req.query?.INSERT?.into?.ref
  if (!ref || ref.length < 2) return
  const parent = cds.infer.target({ SELECT: { from: { ref: ref.slice(0, -1) } } })
  const comp = parent?.compositions?.[ref.at(-1)]
  const max = maxCount(comp)
  if (!max) return
  const { n } = await SELECT.one.from({ ref }).columns('count(1) as n')
  if (n >= max) tooMany(req, comp)
}

/** PUT .../content: allowed media type, max. file size, no overwrite of existing content */
async function onUpload(req) {
  if (!isAttachments(req.target) || !req.data || req._?.event === 'draftActivate') return
  // the file name (and with it the media type) belongs to the uploaded file - no renaming
  if (!('content' in req.data) || req.data.content == null) return void delete req.data.filename
  const row = await SELECT.one.from(req.subject).columns('ID', 'filename', 'mimeType', 'url')
  if (!row) return req.reject(404)
  const restricted = [].concat(req.target['@Capabilities.UpdateRestrictions.NonUpdatableProperties'] ?? []).some(p => (p?.['='] ?? p) === 'content')
  if (row.url && restricted && !isSingle(req.target)) return req.reject(409, 'ATTACHMENT_CONTENT_EXISTS', [row.filename ?? row.ID])

  const headers = req.headers ?? {}
  const filename = req.data.filename ?? filenameOf(headers) ?? row.filename ?? 'file'
  const mimeType = mimeType4(filename, req.data.mimeType ?? headers['content-type']?.split(';')[0] ?? row.mimeType)
  Object.assign(req.data, { filename, mimeType })
  checkMimeType(req, req.target, req.data)

  const max = maxFileSize(req.target)
  const length = Number(headers['content-length'])
  if (max && length > max) req.reject(413, 'ATTACHMENT_TOO_LARGE', [filename, pretty(max)])
}

/** file name from Content-Disposition or Slug headers */
function filenameOf(headers) {
  const cd = headers['content-disposition']
  const m = cd && (/filename\*=UTF-8''([^;]+)/i.exec(cd) ?? /filename="?([^";]+)"?/i.exec(cd))
  if (m) return decodeURIComponent(m[1])
  if (headers.slug) return decodeURIComponent(headers.slug)
}

/** GET .../content: show safe types inline (images, pdf, text, audio, video), download all others */
function onReadContent(result, req) {
  if (Array.isArray(result)) result = result.length === 1 ? result[0] : null
  if (!isAttachments(req.target) || !result || typeof result !== 'object' || !('$mediaContentType' in result)) return
  const inline = options().inline !== false && isInlineSafe(result.$mediaContentType)
  result.$mediaContentDispositionType = inline ? 'inline' : 'attachment'
}
