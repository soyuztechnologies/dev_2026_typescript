# CDS database service for MongoDB

<p align="center">
  <b>by <a href="https://www.anubhavtrainings.com">Anubhav Trainings</a></b> ·
  <a href="https://www.anubhavtrainings.com/scp-cloud-platform-training">SAP CAPM &amp; BTP course</a> ·
  <a href="https://www.anubhavtrainings.com">www.anubhavtrainings.com</a>
</p>

Welcome to the MongoDB database service for the [SAP Cloud Application Programming Model](https://cap.cloud.sap) (CAP)
Node.js, based on CAP's streamlined database architecture
([@cap-js/db-service](https://www.npmjs.com/package/@cap-js/db-service)) – the same foundation as
[@cap-js/sqlite](https://www.npmjs.com/package/@cap-js/sqlite) and [@cap-js/hana](https://www.npmjs.com/package/@cap-js/hana) –
and the official [MongoDB Node.js driver](https://www.npmjs.com/package/mongodb).

It lets you use **MongoDB** and **MongoDB Atlas** as the database of your CAP application. CDS models, services,
OData V4 endpoints, Fiori Elements apps (including drafts) and custom handlers written with CQL
(`SELECT`, `INSERT`, `UPDATE`, `DELETE`, `UPSERT`) work without MongoDB-specific code. Connect with credentials
during local development and with an **SAP BTP destination** in the cloud.

```
 Fiori / OData / REST ──► CAP services ──► cds.db (@anubhav-cap-js/mongo) ──► MongoDB / Atlas
                                                     ▲
                         credentials (local development) or SAP BTP destination (cloud)
```

> **New to SAP CAP?** Learn CAP, SAP BTP, Fiori and ABAP RAP hands-on in the
> [SAP CAPM & BTP course by Anubhav Trainings](https://www.anubhavtrainings.com/scp-cloud-platform-training).

## Table of Contents

- [Setup](#setup)
- [Requirements](#requirements)
- [Step-by-step guide](#step-by-step-guide)
- [Configuration](#configuration)
- [How the connection is resolved](#how-the-connection-is-resolved)
- [Features](#features)
- [Analytics: orderBy, groupBy, top and skip](#analytics-orderby-groupby-top-and-skip)
- [How data is stored](#how-data-is-stored)
- [Deployment, initial data and CLI](#deployment-initial-data-and-cli)
- [Using MongoDB in custom code](#using-mongodb-in-custom-code)
- [Error handling](#error-handling)
- [Security](#security)
- [Limitations](#limitations)
- [Troubleshooting](#troubleshooting)
- [Sample application](#sample-application)
- [Support](#support)
- [Contribution](#contribution)
- [Versioning](#versioning)
- [Licensing](#licensing)

## Setup

Install the database package into your CAP project:

```sh
npm add @anubhav-cap-js/mongo
```

and configure the connection in your `package.json` (or `.cdsrc.json`):

```json
{
  "cds": {
    "requires": {
      "anubhav-mongo": {
        "url": "mongodb+srv://cluster0.xxxxx.mongodb.net",
        "credentials": { "user": "capuser", "password": "<password>" },
        "destination": "MONGO_ATLAS",
        "dbName": "bookshop",
        "autoDeploy": true
      }
    }
  }
}
```

That's it – the package is a [CDS plugin](https://cap.cloud.sap/docs/node.js/cds-plugins): as soon as
`cds.requires["anubhav-mongo"]` is configured, MongoDB becomes the primary database (`cds.db`), even if
`@cap-js/sqlite` is still installed. Start with `cds watch` – collections, indexes and the initial data from
`db/data/*.csv` are created automatically.

Learn more about CAP databases in general in the [CAP database guide](https://cap.cloud.sap/docs/guides/databases/).

## Requirements

| Component | Version |
| --- | --- |
| Node.js | 20 or higher |
| `@sap/cds` | 10.x |
| MongoDB | 5.0 or higher, or MongoDB Atlas (any tier incl. the free M0) |

Tested with `@sap/cds` 10.2, MongoDB 7.0 and MongoDB Atlas (MongoDB 8.0).

## Step-by-step guide

### Step 1 – Create a MongoDB Atlas cluster

1. Sign up at [cloud.mongodb.com](https://cloud.mongodb.com) and create a cluster – the free **M0** tier is fine
   (see the [Atlas getting started guide](https://www.mongodb.com/docs/atlas/getting-started/)).
2. **Database Access** → *Add New Database User*, e.g. `capuser`, role *Read and write to any database*.
3. **Network Access** → *Add IP Address*:
   - for local development: *Add Current IP Address*,
   - for SAP BTP: the egress IP addresses of your BTP region (see
     [Regions and API Endpoints](https://help.sap.com/docs/btp/sap-business-technology-platform/regions-and-api-endpoints-available-for-cloud-foundry-environment)),
     or `0.0.0.0/0` for a quick test.
4. **Connect** → *Drivers*: copy the host of the connection string, e.g. `mongodb+srv://cluster0.xxxxx.mongodb.net`.

You don't need to create databases or collections in Atlas – the plugin does that.

### Step 2 – Add the plugin to your CAP project

```sh
cds init bookshop --add sample     # or use an existing CAP project
cd bookshop
npm add @anubhav-cap-js/mongo
```

### Step 3 – Configure the connection for local development

Add `url` and `credentials` as shown in [Setup](#setup). Special characters in the password need no URL encoding.

Keep the password out of git – put it into **`.cdsrc-private.json`**, which `cds init` adds to `.gitignore` and
which CAP merges automatically:

```json
{
  "requires": {
    "anubhav-mongo": {
      "url": "mongodb+srv://cluster0.xxxxx.mongodb.net",
      "credentials": { "user": "capuser", "password": "<password>" }
    }
  }
}
```

Alternatively set the environment variable `MONGODB_URI`. Local and cloud settings can also be separated with
CAP profiles:

```json
"anubhav-mongo": {
  "dbName": "bookshop",
  "[development]": { "url": "mongodb+srv://cluster0.xxxxx.mongodb.net", "credentials": { "user": "capuser", "password": "<password>" } },
  "[production]":  { "destination": "MONGO_ATLAS" }
}
```

### Step 4 – Run the app locally

```sh
npx anubhav-mongo ping    # optional: checks connection, credentials, MongoDB version and transaction support
cds watch
```

The log shows:

```
[mongo] - connected to mongodb+srv://cluster0.xxxxx.mongodb.net/ (database: bookshop) via credentials
[mongo] - 15 collections ready in 412 ms, initial data loaded into: sap.capire.bookshop.Books, ...
[cds] - connect to db > anubhav-mongo { database: 'bookshop' }
```

Initial data is loaded only into **empty** collections – existing data is never changed. In Atlas → *Browse
Collections* you'll find one collection per entity, e.g. `sap_capire_bookshop_Books`.

This deployment on boot is controlled by the `autoDeploy` option (default `true`). To switch it off, e.g. in
production where you deploy explicitly with `npx anubhav-mongo deploy`:

```json
"anubhav-mongo": {
  "autoDeploy": true,
  "[production]": { "autoDeploy": false }
}
```

Changed your csv files? As existing data is never overwritten, they are not loaded again on the next start. Either
run `npx anubhav-mongo deploy --drop` once, or switch on `replaceMode` – then every start drops and re-creates all
collections of the model and loads the current csv data (⚠ deletes all data in these collections, development only):

```json
"anubhav-mongo": {
  "autoDeploy": true,
  "[development]": { "replaceMode": true }
}
```

### Step 5 – Create a BTP destination for MongoDB

SAP BTP cockpit → subaccount → *Connectivity* → **Destinations** → *New Destination*:

| Field | Value |
| --- | --- |
| Name | `MONGO_ATLAS` (as configured in `destination`) |
| Type | `HTTP` |
| URL | `https://cluster0.xxxxx.mongodb.net` – the Atlas host, converted to `mongodb+srv://` automatically |
| Proxy Type | `Internet` |
| Authentication | `BasicAuthentication` |
| User / Password | the Atlas database user |

Optional additional properties:

| Property | Example | Meaning |
| --- | --- | --- |
| `mongo.database` | `bookshop` | database name (overrides the application configuration) |
| `mongo.options` | `retryWrites=true&w=majority` | connection string options |
| `mongo.url` | `mongodb://host1:27017,host2:27017/?replicaSet=rs0` | complete connection string, overrides `URL` |
| `mongo.srv` | `false` | use `mongodb://` instead of `mongodb+srv://` for the `URL` host |
| `mongo.authSource` | `admin` | authentication database |

### Step 6 – Deploy to SAP BTP Cloud Foundry

The application needs a destination service instance – for example in `mta.yaml`:

```yaml
modules:
  - name: bookshop-srv
    type: nodejs
    path: gen/srv
    requires:
      - name: bookshop-destination

resources:
  - name: bookshop-destination
    type: org.cloudfoundry.managed-service
    parameters:
      service: destination
      service-plan: lite
```

`cds build` doesn't copy `db/data/*.csv` to `gen/srv`. To load the initial data on the first start in the cloud,
add this command after `cds build --production` in the `before-all` build parameters of `mta.yaml`:

```yaml
        - node -e "require('fs').cpSync('db/data','gen/srv/db/data',{recursive:true})"
```

Then build and deploy with `mbt build` and `cf deploy`. In the cloud the log shows
`connected to ... via destination "MONGO_ATLAS"`.

**Hybrid testing** (local app, BTP destination): `cds bind destinations --to bookshop-destination` and
`cds watch --profile hybrid` – or simulate the destination with an environment variable:

```sh
export destinations='[{"name":"MONGO_ATLAS","url":"https://cluster0.xxxxx.mongodb.net","username":"capuser","password":"<password>"}]'
```

**Without destinations**, a user-provided service with tag `mongodb` is picked up automatically:

```sh
cf cups bookshop-mongo -p '{"url":"mongodb+srv://cluster0.xxxxx.mongodb.net","user":"capuser","password":"<password>","database":"bookshop"}' -t mongodb
```

## Configuration

All options are set in `cds.requires["anubhav-mongo"]`:

| Option | Default | Description |
| --- | --- | --- |
| `url` | – | Connection string, `mongodb://` or `mongodb+srv://` |
| `credentials` | – | `{ user, password, database, authSource, url }`, a `"user:password"` string, or a connection string |
| `destination` | – | Name of an SAP BTP destination |
| `dbName` | project name | Name of the MongoDB database, created automatically. Without `dbName`, the database in the URL path is used, otherwise the `name` from the application's `package.json` (e.g. `@my-org/bookshop` → `my-org_bookshop`). Max. 63 characters, no `/ \ . " $ * < > : \| ?` or spaces. A destination property `mongo.database` overrides it. |
| `database` | – | Alias of `dbName` (older configurations) |
| `primary` | `true` | `false` keeps another primary database; then use `cds.connect.to('anubhav-mongo')` |
| `autoDeploy` | `true` | Deploy the model on boot of the application: create missing collections and indexes and load initial data into empty collections (existing data is never changed). `false` = off, `"schema"` = collections and indexes only. String values like `"false"` from environment variables are understood. |
| `replaceMode` | `false` | `true` = the deployment on boot first **drops and re-creates all collections of the model**, so changed csv files are loaded again. All data in these collections (incl. drafts) is deleted on every start – use it in development only, e.g. `"[development]": { "replaceMode": true }`. Collections that don't belong to the model are not touched. Needs `autoDeploy` (with `"schema"` the collections are re-created empty). |
| `transactions` | `"auto"` | Transactions on replica sets / Atlas; `true` or `false` to force |
| `transactionOptions` | – | MongoDB transaction options, e.g. `{ "writeConcern": { "w": "majority" } }` |
| `client` | – | `MongoClient` options, e.g. `{ "maxPoolSize": 20, "serverSelectionTimeoutMS": 5000 }` |
| `pool` | `{ "max": 100 }` | CAP connection pool options |
| `maxTimeMS` | – | Server-side time limit for each query in milliseconds, e.g. `30000` – protects against expensive client queries (error `MONGO_TIMEOUT`, HTTP 504) |
| `destinationCache` | `true` | Cache destinations (SAP Cloud SDK) |
| `dnsServers` | `["8.8.8.8", "1.1.1.1"]` | DNS servers for resolving `mongodb+srv://` hosts when the DNS server of Node.js can't be reached (see [Troubleshooting](#troubleshooting)) |

Entity annotations:

| Annotation | Effect |
| --- | --- |
| `@mongo.collection: 'books'` | custom collection name |
| `@assert.unique` | unique index (rows with `null` values are excluded, as in SQL) |
| `@cds.persistence.skip` | entity is not stored |

## How the connection is resolved

1. **`destination`** – if configured *and* a destination service is available (bound in `VCAP_SERVICES`,
   bound with `cds bind`, or the `destinations` environment variable). If the destination can't be read and
   `url`/`credentials` are configured, these are used as fallback with a warning.
2. **`url` + `credentials`** – also from a bound user-provided service with tag `mongodb`.
3. Environment variable **`MONGODB_URI`**.

Destinations are read with the [SAP Cloud SDK](https://www.npmjs.com/package/@sap-cloud-sdk/connectivity) if it is
installed in your application (recommended for X.509-based destination service bindings), otherwise with the
Destination service REST API.

## Features

- **Drop-in database service** – becomes `cds.db`; generic CAP handlers, OData V4, `cds.ql`, `cds.test` and `cds deploy` work.
- **CRUD** incl. deep insert/update/delete of compositions, `UPSERT`, `INSERT ... from SELECT`, inserts via navigation paths.
- **Fiori Elements drafts** – create, edit, activate, discard, list report filters.
- **Projections** – renamed and excluded elements, projection `where` clauses, path columns like `author.name as author`, calculated elements.
- **OData** – `$filter` (functions, `any`/`all`, path expressions), `$orderby` (also on paths), `$top`, `$skip`, `$count`, `$search`, nested `$expand` with options, `$apply`.
- **Localized data** – `localized` elements from `.texts` entities according to the user's locale.
- **Managed data** – `@cds.on.insert`, `@cds.on.update`, defaults, generated UUID keys.
- **Exact decimals** – `cds.Decimal` as BSON Decimal128, dates and timestamps as BSON dates.
- **Transactions** – on replica sets and Atlas, with rollback on errors.
- **Schema deployment** – collections, unique primary key, `@assert.unique` and foreign key indexes, CSV initial data.
- **Clear errors** – CAP errors with HTTP status, error code and hints; passwords are never logged.

## Analytics: orderBy, groupBy, top and skip

Analytical CQL is translated into MongoDB aggregation pipelines
(`$match` → `$lookup` → `$group` → `$match` → `$sort` → `$skip` → `$limit`):

```js
const { Books } = cds.entities('sap.capire.bookshop')

// top authors by stock, grouped by a to-one path, with having and paging
await SELECT.from(Books)
  .columns('author.name as author', 'count(*) as books', 'sum(stock) as stock')
  .groupBy('author.name')
  .having('count(*) >=', 2)
  .orderBy('stock desc', 'author.name')
  .limit(10, 0) // top 10, skip 0

await SELECT.one.from(Books).columns('count(*) as n', 'avg(price) as avgPrice', 'max(price) as maxPrice')
await SELECT.distinct.from(Books).columns('currency_code').orderBy('currency_code')
```

Supported: `count(*)`, `count(x)`, `countdistinct`, `sum`, `avg`, `min`, `max`, aggregates of expressions,
`groupBy` on elements, foreign keys and to-one paths, `having`, `orderBy` on columns, aliases, aggregates,
expressions and paths, `limit(top, skip)`, `distinct`, `$count`, and OData `$apply` with `groupby`, `aggregate`,
`filter`, `orderby`, `top`, `skip` (also grouping by navigation properties).

The test suite of this package runs 41 analytical queries (30 CQL, 11 OData) on MongoDB and checks that they
return the same results as `@cap-js/sqlite`.

## How data is stored

- One collection per entity, named like SQL tables: `my.bookshop.Books` → `my_bookshop_Books`, draft tables
  `..._drafts`, texts `..._texts`, plus `DRAFT_DraftAdministrativeData`.
- Service projections are not stored, they are resolved to the underlying entity at runtime.
- Managed associations are stored as foreign keys (`author_ID`), compositions in their own collections,
  structured elements flattened (`address_city`) – the same data shape as with SQLite and HANA, so CSV files,
  custom code and OData payloads stay unchanged.
- MongoDB's `_id` is generated; the CAP keys get the unique index `cap_pk`.

| CDS type | BSON type |
| --- | --- |
| UUID, String, LargeString | string |
| Integer, Int16, Int32, UInt8, Double | number |
| Int64 | number (Long above 2^53) |
| Decimal | Decimal128 |
| Boolean | boolean |
| Date / Time | string `YYYY-MM-DD` / `HH:MM:SS` |
| DateTime / Timestamp | date |
| Binary / LargeBinary | binary |
| Vector, Map, arrayed | array / sub-document |

## Deployment, initial data and CLI

| Command | What it does |
| --- | --- |
| `cds watch` / `cds serve` | creates missing collections and indexes, loads CSV data into **empty** collections – never deletes data |
| `cds deploy` | **drops and re-creates** all collections, then loads the CSV data (like `cds deploy` for SQLite) |
| `cds deploy --dry` | prints the collections and indexes |
| `npx anubhav-mongo ping` | tests the connection (credentials or destination), shows version, topology and transaction support |
| `npx anubhav-mongo deploy` | like startup deployment; `--drop` (like `cds deploy`), `--no-data`, `--dry`, `--profile <name>` |

Initial data comes from `db/data` and `db/csv` (plus `test/data` in development) in the usual CAP CSV format.

## Using MongoDB in custom code

Use [CQL](https://cap.cloud.sap/docs/node.js/cds-ql) as with every CAP database:

```js
const { Books } = cds.entities('sap.capire.bookshop')
await SELECT.from(Books).where({ stock: { '>': 10 } }).orderBy('title')
await UPDATE(Books, 201).with({ stock: { '-=': 1 } })
```

For MongoDB-specific features, use the native driver within the current CAP transaction:

```js
const db = await cds.connect.to('db')
const ranking = await db.native(({ collection, session }) =>
  collection(Books).aggregate([{ $sortByCount: '$author_ID' }], { session }).toArray()
)
db.collectionName(Books) // 'sap_capire_bookshop_Books'
```

Show the generated MongoDB queries with `DEBUG=mongo cds watch`.

## Error handling

Errors have an HTTP `status`, a `code` and a message with a hint. The original driver error is available as
`cause`; CAP does not send 5xx details to clients in production.

| Code | HTTP | When |
| --- | --- | --- |
| `MONGO_CONFIG_INVALID` | 500 | missing or invalid configuration, placeholders like `<password>` in the URL |
| `MONGO_CONNECTION_FAILED` | 503 | host not reachable, DNS error, IP not in the Atlas access list |
| `MONGO_AUTHENTICATION_FAILED` | 503 | wrong user or password |
| `MONGO_DESTINATION_FAILED` | 503 | destination not found, destination service not bound or not reachable |
| `ENTITY_ALREADY_EXISTS` | 400 | duplicate primary key |
| `UNIQUE_CONSTRAINT_VIOLATION` | 400 | `@assert.unique` violated |
| `MONGO_INVALID_VALUE` | 400 | value does not match the element type, unknown element in a query |
| `ASSERT_NOT_NULL` | 400 | `not null` element without value |
| `MONGO_WRITE_CONFLICT` | 409 | concurrent change within transactions – retry |
| `MONGO_NOT_AUTHORIZED` | 403 | the database user lacks privileges |
| `MONGO_TRANSACTIONS_UNSUPPORTED` | 500 | `transactions: true` on a standalone server |
| `MONGO_TIMEOUT` | 504 | the query exceeded `maxTimeMS` |
| `MONGO_NOT_SUPPORTED` | 501 | a query feature that can't be executed on MongoDB – the message names it |

## Security

- **No NoSQL injection** – values are always compared literally (`$eq`, `$in`, `$literal`), never interpreted as
  operators; objects are rejected for string elements; element names are checked against the CDS model; `LIKE`,
  `contains`, `startswith`, `endswith` and `$search` terms are escaped. Server-side JavaScript (`$where`,
  `$function`) is never used.
- **Instance-based authorization** – `@restrict` conditions like `where: 'country = $user.country'` follow SQL
  semantics: a user without the attribute gets no rows.
- **Client regular expressions** (OData `matchesPattern`) are limited to 512 characters and validated; use
  `maxTimeMS` to limit the run time of all queries.
- **Credentials** are taken from configuration, destinations or bindings and are never logged or returned in
  errors; connection string options are removed from logs. Keep passwords in `.cdsrc-private.json` or
  destinations, never in `package.json`. `mongodb+srv://` always uses TLS; a warning is logged when credentials
  would be sent to a remote host without TLS.
- **Errors** sent to clients contain only CAP's standard properties; 5xx details are hidden by CAP in production.
- **Plain SQL strings** passed to `db.run()` are rejected – nothing is executed or dropped through them.
- `DEBUG=mongo` logs queries **including data values** – use it for development only.

## Limitations

- Views with **joins or unions** and parameterized views are not supported (projections are).
- **Native SQL** (`cds.run('SELECT ...')`) is not available – use CQL or `db.native()`.
- Path expressions in columns, `orderBy` and `groupBy` must be **to-one** (use `$expand` for to-many).
- `exists` predicates, OData lambdas (`any`/`all`) and path expressions in filters run one additional query per
  association step.
- Counting a to-many association in a filter (`$filter=books/$count gt 1`) is not supported – use `any`/`all`.
- `SELECT ... forUpdate` does not lock; transactions detect conflicts instead (`MONGO_WRITE_CONFLICT`).
- **Standalone** MongoDB servers have no transactions, so errors can't roll back earlier writes (Atlas and
  replica sets are fine).
- Filters on `localized` elements use the default language values.
- Multitenancy is not supported yet.

## Troubleshooting

| Symptom | Solution |
| --- | --- |
| `MONGO_CONNECTION_FAILED ... querySrv ENOTFOUND` | wrong cluster host in `url` or destination `URL` |
| `[mongo] - DNS SRV lookup ... failed with the DNS server of Node.js (127.0.0.1): ECONNREFUSED` (warning) | Node.js on Windows sometimes uses an unreachable DNS server for `mongodb+srv://` lookups. The plugin then resolves the cluster via public DNS (`dnsServers`) and connects anyway. To avoid the warning, set `dnsServers` to a DNS server of your network, or use the standard connection string from Atlas (*Connect → Drivers*, older driver version) with `mongodb://` and all hosts |
| `MONGO_CONNECTION_FAILED ... querySrv ECONNREFUSED` | the SRV lookup failed with the public DNS servers as well (outbound DNS blocked, e.g. in corporate networks) – set `dnsServers` to a DNS server of your network or use the standard `mongodb://` connection string |
| Every request fails with `No database connection` and the log shows no `[mongo] - connected` line | the plugin is not installed in the app – run `npm add @anubhav-cap-js/mongo` |
| `MONGO_CONNECTION_FAILED` only on BTP | add the BTP egress IPs to Atlas *Network Access* |
| `MONGO_AUTHENTICATION_FAILED` | check user and password in Atlas *Database Access*; `authSource` for self-hosted servers |
| `MONGO_DESTINATION_FAILED ... no destination service instance is bound` | bind a destination service (`mta.yaml`, `cf bind-service`) |
| the app still uses SQLite | `cds.requires["anubhav-mongo"]` missing or `primary: false`; look for the `[mongo] - connected to` log line |
| `cds env requires.db` shows sqlite | expected – the plugin switches `cds.db` when plugins are loaded (`cds watch`, `cds serve`, `cds deploy`) |
| CSV data not loaded | startup deployment only fills **empty** collections – use `cds deploy` to reload everything |

## Sample application

A complete sample app is available on
[GitHub](https://github.com/soyuztechnologies/dev_2026_typescript/tree/master/anubhav-cap-js-mongo/samples/bookshop)
(it is not part of the npm package). It contains a catalog service, a Fiori Elements admin app with drafts, an
analytics service with `$apply` and CQL `groupBy`/`having`/`limit`, a freestyle SAPUI5 analytics app with `sap.viz`
charts, and `mta.yaml` / `xs-security.json` for SAP BTP:

```sh
git clone --depth 1 https://github.com/soyuztechnologies/dev_2026_typescript.git
cp -r dev_2026_typescript/anubhav-cap-js-mongo/samples/bookshop my-bookshop
cd my-bookshop
npm install
```

The sample's `.gitignore` already keeps `.cdsrc-private.json` out of git. Then copy `.cdsrc-private.example.json` to `.cdsrc-private.json`, add your Atlas host, user and password, and
run `npm run watch`. The sample's `README.md` has all details.

## Support

This package is created and maintained by [Anubhav Trainings](https://www.anubhavtrainings.com). For questions,
feature requests and bug reports, contact us via [www.anubhavtrainings.com](https://www.anubhavtrainings.com).

Want to learn SAP CAP in depth – CDS modeling, services, Fiori Elements, SAP BTP deployment and more? Join the
[SAP CAPM & BTP course](https://www.anubhavtrainings.com/scp-cloud-platform-training).

## Contribution

Feedback and contributions are welcome. To work on the package:

```sh
npm install
npm test     # starts temporary in-memory MongoDB servers (mongodb-memory-server), no MongoDB installation needed
```

The tests cover OData (drafts, expands, localized data, `$apply`), CQL including analytics compared to SQLite,
deep operations, transactions, destinations and error handling.

## Versioning

This library follows [Semantic Versioning](https://semver.org/). All notable changes are documented in the
`CHANGELOG.md` file of this package (see the [Code tab](https://www.npmjs.com/package/@anubhav-cap-js/mongo?activeTab=code)).

## Licensing

Copyright 2026 [Anubhav Trainings](https://www.anubhavtrainings.com). Licensed under the
[Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0); the license text is included in the
`LICENSE` file of this package.

SAP, SAP BTP and SAP HANA are trademarks of SAP SE. MongoDB and MongoDB Atlas are trademarks of MongoDB, Inc.
This package is not affiliated with or endorsed by SAP SE or MongoDB, Inc.

---

<p align="center">
  Made with ❤️ by <a href="https://www.anubhavtrainings.com"><b>Anubhav Trainings</b></a> –
  <a href="https://www.anubhavtrainings.com/scp-cloud-platform-training">SAP CAPM &amp; BTP course</a> ·
  <a href="https://www.anubhavtrainings.com">www.anubhavtrainings.com</a>
</p>
