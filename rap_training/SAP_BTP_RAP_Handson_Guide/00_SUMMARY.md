# SAP BTP ABAP RAP — End-to-End Hands-On Guide

> **19 days, one business application, built from an empty cloud account to a transported, launchpad-published Fiori app.**

This guide is a chapter-by-chapter rewrite of the *Applied Material RAP Training* document into hands-on markdown. Every code snippet is reproduced **exactly** as it appears in the training material — nothing added, nothing corrected, nothing reformatted. All 238 screenshots are preserved and linked at the point in the flow where they belong.

---

## 📋 The one-page cheat sheet

Every chapter opens with its own cheat sheet. There is also a consolidated one covering all 19 days:

👉 **[00_MASTER_CHEAT_SHEET.md](00_MASTER_CHEAT_SHEET.md)**

---

## 🎬 The use case: a Travel Request application

Everything from Day 6 onwards builds **one** application. Understanding the business scenario first makes every annotation and every method make sense.

### The story

An employee wants to travel. They raise a **Travel Request**. A travel request has:

- an **agency** it is booked through, and a **customer** it is for
- a **begin date** and an **end date**
- a **booking fee**, a **total price** and a **currency**
- an **overall status** — Open, Accepted or Rejected

Each travel request contains one or more **Bookings** (the individual flights). Each booking can have **Booking Supplements** (extra baggage, meals, seat selection). A travel request can also carry **Attachments** — the scanned approval, the invoice PDF.

Two different people use the app:

| Role | What they do | Which app they use |
|---|---|---|
| **Processor** | Creates and edits travel requests, adds bookings, uploads attachments | Processor app (Days 6–14) |
| **Approver** | Sees submitted requests and clicks Accept or Reject | Approver app (Day 18) |

### Why that matters technically

Those two apps read the **same** business object. Same tables, same validations, same determinations — but different **projections**, different **behaviour definitions**, different **screen layouts** and different **OData services**.

That single fact is the reason RAP has a projection layer at all, and it is the strongest argument in the whole course. When you reach Day 18 and build the Approver app without touching one line of the Processor's business logic, the layer cake finally clicks.

### The object tree

```text
Travel  (root)                        ZAM_AB_TRAVEL
  │
  ├── _Booking  (0..*)                ZAM_AB_BOOKING
  │      │
  │      └── _BookSuppl  (0..*)       ZAM_AB_BOOKSUPPL
  │
  └── _Attachment  (0..*)             ZAM_AB_M_ATTACH
```

`_Booking` and `_Attachment` are **compositions** — they cannot exist without a Travel. `_Agency`, `_Customer` and `_Currency` are **associations** — they point at data that exists independently.

### A second, parallel scenario

Days 3–5 build a **separate** sales-analytics model (business partners, products, sales orders, a cube, an AMDP and a table function). It exists to teach CDS and code push-down before RAP starts. It is not part of the Travel app — do not look for a connection between them.

Days 16–17 build a **third** model (`ZAM_AB_U_TRAVEL`) that solves the *same* Travel problem the hard way, using **unmanaged** RAP. Its purpose is to show you how much work managed RAP does for you.

---

## 🗺️ The six phases

### Phase A — Foundation · Days 1–2

Get a free cloud ABAP system and learn to drive the tools.

| Day | Chapter | You end up with |
|---|---|---|
| 1 | [Setup: BTP, ABAP Environment, Eclipse](Day01_Setup_BTP_ABAP_Environment_Eclipse.md) | Your own ABAP server in the cloud, Eclipse connected to it |
| 2 | [Eclipse, packages, classes, tables](Day02_Eclipse_Packages_Classes_Tables.md) | A package, your first class, domains, data elements and 5 database objects |

**Phase output:** a working development environment and the tables everything else sits on.

---

### Phase B — Data Modelling · Days 3–5

Learn CDS properly, then learn to push heavy logic down into HANA.

| Day | Chapter | You end up with |
|---|---|---|
| 3 | [Data generator, CDS views and entities](Day03_Data_Generator_CDS_Views_And_Entities.md) | Sample data, one obsolete `define view` (for contrast), four modern CDS entities with associations |
| 4 | [Analytics, AMDP, table functions](Day04_Analytics_AMDP_Table_Functions.md) | A cube, a query view, a view extension, an AMDP class and a table function |
| 5 | [Table function fix and consumption](Day05_Table_Function_Fix_And_Consumption.md) | A client-safe table function consumed inside a normal CDS entity |

**Key idea of the phase:** *code push-down*. Do not drag a million rows into ABAP to add them up — ask the database to add them up and send you the answer.

---

### Phase C — The RAP Business Object · Days 6–8

Model the Travel app and get it on screen.

| Day | Chapter | You end up with |
|---|---|---|
| 6 | [RAP BO and your first Fiori app](Day06_RAP_Business_Object_And_First_Fiori_App.md) | Root + 2 children, 3 projections, service definition, service binding, a working read-only Fiori app |
| 7 | [Fiori UI annotations and drill-down](Day07_Fiori_UI_Annotations_And_Drilldown.md) | Coloured status icons, dynamic status text, a nested bookings table, 3-level drill-down |
| 8 | [Behavior definition, EML, class pool](Day08_Behavior_Definition_EML_Class_Pool.md) | A **writable** app, plus the ability to drive the BO from plain ABAP via EML |

**Key idea of the phase:** you never write UI code. You write annotations, and Fiori Elements builds the screen.

---

### Phase D — Business Logic · Days 9–12

Everything that makes an app behave like a real application.

| Day | Chapter | You end up with |
|---|---|---|
| 9 | [Early numbering and feature control](Day09_Early_Numbering_And_Feature_Control.md) | System-generated IDs, read-only fields, buttons that enable themselves based on data |
| 10 | [Actions, determinations, validations](Day10_Actions_Determinations_Validations.md) | A Copy button, automatic price recalculation, input checks that block bad saves |
| 11 | [OData V4, draft and authorisation](Day11_OData_V4_Draft_And_Authorisation.md) | A V4 service, side effects, full draft (auto-save), per-record authorisation |
| 12 | [Precheck, augment, virtual elements, BAS](Day12_Precheck_Augment_Virtual_Elements_BAS.md) | The last three RAP hooks, plus a Dev Space in Business Application Studio |

**The RAP save sequence — learn this order, it explains almost every "why did my logic not run?" question:**

```text
precheck
   ↓
determinations on modify      (change data as the user types)
   ↓
validations                   (accept or refuse — never change)
   ↓
determinations on save
   ↓
save                          (buffer becomes database rows)
```

---

### Phase E — Fiori and Deployment · Days 12–15

Take the app out of the developer's laptop and put it in front of a business user.

| Day | Chapter | You end up with |
|---|---|---|
| 13 | [Fiori app in BAS, CIS, Work Zone](Day13_Fiori_App_In_BAS_CIS_And_Work_Zone.md) | A generated Fiori Elements project, customised with the Page Editor; an identity provider and a launchpad site |
| 14 | [Deploy and publish to the launchpad](Day14_Deploy_And_Publish_To_Launchpad.md) | The app deployed to the HTML5 repository and clickable as a tile |
| 15 | [CI/CD and transport management](Day15_CICD_And_Transport_Management.md) | A pipeline that builds and ships on every Git commit, through QLT to PROD |

**Key idea of the phase:** the app you *tested* and the app you *ship* must be the same artefact. That is what CTMS guarantees.

---

### Phase F — Advanced RAP · Days 16–19

The hard cases, and the habits that keep you upgrade-safe.

| Day | Chapter | You end up with |
|---|---|---|
| 16 | [Custom entities and unmanaged RAP](Day16_Custom_Entities_And_Unmanaged_RAP.md) | Data from an **external** OData service shown in your app; the start of an unmanaged BO |
| 17 | [Unmanaged RAP complete](Day17_Unmanaged_RAP_Complete.md) | Every database operation written by hand — and a healthy respect for managed RAP |
| 18 | [Approver scenario and attachments](Day18_Approver_Scenario_And_Attachments.md) | A **second app on the same model**, plus file upload |
| 19 | [Attachments, RAP Generator, clean core](Day19_Attachments_RAP_Generator_Clean_Core.md) | Attachments finished end to end; the RAP Generator; a side-by-side extension app |

**Key idea of the phase:** never modify SAP standard code. Extend it, or build beside it.

---

## 📦 What lives in your package at the end

Replace `_AB_` with your own initials throughout — that is the trainer's instruction from Day 2, and it keeps your objects from clashing with a classmate's.

```text
$Z_AM_AB
│
├── Days 2–5 · sales analytics learning model
│   ├── zam_ab_bpa                      Database table   (business partners)
│   ├── zam_ab_product                  Database table   (product master)
│   ├── zam_ab_so_hdr                   Database table   (sales order header)
│   ├── zam_ab_so_item                  Database table   (sales order items)
│   ├── zam_ab_str_admin_data           Structure        (created/changed by + on)
│   ├── zam_ab_str_product_mrp          Structure        (for the AMDP result)
│   ├── zcl_am_ab_first_class           ABAP class       (hello world, F9)
│   ├── zcl_am_ab_data_builder          ABAP class       (fills the tables)
│   ├── zcl_am_ab_amdp                  ABAP class       (SQLScript / push-down)
│   ├── ZAM_AB_CDS_VIEW                 CDS view         (obsolete — for contrast only)
│   ├── ZI_AM_AB_BPA                    CDS entity       (interface layer)
│   ├── ZI_AM_AB_PRODUCT                CDS entity
│   ├── ZI_AM_AB_SALES                  CDS entity
│   ├── ZI_CO_AM_AB_SALES_CUBE          CDS entity       (cube)
│   ├── ZC_AM_AB_SALES_DB               CDS entity       (analytics query)
│   ├── ZC_AM_AB_SALES_RANK             CDS entity       (joins the table function)
│   └── ZAM_AB_TF                       Table function
│
├── Days 6–14 · the Travel app — MANAGED RAP
│   ├── ZAM_AB_TRAVEL                   CDS root entity  ← interface layer
│   ├── ZAM_AB_BOOKING                  CDS entity
│   ├── ZAM_AB_BOOKSUPPL                CDS entity
│   ├── ZAM_AB_TRAVEL_PROCESSOR         CDS root entity  ← projection layer
│   ├── ZAM_AB_BOOKING_PROCESSOR        CDS entity
│   ├── ZAM_AB_BOOKSUPPL_PROCESSOR      CDS entity
│   ├── ZAM_AB_SD_TRAVEL_PROCESSOR      Service definition
│   ├── zbp_am_ab_travel                Behavior implementation
│   ├── zbp_AM_AB_travel_proc           Behavior implementation (projection)
│   ├── zcl_AM_AB_eml                   ABAP class       (drives the BO from code)
│   ├── zcl_am_ab_ve_calc               ABAP class       (virtual elements)
│   └── zcl_am_ab_mission_mars          ABAP class       (class pool demo)
│
├── Days 16–17 · the same problem — UNMANAGED RAP
│   ├── ZAM_AB_U_TRAVEL                 CDS root entity
│   ├── ZAM_AB_U_AGENCY                 CDS entity
│   ├── ZAM_AB_U_CUSTOMER               CDS entity
│   ├── ZAM_AB_U_SD                     Service definition
│   ├── zbp_am_ab_u_travel              Behavior implementation (you write everything)
│   ├── ZCAM_AB_AGENCY_ES5              Custom entity    (no table — remote data)
│   └── zcl_am_ab_agency                ABAP class       (if_rap_query_provider)
│
└── Days 18–19 · the Approver app + attachments
    ├── ZAM_AB_TRAVEL_APPROVER          CDS root entity  ← second app, same model
    ├── ZAM_AB_BOOKING_approver         CDS entity
    ├── ZAM_AB_SD_TRAVEL_APPROVER       Service definition
    ├── zam_ab_attach                   Database table   (attachments)
    ├── ZAM_AB_M_ATTACH                 CDS entity
    └── ZAM_AB_ATTACH_PROCESSOR         CDS entity       (projection)
```

Behaviour definitions (`.bdef`), metadata extensions (`.mde`) and draft tables are not listed separately — each one sits beside the entity it belongs to.

---

## 🧭 How to work through this guide

1. **Read the cheat sheet at the top of the chapter.** It is there so you can glance back without scrolling.
2. **Read the concepts section before you touch the keyboard.** Every idea is explained in plain language first.
3. **Work the steps in order.** Each step shows what to click (screenshot) and what to type (code block).
4. **Open the 💡 collapsible under each snippet.** It explains the lines that matter, one at a time.
5. **When something breaks, use the final-code section at the bottom of the chapter** and diff it against what you typed.
6. **Check the traps section** — it lists the mistakes people actually make on that day.

### Rules that hold on every single day

- **Replace `_AB_` with your own initials** in every object name.
- **Activate everything** — `Ctrl+F3`. An unactivated object does not exist.
- **Use quick fix** — `Ctrl+1` on a red marker. Let RAP generate method skeletons; never type them by hand.
- **`#NOT_REQUIRED` on `@AccessControl.authorizationCheck` is a training shortcut.** Never ship it.

---

## 📄 A note on the code in this guide

Every snippet is reproduced **byte for byte** from the training document — including the trainer's own comments, spacing, and quirks such as the `superman` / `wonderwomen` / `spiderman` field-group qualifiers. Nothing was tidied up, so what you copy is exactly what was demonstrated in the session.

Two consequences worth knowing:

- The demo systems, hostnames, clients, email addresses and region codes (`us10-001`) belong to the trainer's environment. Substitute your own.
- Day 14's git command was typed in Word and picked up curly quotes: `git commit -m “my first stable version”`. Copied straight into a terminal it will not run — retype the quotes as plain `"`. Left as-is here because the rule was not to alter the source.

---

## ⚠️ On JavaScript → TypeScript conversion

The training material does **not** cover JS→TS conversion, and contains no JavaScript or TypeScript at all. The Fiori side of this course is entirely annotation-driven Fiori Elements (`@UI.*` in metadata extension files) plus visual customising in the BAS Page Editor — which is precisely the point being taught: **you get a full app without writing UI code.**

Because none of it came from your document, that topic lives in a clearly separated file:

👉 **[20_APPENDIX_Fiori_JS_to_TS.md](20_APPENDIX_Fiori_JS_to_TS.md)** — reference material *added by the guide author*, not part of the original training.

---

[📋 Master Cheat Sheet](00_MASTER_CHEAT_SHEET.md) | [▶️ Start with Day 1](Day01_Setup_BTP_ABAP_Environment_Eclipse.md)
