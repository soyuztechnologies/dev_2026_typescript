# MongoDB Bookshop – sample for `@anubhav-cap-js/mongo`

**By [Anubhav Trainings](https://www.anubhavtrainings.com)** – learn SAP CAP hands-on in the [SAP CAPM & BTP course](https://www.anubhavtrainings.com/scp-cloud-platform-training).

A complete SAP CAP application running on **MongoDB Atlas** with no MongoDB-specific code:

| Service | Path | Shows |
| --- | --- | --- |
| `CatalogService` | `/browse` | projections with path expressions, localized texts, `$search`, action `submitOrder` (atomic `UPDATE ... with stock -= quantity`) |
| `AdminService` | `/admin` | Fiori Elements **drafts**, deep compositions, value help (role `admin`) |
| `AnalyticsService` | `/analytics` | OData `$apply`, custom CQL analytics with `groupBy`, `having`, `orderBy`, `limit(top, skip)`, aggregates |

```
samples/bookshop
├── app/annotations.cds         Fiori Elements UI annotations
├── db/schema.cds               plain CDS entities (one MongoDB collection each)
├── db/data/*.csv               initial data, loaded automatically into empty collections
├── srv/*.cds, srv/*.js         services and handlers (plain CQL)
├── test/requests.http          ready-to-run HTTP requests
├── .cdsrc-private.example.json template for your local MongoDB credentials
├── mta.yaml, xs-security.json  deployment to SAP BTP Cloud Foundry
└── package.json                cds.requires["anubhav-mongo"] configuration
```

## Run locally

1. Create a free MongoDB Atlas cluster, a database user and allow your IP
   (see the [package documentation, Step 1](https://www.npmjs.com/package/@anubhav-cap-js/mongo#step-1--create-a-mongodb-atlas-cluster)).
2. Get the sample and install it:

   ```sh
   git clone --depth 1 https://github.com/soyuztechnologies/dev_2026_typescript.git
   cp -r dev_2026_typescript/anubhav-cap-js-mongo/samples/bookshop my-bookshop
   cd my-bookshop
   npm install
   ```

   The included `.gitignore` keeps `.cdsrc-private.json` (your password) out of git.

   > Working inside the source of the plugin (git clone)? Don't run `npm install` in `samples/bookshop`.
   > Run `npm install` and `npm run link:sample` in the plugin root instead. That links the local plugin
   > into the sample, which uses `@sap/cds` from the plugin root (one single CAP instance).

3. Provide the connection – copy `.cdsrc-private.example.json` to **`.cdsrc-private.json`** and fill in
   your cluster host, user and password:

   ```json
   { "requires": { "anubhav-mongo": { "[development]": {
       "url": "mongodb+srv://cluster0.xxxxx.mongodb.net",
       "credentials": { "user": "your-db-user", "password": "your-db-password" }
   } } } }
   ```

   or set an environment variable instead: `MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net`

4. Check the connection and start:

   ```sh
   npm run ping
   npm run watch
   ```

   The sample sets `"autoDeploy": true` in `package.json`, so the model is deployed on boot: the log shows
   `[mongo] - connected to ...` and `initial data loaded into: ...`. Open <http://localhost:4004>:
   - **Fiori preview** of `AdminService.Books` (login `alice`, no password) – create a book, edit as draft, activate
   - **analyticapp** (`/analyticapp/webapp/index.html`) – freestyle SAPUI5 dashboard with `sap.viz` charts, see [below](#analytics-app-sapviz)
   - `/analytics/stockByGenre()` and `/analytics/topAuthors(minBooks=1,top=3,skip=0)`
   - more requests in [test/requests.http](test/requests.http)

   Mock users: `alice` (role `admin`) and `bob`.

Useful scripts: `npm run reset:db` drops and reloads all collections, `npm run deploy:db` creates missing
collections/indexes without touching data.

## Analytics with plain CQL

[srv/analytics-service.js](srv/analytics-service.js) – runs unchanged on SQLite, HANA and MongoDB:

```js
SELECT.from(Books)
  .columns('author.name as author', 'count(*) as books', 'sum(stock) as stock')
  .groupBy('author.name')            // group by a to-one path -> $lookup
  .having('count(*) >=', minBooks)
  .orderBy('stock desc', 'author.name')
  .limit(top, skip)
```

and OData: `/analytics/Books?$apply=groupby((author_ID),aggregate(stock with sum as total))&$orderby=total desc&$top=3`

## Analytics app (sap.viz)

[app/analyticapp](app/analyticapp/webapp) is a freestyle SAPUI5 app that shows four `sap.viz.ui5.controls.VizFrame` charts on one page:

| Chart | vizType | Source |
|---|---|---|
| Total sales per region | `donut` | `/analytics/salesByRegion()` |
| Total stock per book | `bar` | `/analytics/stockByBook()` |
| Total sales per day | `line` | `/analytics/salesByDay()` |
| Revenue and units sold per book | `dual_combination` | `/analytics/salesByBook()` |

The functions group the `Sales` collection with plain CQL (`groupBy` / `sum` / `orderBy`), see
[srv/analytics-service.js](srv/analytics-service.js). The controller calls them through the OData V4 model and
puts the results into a JSON model for the charts' `FlattenedDataset`. `sap.viz` is part of SAPUI5 only, so
`index.html` loads UI5 from `ui5.sap.com`. Sales seed data: [db/data/anubhav.bookshop-Sales.csv](db/data/anubhav.bookshop-Sales.csv).

## Deploy to SAP BTP Cloud Foundry

1. In the BTP cockpit create the destination **`MONGO_ATLAS`** (Type `HTTP`, URL `https://cluster0.xxxxx.mongodb.net`,
   Proxy `Internet`, `BasicAuthentication` with the Atlas database user) and add the properties
   `mongo.url` = `mongodb+srv://cluster0.xxxxx.mongodb.net`, `mongo.database` = e.g. `anubhav-prod`,
   `mongo.options` = `retryWrites=true&w=majority` and `mongo.authSource` = `admin`.
   `mongo.database` overrides `dbName` (`anubhav`) – look for the data in that database. Details and an importable
   destination file in the [package documentation, Step 5](https://www.npmjs.com/package/@anubhav-cap-js/mongo#step-5--create-a-btp-destination-for-mongodb).
2. Allow the egress IPs of your BTP region in Atlas *Network Access*.
3. Build and deploy. Make sure the app uses a plugin version newer than 1.0.3 – up to 1.0.3 the app crashes on
   startup with `token request failed with HTTP 401` when reading the destination
   ([Troubleshooting](https://www.npmjs.com/package/@anubhav-cap-js/mongo#troubleshooting)):

   ```sh
   npm add @anubhav-cap-js/mongo@latest
   npm install -g mbt
   mbt build
   cf deploy mta_archives/mongo-bookshop_1.0.0.mtar
   ```

4. Assign the role collection **MongoBookshopAdmin** to your user for the `/admin` service.

In production the app uses the destination (`"[production]": { "destination": "MONGO_ATLAS" }` in package.json);
locally it uses your `.cdsrc-private.json`. The `mta.yaml` copies `db/data` into the build result, so the initial
data is loaded into the empty collections on the first start.

---

Made with ❤️ by **[Anubhav Trainings](https://www.anubhavtrainings.com)**
