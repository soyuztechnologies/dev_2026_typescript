# SAP BTP ABAP RAP — Hands-On Guide

A 19-day, end-to-end hands-on guide built from the *Applied Material RAP Training* document. Every code snippet is reproduced **exactly** as written in the source. All 238 screenshots are preserved.

**👉 Start here: [00_SUMMARY.md](00_SUMMARY.md)** — the use case, the six phases, and how to work through the guide.

**📋 [00_MASTER_CHEAT_SHEET.md](00_MASTER_CHEAT_SHEET.md)** — everything from all 19 days on one page.

---

## Chapters

| Phase | Day | Chapter |
|---|---|---|
| **A · Foundation** | 1 | [Setup: BTP, ABAP Environment, Eclipse](Day01_Setup_BTP_ABAP_Environment_Eclipse.md) |
| | 2 | [Eclipse, packages, classes, tables](Day02_Eclipse_Packages_Classes_Tables.md) |
| **B · Data Modelling** | 3 | [Data generator, CDS views and entities](Day03_Data_Generator_CDS_Views_And_Entities.md) |
| | 4 | [Analytics, AMDP, table functions](Day04_Analytics_AMDP_Table_Functions.md) |
| | 5 | [Table function fix and consumption](Day05_Table_Function_Fix_And_Consumption.md) |
| **C · RAP Business Object** | 6 | [RAP BO and your first Fiori app](Day06_RAP_Business_Object_And_First_Fiori_App.md) |
| | 7 | [Fiori UI annotations and drill-down](Day07_Fiori_UI_Annotations_And_Drilldown.md) |
| | 8 | [Behavior definition, EML, class pool](Day08_Behavior_Definition_EML_Class_Pool.md) |
| **D · Business Logic** | 9 | [Early numbering and feature control](Day09_Early_Numbering_And_Feature_Control.md) |
| | 10 | [Actions, determinations, validations](Day10_Actions_Determinations_Validations.md) |
| | 11 | [OData V4, draft and authorisation](Day11_OData_V4_Draft_And_Authorisation.md) |
| | 12 | [Precheck, augment, virtual elements, BAS](Day12_Precheck_Augment_Virtual_Elements_BAS.md) |
| **E · Fiori & Deployment** | 13 | [Fiori app in BAS, CIS, Work Zone](Day13_Fiori_App_In_BAS_CIS_And_Work_Zone.md) |
| | 14 | [Deploy and publish to the launchpad](Day14_Deploy_And_Publish_To_Launchpad.md) |
| | 15 | [CI/CD and transport management](Day15_CICD_And_Transport_Management.md) |
| **F · Advanced RAP** | 16 | [Custom entities and unmanaged RAP](Day16_Custom_Entities_And_Unmanaged_RAP.md) |
| | 17 | [Unmanaged RAP complete](Day17_Unmanaged_RAP_Complete.md) |
| | 18 | [Approver scenario and attachments](Day18_Approver_Scenario_And_Attachments.md) |
| | 19 | [Attachments, RAP Generator, clean core](Day19_Attachments_RAP_Generator_Clean_Core.md) |
| **Appendix** | — | [Fiori: JavaScript → TypeScript](20_APPENDIX_Fiori_JS_to_TS.md) *(added by the guide author — not from the training material)* |

---

## Structure of every chapter

1. **📋 Cheat sheet** — first thing on the page, so you can glance back without scrolling
2. **🧱 What you will build today**
3. **🧠 Concepts first, in plain English** — every idea explained the way you would explain it to a school student
4. **🛠️ Hands-on, step by step** — screenshot, then snippet, then a collapsible *"what the important lines mean"* table under each snippet
5. **📦 Objects in your package after today** — the project structure as it stands
6. **✅ Final version of all code** — every snippet from the day gathered in one place, ready to copy
7. **⚠️ Traps and tips**

---

## Files

```text
SAP_BTP_RAP_Handson_Guide/
├── README.md                      this index
├── 00_SUMMARY.md                  use case + phases + how to use
├── 00_MASTER_CHEAT_SHEET.md       all 19 days on one page
├── Day01_….md  …  Day19_….md      19 chapters
├── 20_APPENDIX_Fiori_JS_to_TS.md  author-added TypeScript reference
└── images/                        238 screenshots (day01_01.png … day19_09.png)
```

---

## About the code

Every snippet in `Day01`–`Day19` is **byte-for-byte identical** to the training document — including the trainer's own comments, indentation and quirks. Nothing was tidied, corrected or reformatted. All code is in fenced blocks so it copies cleanly.

Two things this preserves faithfully, and which you should therefore know about:

- Hostnames, clients, email addresses and region codes (`us10-001`) belong to the trainer's demo environment — substitute your own.
- Day 14's git command carries curly quotes from Word: `git commit -m “my first stable version”`. Retype the quotes as plain `"` before running it.

Replace `_AB_` with your own initials in every object name, as instructed on Day 2.
