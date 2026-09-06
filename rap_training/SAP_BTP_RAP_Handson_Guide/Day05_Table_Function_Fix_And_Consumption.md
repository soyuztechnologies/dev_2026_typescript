# Day 5 - Fixing the Table Function and Consuming It

> **Client handling annotations, and joining a table function inside a CDS entity**

> Phase B - Data Modelling (Days 3-5) - Build tables, CDS views/entities, analytics and push-down logic.

**🎯 Goal of the day.** Make the table function client-safe, then use it from a normal CDS entity.

---

## 📋 Cheat Sheet - keep this open

### Today's quick reference

| Thing | Value / Syntax |
|---|---|
| **Client-safe TF** | `@ClientHandling.type: #CLIENT_DEPENDENT` + `@ClientHandling.clientSafe: true` |
| `Parameter` | `with parameters @Environment.systemField: #CLIENT p_clnt : abap.clnt` |
| **Consume a TF** | join it in a `define view entity` exactly like a table |
| **Rule of thumb** | AMDP = engine. Table function = the plug you can actually connect to. |

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

- The corrected **table function** with `@ClientHandling` annotations.
- The corrected **AMDP implementation**.
- A CDS entity that **joins** the table function - proving a table function behaves like any other entity.

## 🧠 Concepts first, in plain English

Read this before touching the keyboard. Every idea is explained the way you would explain it to a school student.

**Why the fix was needed**

The table function was declared client-independent, so the framework did not know which company's rows to return. The `@ClientHandling` annotations tell it explicitly.

**`@ClientHandling.type: #CLIENT_DEPENDENT`**

'This entity has a client column, please filter on it automatically.'

**`@ClientHandling.clientSafe: true`**

'I promise my SQLScript handles the client column correctly.' You are signing a guarantee to the compiler.

**AMDP cannot be consumed directly**

You cannot write `SELECT ... FROM my_amdp_method`. Only a **table function** can be selected from. That wrapper is the whole point of table functions.

---

## 🛠️ Hands-on, step by step

### Step 1. Fixing the Table function issue in last session

**📄 CDS Table Function** - copy the block below exactly as it is:

```cds
@EndUserText.label: 'Table function demo - Total Sales per Customer Ranked'
@ClientHandling.type: #CLIENT_DEPENDENT
@ClientHandling.clientSafe: true
@ClientHandling.algorithm: #SESSION_VARIABLE
define table function ZAM_AB_TF
//with parameters
//@Environment.systemField: #CLIENT
//p_clnt : abap.clnt
returns {
 client : abap.clnt;
 company_name: abap.char(256);
 total_sales: abap.curr(15,2);
 currency_code: abap.cuky(5);
 customer_rank: abap.int4; 
}
implemented by method zcl_AM_AB_amdp=>get_total_sales;
```

<details>
<summary>💡 What the important lines mean (click to open)</summary>

| Line / keyword | What it does |
|---|---|
| `define table` | Creates a real database table in HANA the moment you activate it. |
| `abap.clnt` | The client data type (a 3-character tenant number). |
| `@EndUserText.label` | The human-readable description shown in tools and on screen. |
| `define table function` | A CDS entity whose data is produced by an AMDP method. You can `SELECT` from it like any view. |
| `implemented by method` | Names the AMDP class and method that actually fills this table function. |
| `@ClientHandling.type: #CLIENT_DEPENDENT` | 'This entity has a client column - please filter on it automatically.' |
| `@ClientHandling.clientSafe: true` | Your written promise to the compiler that your SQLScript handles the client column correctly. |
| `@Environment.systemField: #CLIENT` | Fills a parameter from a system value, so the caller does not have to pass the client. |

</details>

**📄 ABAP Class** - copy the block below exactly as it is:

```abap
CLASS zcl_am_ab_amdp DEFINITION
 PUBLIC
 FINAL
 CREATE PUBLIC .
 PUBLIC SECTION.
   INTERFACES if_amdp_marker_hdb .
   INTERFACES if_oo_adt_classrun .
   CLASS-METHODS add_numbers AMDP OPTIONS CLIENT INDEPENDENT
                             IMPORTING value(a) TYPE i
                                       value(b) type i
                             EXPORTING
                                       value(result) TYPE i.
   CLASS-METHODS get_customer_by_id AMDP OPTIONS CDS SESSION CLIENT DEPENDENT IMPORTING
                                       value(i_bp_id) TYPE zAM_AB_dte_id
                                    EXPORTING
                                       VALUE(e_res) TYPE zAM_AB_dte_id.
   CLASS-METHODS get_product_mrp AMDP OPTIONS CDS SESSION CLIENT DEPENDENT IMPORTING
                                   VALUE(i_tax) type i
                                 EXPORTING
                                   VALUE(otab) type zam_ab_tt_product_mrp.
   CLASS-METHODS get_total_sales
                               for table FUNCTION ZAM_AB_TF.
 PROTECTED SECTION.
 PRIVATE SECTION.
ENDCLASS.
CLASS zcl_am_ab_amdp IMPLEMENTATION.
 METHOD get_total_sales by DATABASE FUNCTION FOR HDB LANGUAGE SQLSCRIPT
                       OPTIONS READ-ONLY
                       USING zAM_AB_bpa zAM_AB_so_hdr zAM_AB_so_item
 .
   return select
           bpa.client,
           bpa.company_name,
           sum( item.amount ) as total_sales,
           item.currency as currency_code,
           RANK ( ) OVER ( order by sum( item.amount ) desc ) as customer_rank
    from zAM_AB_bpa as bpa
   INNER join zAM_AB_so_hdr as sls
   on bpa.bp_id = sls.buyer
   inner join zAM_AB_so_item as item
   on sls.order_id = item.order_id
   group by bpa.client,
           bpa.company_name,
           item.currency ;
 ENDMETHOD.
 METHOD add_numbers by DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT
 OPTIONS READ-ONLY.
   DECLARE x integer;
   DECLARE y INTEGER;
   x := a;
   y := b;
   result := :x + :y;
 ENDMETHOD.
 METHOD if_oo_adt_classrun~main.
   zcl_am_ab_amdp=>get_product_mrp(
     EXPORTING
       i_tax = 10
     IMPORTING
       otab  = data(lt_products)
   ).
   out->write(
     EXPORTING
       data   = lt_products
*        name   =
*      RECEIVING
*        output =
   ).
 ENDMETHOD.
 METHOD get_customer_by_id BY DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT
                           options read-only
                            USING zAM_AB_bpa.
   select company_name into e_res from zAM_AB_bpa where bp_id = :i_bp_id;
 ENDMETHOD.
 METHOD get_product_mrp BY DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT
                           options read-only
                           USING zAM_AB_product.
*   declare variables
   declare lv_Count integer;
   declare i integer;
   declare lv_mrp bigint;
   declare lv_price_d integer;
*   get all the products in a implicit table (like a internal table in abap)
   lt_prod = select * from zAM_AB_product;
*   get the record count of the table records
   lv_count := record_count( :lt_prod );
*   loop at each record one by one and calculate the price after discount (dbtable)
   for i in 1..:lv_count do
*   calculate the MRP based on input tax
       lv_price_d := :lt_prod.price[i] * ( 100 - :lt_prod.discount[i] ) / 100;
       lv_mrp := :lv_price_d * ( 100 + :i_tax ) / 100;
*   if the MRP is more than 15k, an additional 10% discount to be applied
       if lv_mrp > 15000 then
           lv_mrp := :lv_mrp * 0.90;
       END IF ;
*   fill the otab for result (like in abap we fill another internal table with data)
       :otab.insert( (
                         :lt_prod.name[i],
                         :lt_prod.category[i],
                         :lt_prod.price[i],
                         :lt_prod.currency[i],
                         :lt_prod.discount[i],
                         :lv_price_d,
                         :lv_mrp
                     ), i );
   END FOR ;
 ENDMETHOD.
ENDCLASS.
```

<details>
<summary>💡 What the important lines mean (click to open)</summary>

| Line / keyword | What it does |
|---|---|
| `INTERFACES if_oo_adt_classrun` | Gives your class a Run button. Implement `~main`, press **F9**, and output appears in the Eclipse console. The cloud replacement for `WRITE`. |
| `INTERFACES if_amdp_marker_hdb` | A marker interface with no methods. It exists only to tell the compiler 'this class contains HANA SQLScript'. |
| `out->write( ... )` | Prints to the Eclipse console. The cloud version of the classic `WRITE` statement. |
| `CLASS-METHODS` | A static method - callable without creating an object. |
| `AMDP OPTIONS CLIENT INDEPENDENT` | Marks the method as an AMDP and states that you handle the client column yourself. |
| `BY DATABASE PROCEDURE / FUNCTION` | The method body is **SQLScript**, not ABAP. ABAP manages it; HANA runs it. |
| `BY DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT` | Declares an AMDP procedure: managed by ABAP, executed inside HANA. |
| `INTERFACES` | Promises this class implements an interface's methods. |
| `CREATE PUBLIC` | Anyone may instantiate this class. |

</details>


![Day 5 - screenshot 1](images/day05_01.png)


![Day 5 - screenshot 2](images/day05_02.png)

### Step 2. Consume Table function in other entities whereas the AMDP cannot be consumed like this

**📄 CDS View Entity** - copy the block below exactly as it is:

```cds
@AbapCatalog.viewEnhancementCategory: [#NONE]
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Entity which joins with TF'
@Metadata.ignorePropagatedAnnotations: true
@ObjectModel.usageType:{
   serviceQuality: #X,
   sizeCategory: #S,
   dataClass: #MIXED
}
define view entity ZC_AM_AB_SALES_RANK
   as select from ZAM_AB_TF as ranked
inner join zam_ab_bpa as bpa on
ranked.company_name = bpa.company_name
{
   key ranked.company_name,
   @Semantics.amount.currencyCode: 'currency_code'
   ranked.total_sales,
   ranked.currency_code,
   ranked.customer_rank
}
```

<details>
<summary>💡 What the important lines mean (click to open)</summary>

| Line / keyword | What it does |
|---|---|
| `@AbapCatalog.viewEnhancementCategory: [#NONE]` | Says whether other people may extend this view. `[#NONE]` = closed, `[#PROJECTION_LIST]` = fields may be added. |
| `@AccessControl.authorizationCheck: #NOT_REQUIRED` | Skip the DCL authorisation check. Fine while learning - **never** on real customer data. |
| `@EndUserText.label` | The human-readable description shown in tools and on screen. |
| `@Metadata.ignorePropagatedAnnotations` | `true` = ignore annotations inherited from the views underneath, so you start with a clean slate. |
| `@ObjectModel.usageType` | Declares the view's role: `serviceQuality` (how polished it is), `sizeCategory` (expected row count), `dataClass` (master, transactional, mixed). |
| `define view entity` | The modern CDS entity - one object, one name, faster and stricter than the old `define view`. |
| `define view` | The **obsolete** CDS View. Kept here only so you can see the difference. |
| `@Semantics.amount.currencyCode` | 'This number is money, and that other field holds its currency.' Without it, amounts render as plain numbers. |

</details>

---

## 📦 Objects in your package after today

```text
$Z_AM_AB  (your package - replace _AB_ with your own initials)
  ├── ZAM_AB_TF                           Table function
  ├── zcl_am_ab_amdp                      ABAP class
  ├── ZC_AM_AB_SALES_RANK                 CDS entity
```

---

## ✅ Final version of all code from Day 5

Everything below is the **complete, unmodified** source from the training material, gathered in one place so you can copy it straight into Eclipse.

### 1. Fixing the Table function issue in last session - _CDS Table Function_

```cds
@EndUserText.label: 'Table function demo - Total Sales per Customer Ranked'
@ClientHandling.type: #CLIENT_DEPENDENT
@ClientHandling.clientSafe: true
@ClientHandling.algorithm: #SESSION_VARIABLE
define table function ZAM_AB_TF
//with parameters
//@Environment.systemField: #CLIENT
//p_clnt : abap.clnt
returns {
 client : abap.clnt;
 company_name: abap.char(256);
 total_sales: abap.curr(15,2);
 currency_code: abap.cuky(5);
 customer_rank: abap.int4; 
}
implemented by method zcl_AM_AB_amdp=>get_total_sales;
```

### 2. Fixing the Table function issue in last session - _ABAP Class_

```abap
CLASS zcl_am_ab_amdp DEFINITION
 PUBLIC
 FINAL
 CREATE PUBLIC .
 PUBLIC SECTION.
   INTERFACES if_amdp_marker_hdb .
   INTERFACES if_oo_adt_classrun .
   CLASS-METHODS add_numbers AMDP OPTIONS CLIENT INDEPENDENT
                             IMPORTING value(a) TYPE i
                                       value(b) type i
                             EXPORTING
                                       value(result) TYPE i.
   CLASS-METHODS get_customer_by_id AMDP OPTIONS CDS SESSION CLIENT DEPENDENT IMPORTING
                                       value(i_bp_id) TYPE zAM_AB_dte_id
                                    EXPORTING
                                       VALUE(e_res) TYPE zAM_AB_dte_id.
   CLASS-METHODS get_product_mrp AMDP OPTIONS CDS SESSION CLIENT DEPENDENT IMPORTING
                                   VALUE(i_tax) type i
                                 EXPORTING
                                   VALUE(otab) type zam_ab_tt_product_mrp.
   CLASS-METHODS get_total_sales
                               for table FUNCTION ZAM_AB_TF.
 PROTECTED SECTION.
 PRIVATE SECTION.
ENDCLASS.
CLASS zcl_am_ab_amdp IMPLEMENTATION.
 METHOD get_total_sales by DATABASE FUNCTION FOR HDB LANGUAGE SQLSCRIPT
                       OPTIONS READ-ONLY
                       USING zAM_AB_bpa zAM_AB_so_hdr zAM_AB_so_item
 .
   return select
           bpa.client,
           bpa.company_name,
           sum( item.amount ) as total_sales,
           item.currency as currency_code,
           RANK ( ) OVER ( order by sum( item.amount ) desc ) as customer_rank
    from zAM_AB_bpa as bpa
   INNER join zAM_AB_so_hdr as sls
   on bpa.bp_id = sls.buyer
   inner join zAM_AB_so_item as item
   on sls.order_id = item.order_id
   group by bpa.client,
           bpa.company_name,
           item.currency ;
 ENDMETHOD.
 METHOD add_numbers by DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT
 OPTIONS READ-ONLY.
   DECLARE x integer;
   DECLARE y INTEGER;
   x := a;
   y := b;
   result := :x + :y;
 ENDMETHOD.
 METHOD if_oo_adt_classrun~main.
   zcl_am_ab_amdp=>get_product_mrp(
     EXPORTING
       i_tax = 10
     IMPORTING
       otab  = data(lt_products)
   ).
   out->write(
     EXPORTING
       data   = lt_products
*        name   =
*      RECEIVING
*        output =
   ).
 ENDMETHOD.
 METHOD get_customer_by_id BY DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT
                           options read-only
                            USING zAM_AB_bpa.
   select company_name into e_res from zAM_AB_bpa where bp_id = :i_bp_id;
 ENDMETHOD.
 METHOD get_product_mrp BY DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT
                           options read-only
                           USING zAM_AB_product.
*   declare variables
   declare lv_Count integer;
   declare i integer;
   declare lv_mrp bigint;
   declare lv_price_d integer;
*   get all the products in a implicit table (like a internal table in abap)
   lt_prod = select * from zAM_AB_product;
*   get the record count of the table records
   lv_count := record_count( :lt_prod );
*   loop at each record one by one and calculate the price after discount (dbtable)
   for i in 1..:lv_count do
*   calculate the MRP based on input tax
       lv_price_d := :lt_prod.price[i] * ( 100 - :lt_prod.discount[i] ) / 100;
       lv_mrp := :lv_price_d * ( 100 + :i_tax ) / 100;
*   if the MRP is more than 15k, an additional 10% discount to be applied
       if lv_mrp > 15000 then
           lv_mrp := :lv_mrp * 0.90;
       END IF ;
*   fill the otab for result (like in abap we fill another internal table with data)
       :otab.insert( (
                         :lt_prod.name[i],
                         :lt_prod.category[i],
                         :lt_prod.price[i],
                         :lt_prod.currency[i],
                         :lt_prod.discount[i],
                         :lv_price_d,
                         :lv_mrp
                     ), i );
   END FOR ;
 ENDMETHOD.
ENDCLASS.
```

### 3. Consume Table function in other entities whereas the AMDP cannot be consumed like this - _CDS View Entity_

```cds
@AbapCatalog.viewEnhancementCategory: [#NONE]
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Entity which joins with TF'
@Metadata.ignorePropagatedAnnotations: true
@ObjectModel.usageType:{
   serviceQuality: #X,
   sizeCategory: #S,
   dataClass: #MIXED
}
define view entity ZC_AM_AB_SALES_RANK
   as select from ZAM_AB_TF as ranked
inner join zam_ab_bpa as bpa on
ranked.company_name = bpa.company_name
{
   key ranked.company_name,
   @Semantics.amount.currencyCode: 'currency_code'
   ranked.total_sales,
   ranked.currency_code,
   ranked.customer_rank
}
```

---

## ⚠️ Traps and tips

- Re-activate the AMDP class **and** the table function after any signature change, in that order.

---

[⬅️ Day 4](Day04_Analytics_AMDP_Table_Functions.md) | [🏠 Summary](00_SUMMARY.md) | [📋 Master Cheat Sheet](00_MASTER_CHEAT_SHEET.md) | [Day 6 ➡️](Day06_RAP_Business_Object_And_First_Fiori_App.md)
