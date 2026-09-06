# Day 19 - Finishing Attachments, RAP Generator and Clean Core

> **Wiring the attachment UI, the RAP Generator, and a side-by-side extension app on BTP**

> Phase F - Advanced RAP (Days 16-19) - Unmanaged RAP, external services, approver flow, attachments, clean core.

**🎯 Goal of the day.** Finish the attachment feature end to end, then meet the two things that make you fast: the RAP Generator and clean-core side-by-side extensions.

---

## 📋 Cheat Sheet - keep this open

### Today's quick reference

| Thing | Value / Syntax |
|---|---|
| **Attachment recipe** | table -> interface entity -> BDEF (+ draft table) -> projection -> MDE -> service definition |
| **MDE layers** | `#CORE` (SAP/base) < `#CUSTOMER` (yours). Higher layer wins. |
| **Child section** | facet `type: #LINEITEM_REFERENCE`, `targetElement: '_Attachment'` |
| **Projection BDEF** | `use association _Attachment { create; with draft; }` |
| `Destination` | BTP cockpit > Connectivity > Destinations > New Destination |
| **S/4 demo used here** | `http://stsrvr.mynetgear.com:8021`, client `800` |
| **Clean core** | extend or build beside - **never modify** SAP standard |

### Eclipse / ADT keys you will use constantly

| Key | Action |
|---|---|
| `Ctrl+Shift+A` | Search any object in the whole system |
| `Ctrl+F3` | Activate the current object |
| `Ctrl+1` | Quick fix - RAP generates code skeletons for you |
| `Ctrl+Space` | Code completion |
| `Ctrl+Click` | Navigate to the object under the cursor |
| `Ctrl+7` | Comment / uncomment a block |
| `F2` | Show a method signature |
| `F8` | Data preview (table / CDS entity) |
| `F9` | Run the class |

### The RAP layer cake (memorise this)

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

---

## 🧱 What you will build today

- The **processor projection BDEF** including the Attachment entity.
- The **Attachment MDE** and the enhanced **Travel MDE** with an Attachments section.
- An enhanced **service definition** exposing Attachments.
- An enhanced **admin data structure** and adjusted table.
- A **destination** to an S/4HANA system and a first **side-by-side extension app** in BTP.

## 🧠 Concepts first, in plain English

Read this before touching the keyboard. Every idea is explained the way you would explain it to a school student.

**Putting it together**

Attachments needed six pieces: table, interface entity, BDEF, projection, MDE, service definition. Every RAP feature follows this same shape - once you see it, new features become mechanical.

**RAP Generator**

A tool that scaffolds a whole managed BO - CDS, BDEF, projections, service definition, binding - from one JSON config file. What took you Days 6-8 by hand takes it seconds. Learn it by hand first; *then* let the generator do it.

**Clean core**

The rule that you never modify SAP standard code. Extend it (Day 4's `extend view entity`), or better, build **beside** it. Then SAP upgrades cannot break you.

**Side-by-side extension**

Your app runs in BTP, not inside S/4HANA. It reads and writes S/4 data through released APIs. Own lifecycle, own release cycle, zero upgrade risk.

**In-app vs side-by-side**

**In-app**: extension lives inside S/4 (fast, but tied to the S/4 upgrade). **Side-by-side**: extension lives in BTP (independent, scalable, needs a destination and a released API).

**Destination**

The named, credentialed connection from BTP to the S/4HANA system. All side-by-side extensions start here.

**Released API**

An API SAP contractually promises not to break. Building on released objects only is what makes clean core actually work.

---

## 🛠️ Hands-on, step by step

### Step 1. Working with attachment functionality

### Step 2. Enhance the BDEF for processor projection

**📄 Behavior Definition - projection (BDEF)** - copy the block below exactly as it is:

```abap
projection;
strict ( 2 );
use draft;
define behavior for ZAM_AB_TRAVEL_PROCESSOR alias Travel
//create a new class for processor implementation
implementation in class zbp_AM_AB_travel_proc unique
{
 use create ( augment );
 use update;
 use delete;
 use action Prepare;
 use action Edit;
 use action Resume;
 use action Activate;
 use action Discard;
 use action copyTravel;
 use association _Booking { create; with draft; }
 use association _Attachment { create; with draft; }
}
define behavior for ZAM_AB_BOOKING_PROCESSOR alias Booking
{
 use update;
 use delete;
 use association _Travel;
 use association _BookingSuppl { create; with draft;}
}
define behavior for ZAM_AB_BOOKSUPPL_PROCESSOR alias BookSuppl
{
 use update;
 use delete;
 use association _Travel;
 use association _Booking;
}
define behavior for ZAM_AB_ATTACH_PROCESSOR alias Attachments
{
 use update;
 use delete;
 use association _Travel;
}
```

<details>
<summary>💡 What the important lines mean (click to open)</summary>

| Line / keyword | What it does |
|---|---|
| `association to` | A reusable, lazily-evaluated relationship. Cheaper than a JOIN because it only runs when used. |
| `projection;` | This BDEF describes a **projection** layer. It can only re-publish (`use`) what the interface BDEF already allows. |
| `strict ( 2 );` | Turns on the strictest syntax checks. It refuses code that would break in a future release - always switch it on. |
| `with draft;` | Switches on the draft (auto-save) mechanism for this entity. |
| `use create ( augment )` | Projection-only: lets you fill projection fields that the underlying model does not have. |
| `use draft;` | Re-publishes the draft mechanism in the projection so the app gets Edit / Save / Cancel. |
| `use action <Name>` | Re-publishes an action in the projection. Without this line the button never appears, even if the action exists. |
| `use association _Child { create; with draft; }` | Re-publishes a child in the projection and says whether the app may create children and whether they take part in the draft. |
| `define behavior for <Entity> alias <Alias>` | Opens the rulebook for one entity. The `alias` is the short name you use everywhere else in the BDEF. |

</details>

### Step 3. Create MDE file for attachment

**📄 Metadata Extension (MDE)** - copy the block below exactly as it is:

```cds
@Metadata.layer: #CORE
@UI.headerInfo:{
   typeName: 'Attachment',
   typeNamePlural: 'Attachments',
   title: { value: 'Id' },
   description: { value: 'Memo' }
}
annotate view ZAM_AB_ATTACH_PROCESSOR
   with
{
   @UI.facet: [
               {
                   purpose: #STANDARD,
                   type: #IDENTIFICATION_REFERENCE,
                   label: 'Attachment Info',
                   position: 10
                }
   ]
   @UI.lineItem: [{ position: 10 }]
   @UI.identification: [{ position: 10 }]
   Id;
   @UI.lineItem: [{ position: 20 }]
   @UI.identification: [{ position: 20 }]
   Memo;
   @UI.lineItem: [{ position: 30 }]
   @UI.identification: [{ position: 30 }]
   Attachment;
   @UI.lineItem: [{ position: 40 }]
   @UI.identification: [{ position: 40 }]
   Filename;
   @UI.lineItem: [{ position: 50 }]
   @UI.identification: [{ position: 50 }]
   Filetype;
   @UI.identification: [{ position: 60 }]
   LocalCreatedAt;
   @UI.identification: [{ position: 70 }]
   LocalCreatedBy;
  
}
```

<details>
<summary>💡 What the important lines mean (click to open)</summary>

| Line / keyword | What it does |
|---|---|
| `@Metadata.layer: #CUSTOMER` | Which annotation layer this MDE belongs to. `#CUSTOMER` overrides `#CORE`, so the higher layer wins. |
| `@UI.headerInfo` | The object page's title area: what to call one record, many records, and which fields become the title and subtitle. |
| `@UI.facet` | The **layout plan** of the object page. Each facet is a section: `#IDENTIFICATION_REFERENCE` = a field block, `#LINEITEM_REFERENCE` = a child table, `#FIELDGROUP_REFERENCE` = a group of fields, `#COLLECTION` = a container for other facets. |
| `@UI.lineItem` | 'Show this field as a **column in the list**.' `position` decides the order; leave gaps (10, 20, 30) so you can insert later. |
| `@UI.identification` | 'Show this field on the **object page** (detail screen).' |
| `annotate view <X> with { ... }` | Same as `annotate entity`, for the older CDS View flavour. |

</details>

### Step 4. Travel MDE enhancement

**📄 Metadata Extension (MDE)** - copy the block below exactly as it is:

```cds
@Metadata.layer: #CUSTOMER
@UI.headerInfo:{
   typeName: 'Travel',
   typeNamePlural: 'Travel Requests'  ,
   title: { value: 'TravelId' },
   description: { value: 'Description' } 
}
annotate entity ZAM_AB_TRAVEL_PROCESSOR
   with
{
   --Second screen ( applies only and only on Object Page )
   @UI.facet: [
       {
           purpose: #STANDARD,
           type: #COLLECTION,
           id: 'spiderman',
           label: 'General Information',
           position: 10
       },
       {
           id: 'TravelBasic',
           purpose: #STANDARD,
           type: #IDENTIFICATION_REFERENCE,
           parentId: 'spiderman',
           position: 10,
           label: 'More Info'
       },
       {
           id: 'TravelDates',
           type: #FIELDGROUP_REFERENCE,
           purpose: #STANDARD,
           parentId: 'spiderman',
           label: 'Dates',
           position: 30,
           targetQualifier: 'superman'       
       },
       {
           id: 'Pricing',
           type: #FIELDGROUP_REFERENCE,
           purpose: #STANDARD,
           parentId: 'spiderman',
           label: 'Pricing',
           position: 20,
           targetQualifier: 'wonderwomen'       
       },
       {
           id: 'TotalPrice',
           purpose: #HEADER,
           type: #DATAPOINT_REFERENCE,
           position: 10,
           targetQualifier: 'MyTravelCost'
       },
       {
           id: 'TravelStatus',
           purpose: #HEADER,
           type: #DATAPOINT_REFERENCE,
           position: 20,
           targetQualifier: 'MyTravelStatus'
       },
       {
           id: 'bookingDetails',
           label: 'Bookings',
           purpose: #STANDARD,
           type: #LINEITEM_REFERENCE,
           targetElement: '_Booking',
           position: 20
       },
       {
           id: 'attachmentDetails',
           label: 'Attachments',
           purpose: #STANDARD,
           type: #LINEITEM_REFERENCE,
           targetElement: '_Attachment',
           position: 30
       }
   ]
   @UI.selectionField: [{ position: 10 }]
   @UI.lineItem: [{ position: 10 },
                  { type: #FOR_ACTION, dataAction: 'set_booked_status', label: 'Change Status' }]
   @UI.identification: [{ position: 10 }]
   TravelId;
   @UI.selectionField: [{ position: 20 }]
   @UI.lineItem: [{ position: 20 }]
   @UI.identification: [{ position: 20 }]   
   AgencyId;
   @UI.selectionField: [{ position: 30 }]
   @UI.lineItem: [{ position: 30, importance: #HIGH }]
   @UI.identification: [{ position: 30 }]
   CustomerId;
   @UI.selectionField: [{ position: 40 }]
   @UI.lineItem: [{ position: 40 }]
   @UI.fieldGroup: [{ position: 10, qualifier: 'superman' }]
   BeginDate;
   @UI.fieldGroup: [{ position: 20, qualifier: 'superman' }]
   EndDate;
   @UI.fieldGroup: [{ position: 20, qualifier: 'wonderwomen' }]
   BookingFee;
   @UI.lineItem: [{ position: 50 }]
   @UI.fieldGroup: [{ position: 10, qualifier: 'wonderwomen' }]
   @UI.dataPoint: { qualifier: 'MyTravelCost', title: 'Overall Cost' }
   TotalPrice;
   @UI.fieldGroup: [{ position: 30, qualifier: 'wonderwomen' }]
   CurrencyCode;
   @UI.identification: [{ position: 40 }]
   Description;
   @UI.lineItem: [{ position: 60, criticality: 'IconColor' }]
   @UI.fieldGroup: [{ position: 11, qualifier: 'wonderwomen' }]
   @UI.dataPoint: { qualifier: 'MyTravelStatus', title: 'Overall Status' }
   OverallStatus;
   @UI.lineItem: [{ position: 70, importance: #HIGH }]
   CO2Tax;
   @UI.lineItem: [{ position: 80, importance: #HIGH }]
   dayOfTheFlight;
//    CreatedBy;
//    CreatedAt;
//    LastChangedBy;
//    LastChangedAt;
  
}
```

<details>
<summary>💡 What the important lines mean (click to open)</summary>

| Line / keyword | What it does |
|---|---|
| `@Metadata.layer: #CUSTOMER` | Which annotation layer this MDE belongs to. `#CUSTOMER` overrides `#CORE`, so the higher layer wins. |
| `@UI.headerInfo` | The object page's title area: what to call one record, many records, and which fields become the title and subtitle. |
| `@UI.facet` | The **layout plan** of the object page. Each facet is a section: `#IDENTIFICATION_REFERENCE` = a field block, `#LINEITEM_REFERENCE` = a child table, `#FIELDGROUP_REFERENCE` = a group of fields, `#COLLECTION` = a container for other facets. |
| `@UI.lineItem` | 'Show this field as a **column in the list**.' `position` decides the order; leave gaps (10, 20, 30) so you can insert later. |
| `@UI.identification` | 'Show this field on the **object page** (detail screen).' |
| `@UI.selectionField` | 'Put this field on the **filter bar** at the top of the list.' |
| `@UI.fieldGroup` | Groups fields under one heading. The `qualifier` name must match the `targetQualifier` of a `#FIELDGROUP_REFERENCE` facet. |
| `@UI.dataPoint` | One highlighted value, usually a KPI in the header. `criticality` colours it: 1 red, 2 yellow, 3 green. |
| `@UI.lineItem: [{ type: #FOR_ACTION, dataAction: '...' }]` | Puts a **button** on the screen that calls a RAP action. `dataAction` is the action name; `label` is what the user reads. |

</details>

### Step 5. Enhance Service definition and test our app

**📄 Service Definition** - copy the block below exactly as it is:

```cds
@EndUserText.label: 'Travel processor Service definition'
define service ZAM_AB_SD_TRAVEL_PROCESSOR {
 expose ZAM_AB_TRAVEL_PROCESSOR    as Travel;
 expose ZAM_AB_BOOKING_PROCESSOR   as Booking;
 expose ZAM_AB_BOOKSUPPL_PROCESSOR as BookSupplement;
 expose ZAM_AB_ATTACH_PROCESSOR    as Attachment;
 expose /DMO/I_Agency              as Agency;
 expose /DMO/I_Customer            as Customer;
 expose /DMO/I_Carrier             as Carrier;
 expose /DMO/I_Connection          as Connection;
 expose /DMO/I_Overall_Status_VH   as OverallStatus;
 expose /DMO/I_Booking_Status_VH   as BookingStatus;
}
```

<details>
<summary>💡 What the important lines mean (click to open)</summary>

| Line / keyword | What it does |
|---|---|
| `@EndUserText.label` | The human-readable description shown in tools and on screen. |
| `define service` | The guest list of your OData service: which entities may leave the system, and under which public names. |
| `expose <Entity> as <Name>` | Publishes one entity in the service under a public alias. The alias is what appears in the OData URL. |

</details>

### Step 6. RAP Generator

### Step 7. Enhance the str for admin data

**📄 DDIC Structure** - copy the block below exactly as it is:

```cds
@EndUserText.label : 'Admin data'
@AbapCatalog.enhancement.category : #NOT_EXTENSIBLE
define structure zam_ab_str_admin_data {
 createdby     : abp_creation_user;
 createdat     : abp_creation_tstmpl;
 lastchangedby : abp_locinst_lastchange_user;
 lastchangedat : abp_locinst_lastchange_tstmpl;
}
```

<details>
<summary>💡 What the important lines mean (click to open)</summary>

| Line / keyword | What it does |
|---|---|
| `@AbapCatalog.enhancement.category : #NOT_EXTENSIBLE` | Nobody may bolt extra fields onto this table later. Declaring this is mandatory. |
| `define structure` | A field layout with **no** database table behind it - a shape you reuse inside other objects. |
| `@EndUserText.label` | The human-readable description shown in tools and on screen. |

</details>

### Step 8. Adjust table


![Day 19 - screenshot 1](images/day19_01.png)


![Day 19 - screenshot 2](images/day19_02.png)

![Day 19 - screenshot 3](images/day19_03.png)

![Day 19 - screenshot 4](images/day19_04.png)

![Day 19 - screenshot 5](images/day19_05.png)

### Step 9. Clean Core Extension App Scenario 1 - Side by Side extension app in SAP BTP


![Day 19 - screenshot 6](images/day19_06.png)

Create Destination for ABAP system


![Day 19 - screenshot 7](images/day19_07.png)

![Day 19 - screenshot 8](images/day19_08.png)


![Day 19 - screenshot 9](images/day19_09.png)


![Day 19 - screenshot 10](images/day19_10.png)

Add new S/4HANA connection

🔗 <http://stsrvr.mynetgear.com:8021>

### Step 10. Client: 800


![Day 19 - screenshot 11](images/day19_11.png)

### Step 11. Create First Side by Side Extension App


![Day 19 - screenshot 12](images/day19_12.png)


![Day 19 - screenshot 13](images/day19_13.png)

![Day 19 - screenshot 14](images/day19_14.png)

![Day 19 - screenshot 15](images/day19_15.png)

![Day 19 - screenshot 16](images/day19_16.png)

![Day 19 - screenshot 17](images/day19_17.png)

![Day 19 - screenshot 18](images/day19_18.png)

![Day 19 - screenshot 19](images/day19_19.png)

---

## 📦 Objects in your package after today

```text
$Z_AM_AB  (your package - replace _AB_ with your own initials)
  ├── ZAM_AB_SD_TRAVEL_PROCESSOR          Service definition
  ├── zam_ab_str_admin_data               Structure
```

---

## ✅ Final version of all code from Day 19

Everything below is the **complete, unmodified** source from the training material, gathered in one place so you can copy it straight into Eclipse.

### 1. Enhance the BDEF for processor projection - _Behavior Definition - projection (BDEF)_

```abap
projection;
strict ( 2 );
use draft;
define behavior for ZAM_AB_TRAVEL_PROCESSOR alias Travel
//create a new class for processor implementation
implementation in class zbp_AM_AB_travel_proc unique
{
 use create ( augment );
 use update;
 use delete;
 use action Prepare;
 use action Edit;
 use action Resume;
 use action Activate;
 use action Discard;
 use action copyTravel;
 use association _Booking { create; with draft; }
 use association _Attachment { create; with draft; }
}
define behavior for ZAM_AB_BOOKING_PROCESSOR alias Booking
{
 use update;
 use delete;
 use association _Travel;
 use association _BookingSuppl { create; with draft;}
}
define behavior for ZAM_AB_BOOKSUPPL_PROCESSOR alias BookSuppl
{
 use update;
 use delete;
 use association _Travel;
 use association _Booking;
}
define behavior for ZAM_AB_ATTACH_PROCESSOR alias Attachments
{
 use update;
 use delete;
 use association _Travel;
}
```

### 2. Create MDE file for attachment - _Metadata Extension (MDE)_

```cds
@Metadata.layer: #CORE
@UI.headerInfo:{
   typeName: 'Attachment',
   typeNamePlural: 'Attachments',
   title: { value: 'Id' },
   description: { value: 'Memo' }
}
annotate view ZAM_AB_ATTACH_PROCESSOR
   with
{
   @UI.facet: [
               {
                   purpose: #STANDARD,
                   type: #IDENTIFICATION_REFERENCE,
                   label: 'Attachment Info',
                   position: 10
                }
   ]
   @UI.lineItem: [{ position: 10 }]
   @UI.identification: [{ position: 10 }]
   Id;
   @UI.lineItem: [{ position: 20 }]
   @UI.identification: [{ position: 20 }]
   Memo;
   @UI.lineItem: [{ position: 30 }]
   @UI.identification: [{ position: 30 }]
   Attachment;
   @UI.lineItem: [{ position: 40 }]
   @UI.identification: [{ position: 40 }]
   Filename;
   @UI.lineItem: [{ position: 50 }]
   @UI.identification: [{ position: 50 }]
   Filetype;
   @UI.identification: [{ position: 60 }]
   LocalCreatedAt;
   @UI.identification: [{ position: 70 }]
   LocalCreatedBy;
  
}
```

### 3. Travel MDE enhancement - _Metadata Extension (MDE)_

```cds
@Metadata.layer: #CUSTOMER
@UI.headerInfo:{
   typeName: 'Travel',
   typeNamePlural: 'Travel Requests'  ,
   title: { value: 'TravelId' },
   description: { value: 'Description' } 
}
annotate entity ZAM_AB_TRAVEL_PROCESSOR
   with
{
   --Second screen ( applies only and only on Object Page )
   @UI.facet: [
       {
           purpose: #STANDARD,
           type: #COLLECTION,
           id: 'spiderman',
           label: 'General Information',
           position: 10
       },
       {
           id: 'TravelBasic',
           purpose: #STANDARD,
           type: #IDENTIFICATION_REFERENCE,
           parentId: 'spiderman',
           position: 10,
           label: 'More Info'
       },
       {
           id: 'TravelDates',
           type: #FIELDGROUP_REFERENCE,
           purpose: #STANDARD,
           parentId: 'spiderman',
           label: 'Dates',
           position: 30,
           targetQualifier: 'superman'       
       },
       {
           id: 'Pricing',
           type: #FIELDGROUP_REFERENCE,
           purpose: #STANDARD,
           parentId: 'spiderman',
           label: 'Pricing',
           position: 20,
           targetQualifier: 'wonderwomen'       
       },
       {
           id: 'TotalPrice',
           purpose: #HEADER,
           type: #DATAPOINT_REFERENCE,
           position: 10,
           targetQualifier: 'MyTravelCost'
       },
       {
           id: 'TravelStatus',
           purpose: #HEADER,
           type: #DATAPOINT_REFERENCE,
           position: 20,
           targetQualifier: 'MyTravelStatus'
       },
       {
           id: 'bookingDetails',
           label: 'Bookings',
           purpose: #STANDARD,
           type: #LINEITEM_REFERENCE,
           targetElement: '_Booking',
           position: 20
       },
       {
           id: 'attachmentDetails',
           label: 'Attachments',
           purpose: #STANDARD,
           type: #LINEITEM_REFERENCE,
           targetElement: '_Attachment',
           position: 30
       }
   ]
   @UI.selectionField: [{ position: 10 }]
   @UI.lineItem: [{ position: 10 },
                  { type: #FOR_ACTION, dataAction: 'set_booked_status', label: 'Change Status' }]
   @UI.identification: [{ position: 10 }]
   TravelId;
   @UI.selectionField: [{ position: 20 }]
   @UI.lineItem: [{ position: 20 }]
   @UI.identification: [{ position: 20 }]   
   AgencyId;
   @UI.selectionField: [{ position: 30 }]
   @UI.lineItem: [{ position: 30, importance: #HIGH }]
   @UI.identification: [{ position: 30 }]
   CustomerId;
   @UI.selectionField: [{ position: 40 }]
   @UI.lineItem: [{ position: 40 }]
   @UI.fieldGroup: [{ position: 10, qualifier: 'superman' }]
   BeginDate;
   @UI.fieldGroup: [{ position: 20, qualifier: 'superman' }]
   EndDate;
   @UI.fieldGroup: [{ position: 20, qualifier: 'wonderwomen' }]
   BookingFee;
   @UI.lineItem: [{ position: 50 }]
   @UI.fieldGroup: [{ position: 10, qualifier: 'wonderwomen' }]
   @UI.dataPoint: { qualifier: 'MyTravelCost', title: 'Overall Cost' }
   TotalPrice;
   @UI.fieldGroup: [{ position: 30, qualifier: 'wonderwomen' }]
   CurrencyCode;
   @UI.identification: [{ position: 40 }]
   Description;
   @UI.lineItem: [{ position: 60, criticality: 'IconColor' }]
   @UI.fieldGroup: [{ position: 11, qualifier: 'wonderwomen' }]
   @UI.dataPoint: { qualifier: 'MyTravelStatus', title: 'Overall Status' }
   OverallStatus;
   @UI.lineItem: [{ position: 70, importance: #HIGH }]
   CO2Tax;
   @UI.lineItem: [{ position: 80, importance: #HIGH }]
   dayOfTheFlight;
//    CreatedBy;
//    CreatedAt;
//    LastChangedBy;
//    LastChangedAt;
  
}
```

### 4. Enhance Service definition and test our app - _Service Definition_

```cds
@EndUserText.label: 'Travel processor Service definition'
define service ZAM_AB_SD_TRAVEL_PROCESSOR {
 expose ZAM_AB_TRAVEL_PROCESSOR    as Travel;
 expose ZAM_AB_BOOKING_PROCESSOR   as Booking;
 expose ZAM_AB_BOOKSUPPL_PROCESSOR as BookSupplement;
 expose ZAM_AB_ATTACH_PROCESSOR    as Attachment;
 expose /DMO/I_Agency              as Agency;
 expose /DMO/I_Customer            as Customer;
 expose /DMO/I_Carrier             as Carrier;
 expose /DMO/I_Connection          as Connection;
 expose /DMO/I_Overall_Status_VH   as OverallStatus;
 expose /DMO/I_Booking_Status_VH   as BookingStatus;
}
```

### 5. Enhance the str for admin data - _DDIC Structure_

```cds
@EndUserText.label : 'Admin data'
@AbapCatalog.enhancement.category : #NOT_EXTENSIBLE
define structure zam_ab_str_admin_data {
 createdby     : abp_creation_user;
 createdat     : abp_creation_tstmpl;
 lastchangedby : abp_locinst_lastchange_user;
 lastchangedat : abp_locinst_lastchange_tstmpl;
}
```

---

## ⚠️ Traps and tips

- The S/4HANA host and client in this material are the trainer's demo system. Substitute your own.
- Learn the RAP Generator *after* you can do it by hand. Otherwise you will not know what to fix when it goes wrong.

---

[⬅️ Day 18](Day18_Approver_Scenario_And_Attachments.md) | [🏠 Summary](00_SUMMARY.md) | [📋 Master Cheat Sheet](00_MASTER_CHEAT_SHEET.md) | [Appendix ➡️](20_APPENDIX_Fiori_JS_to_TS.md)
