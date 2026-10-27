/**
 * @anubhav-cap-js/attachments - in-app preview of attachments for Fiori Elements, by www.anubhavtrainings.com
 *
 * Used by PreviewColumn.fragment.xml (tables) and PreviewField.fragment.xml (single attachments):
 * opens the file of the attachment in a dialog instead of a new browser tab.
 *   images            <img>
 *   PDF               <iframe>  (PDF viewer of the browser)
 *   text, CSV         <pre>     (escaped text, never interpreted as HTML)
 *   audio, video      <audio> / <video> player
 *   others            no preview, download button
 */
sap.ui.define(['sap/m/Dialog', 'sap/m/Button', 'sap/m/MessageStrip', 'sap/ui/core/HTML', 'sap/ui/Device'], function (Dialog, Button, MessageStrip, HTML, Device) {
  'use strict'

  const IMAGE = /^image\/(png|jpe?g|gif|bmp|webp)$/
  const TEXT = /^text\/(plain|csv)$/
  const MAX_TEXT = 1024 * 1024
  const MEDIA = /^(audio|video)\//
  const esc = s => String(s).replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';')

  /** URL of the content of an attachment, e.g. /odata/v4/srv/Incidents(...)/attachments(...)/content */
  function contentUrl(ctx) {
    return ctx.getModel().getServiceUrl() + ctx.getPath().slice(1) + '/content'
  }

  function viewer(url, type, name) {
    const src = esc(url)
    if (IMAGE.test(type)) return new HTML({ content: `<div style="text-align:center"><img src="${src}" alt="${esc(name)}" style="max-width:100%;max-height:70vh"></div>` })
    if (MEDIA.test(type)) {
      const tag = type.startsWith('audio/') ? 'audio' : 'video'
      return new HTML({ content: `<div style="text-align:center"><${tag} controls src="${src}" style="max-width:100%;max-height:70vh"></${tag}></div>` })
    }
    if (type === 'application/pdf') return new HTML({ content: `<iframe src="${src}" title="${esc(name)}" style="width:100%;height:70vh;border:0;display:block"></iframe>` })
    if (TEXT.test(type)) {
      // text is loaded and shown escaped - in the colors of the Fiori theme, never interpreted as HTML
      const html = new HTML({ content: '<div style="padding:1rem">Loading...</div>' })
      fetch(url, { credentials: 'same-origin' })
        .then(r => (r.ok ? r.text() : Promise.reject(new Error(r.status + ' ' + r.statusText))))
        .then(t => {
          const more = t.length > MAX_TEXT ? `\n\n... (${Math.round(t.length / 1024)} KB - download the file to see all)` : ''
          html.setContent(`<pre style="margin:0;padding:1rem;max-height:70vh;overflow:auto;white-space:pre-wrap;font-family:monospace">${esc(t.slice(0, MAX_TEXT) + more)}</pre>`)
        })
        .catch(e => html.setContent(`<div style="padding:1rem">Preview failed: ${esc(e.message)}</div>`))
      return html
    }
    return new MessageStrip({ text: `No preview available for "${type || 'unknown'}" files - use Download.`, type: 'Information', showIcon: true }).addStyleClass('sapUiSmallMargin')
  }

  function download(url, name) {
    const a = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  return {
    /** press handler: <Button press="Preview.open"/> in the row / form of an attachment */
    open(event) {
      const ctx = event.getSource().getBindingContext()
      if (!ctx) return
      const type = String(ctx.getProperty('mimeType') || '').split(';')[0].trim().toLowerCase()
      const name = ctx.getProperty('filename') || 'Attachment'
      const url = contentUrl(ctx)
      const dialog = new Dialog({
        title: name,
        contentWidth: '80%',
        resizable: true,
        draggable: true,
        stretch: Device.system.phone,
        content: [viewer(url, type, name)],
        buttons: [
          new Button({ text: 'Download', icon: 'sap-icon://download', press: () => download(url, name) }),
          new Button({ text: 'Close', type: 'Emphasized', press: () => dialog.close() })
        ],
        afterClose: () => dialog.destroy()
      })
      dialog.open()
    },

    /** formatter for visible: only attachments with a file can be previewed */
    hasFile(size) {
      return size !== null && size !== undefined && size !== ''
    }
  }
})
