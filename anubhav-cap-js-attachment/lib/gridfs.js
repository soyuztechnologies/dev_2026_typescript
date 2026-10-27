const cds = require('@sap/cds')
const path = require('path')
const { Readable, Transform } = require('stream')
const { pipeline } = require('stream/promises')
const { options, pretty } = require('./config')

// use the MongoDB driver of @anubhav-cap-js/mongo - same driver, same connection, no extra dependency
let mongodb
function driver() {
  if (mongodb) return mongodb
  try {
    const mongo = path.dirname(require.resolve('@anubhav-cap-js/mongo/package.json'))
    return (mongodb = require(require.resolve('mongodb', { paths: [mongo] })))
  } catch (e) {
    throw cds.error({ status: 500, code: 'ATTACHMENTS_MONGO_MISSING', message: '@anubhav-cap-js/attachments requires @anubhav-cap-js/mongo - run: npm add @anubhav-cap-js/mongo', cause: e })
  }
}

const buckets = new WeakMap()

/** The GridFS bucket in the database of cds.db (or of the given db transaction) */
async function bucket(db = cds.db) {
  const mdb = await db.native(({ db }) => db)
  let b = buckets.get(mdb)
  if (!b) buckets.set(mdb, (b = new (driver().GridFSBucket)(mdb, { bucketName: options().bucketName })))
  return b
}

const toReadable = v => (v instanceof Readable || typeof v?.pipe === 'function' ? v : Readable.from([typeof v === 'string' ? Buffer.from(v, 'base64') : Buffer.from(v)]))

/**
 * Streams content into GridFS and returns { id, size }. Rejects with 413 if the
 * content exceeds maxBytes - the partially written file is removed.
 */
async function upload(db, content, { filename, metadata, maxBytes }) {
  const b = await bucket(db)
  const up = b.openUploadStream(filename || 'file', { metadata })
  let size = 0
  const limit = new Transform({
    transform(chunk, _, done) {
      size += chunk.length
      if (maxBytes && size > maxBytes) done(cds.error({ status: 413, message: 'ATTACHMENT_TOO_LARGE', args: [filename, pretty(maxBytes)] }))
      else done(null, chunk)
    }
  })
  try {
    await pipeline(toReadable(content), limit, up)
  } catch (e) {
    await up.abort?.().catch(() => {})
    throw e
  }
  return { id: up.id.toString(), size }
}

const oid = id => {
  try {
    return new (driver().ObjectId)(id)
  } catch {
    return null
  }
}

/** A read stream for the file, or null if it doesn't exist */
async function download(db, id) {
  const _id = oid(id)
  if (!_id) return null
  const b = await bucket(db)
  const file = await b.find({ _id }, { limit: 1 }).next()
  return file ? b.openDownloadStream(_id) : null
}

/** Deletes a file, if it exists */
async function remove(db, id) {
  const _id = oid(id)
  if (!_id) return
  const b = await bucket(db)
  await b.delete(_id).catch(e => {
    if (!/FileNotFound|File not found/i.test(e.message)) throw e
  })
}

module.exports = { bucket, upload, download, remove }
