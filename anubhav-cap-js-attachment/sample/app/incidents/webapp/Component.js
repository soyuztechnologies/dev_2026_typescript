// in-app preview of attachments: UI5 module served by @anubhav-cap-js/attachments (see manifest.json),
// loaded relative to this app - locally from CAP, on SAP BTP through a route in xs-app.json
sap.ui.loader.config({ paths: { 'anubhav/attachments': sap.ui.require.toUrl('anubhav/helpdesk/incidents') + '/anubhav/attachments/ui5' } })

sap.ui.define(['sap/fe/core/AppComponent'], function (AppComponent) {
  'use strict'
  return AppComponent.extend('anubhav.helpdesk.incidents.Component', {
    metadata: { manifest: 'json' }
  })
})
