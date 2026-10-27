const cds = require('@sap/cds')
const { LOG, isAttachments, maxFileSize } = require('./config')
const gridfs = require('./gridfs')

/**
 * Handlers on the database service (@anubhav-cap-js/mongo). They run for every query - OData,
 * drafts and custom CQL - and keep the file content in GridFS:
 *
 *   write   content in INSERT / UPSERT / UPDATE data (also deep) -> GridFS, url = file id
 *   read    SELECT ... content -> GridFS read stream
 *   delete  files no longer referenced by any attachment (active or draft) are removed after the transaction
 */
module.exports = function registerDbHandlers(db) {
  db.prepend(() => {
    db.on(['INSERT', 'UPSERT', 'UPDATE', 'DELETE'], onWrite)
    db.on('SELECT', onRead)
  })
}

// --- model helpers ---------------------------------------------------------------------------------

const _paths = new WeakMap()

/** Composition paths from an entity to attachment entities, e.g. [[]] or [['attachments'], ['items', 'files']] */
function attachmentPaths(entity, visited = new Set()) {
  if (!entity?.elements) return []
  if (_paths.has(entity)) return _paths.get(entity)
  const paths = isAttachments(entity) ? [[]] : []
  if (!visited.has(entity)) {
    visited.add(entity)
    for (const [name, c] of Object.entries(entity.compositions ?? {}))
      for (const p of attachmentPaths(c._target, visited)) if (p.length < 5) paths.push([name, ...p])
    visited.delete(entity)
  }
  if (!visited.size) _paths.set(entity, paths)
  return paths
}

/** Calls fn(entity, row) for each attachment row in (deep) data */
function eachAttachment(entity, data, fn) {
  if (!data || typeof data !== 'object') return
  for (const row of Array.isArray(data) ? data : [data]) {
    if (!row || typeof row !== 'object') continue
    if (isAttachments(entity)) fn(entity, row)
    for (const [name, c] of Object.entries(entity.compositions ?? {}))
      if (row[name] && attachmentPaths(c._target).length) eachAttachment(c._target, row[name], fn)
  }
}

/** The persisted entity of an (active) service projection */
function baseOf(e) {
  if (e.isDraft) e = e.actives
  for (let i = 0; i < 10 && e?.query?.SELECT?.from?.ref?.length === 1; i++) {
    const next = cds.model.definitions[e.query.SELECT.from.ref[0].id ?? e.query.SELECT.from.ref[0]]
    if (!next) break
    e = next
  }
  return e
}

const _refs = new Map()

/** All entities that can reference files of the given attachment entity: the persisted entity and the draft entities of all its projections */
function referencingEntities(entity) {
  const base = baseOf(entity)
  if (_refs.has(base.name)) return _refs.get(base.name)
  const list = [base]
  for (const d of Object.values(cds.model.definitions)) if (d.kind === 'entity' && d.drafts && !d.isDraft && baseOf(d) === base) list.push(d.drafts)
  _refs.set(base.name, list)
  return list
}

const hasContent = v => v != null && (typeof v === 'string' ? v.length > 0 : typeof v === 'object')

// --- write -----------------------------------------------------------------------------------------

async function onWrite(req, next) {
  const target = req.target
  if (!target || !attachmentPaths(target).length) return next()
  const q = req.query
  const files = [] // candidates for removal after the transaction: { entity, url }

  // 1. upload content into GridFS
  const data = q.INSERT?.entries ?? q.UPSERT?.entries ?? q.UPDATE?.data
  // UPDATE attachment SET content = null (e.g. DELETE .../content from Fiori) removes the file
  if (q.UPDATE && isAttachments(target) && data && 'content' in data && data.content === null) {
    Object.assign(data, { url: null, size: null, filename: null, mimeType: null })
  }
  const uploads = []
  eachAttachment(target, data, (entity, row) => {
    if (!('content' in row)) return
    if (!hasContent(row.content)) return void delete row.content
    uploads.push([entity, row])
  })
  for (const [entity, row] of uploads) {
    const { id, size } = await gridfs.upload(this, row.content, {
      filename: row.filename,
      metadata: { entity: baseOf(entity).name, ID: row.ID },
      maxBytes: maxFileSize(entity)
    })
    delete row.content
    Object.assign(row, { url: id, size })
    files.push({ entity, url: id }) // removed again, if the transaction fails
  }

  // 2. files referenced by rows which are deleted or updated now
  if (q.DELETE || ((q.UPDATE || q.UPSERT) && touchesFiles(target, data))) files.push(...(await referencedFiles(this, req)))

  if (files.length) cleanupAfterTransaction(req, files)
  return next()
}

/** true if update data replaces files or deep compositions containing attachments */
function touchesFiles(entity, data) {
  for (const row of Array.isArray(data) ? data : [data]) {
    if (!row) continue
    if (isAttachments(entity) && 'url' in row) return true
    for (const [name, c] of Object.entries(entity.compositions ?? {})) if (name in row && attachmentPaths(c._target).length) return true
  }
  return false
}

/** Files of all attachments below the rows affected by a DELETE / UPDATE / UPSERT */
async function referencedFiles(db, req) {
  const q = req.query
  const target = req.target
  let ref, where
  if (q.DELETE) [ref, where] = [q.DELETE.from, q.DELETE.where]
  else if (q.UPDATE) [ref, where] = [q.UPDATE.entity, q.UPDATE.where]
  else {
    // UPSERT: the rows with the keys of the entries (single key entities)
    const keys = Object.keys(target.keys).filter(k => !target.keys[k].isAssociation && k !== 'IsActiveEntity')
    const values = [].concat(q.UPSERT.entries ?? []).map(e => e?.[keys[0]]).filter(v => v != null)
    if (keys.length !== 1 || !values.length) return []
    ;[ref, where] = [target.name, [{ ref: [keys[0]] }, 'in', { list: values.map(val => ({ val })) }]]
  }
  const steps = typeof ref === 'string' ? [ref] : ref.ref ? [...ref.ref] : [ref.name ?? target.name]
  if (where?.length) {
    const last = steps.at(-1)
    const id = last.id ?? last
    const w = last.where ? [{ xpr: last.where }, 'and', { xpr: where }] : where
    steps[steps.length - 1] = { ...(typeof last === 'object' ? last : {}), id, where: w }
  }
  const files = []
  for (const path of attachmentPaths(target)) {
    const entity = path.reduce((e, p) => e.compositions[p]._target, target)
    const rows = await db.run(SELECT.from({ ref: [...steps, ...path] }).columns('url').where('url is not null'))
    for (const { url } of rows) files.push({ entity, url })
  }
  return files
}

/** Removes files which are not referenced anymore once the current transaction has ended */
function cleanupAfterTransaction(req, files) {
  const ctx = req.context ?? cds.context
  const run = () => removeUnreferenced(files).catch(e => LOG.warn('could not remove unreferenced files from GridFS:', e.message))
  if (typeof ctx?.on === 'function') ctx.on('done', run)
  else return run()
}

async function removeUnreferenced(files) {
  const seen = new Set()
  await cds.tx({ user: cds.User.privileged }, async tx => {
    for (const { entity, url } of files) {
      if (seen.has(url)) continue
      seen.add(url)
      let used = false
      for (const e of referencingEntities(entity)) if ((used = !!(await tx.run(SELECT.one.from(e).columns('url').where({ url }))))) break
      if (!used) {
        await gridfs.remove(tx, url)
        LOG.debug?.('removed unreferenced file', url)
      }
    }
  })
}

// --- read ------------------------------------------------------------------------------------------

/**
 * content is never stored in the collection: SELECT content -> SELECT url as content, then the
 * file ids are replaced with GridFS read streams. References to content in expressions (e.g. the
 * content@odata.mediaContentType column of Fiori) are redirected to url, also in $expand.
 */
async function onRead(req, next) {
  const S = req.query?.SELECT
  if (!S || !req.target || !attachmentPaths(req.target).length) return next()
  const columns = S.columns
  const r = columns && rewrite(req.target, columns)
  if (r) S.columns = r.columns
  let result
  try {
    result = await next()
  } finally {
    S.columns = columns
  }
  if (!result || typeof result !== 'object') return result
  const rows = Array.isArray(result) ? result : [result]
  if (r?.streams.length) for (const row of rows) for (const as of r.streams) if (row?.[as] != null) row[as] = await gridfs.download(this, row[as])
  stripContent(req.target, columns, rows)
  return result
}

/**
 * Like SELECT * on SQL databases, results contain content only if it was selected explicitly:
 * Fiori computes the upload / download URL of a file only if content is missing in the response.
 */
function stripContent(entity, columns, rows) {
  const explicit = columns?.some(c => c.ref?.length === 1 && c.ref[0] === 'content' && !c.expand && !c.as)
  if (isAttachments(entity) && !explicit) for (const row of rows) if (row && typeof row === 'object') delete row.content
  for (const [name, c] of Object.entries(entity.compositions ?? {})) {
    if (!attachmentPaths(c._target).length) continue
    const col = columns?.find(x => x.expand && x.ref?.length === 1 && x.ref[0] === name)
    if (columns && !col) continue
    const alias = col?.as ?? name
    const expand = Array.isArray(col?.expand) ? col.expand : undefined
    const children = rows.flatMap(row => (row?.[alias] && typeof row[alias] === 'object' ? [].concat(row[alias]) : []))
    if (children.length) stripContent(c._target, expand?.some(x => x === '*') ? undefined : expand, children)
  }
}

const toUrl = xpr => xpr.map(x => (x?.ref?.length === 1 && x.ref[0] === 'content' ? { ...x, ref: ['url'] } : x?.xpr ? { ...x, xpr: toUrl(x.xpr) } : x))

function rewrite(entity, columns, top = true) {
  let changed = false
  const streams = []
  const att = isAttachments(entity)
  const result = columns.map(c => {
    if (att && c.ref?.length === 1 && c.ref[0] === 'content' && !c.expand) {
      changed = true
      if (!top) return { val: null, as: c.as ?? 'content' } // no streams in $expand
      streams.push(c.as ?? 'content')
      return { ref: ['url'], as: c.as ?? 'content' }
    }
    if (att && c.xpr) {
      changed = true
      return { ...c, xpr: toUrl(c.xpr) }
    }
    const target = c.expand && c.ref?.length === 1 && entity.elements?.[c.ref[0]]?._target
    if (target && attachmentPaths(target).length && Array.isArray(c.expand)) {
      const sub = rewrite(target, c.expand, false)
      if (sub) {
        changed = true
        return { ...c, expand: sub.columns }
      }
    }
    return c
  })
  return changed ? { columns: result, streams } : null
}

module.exports.attachmentPaths = attachmentPaths
module.exports.eachAttachment = eachAttachment
