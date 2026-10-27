const cds = require('@sap/cds')

/**
 * @anubhav-cap-js/attachments - CDS plugin bootstrap, by www.anubhavtrainings.com
 *
 *   using { Attachments } from '@anubhav-cap-js/attachments';
 *   entity Incidents : cuid { ... attachments : Composition of many Attachments; }
 *
 * Files are stored in MongoDB GridFS of the database of @anubhav-cap-js/mongo, configured in
 * cds.requires["anubhav-attachments"]: { maxFileSize, allowedMimeTypes, maxCount, inline, bucketName }
 */

const { LOG } = require('./lib/config')
const registerDbHandlers = require('./lib/db-handlers')
const registerServiceHandlers = require('./lib/srv-handlers')
const addFioriAnnotations = require('./lib/fiori')

const usesAttachments = () => !!cds.model?.definitions['anubhav.attachments.Attachments']

cds.on('compile.to.edmx', addFioriAnnotations)

// UI5 module for the in-app preview in Fiori Elements: Preview.js and the fragments PreviewColumn /
// PreviewField (see README, "In-app preview"). Served at /anubhav/attachments/ui5/ - also below any
// prefix, e.g. /incidents/webapp/anubhav/attachments/ui5/, so apps can load it relative to themselves
// (locally from CAP, on SAP BTP through a route of the approuter).
const UI5_PATH = /^(?:\/[^?#]*)?\/anubhav\/attachments\/ui5(?=\/)/
cds.on('bootstrap', app => app.use(UI5_PATH, require('express').static(require('path').join(__dirname, 'ui5'), { fallthrough: false })))

cds.on('serving', srv => {
  if (srv instanceof cds.ApplicationService && usesAttachments()) registerServiceHandlers(srv)
})

cds.once('served', () => {
  if (!usesAttachments()) return
  const db = cds.db
  if (!db?.isMongoService) {
    throw cds.error({
      status: 500,
      code: 'ATTACHMENTS_MONGO_REQUIRED',
      message:
        '@anubhav-cap-js/attachments stores files in MongoDB and needs @anubhav-cap-js/mongo as primary database - ' +
        `run "npm add @anubhav-cap-js/mongo" and configure cds.requires["anubhav-mongo"] (current database: ${db?.options?.kind ?? 'none'})`
    })
  }
  registerDbHandlers(db)
  LOG.info(`files are stored in MongoDB GridFS (bucket "${require('./lib/config').options().bucketName}")`)
})
