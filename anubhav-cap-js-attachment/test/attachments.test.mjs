import { describe, test, after } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import fs from 'node:fs'
import cds from '@sap/cds'
import { MongoMemoryReplSet } from 'mongodb-memory-server'

// the test app uses the plugin like an installed npm package -> link it into its node_modules
const link = path.join(import.meta.dirname, 'app', 'node_modules', '@anubhav-cap-js', 'attachments')
if (!fs.existsSync(link)) {
  fs.mkdirSync(path.dirname(link), { recursive: true })
  fs.symlinkSync(path.join(import.meta.dirname, '..'), link, 'junction')
}

// in-memory MongoDB replica set (with transactions) for the tests
const rs = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } })
process.env.MONGODB_URI = rs.getUri()
const { GET, POST, PUT, PATCH, DELETE: DEL, axios } = cds.test(path.join(import.meta.dirname, 'app'))
after(() => rs.stop())
axios.defaults.validateStatus = () => true

const S = '/odata/v4/test'
const draft = id => `${S}/Incidents(ID=${id},IsActiveEntity=false)`
const active = id => `${S}/Incidents(ID=${id},IsActiveEntity=true)`

/** number of files in GridFS */
const files = () => cds.db.native(({ db }) => db.collection('attachments.files').countDocuments())

async function upload(parent, filename, body, type = 'application/octet-stream', comp = 'attachments') {
  const created = await POST(`${parent}/${comp}`, { filename })
  assert.equal(created.status, 201, JSON.stringify(created.data))
  const isDraft = parent.includes('IsActiveEntity=false')
  const att = `${parent}/${comp}(ID=${created.data.ID}${parent.includes('IsActiveEntity') ? `,IsActiveEntity=${!isDraft}` : ''})`
  const put = await PUT(`${att}/content`, body, { headers: { 'content-type': type } })
  return { ID: created.data.ID, url: att, created, put }
}

const text = async url => {
  const res = await axios.get(url, { responseType: 'arraybuffer' })
  return { status: res.status, headers: res.headers, body: Buffer.from(res.data).toString() }
}

describe('draft-enabled entity (Fiori Elements flow)', () => {
  let incident, att

  test('create draft, add attachment, upload content', async () => {
    const { data } = await POST(`${S}/Incidents`, { title: 'Printer on fire' })
    incident = data.ID
    att = await upload(draft(incident), 'hello.txt', 'Hello GridFS', 'text/plain')
    assert.equal(att.created.data.mimeType, 'text/plain')
    assert.equal(att.put.status, 204, JSON.stringify(att.put.data))
    assert.equal(await files(), 1)
  })

  test('responses contain no content property - Fiori computes the upload URL (table upload)', async () => {
    assert.equal('content' in att.created.data, false)
    const { data } = await GET(`${draft(incident)}?$expand=attachments`)
    assert.equal('content' in data.attachments[0], false)
    const list = await GET(`${draft(incident)}/attachments`)
    assert.equal('content' in list.data.value[0], false)
  })

  test('download content from the draft - text is shown inline', async () => {
    const res = await text(`${att.url}/content`)
    assert.equal(res.status, 200)
    assert.equal(res.body, 'Hello GridFS')
    assert.match(res.headers['content-type'], /text\/plain/)
    assert.match(res.headers['content-disposition'], /^inline/)
    assert.match(res.headers['content-disposition'], /hello\.txt/)
  })

  test('metadata: size, url hidden, media link for Fiori in $expand', async () => {
    const { data } = await GET(`${draft(incident)}?$expand=attachments($select=ID,content,filename,mimeType,size)`)
    const [a] = data.attachments
    assert.equal(a.filename, 'hello.txt')
    assert.equal(a.size, 12)
    assert.equal(a['content@odata.mediaContentType'], 'text/plain')
  })

  test('activate the draft - the file is kept', async () => {
    const res = await POST(`${draft(incident)}/TestService.draftActivate`, {})
    assert.equal(res.status, 201, JSON.stringify(res.data))
    const c = await text(`${active(incident)}/attachments(ID=${att.ID},IsActiveEntity=true)/content`)
    assert.equal(c.body, 'Hello GridFS')
    assert.equal(await files(), 1)
  })

  test('edit, upload and save: file name and type are kept, renaming is ignored', async () => {
    await POST(`${active(incident)}/TestService.draftEdit`, { PreserveChanges: true })
    const a = await upload(draft(incident), 'added-in-edit.pdf', '%PDF', 'application/pdf')
    const renamed = await PATCH(`${draft(incident)}/attachments(ID=${a.ID},IsActiveEntity=false)`, { filename: 'evil.html', note: 'renamed?' })
    assert.equal(renamed.status, 200)
    assert.equal((await POST(`${draft(incident)}/TestService.draftActivate`, {})).status, 200)
    const { data } = await GET(`${active(incident)}/attachments(ID=${a.ID},IsActiveEntity=true)`)
    assert.equal(data.filename, 'added-in-edit.pdf')
    assert.equal(data.mimeType, 'application/pdf')
    assert.equal(data.note, 'renamed?')
    await POST(`${active(incident)}/TestService.draftEdit`, { PreserveChanges: true })
    await DEL(`${draft(incident)}/attachments(ID=${a.ID},IsActiveEntity=false)`)
    await POST(`${draft(incident)}/TestService.draftActivate`, {})
  })

  test('content cannot be overwritten (NonUpdatableProperties: [content])', async () => {
    await POST(`${active(incident)}/TestService.draftEdit`, { PreserveChanges: true })
    const res = await PUT(`${draft(incident)}/attachments(ID=${att.ID},IsActiveEntity=false)/content`, 'other', { headers: { 'content-type': 'text/plain' } })
    assert.equal(res.status, 409)
  })

  test('discarding a draft removes only the files uploaded in the draft', async () => {
    await upload(draft(incident), 'draft-only.txt', 'temp', 'text/plain')
    assert.equal(await files(), 2)
    const res = await DEL(draft(incident))
    assert.equal(res.status, 204)
    assert.equal(await files(), 1)
  })

  test('deleting an attachment in the draft removes its file on activation', async () => {
    await POST(`${active(incident)}/TestService.draftEdit`, { PreserveChanges: true })
    await DEL(`${draft(incident)}/attachments(ID=${att.ID},IsActiveEntity=false)`)
    assert.equal(await files(), 1, 'still referenced by the active entity')
    await POST(`${draft(incident)}/TestService.draftActivate`, {})
    assert.equal(await files(), 0)
  })

  test('attachments in nested compositions', async () => {
    const { data } = await POST(`${S}/Incidents`, { title: 'nested', items: [{ ID: cds.utils.uuid(), name: 'item' }] })
    const item = data.items?.[0]?.ID ?? (await GET(`${draft(data.ID)}/items`)).data.value[0].ID
    const a = await upload(`${draft(data.ID)}/items(ID=${item},IsActiveEntity=false)`, 'photo.png', Buffer.from([0x89, 0x50, 0x4e, 0x47]), 'image/png', 'files')
    assert.equal(a.put.status, 204, JSON.stringify(a.put.data))
    await POST(`${draft(data.ID)}/TestService.draftActivate`, {})
    assert.equal(await files(), 1)
    await DEL(active(data.ID))
    assert.equal(await files(), 0)
  })

  test('files larger than 16 MB (MongoDB document limit) are stored and streamed', async () => {
    const { data } = await POST(`${S}/Incidents`, { title: 'big' })
    const big = Buffer.alloc(20 * 1024 * 1024, 7)
    const a = await upload(draft(data.ID), 'video.mp4', big, 'video/mp4')
    assert.equal(a.put.status, 204, JSON.stringify(a.put.data))
    const res = await axios.get(`${a.url}/content`, { responseType: 'arraybuffer' })
    assert.equal(res.data.byteLength, big.length)
    assert.match(res.headers['content-disposition'], /^inline/)
    await DEL(draft(data.ID))
    assert.equal(await files(), 0)
  })
})

describe('single attachment (Composition of one) and several attachment compositions', () => {
  let incident, photo
  const put = (body, filename, type) => PUT(`${photo}/content`, body, { headers: { 'content-type': type, 'content-disposition': `attachment; filename="${filename}"` } })

  test('a new draft has an empty single attachment, ready for upload', async () => {
    incident = (await POST(`${S}/Incidents`, { title: 'single' })).data.ID
    photo = `${draft(incident)}/photo`
    const { status, data } = await GET(photo)
    assert.equal(status, 200)
    assert.equal(data.url, null)
  })

  test('upload into the single attachment - file name from Content-Disposition', async () => {
    const before = await files()
    assert.equal((await put('first', 'me.png', 'image/png')).status, 204)
    const { data } = await GET(photo)
    assert.equal(data.filename, 'me.png')
    assert.equal(data.mimeType, 'image/png')
    assert.equal(await files(), before + 1)
  })

  test('the content of a single attachment can be replaced - the old file is removed', async () => {
    const before = await files()
    assert.equal((await put('second', 'me2.jpg', 'image/jpeg')).status, 204)
    assert.equal((await text(`${photo}/content`)).body, 'second')
    assert.equal((await GET(photo)).data.filename, 'me2.jpg')
    assert.equal(await files(), before)
  })

  test('removing the file (DELETE .../content) keeps the attachment, removes the file', async () => {
    const before = await files()
    assert.equal((await DEL(`${photo}/content`)).status, 204)
    const { data } = await GET(photo)
    assert.equal(data.url, null)
    assert.equal(data.filename, null)
    assert.equal(await files(), before - 1)
  })

  test('several attachment compositions are independent', async () => {
    await put('photo', 'p.png', 'image/png')
    await upload(draft(incident), 'a.txt', 'A', 'text/plain')
    await upload(draft(incident), 'c.pdf', '%PDF', 'application/pdf', 'contracts')
    const { data } = await GET(`${draft(incident)}?$expand=attachments($select=filename),contracts($select=filename),photo($select=filename,content)`)
    assert.deepEqual(data.attachments.map(a => a.filename), ['a.txt'])
    assert.deepEqual(data.contracts.map(a => a.filename), ['c.pdf'])
    assert.equal(data.photo.filename, 'p.png')
    assert.equal(data.photo['content@odata.mediaContentType'], 'image/png')
  })

  test('activate - all files are kept; deleting the parent removes them', async () => {
    const before = await files()
    assert.equal((await POST(`${draft(incident)}/TestService.draftActivate`, {})).status, 201)
    assert.equal((await text(`${active(incident)}/photo/content`)).body, 'photo')
    assert.equal(await files(), before)
    await DEL(active(incident))
    assert.equal(await files(), before - 3)
  })

  test('edit of an entity without single attachment creates it', async () => {
    const { Incidents } = cds.entities('test')
    const ID = cds.utils.uuid()
    await INSERT.into(Incidents).entries({ ID, title: 'created by API' })
    assert.equal((await POST(`${active(ID)}/TestService.draftEdit`, { PreserveChanges: true })).status, 201)
    assert.equal((await GET(`${draft(ID)}/photo`)).status, 200)
    await DEL(draft(ID))
  })
})

describe('non-draft entity with restrictions', () => {
  let doc
  const parent = () => `${S}/Documents(${doc})`

  test('allowed media types (@Core.AcceptableMediaTypes)', async () => {
    doc = (await POST(`${S}/Documents`, { title: 'Contract' })).data.ID
    const res = await POST(`${parent()}/files`, { filename: 'virus.exe' })
    assert.equal(res.status, 415)
    assert.match(res.data.error.message, /not allowed/)
    const ok = await upload(parent(), 'scan.pdf', '%PDF-1.4 test', 'application/pdf', 'files')
    assert.equal(ok.put.status, 204, JSON.stringify(ok.put.data))
  })

  test('the media type comes from the file name, not from the Content-Type header', async () => {
    const res = await POST(`${parent()}/files`, { filename: 'page.html', mimeType: 'image/png' })
    assert.equal(res.status, 415)
  })

  test('clients cannot set url or size (no access to other files)', async () => {
    const { data } = await GET(`${parent()}/files`)
    const res = await POST(`${parent()}/files`, { filename: 'fake.png', url: data.value[0].url, size: 1 })
    assert.equal(res.status, 201)
    assert.equal(res.data.url, null)
    assert.equal(res.data.size, null)
    await DEL(`${parent()}/files(${res.data.ID})`)
  })

  test('maximum file size (@Validation.Maximum)', async () => {
    const a = await upload(parent(), 'large.png', Buffer.alloc(2048), 'image/png', 'files')
    assert.equal(a.put.status, 413)
    assert.match(a.put.data.error.message, /exceeds the maximum size of 1 KB/)
    await DEL(a.url)
  })

  test('maximum number of attachments (@Validation.MaxItems)', async () => {
    await upload(parent(), 'two.png', Buffer.from('x'), 'image/png', 'files')
    const res = await POST(`${parent()}/files`, { filename: 'three.png' })
    assert.equal(res.status, 400)
    assert.match(res.data.error.message, /Not more than 2/)
  })

  test('content can be replaced when NonUpdatableProperties is []', async () => {
    const { data } = await GET(`${parent()}/files?$filter=filename eq 'two.png'`)
    const url = `${parent()}/files(${data.value[0].ID})`
    const before = await files()
    const res = await PUT(`${url}/content`, Buffer.from('y2'), { headers: { 'content-type': 'image/png' } })
    assert.equal(res.status, 204)
    const c = await text(`${url}/content`)
    assert.equal(c.body, 'y2')
    assert.equal(await files(), before, 'the old file is removed')
  })

  test('pdf is shown inline, deleting the parent removes all files', async () => {
    const { data } = await GET(`${parent()}/files?$filter=filename eq 'scan.pdf'`)
    const res = await GET(`${parent()}/files(${data.value[0].ID})/content`)
    assert.match(res.headers['content-disposition'], /^inline/)
    assert.ok((await files()) > 0)
    await DEL(parent())
    assert.equal(await files(), 0)
  })
})

describe('CQL and Fiori annotations', () => {
  test('INSERT with content and SELECT content in custom code', async () => {
    const { Documents } = cds.entities('test')
    const ID = cds.utils.uuid()
    await INSERT.into(Documents).entries({ ID, title: 'cql', files: [{ filename: 'a.png', mimeType: 'image/png', content: Buffer.from('png!') }] })
    assert.equal(await files(), 1)
    const [file] = await SELECT.from(Documents.elements.files.target).where({ up__ID: ID })
    assert.equal(file.size, 4)
    const { content } = await SELECT.one.from(Documents.elements.files.target, file.ID).columns('content')
    assert.equal((await new Response(content).text()), 'png!')
    await DELETE.from(Documents, ID)
    assert.equal(await files(), 0)
  })

  test('the UI5 preview module and fragments are served for Fiori apps', async () => {
    for (const f of ['Preview.js', 'PreviewColumn.fragment.xml', 'PreviewField.fragment.xml']) {
      const res = await axios.get(`/anubhav/attachments/ui5/${f}`)
      assert.equal(res.status, 200, f)
    }
    // also below the path of an app, to be loaded relative to it
    assert.equal((await axios.get('/incidents/webapp/anubhav/attachments/ui5/Preview.js')).status, 200)
    assert.notEqual((await axios.get('/anubhav/attachments/ui5/..%2fpackage.json')).status, 200)
    assert.equal((await axios.get('/anubhav/attachments/ui5/missing.js')).status, 404)
  })

  test('$metadata: attachments facet, upload annotations, hidden parent key', async () => {
    const { data } = await GET(`${S}/$metadata`)
    assert.match(data, /<PropertyValue Property="Target" AnnotationPath="attachments\/@UI.LineItem"\/>/)
    assert.match(data, /<PropertyValue Property="Target" AnnotationPath="contracts\/@UI.LineItem"\/>/)
    assert.match(data, /<PropertyValue Property="Target" AnnotationPath="photo\/@UI.FieldGroup#SingleAttachment"\/>/)
    assert.match(data, /<PropertyValue Property="Label" String="Photo"\/>/)
    assert.match(data, /UI.MediaResource/)
    assert.match(data, /Core.ContentDisposition/)
    assert.match(data, /Target="TestService.Incidents_attachments\/up__ID">\s*<Annotation Term="UI.Hidden"/)
    assert.match(data, /Core.AcceptableMediaTypes/)
  })
})
