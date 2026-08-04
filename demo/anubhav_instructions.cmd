1. cds init 
2. download edmx file and keep in srv/external
3. cds import srv/external/..pathedmx
4. define CatalogService.cds

```
using { ZSD_ATS_FIFA_0001 as service } from './external/ZSD_ATS_FIFA_0001';

service CatalogService @(path: 'CatalogService'){

    entity TeamsSet as projection on service.Teams;
}

annotate CatalogService.TeamsSet with @(
    Capabilities.InsertRestrictions.Insertable: true,
    Capabilities.UpdateRestrictions.Updatable: true
);
```

5. cds add handler 

```
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

  this.on ('UPDATE', TeamsSet, async (req) => {
    return service.tx(req).run(req.query);
  })

  return super.init()
}}

```

6. npm install && npm install dotenv

7. test locally cds watch
```
@host = http://localhost:4004
@service = {{host}}/odata/v4/CatalogService
@id = 9e38cfcf-2759-1fd1-a3f8-5a71ab498873

### GET all Teams
GET {{service}}/TeamsSet
Accept: application/json

### GET one Team by id
GET {{service}}/TeamsSet({{id}})
Accept: application/json

### POST create a Team
# NOTE: ZSD_ATS_FIFA_0001's $metadata marks Teams as Insertable:false,
# so CAP rejects this with 405 ENTITY_IS_NOT_CRUD until that capability is relaxed.
POST {{service}}/TeamsSet
Content-Type: application/json

{
  "team": "India",
  "captain": "Virat",
  "coach": "Tite",
  "score": 9.5,
  "ranking": 1,
  "past_wc_wins": 5,
  "year_of_win": 2002
}

### PUT update a Team by id
# NOTE: ZSD_ATS_FIFA_0001's $metadata marks Teams as Updatable:false,
# so CAP rejects this with 405 ENTITY_IS_NOT_CRUD until that capability is relaxed.
PUT {{service}}/TeamsSet({{id}})
Content-Type: application/json

{
  "team": "Brazil",
  "captain": "Neymar",
  "coach": "Tite",
  "score": 8.0,
  "ranking": 2,
  "past_wc_wins": 5,
  "year_of_win": 2002
}

```

8. change code with destination

9. add dest service and key
cf create-service destination lite mydest
cf create-service-key mydest sk
cds bind -2 mydest:sk

10. Create destination AOC and cds watch --hybrid
11. Add start script
```
"scripts": {
    "start": "cds-serve"
  },
```
12. cds add cf-manifest 
```
# Generated manifest.yml based on template version 0.1.0
# appName = demo
# language=nodejs
# multitenancy=
---
applications:
# -----------------------------------------------------------------------------------
# Backend Service
# -----------------------------------------------------------------------------------
- name: demo-srv
  random-route: true  # for development only
  path: gen/srv
  memory: 256M
  buildpack: nodejs_buildpack
  services:
    - mydest
  

```
13. disable auth
```
"requires": {
      "ZSD_ATS_FIFA_0001": {
        "kind": "odata",
        "model": "srv/external/ZSD_ATS_FIFA_0001",
        "csrf": true
      },
      "destinations": true,
      "auth": {
        "kind": "dummy"
      }
    }
```
14. cds build
15. cf push