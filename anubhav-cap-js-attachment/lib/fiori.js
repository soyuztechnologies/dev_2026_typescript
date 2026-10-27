const cds = require('@sap/cds')
const { LOG, isAttachments, allowedMimeTypes } = require('./config')

/**
 * Adds the Fiori annotations for compositions of Attachments to the EDMX ($metadata):
 *  - a section (UI.ReferenceFacet) on the object page of the parent: a table for `Composition of many`,
 *    a form with upload / download / remove for `Composition of one` - unless the parent has no
 *    UI.Facets, already has a facet for the composition, or the composition is @UI.Hidden
 *  - the content of single attachments can be replaced
 *  - hides the parent key (up_) of the attachments
 *  - Core.AcceptableMediaTypes from the configured allowedMimeTypes, so the file dialog filters
 */
module.exports = function addFioriAnnotations(csn) {
  const meta = (csn.meta ??= {})
  if (meta._anubhav_attachments || !Object.keys(csn.definitions).some(n => n.startsWith('anubhav.attachments.'))) return
  const hasFacet = (name, facets) => facets.some(f => f.Target?.startsWith?.(`${name}/@`) || (f.Facets && hasFacet(name, f.Facets)))

  cds.linked(csn).forall('entity', entity => {
    for (const [name, comp] of Object.entries(entity.compositions ?? {})) {
      const target = comp._target
      if (!isAttachments(target)) continue
      const many = comp.is2many
      if (!many) target['@Capabilities.UpdateRestrictions.NonUpdatableProperties'] = []
      for (const e in target.elements) if (e === 'up_' || e.startsWith('up__')) target.elements[e]['@UI.Hidden'] = true
      const content = target.elements.content
      const allowed = allowedMimeTypes(target)
      if (content && !content['@Core.AcceptableMediaTypes'] && !allowed.includes('*/*')) content['@Core.AcceptableMediaTypes'] = allowed

      const facets = entity['@UI.Facets']
      if (!facets || comp['@UI.Hidden'] === true || hasFacet(name, facets)) continue
      LOG.debug?.(`adding attachments facet to ${entity.name}`)
      facets.push(
        many
          ? { $Type: 'UI.ReferenceFacet', ID: `${name}_attachments`, Label: comp['@title'] ?? '{i18n>Attachments}', Target: `${name}/@UI.LineItem` }
          : { $Type: 'UI.ReferenceFacet', ID: `${name}_attachment`, Label: comp['@title'] ?? '{i18n>Attachment}', Target: `${name}/@UI.FieldGroup#SingleAttachment` }
      )
    }
  })
  meta._anubhav_attachments = true
}
