const cds = require('@sap/cds')
require('dotenv').config();

module.exports = class CatalogService extends cds.ApplicationService { async init() {

  const { TeamsSet } = cds.entities('CatalogService')

  const service = await cds.connect.to('ZSD_ATS_FIFA_0001',{
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

    return  service.tx(req).run(req.query);

  })


  return super.init()
}}
