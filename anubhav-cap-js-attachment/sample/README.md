# Helpdesk sample for `@anubhav-cap-js/attachments`

**By [Anubhav Trainings](https://www.anubhavtrainings.com)**. Learn SAP CAP hands-on in the
[SAP CAPM & BTP course](https://www.anubhavtrainings.com/scp-cloud-platform-training).

A SAP CAP app with a **Fiori Elements** List Report and Object Page for incidents. Users upload, view and download
files in three sections, which show a single attachment and multiple attachments side by side. The files are stored in **MongoDB GridFS**. No object store is needed.

| Section | Model | Allows |
| --- | --- | --- |
| *Signed Approval* | `Composition of one Attachments` | **one** PDF, can be replaced |
| *Attachments* | `Composition of many Attachments` | any file type, max. 25 MB per file, max. 10 files (`cds.requires["anubhav-attachments"]` in `package.json`) |
| *Screenshots* | `Composition of many Attachments` | PNG, JPEG, GIF and WebP only, max. 2 MB per file, max. 3 files (annotations in `db/schema.cds`) |

```
sample
├── app/annotations.cds          Fiori annotations of Incidents (the attachment sections are added by the plugin)
├── app/incidents/webapp         Fiori Elements app (List Report + Object Page, SAPUI5 1.136 from the CDN),
│                                in-app preview set up in Component.js and manifest.json
├── db/schema.cds                Incidents with "approval" (one), "attachments" and "screenshots" (many)
├── db/data/*.csv                initial data (incl. the empty single attachments of the initial incidents)
├── srv/service.cds              HelpdeskService (draft enabled)
├── test/requests.http           upload / download with plain HTTP requests
├── .cdsrc-private.example.json  template for your local MongoDB credentials
└── package.json                 configuration of @anubhav-cap-js/mongo and @anubhav-cap-js/attachments
```

## Run locally

1. Create a MongoDB Atlas cluster (the free M0 tier is fine), a database user, and allow your IP. See the
   [@anubhav-cap-js/mongo documentation](https://www.npmjs.com/package/@anubhav-cap-js/mongo#step-1--create-a-mongodb-atlas-cluster).
   A local MongoDB (`mongodb://localhost:27017`) works as well.
2. Copy the sample and install it:

   ```sh
   cp -r sample my-helpdesk
   cd my-helpdesk
   npm install
   ```

   > Working inside the source of the plugin (git clone)? Don't run `npm install` in `sample`. Run `npm install`
   > and `npm run link:sample` in the plugin root instead. That links the local plugin into the sample, which then
   > uses `@sap/cds` and `@anubhav-cap-js/mongo` from the plugin root.

3. Provide the connection. Copy `.cdsrc-private.example.json` to **`.cdsrc-private.json`** and fill in your
   cluster host, user and password. `.gitignore` keeps that file out of git. Or set an environment variable
   instead:

   ```sh
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net
   ```

4. Start the app:

   ```sh
   npm run watch
   ```

   Then open <http://localhost:4004/incidents/webapp/index.html> and log in as **`alice`** with an empty password.

## Try it

1. Open an incident and click **Edit**.
2. In **Signed Approval**, click the upload icon (↑) and choose a PDF. Upload again to replace it, or click ×
   to remove it.
3. In **Attachments**, click **Upload** and choose any file, e.g. a PDF, an Excel file or a video.
4. In **Screenshots**, upload a PNG. A PDF is rejected there: *File type "application/pdf" is not allowed*.
5. Click the **magnifier** next to a file: it opens in a preview dialog in the app (images, PDF, text, audio,
   video). Click **Save**. Clicking a file name opens or downloads it in the browser.
6. In MongoDB Atlas, *Browse Collections* → database `anubhav_helpdesk`:
   - `anubhav_helpdesk_Incidents_approval`, `..._attachments` and `..._screenshots` hold the metadata
   - `attachments.files` / `attachments.chunks` hold the content (GridFS)
7. Delete an attachment or the incident. Its files are removed from GridFS.

`test/requests.http` has the same flow as plain HTTP requests.

---

Made with ❤️ by [Anubhav Trainings](https://www.anubhavtrainings.com) ·
[SAP CAPM & BTP course](https://www.anubhavtrainings.com/scp-cloud-platform-training)
