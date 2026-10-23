#!/usr/bin/env node
/* eslint-disable no-console */

const USAGE = `
@anubhav-cap-js/mongo - MongoDB for SAP CAP  (www.anubhavtrainings.com)

Usage: npx anubhav-mongo <command> [options]

Commands:
  ping              Test the connection (credentials or BTP destination) and show server details
  deploy            Create collections + indexes and load initial data (db/data/*.csv) into empty collections

Options:
  --drop            deploy: drop and re-create all collections first, then load initial data (like cds deploy)
  --no-data         deploy: only create collections and indexes
  --dry             deploy: print the collections and indexes which would be created
  --profile <name>  cds profile(s) to use, e.g. hybrid or production
  -h, --help        show this help
`

async function main(argv) {
  const args = argv.slice(2)
  const cmd = args.find(a => !a.startsWith('-'))
  const flag = f => args.includes(f)
  if (!cmd || flag('-h') || flag('--help')) return console.log(USAGE)
  const p = args.indexOf('--profile')
  if (p >= 0 && args[p + 1]) process.env.CDS_ENV = args[p + 1]

  // use the application's @sap/cds, so that the plugin and the app share the same instance
  let cds
  try {
    cds = require(require.resolve('@sap/cds', { paths: [process.cwd()] }))
  } catch {
    throw new Error('@sap/cds not found - run this command in the root folder of your CAP project')
  }
  cds.root = process.cwd()
  await cds.plugins

  const name = cds.env.requires.db?.kind === 'anubhav-mongo' ? 'db' : cds.env.requires['anubhav-mongo'] ? 'anubhav-mongo' : null
  if (!name) throw new Error('No MongoDB configured: add cds.requires["anubhav-mongo"] to your package.json (see README of @anubhav-cap-js/mongo)')
  const options = { ...cds.env.requires[name], autoDeploy: false }

  if (cmd === 'ping') {
    const db = await cds.connect.to(name, options)
    const info = await db.native(async ({ db: mdb, client }) => {
      const admin = client.db('admin')
      const [build, hello, collections] = await Promise.all([
        admin.command({ buildInfo: 1 }).catch(() => ({})),
        admin.command({ hello: 1 }),
        mdb.listCollections({}, { nameOnly: true }).toArray()
      ])
      return { version: build.version, hello, collections: collections.length, database: mdb.databaseName }
    })
    const topology = info.hello.setName ? `replica set "${info.hello.setName}"` : info.hello.msg === 'isdbgrid' ? 'sharded cluster' : 'standalone'
    console.log(`\n  ✔ Connected to MongoDB ${info.version || ''} (${topology})`)
    console.log(`    connection:   ${db.url4()}`)
    console.log(`    database:     ${info.database} (${info.collections} collections)`)
    console.log(`    transactions: ${db._useTransactions ? 'yes' : 'no'}\n`)
    await db.disconnect()
    return
  }

  if (cmd === 'deploy') {
    const csn = await cds.load('*').then(cds.minify)
    cds.model = cds.compile.for.nodejs(csn)
    const db = await cds.connect.to(name, options)
    if (flag('--dry')) {
      await db.deploySchema(cds.model, { dry: true })
      return db.disconnect()
    }
    if (flag('--drop')) {
      if (flag('--no-data')) await db.deploySchema(cds.model, { drop: true })
      else await cds.deploy(csn).to(db)
    } else {
      db.options.autoDeploy = flag('--no-data') ? 'schema' : true
      await db.autoDeploy()
    }
    console.log(`\n  ✔ Deployed to ${db.url4()}\n`)
    await db.disconnect()
    return
  }

  throw new Error(`Unknown command "${cmd}"\n${USAGE}`)
}

main(process.argv).then(
  () => process.exit(0),
  e => {
    console.error(`\n  ✖ ${e.message}${e.code ? `  [${e.code}]` : ''}\n`)
    process.exit(1)
  }
)
