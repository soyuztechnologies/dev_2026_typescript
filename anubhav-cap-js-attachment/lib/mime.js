const { extname } = require('path')

// file extension -> media type; the type of an upload is taken from its file name, not from the
// Content-Type header sent by the client, so that @Core.AcceptableMediaTypes can't be bypassed
const TYPES = {
  // documents
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  odt: 'application/vnd.oasis.opendocument.text',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  odp: 'application/vnd.oasis.opendocument.presentation',
  rtf: 'application/rtf',
  txt: 'text/plain',
  log: 'text/plain',
  md: 'text/markdown',
  csv: 'text/csv',
  json: 'application/json',
  xml: 'application/xml',
  html: 'text/html',
  htm: 'text/html',
  eml: 'message/rfc822',
  msg: 'application/vnd.ms-outlook',
  // images
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  bmp: 'image/bmp',
  webp: 'image/webp',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  ico: 'image/vnd.microsoft.icon',
  svg: 'image/svg+xml',
  heic: 'image/heic',
  // audio and video
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  webm: 'video/webm',
  avi: 'video/x-msvideo',
  mkv: 'video/x-matroska',
  // archives and others
  zip: 'application/zip',
  '7z': 'application/x-7z-compressed',
  rar: 'application/vnd.rar',
  gz: 'application/gzip',
  tar: 'application/x-tar'
}

/** Media type for a file name, undefined if the extension is unknown */
const mimeTypeOf = filename => filename && TYPES[extname(filename).slice(1).toLowerCase()]

/** true if type matches one of the patterns, e.g. ['image/*', 'application/pdf'] */
function isAllowed(type, patterns) {
  type = (type || '').toLowerCase().split(';')[0].trim()
  return patterns.some(p => {
    p = p.toLowerCase()
    if (p === '*/*' || p === '*') return true
    if (p.endsWith('/*')) return type.startsWith(p.slice(0, -1))
    return type === p
  })
}

// types browsers display without running scripts - shown inline ("view"), everything else is
// downloaded; SVG, HTML and XML can contain scripts and are never shown inline
const INLINE = ['image/png', 'image/jpeg', 'image/gif', 'image/bmp', 'image/webp', 'application/pdf', 'text/plain', 'text/csv', 'audio/*', 'video/*']
const isInlineSafe = type => isAllowed(type, INLINE)

module.exports = { mimeTypeOf, isAllowed, isInlineSafe }
