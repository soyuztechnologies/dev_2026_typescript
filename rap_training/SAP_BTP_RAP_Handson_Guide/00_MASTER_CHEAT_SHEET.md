# Master Cheat Sheet — SAP BTP ABAP RAP

Everything from all 19 days on one page. Each chapter also carries its own focused cheat sheet at the top.

[🏠 Summary](00_SUMMARY.md)

---

## The RAP layer cake

```text
Database tables            <- where the data really sits
   |
Interface CDS entity       <- stable, reusable model       (ZAM_AB_TRAVEL)
   |
Behavior Definition        <- the rulebook                 (.bdef)
   |
Projection CDS entity      <- one app's view of the model  (ZAM_AB_TRAVEL_PROCESSOR)
   |
Projection BDEF            <- which rules this app may use
   |
Metadata Extension (MDE)   <- the screen layout, @UI.*
   |
Service Definition         <- which entities are allowed out
   |
Service Binding            <- the actual OData V2 / V4 URL
   |
Fiori Elements app         <- built from the annotations, no JavaScript needed
```

## The RAP save sequence

```text
precheck  →  determinations on modify  →  validations  →  determinations on save  →  save
```

Determinations **change** data. Validations **only accept or refuse**. Get these two mixed up and your logic silently does nothing.

---

## Eclipse / ADT keys

| Key | Action |
|---|---|
| `Ctrl+Shift+A` | Search any object in the whole system |
| `Ctrl+F3` | Activate the current object |
| `Ctrl+1` | **Quick fix** — RAP generates code skeletons for you |
| `Ctrl+Space` | Code completion |
| `Shift+Enter` | Generate code from the selected suggestion |
| `Ctrl+Click` | Navigate to the object under the cursor |
| `Ctrl+T` | Type hierarchy of a class |
| `Ctrl+6` | Jump to the SAP GUI window |
| `Ctrl+7` | Comment / uncomment a block |
| `Ctrl+M` | Maximise / restore the editor pane |
| `F2` | Show a method signature |
| `F5` (Project Explorer) | Refresh — load all objects of your package |
| `F8` | Data preview (table / CDS entity) |
| `F9` | Run the class (the cloud replacement for classic F8) |

---

## Naming conventions used throughout

| Prefix | Meaning |
|---|---|
| `ZI_` | Interface / basic view — the reusable layer |
| `ZC_` | Consumption view — what a UI or report reads |
| `ZI_CO_` | Cube — the analytics number-crunching layer |
| `zcl_` | Global ABAP class |
| `zbp_` | Behavior implementation class (RAP generates the name) |
| `lhc_` | Local handler class inside a behavior implementation |
| `lsc_` | Local saver class (unmanaged RAP) |
| `_PROCESSOR` | Projection for the Processor app |
| `_APPROVER` | Projection for the Approver app |
| `_U_` | The unmanaged-RAP variant (Days 16–17) |
| `_AB_` | **The trainer's initials — replace with your own everywhere** |

---

## DDL — tables and structures

```cds
@EndUserText.label : 'my table'
@AbapCatalog.enhancement.category : #NOT_EXTENSIBLE
@AbapCatalog.tableCategory : #TRANSPARENT
@AbapCatalog.deliveryClass : #A
@AbapCatalog.dataMaintenance : #RESTRICTED
define table zxx { key client : abap.clnt not null; ... }
```

| Element | Meaning |
|---|---|
| `key client : abap.clnt not null` | The tenant column. Always the first key field. |
| `#TRANSPARENT` | One ABAP table = one HANA table |
| `#A` | Application data — system copies must not wipe it |
| `#NOT_EXTENSIBLE` | Nobody may bolt extra fields on later |
| `sysuuid_x16` | Generated 16-byte key, for records with no natural key |
| `include <structure>` | Paste a structure's fields in — reuse instead of copy-paste |
| `define structure` | A field layout with no table behind it |

---

## CDS — views and entities

| Syntax | Meaning |
|---|---|
| `define view entity` | **The modern one. Always use this.** |
| `define view` + `@AbapCatalog.sqlViewName` | Obsolete. Created three objects, two of them useless. |
| `define root view entity` | The top of a RAP business object tree |
| `... as projection on ...` | A window onto another entity — the projection layer |
| `define custom entity` | No table behind it; an ABAP class supplies the rows |
| `define table function` | Data comes from an AMDP method |
| `extend view entity X with { }` | Add fields without editing someone else's source |
| `composition [0..*] of Y as _Child` | Child that **cannot exist alone** — makes one business object |
| `association to parent X as _Parent` | The child's pointer back up. Every child needs one. |
| `association [1] to Z as _Z on ...` | Lazy join to an **independent** object |
| `$projection.Field` | A field of the view you are currently writing |
| `virtual Field : type` | Never stored — calculated at read time |

### Annotations you will meet constantly

| Annotation | Meaning |
|---|---|
| `@AccessControl.authorizationCheck: #NOT_REQUIRED` | Skip the DCL check. **Training only.** |
| `@EndUserText.label` | Human-readable description |
| `@Metadata.ignorePropagatedAnnotations` | `true` = start with a clean annotation slate |
| `@Metadata.allowExtensions: true` | Allow an MDE file to attach `@UI` annotations here |
| `@AbapCatalog.viewEnhancementCategory: [#NONE]` | Closed to extension. `[#PROJECTION_LIST]` = fields may be added |
| `@VDM.viewType` | `#BASIC` / `#COMPOSITE` / `#CONSUMPTION` |
| `@ObjectModel.usageType` | `serviceQuality`, `sizeCategory`, `dataClass` |
| `@ObjectModel.text.element: ['Name']` | The readable name for this code lives in that field |
| `@Consumption.valueHelpDefinition` | Attach an F4 dropdown |
| `@Semantics.amount.currencyCode: 'CurrencyCode'` | This number is money; that field holds its currency |
| `@Semantics.quantity.unitOfMeasure` | This number is a quantity; that field holds its unit |
| `@Semantics.largeObject` | Binary field is a file — renders an upload control |
| `@Semantics.mimeType: true` | This field holds the file type |
| `@ObjectModel.virtualElementCalculatedBy: 'ABAP:ZCL_…'` | Class that computes a virtual element |
| `@ObjectModel.query.implementedBy: 'ABAP:ZCL_…'` | Class that supplies rows for a custom entity |

---

## Analytics and code push-down

```text
Interface view  →  Cube (@Analytics.dataCategory: #CUBE)  →  Query (@Analytics.query: true)
```

| Item | Syntax |
|---|---|
| Cube | `@Analytics.dataCategory: #CUBE` |
| Query | `@Analytics.query: true` |
| Axis | `@AnalyticsDetails.query.axis: #ROWS / #COLUMNS / #FREE` |
| Aggregation | `@DefaultAggregation: #SUM` |
| AMDP marker | `INTERFACES if_amdp_marker_hdb` |
| AMDP method | `CLASS-METHODS m AMDP OPTIONS CLIENT INDEPENDENT ...` |
| AMDP body | `BY DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT` |
| Table function | `define table function ZAM_AB_TF ... implemented by method zcl=>m` |
| Client-safe TF | `@ClientHandling.type: #CLIENT_DEPENDENT` + `@ClientHandling.clientSafe: true` |
| TF client param | `with parameters @Environment.systemField: #CLIENT p_clnt : abap.clnt` |

**An AMDP cannot be selected from.** Only a table function can. That wrapper is the whole point.

---

## Behavior Definition (BDEF)

```abap
managed implementation in class zbp_am_ab_travel unique;
strict ( 2 );
with draft;
```

| Line | Meaning |
|---|---|
| `managed implementation in class … unique` | RAP writes the database statements |
| `unmanaged implementation in class … unique` | **You** write create/update/delete/read/lock/save |
| `projection;` | This BDEF is a projection — it can only `use` what the interface allows |
| `strict ( 2 );` | Strictest syntax checks. Always switch it on. |
| `with draft;` | Enable draft (auto-save) |
| `draft table zam_ab_travel_d;` | The shadow table. **Generate with `Ctrl+1`, then ACTIVATE it.** |
| `total etag LastChangedAt;` | Change-detection stamp — required for draft |
| `lock master` / `lock dependent by _Travel` | Root owns the lock; children borrow it |
| `authorization master ( instance )` | This entity decides permissions, per record, in code |
| `early numbering;` | Key assigned as the user starts creating |
| `field ( numbering : managed ) TravelId;` | The system owns this field |
| `field ( readonly ) TotalPrice;` | Look, don't type |
| `field ( mandatory ) AgencyId;` | Must be filled before saving |
| `mapping for zam_ab_travel { TravelId = travel_id; }` | CDS name ↔ column name translation |
| `update ( features : instance );` | Enable/disable per record, in `get_instance_features` |
| `create ( precheck );` | Check before the data enters RAP's buffer |
| `association _Booking { create; }` | Child link — may the app create children? |

### Actions, determinations, validations

| Syntax | Meaning |
|---|---|
| `action set_booked_status result [1] $self;` | A button |
| `factory action copyTravel [1];` | An action that **creates** instances |
| `internal action reCalcTotalPrice;` | No button — only ABAP can call it |
| `action ( features : instance ) acceptTravel result [1] $self;` | Button that enables itself per record |
| `determination calc on modify { field BookingFee; }` | Auto-changes data while the user types |
| `determination calc on save { … }` | Auto-changes data once, at save |
| `validation check on save { create; field AgencyId; }` | Gatekeeper — accept or refuse only |
| `side effects { field BookingFee affects field TotalPrice; }` | Re-read B from the server when A changes |

### Projection BDEF

```abap
projection;
strict ( 2 );
use draft;
define behavior for ZAM_AB_TRAVEL_PROCESSOR alias Travel
{
  use create ( augment );
  use update;
  use delete;
  use action Prepare; use action Edit; use action Resume;
  use action Activate; use action Discard;
  use action copyTravel;
  use association _Booking { create; with draft; }
}
```

An action or child that is not `use`d here **never appears in the app**, even if it exists in the model.

---

## Metadata Extension (MDE) — the whole UI

```cds
@Metadata.layer: #CUSTOMER
annotate entity ZAM_AB_TRAVEL_PROCESSOR with { ... }
```

`#CUSTOMER` beats `#CORE`. If an annotation seems ignored, check which layer it is in.

| Annotation | Where it puts the field |
|---|---|
| `@UI.lineItem: [{ position: 10 }]` | A **column in the list** |
| `@UI.selectionField: [{ position: 10 }]` | The **filter bar** |
| `@UI.identification: [{ position: 10 }]` | The **object page** (detail screen) |
| `@UI.fieldGroup: [{ position: 10, qualifier: 'x' }]` | A named group of fields |
| `@UI.dataPoint: { qualifier: 'x', title: '…' }` | One highlighted value / KPI |
| `@UI.headerInfo: { typeName, typeNamePlural, title, description }` | The object page title area |

### Facets — the layout plan

| `type:` | What it renders |
|---|---|
| `#IDENTIFICATION_REFERENCE` | A block of `@UI.identification` fields |
| `#FIELDGROUP_REFERENCE` + `targetQualifier: 'x'` | A field group (qualifier must match) |
| `#LINEITEM_REFERENCE` + `targetElement: '_Booking'` | A **table of the child entity** |
| `#DATAPOINT_REFERENCE` + `purpose: #HEADER` | A KPI in the header |
| `#COLLECTION` + children using `parentId` | A container grouping other facets |

### Buttons and colour

| Item | Syntax |
|---|---|
| Button | `@UI.lineItem: [{ type: #FOR_ACTION, dataAction: 'copyTravel', label: 'Copy' }]` |
| Criticality | `0` neutral · `1` red · `2` yellow · `3` green |
| Icon | `criticality: '<field>'` + `criticalityRepresentation: #WITH_ICON` |

**Leave gaps in `position` (10, 20, 30)** so you can insert fields later without renumbering everything.

---

## Service definition and binding

```cds
@EndUserText.label: 'Travel processor Service definition'
define service ZAM_AB_SD_TRAVEL_PROCESSOR {
  expose ZAM_AB_TRAVEL_PROCESSOR as Travel;
}
```

- The **definition** is the guest list. The **binding** is the door, and it creates the URL.
- Same definition can be bound as **OData V2 – UI** and **OData V4 – UI** at the same time.
- V4 is required for modern Fiori Elements templates.

---

## EML — driving a RAP BO from ABAP

```abap
READ ENTITIES OF ZAM_AB_TRAVEL
  ENTITY Travel
  FIELDS ( TravelId AgencyId )
  WITH VALUE #( ( TravelId = '00000010' ) )
  RESULT DATA(lt_result)
  FAILED DATA(lt_failed)
  REPORTED DATA(lt_messages).
```

| Statement | Meaning |
|---|---|
| `READ ENTITIES OF … ENTITY … FIELDS ( … ) WITH …` | Read. Always a **mass** operation. |
| `MODIFY ENTITIES OF … ENTITY … CREATE / UPDATE / DELETE` | Write, through the BO so all rules run |
| `COMMIT ENTITIES` | **This is what actually saves.** Forget it and changes vanish. |
| `IN LOCAL MODE` | Skip auth/feature checks — correct inside a behavior implementation |

Never write to the underlying table directly. Go through EML or your rules do not run.

---

## Handler method internals

| Symbol | Meaning |
|---|---|
| `%tky` | Transactional key — full key + draft flag. Match records on this. |
| `%cid` | Content ID — temporary label for a record with no key yet |
| `%control` | One flag per field: "I really did supply this" |
| `%features` | What you fill in `get_instance_features` |
| `%msg` | The message object attached to a `reported` entry |
| `failed-<alias>` | Records that could **not** be processed |
| `reported-<alias>` | Messages to show the user |
| `if_abap_behv=>fc-o-enabled / -disabled` | Feature control for **operations and actions** |
| `if_abap_behv=>fc-f-read_only / -mandatory` | Feature control for **fields** |
| `if_abap_behv=>auth-allowed / -unauthorized` | Authorisation results |

### The methods RAP calls

| Method | When |
|---|---|
| `earlynumbering_create` | Hand out keys at the start of a create — fill `%key` for every record |
| `get_instance_features` | Per record, before drawing the screen: what should be enabled? |
| `get_instance_authorizations` | Per record: may this user touch **this** row? |
| `get_global_authorizations` | The cheaper question: may this user create at all? |
| `precheck_create` / `precheck_update` | Before data enters the buffer |
| `save_modified` | Unmanaged RAP: buffer becomes database rows |

### Base classes

| Class | Purpose |
|---|---|
| `cl_abap_behavior_handler` | Every RAP handler inherits from this |
| `cl_abap_behavior_saver` | The saver class (unmanaged RAP) |
| `if_oo_adt_classrun` | Gives your class a Run button (`F9`) and `out->write( )` |
| `if_amdp_marker_hdb` | Marker: this class contains HANA SQLScript |
| `if_rap_query_provider` | One method, `select` — your class becomes the database |
| `if_sadl_exit_calc_element_read` | Calculate virtual elements at read time |

---

## External OData consumption (Day 16)

| Step | Syntax |
|---|---|
| Get metadata | `https://sapes5.sapdevcenter.com/sap/opu/odata/sap/ZAGENCYCDS_SRV/$metadata` |
| Save it | `Ctrl+S` as `$metadata.xml`, then create a **Service Consumption Model** in ADT |
| Destination | `cl_http_destination_provider=>create_by_url( )` |
| HTTP client | `cl_web_http_client_manager=>create_by_http_destination( )` |
| Proxy | `/iwbep/cl_cp_factory_remote=>create_v2_remote_proxy( )` |
| Paging | `io_request->get_paging( )->get_page_size( )` / `->get_offset( )` |
| Requested fields | `io_request->get_requested_elements( )` |
| Row count back | `io_response->set_total_number_of_records( )` |
| Value-control field | `rap_cp_odata_value_control` — was the field actually sent? |

Honour paging. The UI asks for 30 rows; do not fetch a million.

---

## BAS, deployment and launchpad

| Task | How |
|---|---|
| Dev Space | BTP cockpit → Business Application Studio → Create Dev Space → type **SAP Fiori** |
| CF login | `cf login -a https://api.cf.<region>.hana.ondemand.com --sso` |
| New Fiori app | `Ctrl+Shift+P` → **Fiori: Open Application Generator** → List Report Object Page (V4) |
| Visual editing | Application Info → Page Map / Page Editor |
| Deploy config | `Ctrl+Shift+P` → **Fiori: Add Deployment Configuration** → managed approuter |
| Build | `mbt build` |
| Deploy | `cf deploy mta_archives/<file>.mtar` |

### Work Zone publishing order

```text
Channel Manager scan  →  Content Explorer  →  Catalog  →  Group  →  Role  →  assign to Site
```

Tile missing? Re-scan in Channel Manager, then check the app is in a catalog **and** a group **and** the role is assigned to the site. It is almost always the role.

### Identity and users

| Item | Meaning |
|---|---|
| Default IdP | For **developers** |
| Custom IdP (CIS) | For **business users** |
| Trust configuration | Security → Trust Configuration → New Trust Configuration |
| Test as a user | Always in an **incognito window** |

---

## Git, CI/CD and transport

```bash
cd <your project>
git init
git add .
git commit -m "my first stable version"
```

| Item | Meaning |
|---|---|
| CI/CD | A robot that builds, tests and deploys on every commit |
| Webhook | Git's doorbell — it wakes the pipeline up |
| CTMS | Cloud Transport Management — moves the **same built artefact** DEV → QLT → PROD |
| Node | A transport destination (QLT, PROD) |
| Route | An allowed arrow between nodes — stops DEV → PROD shortcuts |
| Space | A Cloud Foundry compartment. Separate QLT and PROD spaces. |
| Roles needed | `TransportOperator`, `TransportManager`, `CICD Service Administrator` |
| Deploy URL | `https://deploy-service.cf.<region>.hana.ondemand.com/slprot/<space-guid>/slp` |

Keep a notepad file — Day 15 alone generates a service key, two space GUIDs, a webhook secret and an API endpoint.

---

## Clean core

| Approach | Where the extension lives | Upgrade risk |
|---|---|---|
| **Modify** SAP standard | Inside SAP's own code | 🚫 Never do this |
| **In-app extension** | Inside S/4HANA | Tied to the S/4 upgrade cycle |
| **Side-by-side extension** | In BTP, via a destination + released API | Independent lifecycle — the goal |

Extend (`extend view entity`) or build beside. Never modify.

---

## The mistakes people actually make

| Symptom | Cause |
|---|---|
| Empty data preview | You never ran the data generator class |
| Object "does not exist" | You forgot `Ctrl+F3` to activate |
| Annotation ignored | Wrong `@Metadata.layer` — `#CUSTOMER` beats `#CORE` |
| Button does not appear | Missing `use action <name>;` in the **projection** BDEF |
| Runtime dump after enabling draft | A generated **draft table was never activated** |
| Child activation error on Day 6 | Create children with compositions commented out, then uncomment and re-activate |
| Changes silently vanish | Missing `COMMIT ENTITIES` |
| Logic never runs | Wrong hook — determinations change data, validations only refuse |
| UI behaves randomly | `get_instance_features` did not fill `result` for every key |
| Stale value on screen | Missing `side effects` declaration |
| Launchpad tile missing | Role not assigned to the site |
| URL 404 in Day 14–15 | Wrong region code — copy yours from the cockpit, not the screenshot |

---

[🏠 Summary](00_SUMMARY.md) | [▶️ Day 1](Day01_Setup_BTP_ABAP_Environment_Eclipse.md)
