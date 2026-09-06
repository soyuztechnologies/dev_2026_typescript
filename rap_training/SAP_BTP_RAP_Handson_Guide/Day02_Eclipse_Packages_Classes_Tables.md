# Day 2 - Eclipse Basics and Your First ABAP Objects

> **Packages, your first class, data elements, domains and database tables**

> Phase A - Foundation (Days 1-2) - Get a free cloud ABAP system and learn to drive the tools.

**🎯 Goal of the day.** Learn to drive Eclipse, then create the database tables that every later day depends on.

---

## 📋 Cheat Sheet - keep this open

### Today's quick reference

| Thing | Value / Syntax |
|---|---|
| `Ctrl+Shift+A` | Search **any** object in the whole system |
| `Ctrl+F3` | Activate the current object |
| `Ctrl+6` | Jump to the SAP GUI window |
| `Ctrl+T` | Show the type hierarchy of a class |
| `Ctrl+Click` | Navigate to the object under the cursor |
| `Ctrl+Space` | Code completion - list available methods |
| `Shift+Enter` | Generate code from the selected suggestion |
| `F2` | Show the signature (parameters) of a method |
| `Ctrl+M` | Maximise / restore the editor pane |
| `Ctrl+7` | Comment / uncomment the selected block |
| `F9` | Run the class (the cloud version of classic F8) |
| `F8` | Data preview for a table or CDS entity |

### Eclipse / ADT keys you will use constantly

| Key | Action |
|---|---|
| `Ctrl+1` | Quick fix - RAP generates code skeletons for you |

### The data-modelling ladder

```text
Domain                     <- the rules of a field (length, type)
   |
Data element               <- domain + name + labels (reusable)
   |
Database table             <- real rows in HANA
   |
Interface CDS entity  ZI_  <- readable names, reusable, the base layer
   |
Composite / Cube view      <- joins and measures
   |
Consumption view      ZC_  <- what a UI or report actually reads
```

---

## 🧱 What you will build today

- A **package** - the folder that holds all your objects.
- Your **first ABAP class** that prints text to the console.
- **Data elements** and **domains** - reusable field definitions.
- Five database objects: `zam_ab_bpa`, `zam_ab_product`, `zam_ab_str_admin_data`, `zam_ab_so_hdr`, `zam_ab_so_item`.

## 🧠 Concepts first, in plain English

Read this before touching the keyboard. Every idea is explained the way you would explain it to a school student.

**Package**

A labelled box. You put related objects in the same box so you can move them together later (transports).

**Class**

A recipe card. It has a *definition* (the list of what it can do) and an *implementation* (the actual steps).

**`if_oo_adt_classrun`**

An interface that gives your class a Run button. Implement it, press F9, and your code runs and prints in Eclipse. It is the cloud replacement for the old `WRITE` statement.

**Domain**

The *rules* of a field: it is a 10-character text, or a number with 2 decimals. Rules only, no meaning.

**Data element**

A domain **plus** a name and labels. `Customer ID` is a data element; `10-character text` is its domain. Define it once, reuse it in 50 tables, and all 50 show the same column label.

**Database table**

A spreadsheet stored in HANA. `key` fields are the columns that make each row unique - like a roll number in a class register.

**`client` field**

SAP systems can host several companies at once. The `client` column keeps their rows apart. Always the first key field.

---

## 🛠️ Hands-on, step by step


![Day 2 - screenshot 1](images/day02_01.png)

Eclipse Shortcut

- **`Ctrl+Shift+A`** — Search any object in entire system
- **`Ctrl+F3`** — Activate an object
- **`Ctrl+6`** — to gui window
- **`Ctrl+T`** — to check type hierarchy of a class
- **`Ctrl+Click`** — to navigate to the selected

![Day 2 - screenshot 2](images/day02_02.png)


![Day 2 - screenshot 3](images/day02_03.png)

### Step 1. Create a package


![Day 2 - screenshot 4](images/day02_04.png)


![Day 2 - screenshot 5](images/day02_05.png)

### Step 2. Create our first class in ABAP on Cloud system


![Day 2 - screenshot 6](images/day02_06.png)


![Day 2 - screenshot 7](images/day02_07.png)

### Step 3. Source code

**📄 ABAP Class** - copy the block below exactly as it is:

```abap
CLASS zcl_am_ab_first_class DEFINITION
 PUBLIC
 FINAL
 CREATE PUBLIC .
 PUBLIC SECTION.
   INTERFACES if_oo_adt_classrun .
 PROTECTED SECTION.
 PRIVATE SECTION.
ENDCLASS.
CLASS zcl_am_ab_first_class IMPLEMENTATION.
 METHOD if_oo_adt_classrun~main.
   out->write(
     EXPORTING
       data   = |Welcome to first ABAP on Cloud, Hello World!|
*        name   =
*      RECEIVING
*        output =
   ).
 ENDMETHOD.
ENDCLASS.
```

<details>
<summary>💡 What the important lines mean (click to open)</summary>

| Line / keyword | What it does |
|---|---|
| `INTERFACES if_oo_adt_classrun` | Gives your class a Run button. Implement `~main`, press **F9**, and output appears in the Eclipse console. The cloud replacement for `WRITE`. |
| `out->write( ... )` | Prints to the Eclipse console. The cloud version of the classic `WRITE` statement. |
| `INTERFACES` | Promises this class implements an interface's methods. |
| `CREATE PUBLIC` | Anyone may instantiate this class. |
| `FINAL` | Nobody may inherit from this class. |

</details>

Replace _AB_ with _YOURINITIALS_

Ctrl+Space to check the methods

Shift+Enter to generate the code

Select the method ~main and choose F2 to view the signature of the method

Ctrl+M expand the canvas, press Ctrl+M it will come back again

Ctrl+7 to comment and uncomment the block of code

Press F9 to test the class.(like F8 in classic ABAP)

### Step 4. Create data elements


![Day 2 - screenshot 8](images/day02_08.png)


![Day 2 - screenshot 9](images/day02_09.png)

![Day 2 - screenshot 10](images/day02_10.png)


![Day 2 - screenshot 11](images/day02_11.png)

### Step 5. Create domain and data element


![Day 2 - screenshot 12](images/day02_12.png)


![Day 2 - screenshot 13](images/day02_13.png)

![Day 2 - screenshot 14](images/day02_14.png)

![Day 2 - screenshot 15](images/day02_15.png)

![Day 2 - screenshot 16](images/day02_16.png)

![Day 2 - screenshot 17](images/day02_17.png)

### Step 6. Create table


![Day 2 - screenshot 18](images/day02_18.png)

![Day 2 - screenshot 19](images/day02_19.png)

![Day 2 - screenshot 20](images/day02_20.png)

**📄 Database Table (DDL)** - copy the block below exactly as it is:

```cds
@EndUserText.label : 'business partners table'
@AbapCatalog.enhancement.category : #NOT_EXTENSIBLE
@AbapCatalog.tableCategory : #TRANSPARENT
@AbapCatalog.deliveryClass : #A
@AbapCatalog.dataMaintenance : #RESTRICTED
define table zam_ab_bpa {
 key client   : abap.clnt not null;
 key bp_id    : zam_ab_dte_id not null;
 bp_role      : zam_ab_dte_bptype;
 @EndUserText.label : 'Company Name'
 company_name : abap.string(256);
 @EndUserText.label : 'Street'
 street       : abap.string(256);
 @EndUserText.label : 'Country'
 country      : abap.char(3);
 @EndUserText.label : 'Region'
 region       : abap.char(5);
 @EndUserText.label : 'City'
 city         : abap.string(256);
}
```

<details>
<summary>💡 What the important lines mean (click to open)</summary>

| Line / keyword | What it does |
|---|---|
| `@AbapCatalog.tableCategory : #TRANSPARENT` | A normal database table - one table in ABAP means one table in HANA. |
| `@AbapCatalog.deliveryClass : #A` | 'A' = application data. It tells SAP this table holds business records, so system copies do not wipe it. |
| `@AbapCatalog.dataMaintenance : #RESTRICTED` | Controls whether anyone may edit rows with the generic table editor. `#RESTRICTED` keeps casual hands out. |
| `@AbapCatalog.enhancement.category : #NOT_EXTENSIBLE` | Nobody may bolt extra fields onto this table later. Declaring this is mandatory. |
| `define table` | Creates a real database table in HANA the moment you activate it. |
| `key client : abap.clnt not null` | The client (tenant) column. SAP can host several companies in one system, and this keeps their rows apart. Always the first key. |
| `abap.clnt` | The client data type (a 3-character tenant number). |
| `@EndUserText.label` | The human-readable description shown in tools and on screen. |

</details>

Press F8 to test the table data preview

### Step 7. Create product table


![Day 2 - screenshot 21](images/day02_21.png)

**📄 Database Table (DDL)** - copy the block below exactly as it is:

```cds
@EndUserText.label : 'Product master table'
@AbapCatalog.enhancement.category : #NOT_EXTENSIBLE
@AbapCatalog.tableCategory : #TRANSPARENT
@AbapCatalog.deliveryClass : #A
@AbapCatalog.dataMaintenance : #RESTRICTED
define table zam_ab_product {
 key client     : abap.clnt not null;
 key product_id : zam_ab_dte_id not null;
 name           : abap.string(256);
 category       : abap.char(40);
 price          : int4;
 currency       : abap.cuky;
 discount       : abap.int4;
}
```

<details>
<summary>💡 What the important lines mean (click to open)</summary>

| Line / keyword | What it does |
|---|---|
| `@AbapCatalog.tableCategory : #TRANSPARENT` | A normal database table - one table in ABAP means one table in HANA. |
| `@AbapCatalog.deliveryClass : #A` | 'A' = application data. It tells SAP this table holds business records, so system copies do not wipe it. |
| `@AbapCatalog.dataMaintenance : #RESTRICTED` | Controls whether anyone may edit rows with the generic table editor. `#RESTRICTED` keeps casual hands out. |
| `@AbapCatalog.enhancement.category : #NOT_EXTENSIBLE` | Nobody may bolt extra fields onto this table later. Declaring this is mandatory. |
| `define table` | Creates a real database table in HANA the moment you activate it. |
| `key client : abap.clnt not null` | The client (tenant) column. SAP can host several companies in one system, and this keeps their rows apart. Always the first key. |
| `abap.clnt` | The client data type (a 3-character tenant number). |
| `@EndUserText.label` | The human-readable description shown in tools and on screen. |

</details>

### Step 8. Create structure for admin data


![Day 2 - screenshot 22](images/day02_22.png)

![Day 2 - screenshot 23](images/day02_23.png)

**📄 DDIC Structure** - copy the block below exactly as it is:

```cds
@EndUserText.label : 'Admin data'
@AbapCatalog.enhancement.category : #NOT_EXTENSIBLE
define structure zam_ab_str_admin_data {
 created_by : abap.char(16);
 created_on : timestamp;
 changed_by : abap.char(16);
 changed_on : timestamp;
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

### Step 9. Sales order header

**📄 Database Table (DDL)** - copy the block below exactly as it is:

```cds
@EndUserText.label : 'sales order header'
@AbapCatalog.enhancement.category : #NOT_EXTENSIBLE
@AbapCatalog.tableCategory : #TRANSPARENT
@AbapCatalog.deliveryClass : #A
@AbapCatalog.dataMaintenance : #RESTRICTED
define table zam_ab_so_hdr {
 key client    : abap.clnt not null;
 key order_id  : zam_ab_dte_id not null;
 order_no      : int4;
 @AbapCatalog.foreignKey.screenCheck : false
 buyer         : zam_ab_dte_id not null
   with foreign key [0..*,1] zam_ab_bpa
     where bp_id = zam_ab_so_hdr.buyer;
 @Semantics.amount.currencyCode : 'zam_ab_so_hdr.currency_code'
 gross_amount  : abap.curr(10,2);
 currency_code : abap.cuky;
 include zam_ab_str_admin_data;
}
```

<details>
<summary>💡 What the important lines mean (click to open)</summary>

| Line / keyword | What it does |
|---|---|
| `@AbapCatalog.tableCategory : #TRANSPARENT` | A normal database table - one table in ABAP means one table in HANA. |
| `@AbapCatalog.deliveryClass : #A` | 'A' = application data. It tells SAP this table holds business records, so system copies do not wipe it. |
| `@AbapCatalog.dataMaintenance : #RESTRICTED` | Controls whether anyone may edit rows with the generic table editor. `#RESTRICTED` keeps casual hands out. |
| `@AbapCatalog.enhancement.category : #NOT_EXTENSIBLE` | Nobody may bolt extra fields onto this table later. Declaring this is mandatory. |
| `define table` | Creates a real database table in HANA the moment you activate it. |
| `key client : abap.clnt not null` | The client (tenant) column. SAP can host several companies in one system, and this keeps their rows apart. Always the first key. |
| `abap.clnt` | The client data type (a 3-character tenant number). |
| `include <structure>` | Pastes all fields of a structure into this table - reuse instead of copy-paste. |
| `@EndUserText.label` | The human-readable description shown in tools and on screen. |

</details>

### Step 10. Sales order items

**📄 Database Table (DDL)** - copy the block below exactly as it is:

```cds
@EndUserText.label : 'Sales items data'
@AbapCatalog.enhancement.category : #NOT_EXTENSIBLE
@AbapCatalog.tableCategory : #TRANSPARENT
@AbapCatalog.deliveryClass : #A
@AbapCatalog.dataMaintenance : #RESTRICTED
define table zam_ab_so_item {
 key client  : abap.clnt not null;
 key item_id : zam_ab_dte_id not null;
 order_id    : zam_ab_dte_id not null;
 @AbapCatalog.foreignKey.screenCheck : false
 product     : zam_ab_dte_id not null
   with foreign key [0..*,1] zam_ab_product
     where product_id = zam_ab_so_item.product;
 @Semantics.quantity.unitOfMeasure : 'zam_ab_so_item.uom'
 qty         : abap.quan(5,0);
 uom         : abap.unit(3);
 @Semantics.amount.currencyCode : 'zam_ab_so_item.currency'
 amount      : abap.curr(15,2);
 currency    : abap.cuky;
}
```

<details>
<summary>💡 What the important lines mean (click to open)</summary>

| Line / keyword | What it does |
|---|---|
| `@AbapCatalog.tableCategory : #TRANSPARENT` | A normal database table - one table in ABAP means one table in HANA. |
| `@AbapCatalog.deliveryClass : #A` | 'A' = application data. It tells SAP this table holds business records, so system copies do not wipe it. |
| `@AbapCatalog.dataMaintenance : #RESTRICTED` | Controls whether anyone may edit rows with the generic table editor. `#RESTRICTED` keeps casual hands out. |
| `@AbapCatalog.enhancement.category : #NOT_EXTENSIBLE` | Nobody may bolt extra fields onto this table later. Declaring this is mandatory. |
| `define table` | Creates a real database table in HANA the moment you activate it. |
| `key client : abap.clnt not null` | The client (tenant) column. SAP can host several companies in one system, and this keeps their rows apart. Always the first key. |
| `abap.clnt` | The client data type (a 3-character tenant number). |
| `@EndUserText.label` | The human-readable description shown in tools and on screen. |
| `@Semantics.amount.currencyCode` | 'This number is money, and that other field holds its currency.' Without it, amounts render as plain numbers. |

</details>

To understand GUID based table design please refer below video:

🔗 <https://www.youtube.com/watch?v=1tk4DUOXXQw&t=295s&pp=ygUdczRoYW5hIHNpbXBsZmllZCB0YWJsZSBkZXNpZ24%3D>

[optional]Change the font


![Day 2 - screenshot 24](images/day02_24.png)


![Day 2 - screenshot 25](images/day02_25.png)

---

## 📦 Objects in your package after today

```text
$Z_AM_AB  (your package - replace _AB_ with your own initials)
  ├── zcl_am_ab_first_class               ABAP class
  ├── zam_ab_bpa                          Database table
  ├── zam_ab_product                      Database table
  ├── zam_ab_str_admin_data               Structure
  ├── zam_ab_so_hdr                       Database table
  ├── zam_ab_so_item                      Database table
```

---

## ✅ Final version of all code from Day 2

Everything below is the **complete, unmodified** source from the training material, gathered in one place so you can copy it straight into Eclipse.

### 1. Source code - _ABAP Class_

```abap
CLASS zcl_am_ab_first_class DEFINITION
 PUBLIC
 FINAL
 CREATE PUBLIC .
 PUBLIC SECTION.
   INTERFACES if_oo_adt_classrun .
 PROTECTED SECTION.
 PRIVATE SECTION.
ENDCLASS.
CLASS zcl_am_ab_first_class IMPLEMENTATION.
 METHOD if_oo_adt_classrun~main.
   out->write(
     EXPORTING
       data   = |Welcome to first ABAP on Cloud, Hello World!|
*        name   =
*      RECEIVING
*        output =
   ).
 ENDMETHOD.
ENDCLASS.
```

### 2. Create table - _Database Table (DDL)_

```cds
@EndUserText.label : 'business partners table'
@AbapCatalog.enhancement.category : #NOT_EXTENSIBLE
@AbapCatalog.tableCategory : #TRANSPARENT
@AbapCatalog.deliveryClass : #A
@AbapCatalog.dataMaintenance : #RESTRICTED
define table zam_ab_bpa {
 key client   : abap.clnt not null;
 key bp_id    : zam_ab_dte_id not null;
 bp_role      : zam_ab_dte_bptype;
 @EndUserText.label : 'Company Name'
 company_name : abap.string(256);
 @EndUserText.label : 'Street'
 street       : abap.string(256);
 @EndUserText.label : 'Country'
 country      : abap.char(3);
 @EndUserText.label : 'Region'
 region       : abap.char(5);
 @EndUserText.label : 'City'
 city         : abap.string(256);
}
```

### 3. Create product table - _Database Table (DDL)_

```cds
@EndUserText.label : 'Product master table'
@AbapCatalog.enhancement.category : #NOT_EXTENSIBLE
@AbapCatalog.tableCategory : #TRANSPARENT
@AbapCatalog.deliveryClass : #A
@AbapCatalog.dataMaintenance : #RESTRICTED
define table zam_ab_product {
 key client     : abap.clnt not null;
 key product_id : zam_ab_dte_id not null;
 name           : abap.string(256);
 category       : abap.char(40);
 price          : int4;
 currency       : abap.cuky;
 discount       : abap.int4;
}
```

### 4. Create structure for admin data - _DDIC Structure_

```cds
@EndUserText.label : 'Admin data'
@AbapCatalog.enhancement.category : #NOT_EXTENSIBLE
define structure zam_ab_str_admin_data {
 created_by : abap.char(16);
 created_on : timestamp;
 changed_by : abap.char(16);
 changed_on : timestamp;
}
```

### 5. Sales order header - _Database Table (DDL)_

```cds
@EndUserText.label : 'sales order header'
@AbapCatalog.enhancement.category : #NOT_EXTENSIBLE
@AbapCatalog.tableCategory : #TRANSPARENT
@AbapCatalog.deliveryClass : #A
@AbapCatalog.dataMaintenance : #RESTRICTED
define table zam_ab_so_hdr {
 key client    : abap.clnt not null;
 key order_id  : zam_ab_dte_id not null;
 order_no      : int4;
 @AbapCatalog.foreignKey.screenCheck : false
 buyer         : zam_ab_dte_id not null
   with foreign key [0..*,1] zam_ab_bpa
     where bp_id = zam_ab_so_hdr.buyer;
 @Semantics.amount.currencyCode : 'zam_ab_so_hdr.currency_code'
 gross_amount  : abap.curr(10,2);
 currency_code : abap.cuky;
 include zam_ab_str_admin_data;
}
```

### 6. Sales order items - _Database Table (DDL)_

```cds
@EndUserText.label : 'Sales items data'
@AbapCatalog.enhancement.category : #NOT_EXTENSIBLE
@AbapCatalog.tableCategory : #TRANSPARENT
@AbapCatalog.deliveryClass : #A
@AbapCatalog.dataMaintenance : #RESTRICTED
define table zam_ab_so_item {
 key client  : abap.clnt not null;
 key item_id : zam_ab_dte_id not null;
 order_id    : zam_ab_dte_id not null;
 @AbapCatalog.foreignKey.screenCheck : false
 product     : zam_ab_dte_id not null
   with foreign key [0..*,1] zam_ab_product
     where product_id = zam_ab_so_item.product;
 @Semantics.quantity.unitOfMeasure : 'zam_ab_so_item.uom'
 qty         : abap.quan(5,0);
 uom         : abap.unit(3);
 @Semantics.amount.currencyCode : 'zam_ab_so_item.currency'
 amount      : abap.curr(15,2);
 currency    : abap.cuky;
}
```

---

## ⚠️ Traps and tips

- Everywhere you see `_AB_` in an object name, replace it with **your own initials** so your objects do not clash with a classmate's.
- A table is useless until you activate it (Ctrl+F3). Activation is what actually creates it in HANA.

---

[⬅️ Day 1](Day01_Setup_BTP_ABAP_Environment_Eclipse.md) | [🏠 Summary](00_SUMMARY.md) | [📋 Master Cheat Sheet](00_MASTER_CHEAT_SHEET.md) | [Day 3 ➡️](Day03_Data_Generator_CDS_Views_And_Entities.md)
