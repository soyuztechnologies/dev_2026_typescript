# Changelog

All notable changes to this project are documented in this file.
This project follows [Semantic Versioning](https://semver.org/).

## [1.0.1] - 2026-10-27

### Changed

- npm keywords: added distinctive keywords (e.g. `anubhav`, `anubhav-cap-js`, `cap-mongodb`, `cap-attachments`) so
  the package can be found with `npm search` and `keywords:` searches on npmjs.com.

## [1.0.0] - 2026-10-27

### Added

- `Attachments` aspect for compositions of files, with Fiori Elements annotations (section on the object page,
  upload, delete, download, inline preview).
- Single and multiple attachments by cardinality: `Composition of one Attachments` (form section, replaceable,
  created together with the parent) and `Composition of many Attachments` (table section), any number per entity.
- File content stored in MongoDB GridFS via `@anubhav-cap-js/mongo`, streamed in both directions, no size limit
  from MongoDB documents.
- Draft support: upload in edit mode, keep on activation, remove on discard.
- Automatic removal of unreferenced GridFS files after deletes, discarded drafts, replaced content and failed
  transactions.
- Configuration `cds.requires["anubhav-attachments"]`: `maxFileSize`, `allowedMimeTypes`, `maxCount`, `inline`,
  `bucketName`, and per-composition overrides via `@Core.AcceptableMediaTypes`, `@Validation.Maximum`,
  `@Validation.MaxItems`.
- Startup check that `@anubhav-cap-js/mongo` is the primary database.
- In-app preview for Fiori Elements: UI5 module and fragments (`anubhav/attachments/Preview`, `PreviewColumn`,
  `PreviewField`) served by the plugin. A magnifier button per table row or single attachment opens images, PDF,
  text, audio and video in a dialog.

### Fixed

- Upload in Fiori Elements tables failed with `TypeError: Cannot read properties of null (reading 'replace')`:
  results contained `content: null`, so Fiori couldn't compute the upload URL. `content` is now only returned
  when selected explicitly, like `SELECT *` on SQL databases.
- File names of attachments added while editing an existing entity were lost on *Save*. Renaming via `PATCH` is now
  ignored, instead of protecting `filename` with `@Core.Immutable`, which CAP also applied on draft activation.
