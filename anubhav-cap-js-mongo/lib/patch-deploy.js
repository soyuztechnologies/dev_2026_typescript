const cds = require('@sap/cds')

/**
 * Makes cds.deploy() - used by `cds deploy`, `cds.test()` and tests - create MongoDB collections
 * and indexes instead of running SQL DDL. Other databases are not affected.
 */
module.exports = function patchCdsDeploy() {
  const deploy = cds.deploy
  if (!deploy?.schema || deploy.schema._mongo) return
  const schema = deploy.schema
  deploy.schema = async function (db, csn, o = {}) {
    // cds deploy --dry passes a dummy db -> show the MongoDB plan if MongoDB is the configured database
    if (o.dry && !db?.isMongoService && !o.to && cds.env.requires.db?.kind === 'anubhav-mongo') {
      const { deploySchema } = require('./deploy')
      return deploySchema(null, cds.linked(cds.compile.for.nodejs(csn)), { dry: true })
    }
    if (!db?.isMongoService) return schema.apply(this, arguments)
    if (o.dry) return db.deploySchema(csn, { dry: true })
    await db.deploySchema(csn, { drop: true })
    return true
  }
  deploy.schema._mongo = true
}
