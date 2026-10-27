# Attachments for SAP CAP on MongoDB

<p align="center">
  <b>by <a href="https://www.anubhavtrainings.com">Anubhav Trainings</a></b> ·
  <a href="https://www.anubhavtrainings.com/scp-cloud-platform-training">SAP CAPM &amp; BTP course</a> ·
  <a href="https://www.anubhavtrainings.com">www.anubhavtrainings.com</a>
</p>

`@anubhav-cap-js/attachments` is a [CDS plugin](https://cap.cloud.sap/docs/node.js/cds-plugins) for
[SAP CAP](https://cap.cloud.sap) (Node.js) that adds **file attachments** to your entities: upload, download and
preview files of **any kind** in Fiori Elements, out of the box. It is the MongoDB counterpart of
[`@cap-js/attachments`](https://www.npmjs.com/package/@cap-js/attachments) and works with
[`@anubhav-cap-js/mongo`](https://www.npmjs.com/package/@anubhav-cap-js/mongo).

The files are stored in **MongoDB GridFS**, in the same database as your data. You don't need an object store,
an S3 bucket or any other SAP BTP service.

```
 Fiori Elements ──► CAP service ──► cds.db (@anubhav-cap-js/mongo) ──► MongoDB / Atlas
  Upload / view                      ├─ collection  ...attachments      metadata: file name, type, size, note
                                     └─ GridFS      attachments.files   file content, streamed in chunks
                                                    attachments.chunks
```

> **New to SAP CAP?** Learn CAP, SAP BTP, Fiori and ABAP RAP hands-on in the
> [SAP CAPM & BTP course by Anubhav Trainings](https://www.anubhavtrainings.com/scp-cloud-platform-training).

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Setup](#setup)
- [Single and multiple attachments](#single-and-multiple-attachments)
- [Fiori Elements](#fiori-elements)
- [In-app preview](#in-app-preview)
- [Configuration](#configuration)
- [Restrictions per composition](#restrictions-per-composition)
- [Using attachments in custom code](#using-attachments-in-custom-code)
- [OData API](#odata-api)
- [How files are stored](#how-files-are-stored)
- [Differences to @cap-js/attachments](#differences-to-cap-jsattachments)
- [Security](#security)
- [Limitations](#limitations)
- [Troubleshooting](#troubleshooting)
- [Sample application](#sample-application)
- [Support](#support)
- [Contribution](#contribution)
- [Licensing](#licensing)

## Features

- **Single or multiple attachments, by cardinality**: `Composition of many Attachments` gives a list of files,
  `Composition of one Attachments` gives exactly one file. An entity can have any number of both.
- **Fiori Elements, ready to use**: an *Attachments* section on the object page with **Upload**, **Delete**, a
  download link per file and **inline preview** of images, PDFs, text, audio and video.
- **In-app preview**: a magnifier button in each attachment row opens the file in a dialog in the app, not in a
  new browser tab.
- **Files of any size and type**: content is streamed into GridFS, so the 16 MB limit of MongoDB documents doesn't
  apply.
- **Drafts**: upload in edit mode, then *Save* or *Discard*. Files of discarded drafts and deleted attachments are
  removed from GridFS automatically.
- **Configurable**: allowed media types, maximum file size and maximum number of files. Set them for the whole
  app or per composition with standard annotations.
- **Plain CQL**: `INSERT` content and `SELECT` content as a stream in custom handlers.
- **No extra services**: no object store, no destination and no service binding beyond your MongoDB connection.

## Requirements

| Component | Version |
| --- | --- |
| Node.js | 20 or higher |
| `@sap/cds` | 10.x |
| `@anubhav-cap-js/mongo` | 1.0.5 or higher, configured as the primary database |
| SAPUI5 (Fiori Elements) | 1.136 or higher |

The plugin checks this at startup. If the primary database isn't `@anubhav-cap-js/mongo`, the app stops with the
error `ATTACHMENTS_MONGO_REQUIRED`.

## Setup

1. Set up `@anubhav-cap-js/mongo` first (see its [documentation](https://www.npmjs.com/package/@anubhav-cap-js/mongo)).
2. Add the plugin:

   ```sh
   npm add @anubhav-cap-js/attachments
   ```

3. Add attachments to your entities. The cardinality decides between a single file and a list of files:

   ```cds
   using { cuid, managed } from '@sap/cds/common';
   using { Attachments } from '@anubhav-cap-js/attachments';

   entity Incidents : cuid, managed {
     title       : String;
     attachments : Composition of many Attachments;   // multiple files
     approval    : Composition of one  Attachments;   // single file
     screenshots : Composition of many Attachments;   // another, independent list
   }
   ```

4. Start the app with `cds watch`. The log shows:

   ```
   [mongo] - connected to mongodb+srv://cluster0.xxxxx.mongodb.net/ (database: helpdesk) via credentials
   [attachments] - files are stored in MongoDB GridFS (bucket "attachments")
   ```

`Attachments` provides these elements:

| Element | Type | Description |
| --- | --- | --- |
| `ID` | UUID | key |
| `content` | LargeBinary | the file. It is streamed from and to GridFS and never stored in the collection |
| `filename` | String | file name, set when the attachment is created |
| `mimeType` | String | media type, derived from the file name (read-only) |
| `size` | Integer64 | size in bytes (read-only) |
| `note` | String | free text |
| `url` | String | GridFS file id (hidden, read-only) |
| `createdAt`, `createdBy`, `modifiedAt`, `modifiedBy` | | from `managed` |

## Single and multiple attachments

| Model | Cardinality | Object page section | Content |
| --- | --- | --- | --- |
| `Composition of many Attachments` | 0..n files | table with **Upload** and **Delete** | can't be replaced. Delete the file and upload a new one |
| `Composition of one Attachments` | 0..1 file | form with **upload** (↑) and **remove** (×) buttons | can be replaced: uploading again replaces the file |

Each composition gets its own collection, e.g. `my_Incidents_attachments` and `my_Incidents_approval`, and its
own section, settings and restrictions. Mix as many as you need, at any level (also in child entities).

For a single attachment, the plugin creates the (empty) attachment together with its parent, so Fiori Elements
can upload into it. Fiori can't create the target of a to-one composition itself. Records that existed before the
composition was added get their single attachment on the first *Edit*. To create them right away, use a CSV file,
e.g. `db/data/my-Incidents.approval.csv` with the columns `ID;up__ID`.

## Fiori Elements

Nothing else to do. For every attachment composition of an entity with `@UI.Facets`, the plugin adds a section to
the object page, labeled with the composition's `@title` (default *Attachments* / *Attachment*):

| Mode | What users can do |
| --- | --- |
| Display | click a file to **view** it (images, PDF, text, audio, video open in the browser) or **download** it (all other types) |
| Edit (draft) | **upload**, **delete** or **replace** files and edit the note; *Save* keeps the changes, *Discard Draft* removes the new files |

The annotations come with the aspect (`UI.LineItem` for lists, `UI.FieldGroup#SingleAttachment` for single files,
`UI.HeaderInfo`, `UI.MediaResource`, `Core.MediaType`, `Core.ContentDisposition`, and `Common.SideEffects`, which
refreshes the file name, type and size after an upload). Override them like any CDS annotation. To hide a section,
annotate the composition with `@UI.Hidden`. To place a section yourself, add your own `UI.ReferenceFacet` with
`Target: 'attachments/@UI.LineItem'` (many) or `Target: 'approval/@UI.FieldGroup#SingleAttachment'` (one). The
plugin then doesn't add another one.

```cds
annotate Incidents with {
  attachments @title: 'Documents';         // section labels
  approval    @title: 'Signed Approval';
}
```

## In-app preview

The plugin ships a small UI5 module that adds a **preview button** (magnifier icon) to every attachments table
and to single attachments. The button opens the file in a dialog inside the app, not in a new browser tab:

| File type | Preview |
| --- | --- |
| PNG, JPEG, GIF, BMP, WebP | image |
| PDF | the PDF viewer of the browser |
| text, CSV | the text (first 1 MB), shown as plain text |
| audio, video | player |
| all others | note *No preview available*, with a **Download** button |

The dialog always has a **Download** button. Drafts work too, so users can preview a file before they save.

The module is served by the plugin at `<any path>/anubhav/attachments/ui5/`. Set it up once per Fiori Elements
app:

**1. `webapp/Component.js`**: tell UI5 where to load the module from (relative to the app):

```js
sap.ui.loader.config({ paths: { 'anubhav/attachments': sap.ui.require.toUrl('my/app/id') + '/anubhav/attachments/ui5' } })

sap.ui.define(['sap/fe/core/AppComponent'], function (AppComponent) { /* ... unchanged ... */ })
```

Replace `my/app/id` with the id of your app (`sap.app.id` with `/` instead of `.`).

**2. `webapp/manifest.json`**: add the preview to each attachments table (`columns`) and single attachment
(`fields`) in the settings of the object page:

```json
"controlConfiguration": {
  "attachments/@com.sap.vocabularies.UI.v1.LineItem": {
    "columns": {
      "Preview": {
        "header": "Preview",
        "template": "anubhav.attachments.PreviewColumn",
        "width": "5em",
        "horizontalAlign": "Center",
        "position": { "placement": "After", "anchor": "DataField::content" },
        "properties": ["size", "mimeType", "filename"]
      }
    }
  },
  "approval/@com.sap.vocabularies.UI.v1.FieldGroup#SingleAttachment": {
    "fields": {
      "Preview": {
        "label": "Preview",
        "template": "anubhav.attachments.PreviewField",
        "position": { "placement": "After", "anchor": "DataField::content" }
      }
    }
  }
}
```

Repeat the `columns` block for every `Composition of many Attachments` (e.g. `screenshots/@...LineItem`) and the
`fields` block for every `Composition of one Attachments`. The button only shows for attachments that have a
file.

**3. SAP BTP (approuter / HTML5 repository)**: route the module to the CAP service, like the OData requests, in
the `xs-app.json` of the app:

```json
{ "source": "^/anubhav/attachments/(.*)$", "target": "/anubhav/attachments/$1", "destination": "srv-api", "authenticationType": "xsuaa" }
```

Locally (`cds watch`) nothing else is needed. The sample app has the complete setup.

## Configuration

Settings for the whole app go into `cds.requires["anubhav-attachments"]`, in `package.json` or `.cdsrc.json`:

```json
{
  "cds": {
    "requires": {
      "anubhav-attachments": {
        "maxFileSize": "25MB",
        "allowedMimeTypes": ["image/*", "application/pdf", "text/plain"],
        "maxCount": 10,
        "inline": true
      }
    }
  }
}
```

| Option | Default | Description |
| --- | --- | --- |
| `maxFileSize` | `"100MB"` | Maximum size of a file, e.g. `"500KB"`, `"20MB"`, `"1GB"` or bytes. Larger uploads fail with HTTP 413. `0` = unlimited |
| `allowedMimeTypes` | `["*/*"]` | Allowed media types, wildcards like `image/*` work. Other files fail with HTTP 415. They are also added to `$metadata` as `Core.AcceptableMediaTypes` for Fiori |
| `maxCount` | `0` | Maximum number of attachments per parent and composition, `0` = unlimited. More fail with HTTP 400 |
| `inline` | `true` | Show safe types (PNG, JPEG, GIF, BMP, WebP, PDF, text, CSV, audio, video) in the browser. `false` = always download |
| `bucketName` | `"attachments"` | Name of the GridFS bucket, i.e. the collections `<bucketName>.files` and `<bucketName>.chunks` |

## Restrictions per composition

Annotations on a composition override the configuration:

```cds
entity Incidents : cuid {
  attachments : Composition of many Attachments;   // uses the configuration
  approval    : Composition of one Attachments;

  @title: 'Screenshots'
  @Validation.MaxItems: 3                           // max. 3 files
  screenshots : Composition of many Attachments;
}

annotate Incidents.screenshots with {
  content @Core.AcceptableMediaTypes: ['image/png', 'image/jpeg']  // only these types
          @Validation.Maximum: '2MB';                               // max. 2 MB per file
}

annotate Incidents.approval with {
  content @Core.AcceptableMediaTypes: ['application/pdf'];         // single file: PDF only
}
```

| Annotation | On | Overrides |
| --- | --- | --- |
| `@Core.AcceptableMediaTypes: [...]` | `<composition>.content` | `allowedMimeTypes` |
| `@Validation.Maximum: '2MB'` | `<composition>.content` | `maxFileSize` |
| `@Validation.MaxItems: 3` | the composition | `maxCount` |
| `@Capabilities.UpdateRestrictions.NonUpdatableProperties: []` | `<composition>` | allows uploading new content to an existing attachment of a list (default: HTTP 409). Single attachments are always replaceable |
| `@UI.Hidden` | the composition | no section on the object page |

The media type is always derived from the **file extension**, not from the `Content-Type` header the client sends,
so the restrictions can't be bypassed by sending a fake type. Files with unknown extensions use the header type,
or `application/octet-stream`.

## Using attachments in custom code

The `content` element works with plain CQL. Pass a Buffer, a stream or a base64 string, and read it back as a
stream:

```js
const { Incidents } = cds.entities('my.helpdesk')
const Attachments = Incidents.elements.attachments.target

// insert, also deep
await INSERT.into(Incidents).entries({
  title: 'Printer on fire',
  attachments: [{ filename: 'photo.jpg', mimeType: 'image/jpeg', content: fs.createReadStream('photo.jpg') }]
})

// read metadata
const files = await SELECT.from(Attachments).columns('ID', 'filename', 'size').where({ up__ID: incidentID })

// read the content as a stream
const { content } = await SELECT.one.from(Attachments, files[0].ID).columns('content')
content.pipe(res)

// delete - the file is removed from GridFS after the transaction
await DELETE.from(Attachments, files[0].ID)
```

In custom code, the media type isn't derived from the file name. Set `mimeType` yourself. `content` is only
returned when it is selected explicitly at the top level of a query. In `$expand` and deep reads it's `null`.

Direct access to the GridFS bucket, e.g. for reports:

```js
const { bucket } = require('@anubhav-cap-js/attachments/lib/gridfs')
const files = await (await bucket()).find({ 'metadata.entity': 'my.helpdesk.Incidents.attachments' }).toArray()
```

## OData API

Uploads take two requests, the same as with `@cap-js/attachments`. Fiori Elements sends them for you:

```http
### 1. create the attachment (metadata)
POST /odata/v4/helpdesk/Incidents(ID=...,IsActiveEntity=false)/attachments
Content-Type: application/json

{ "filename": "report.pdf" }

### 2. upload the content
PUT /odata/v4/helpdesk/Incidents(ID=...,IsActiveEntity=false)/attachments(ID=...,IsActiveEntity=false)/content
Content-Type: application/pdf

<binary>

### download / view
GET /odata/v4/helpdesk/Incidents(ID=...,IsActiveEntity=true)/attachments(ID=...,IsActiveEntity=true)/content
```

A single attachment exists together with its parent, so it takes only the upload. The file name comes from the
`Content-Disposition` (or `Slug`) header. Removing the file keeps the (empty) attachment:

```http
PUT /odata/v4/helpdesk/Incidents(ID=...,IsActiveEntity=false)/approval/content
Content-Type: application/pdf
Content-Disposition: attachment; filename="approval.pdf"

<binary>

### remove the file
DELETE /odata/v4/helpdesk/Incidents(ID=...,IsActiveEntity=false)/approval/content
```

For entities without drafts, leave out `IsActiveEntity`.

## How files are stored

- **Metadata** (`filename`, `mimeType`, `size`, `note`, ...) is stored in the attachment's collection, e.g.
  `my_helpdesk_Incidents_attachments`, the same as any other CAP entity on `@anubhav-cap-js/mongo`.
- **Content** is stored in [GridFS](https://www.mongodb.com/docs/manual/core/gridfs/), in the collections
  `attachments.files` and `attachments.chunks` (255 KB chunks). `url` holds the GridFS file id. Each GridFS file
  has the metadata `{ entity, ID }` for traceability.
- An attachment in a draft and the active attachment share the same GridFS file, so *Edit* copies no content.
- **Clean-up**: after each transaction that deletes or replaces attachments, including discarded drafts, deleted
  parents and failed uploads, the plugin removes GridFS files that no active or draft attachment references
  anymore.

## Differences to @cap-js/attachments

| | `@cap-js/attachments` | `@anubhav-cap-js/attachments` |
| --- | --- | --- |
| Database | SQLite, HANA, PostgreSQL | MongoDB / Atlas via `@anubhav-cap-js/mongo` |
| File storage | database (development), SAP Object Store / S3 / Azure / GCP (production) | MongoDB GridFS, in all environments |
| Extra BTP services | Object Store, Malware Scanning | none |
| Malware scanning | yes (SAP Malware Scanning Service) | no, see [Security](#security) |
| Model usage | `Composition of many Attachments` | the same |
| Configuration | `cds.requires.attachments` | `cds.requires["anubhav-attachments"]` |

## Security

- **Media types** are derived from the file extension and checked against `@Core.AcceptableMediaTypes` /
  `allowedMimeTypes` on create and on upload (HTTP 415).
- **File size** is checked against `Content-Length` before the upload, and again while streaming. Uploads that
  exceed the limit are aborted and their partial data is removed (HTTP 413).
- **`url`, `size` and `mimeType` are read-only** (`@Core.Computed`). Clients can't point an attachment to another
  file.
- **Inline preview** is limited to types that browsers render without running scripts. SVG, HTML and XML are
  always downloaded, even with `inline: true`. The in-app preview shows text files as escaped text, never as HTML.
- **File names** come from the upload. Renaming via `PATCH` is ignored, so a file can't be relabeled to another type
  after the type check.
- **Authorization**: attachments are part of their parent, so the `@restrict` / `@requires` of your service apply.
  Files are only served through CAP. There are no public links.
- **No malware scanning.** If users upload files that others download, restrict the media types, or scan files in
  a custom `before('UPDATE')` handler.

## Limitations

- Attachments are **compositions** (`Composition of one / many Attachments`). Inline attachment fields (a structured
  type in the parent, like `Attachment` of `@cap-js/attachments`) aren't supported. Use `Composition of one`.
- In lists, the content of an attachment can't be replaced by default (HTTP 409). Delete the attachment and upload
  again, or allow it with `@Capabilities.UpdateRestrictions.NonUpdatableProperties: []`.
- Records that existed before a `Composition of one Attachments` was added show an *Open File* placeholder until
  their first *Edit*, or until you create the attachments with a CSV file (see
  [Single and multiple attachments](#single-and-multiple-attachments)).
- GridFS writes don't take part in MongoDB transactions. The plugin handles failed transactions by removing
  uploaded files afterwards.
- No multitenancy, the same as `@anubhav-cap-js/mongo`.

## Troubleshooting

| Symptom | Solution |
| --- | --- |
| `ATTACHMENTS_MONGO_REQUIRED` at startup | install `@anubhav-cap-js/mongo` and configure `cds.requires["anubhav-mongo"]` |
| No *Attachments* section on the object page | the parent entity needs `@UI.Facets`. Check that the composition isn't `@UI.Hidden` |
| No *Upload* button | switch to edit mode (draft). Upload needs SAPUI5 1.136 or higher |
| Single attachment: upload fails with 404, or *Open File* is shown without a file | the record has no attachment yet (created before the composition existed): click *Edit* once, or load `ID;up__ID` rows via CSV |
| HTTP 415 *File type ... is not allowed* | the file extension isn't in `allowedMimeTypes` / `@Core.AcceptableMediaTypes` |
| HTTP 413 *exceeds the maximum size* | raise `maxFileSize` / `@Validation.Maximum` |
| HTTP 409 *already has content* | delete the attachment and upload again, or allow replacing (see [Restrictions](#restrictions-per-composition)) |
| Files are downloaded instead of shown | only safe types are shown inline. Check `inline` |
| No preview button, or the UI5 log shows `failed to load 'anubhav/attachments/Preview.js'` | check the `sap.ui.loader.config` line in `Component.js` (app id) and, on SAP BTP, the route in `xs-app.json` (see [In-app preview](#in-app-preview)) |
| A file name is empty or reverts after a rename | file names come from the upload and can't be changed afterwards. Upload the file again with the new name |
| Upload of large files fails behind a proxy or the approuter | increase the request size limit of the proxy (e.g. approuter `maxBodySize`) |

Use `DEBUG=attachments cds watch` to log when unreferenced files are removed.

## Sample application

The [`sample`](https://github.com/anubhavtrainings-official/-anubhav-cap-js-mongodb/tree/main/anubhav-cap-js-attachment/sample)
folder of the repository has a complete helpdesk app with a Fiori Elements List Report and Object Page. It has
three attachment sections: *Signed Approval* (a single PDF), *Attachments* (any file) and *Screenshots* (images up
to 2 MB, max. 3 files). The
sample isn't part of the npm package. See its `README.md`.

## Support

This package is created and maintained by [Anubhav Trainings](https://www.anubhavtrainings.com). For questions,
feature requests and bug reports, contact us via [www.anubhavtrainings.com](https://www.anubhavtrainings.com).

Want to learn SAP CAP in depth, including CDS modeling, services, Fiori Elements and SAP BTP deployment? Join the
[SAP CAPM & BTP course](https://www.anubhavtrainings.com/scp-cloud-platform-training).

## Contribution

```sh
npm install
npm test     # starts a temporary in-memory MongoDB (mongodb-memory-server), no installation needed
```

The tests cover the Fiori draft flow (upload, activate, edit, discard), single and multiple attachments (also
several per entity), nested compositions, files larger than
16 MB, media type, size and count restrictions, CQL access, GridFS clean-up and the `$metadata` annotations.

## Licensing

Copyright 2026 [Anubhav Trainings](https://www.anubhavtrainings.com). Licensed under the
[Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0). The license text is in the `LICENSE`
file of this package.

SAP, SAP BTP and SAP Fiori are trademarks of SAP SE. MongoDB and MongoDB Atlas are trademarks of MongoDB, Inc.
This package is not affiliated with or endorsed by SAP SE or MongoDB, Inc.

---

<p align="center">
  Made with ❤️ by <a href="https://www.anubhavtrainings.com"><b>Anubhav Trainings</b></a> ·
  <a href="https://www.anubhavtrainings.com/scp-cloud-platform-training">SAP CAPM &amp; BTP course</a> ·
  <a href="https://www.anubhavtrainings.com">www.anubhavtrainings.com</a>
</p>
