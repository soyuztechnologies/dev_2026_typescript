# Changelog

All notable changes to `@anubhav-cap-js/mongo` are documented here.
This project follows [Semantic Versioning](https://semver.org).

## 1.0.1 - 2026-10-24

First public release (version 1.0.0 was unpublished and can't be reused on npm).

### Added

- CDS database service for MongoDB and MongoDB Atlas (`kind: anubhav-mongo`), based on `@cap-js/db-service`.
- Connection via `url` + `credentials` (local development), SAP BTP destinations (Cloud SDK or Destination
  service REST API), user-provided services tagged `mongodb`, or `MONGODB_URI`.
- CQN to MongoDB compiler: filters, path expressions, `exists`, search, sorting, pagination, `$count`,
  expands, aggregations, localized texts, projections and calculated elements.
- INSERT / UPSERT / UPDATE / DELETE incl. deep operations, managed fields, defaults and UUID keys.
- Fiori Elements draft support.
- Transactions on replica sets and Atlas (auto-detected).
- Schema deployment (collections, primary key, `@assert.unique` and foreign key indexes) via `cds deploy`,
  startup `autoDeploy` and the `anubhav-mongo` CLI (`ping`, `deploy`).
- Error translation with HTTP status codes and hints.
- Analytics: `groupBy` / `having` / `orderBy` / `limit` / `distinct` and aggregates (also over to-one paths such as
  `product.category`), OData `$apply` incl. `groupby` over navigation properties - verified to return the same
  results as `@cap-js/sqlite`.
- Sample application `samples/bookshop` on GitHub, not part of the npm package (Fiori drafts, analytics service,
  freestyle SAPUI5 analytics app with `sap.viz` charts, SAP BTP deployment).
- Option `maxTimeMS` to limit the run time of queries.
- `mongodb+srv://` URLs work when the DNS server of Node.js can't be reached (e.g. 127.0.0.1 on Windows): the cluster
  is then resolved via public DNS servers, configurable with option `dnsServers`.
- Option `dbName` for the database name; defaults to the project name from package.json.
- Option `autoDeploy` (`true` | `false` | `"schema"`) to deploy the model on boot; string values from
  environment variables are parsed (`"false"` switches it off), invalid values fail the boot.

### Security

- Comparisons with missing `$user` attributes (e.g. `country = $user.country`) match no rows, like SQL.
- Objects are rejected as values of string elements; sub paths and session variables are validated.
- Stored `__proto__` keys can't change the prototype of returned objects.
- Client regular expressions (`matchesPattern`) are limited in size and validated.
- Connection string options and passwords are removed from logs and error messages; errors expose no internal properties.
- `https://` destinations keep TLS when `mongo.srv` is `false`; warning for credentials without TLS.
- Plain SQL strings (incl. `DROP TABLE`) passed to `db.run()` are rejected.
