const cds = require('@sap/cds')
require('dotenv').config();

module.exports = class CatalogService extends cds.ApplicationService { async init() {

  const { TeamsSet } = cds.entities('CatalogService')
  const service = await cds.connect.to('ZSD_ATS_FIFA_0001', {
      credentials: {
        // url: process.env.aoc_url,
        // username: process.env.aoc_user,
        // password: process.env.aoc_password
        destination: 'AOC'
      }
    });

  this.before (['CREATE', 'UPDATE'], TeamsSet, async (req) => {
    console.log('Before CREATE/UPDATE TeamsSet', req.data)
  })

  this.on ('READ', TeamsSet, async (req) => {
    return service.tx(req).run(req.query);
  })

  // NOTE: ZSD_ATS_FIFA_0001's $metadata marks Teams as Insertable:false / Updatable:false;
  // TeamsSet overrides those capabilities locally (see CatalogService.cds) so requests reach
  // this handler, but the remote backend may still reject the forwarded write itself.
  this.on ('CREATE', TeamsSet, async (req) => {
    return service.tx(req).run(req.query);
  })

  this.on ('DELETE', TeamsSet, async (req) => {
    return service.tx(req).run(req.query);
  })

  this.on ('UPDATE', TeamsSet, async (req) => {
    return service.tx(req).run(req.query);
  })

  return super.init()
}}
