# Day 10 - Actions, Determinations and Validations

> **copyTravel factory action, internal actions, determinations and header validation**

> Phase D - Business Logic (Days 9-12) - Add numbering, actions, determinations, validations, drafts and authorisations.

**🎯 Goal of the day.** Add real business logic: a Copy button, an automatic price recalculation and input checks.

---

## 📋 Cheat Sheet - keep this open

### Today's quick reference

| Thing | Value / Syntax |
|---|---|
| `Action` | `action set_booked_status result [1] $self;` |
| **Factory action** | `factory action copyTravel [1];` |
| **Internal action** | `internal action reCalcTotalPrice;` |
| **Determination on modify** | `determination calculateTotalPrice on modify { field BookingFee; }` |
| **Validation on save** | `validation validateHeaderData on save { create; field AgencyId, CustomerId; }` |
| **Expose in projection** | `use action copyTravel;` |
| **Button in MDE** | `@UI.lineItem: [{ type: #FOR_ACTION, dataAction: 'copyTravel', label: 'Copy' }]` |
| `Message` | `APPEND VALUE #( %tky = ..., %msg = new_message_with_text( severity = if_abap_behv_message=>severity-error text = '...' ) ) TO reported-travel.` |

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

- The **`copyTravel`** factory action implementation.
- Its exposure in the **projection BDEF** and the button in the **MDE**.
- An **internal action** (`reCalcTotalPrice`) plus a **determination** that triggers it.
- A **validation** (`validateHeaderData`) that blocks bad input.

## 🧠 Concepts first, in plain English

Read this before touching the keyboard. Every idea is explained the way you would explain it to a school student.

**Action**

A button. The user clicks; your method runs. `Approve`, `Copy`, `Set to Booked` - all actions.

**Internal action**

An action with **no button**. Only other ABAP code can call it. Perfect for shared logic you want to reuse from several places.

**Determination**

Automatic logic. 'Whenever `BookingFee` changes, recalculate `TotalPrice`.' The user never asks for it; RAP just does it. Like a spreadsheet formula recalculating when you edit a cell.

**`on modify` vs `on save`**

`on modify` runs while the user types (they see the effect immediately). `on save` runs once at the end (cheaper, but the user sees nothing until save).

**Validation**

A gatekeeper at save time. It cannot change data - it can only accept it or refuse it with a message. Determinations *change*; validations *judge*.

**The RAP save sequence**

The order is fixed: determinations on modify -> validations -> determinations on save -> save. Knowing this order explains almost every 'why did my logic not run' question.

**`reported` and `failed`**

Two tables you fill instead of throwing exceptions. `failed` = which records could not be processed; `reported` = the messages to show. RAP is a mass framework, so errors have to be per-record.

---

## 🛠️ Hands-on, step by step

### Step 1. Implement the data action for - copyTravel - Factory (Instance)

### Step 2. Logic in BIMP in our BPool Class (last session we generated the method copyTravel)

**📄 ABAP Method Implementation** - copy the block below exactly as it is:

```abap
METHOD copyTravel.
 "Prepare the itabs with the data that needs to be inserted
   data: travels type table for create ZAM_AB_travel\\Travel,
         bookings_cba type table for create ZAM_AB_travel\\Travel\_Booking,
         booksuppl_cba type table for create ZAM_AB_travel\\Booking\_BookingSuppl.
   "Step 1: Remove the travel instances with initial %cid
   read table keys with key %cid = '' into data(key_with_initial_cid).
   ASSERT key_with_initial_cid is initial.
   "Step 2: Read all travel, booking and booking supplement using EML
   read entities of ZAM_AB_travel in local mode
   entity Travel
       ALL FIELDS WITH CORRESPONDING #( keys )
       RESULT DATA(travel_read_result)
       FAILED failed.
   read entities of ZAM_AB_travel in local mode
   entity Travel by \_Booking
       ALL FIELDS WITH CORRESPONDING #( travel_read_result )
       RESULT DATA(book_read_result)
       FAILED failed.
   read entities of ZAM_AB_travel in local mode
   entity booking by \_BookingSuppl
       ALL FIELDS WITH CORRESPONDING #( book_read_result )
       RESULT DATA(booksuppl_read_result)
       FAILED failed.
   "Step 3: Fill travel internal table for travel data creation - %cid - abc123
   loop at travel_read_result ASSIGNING FIELD-SYMBOL(<travel>).
        "Travel data prepration
        append value #( %cid = keys[ %tky = <travel>-%tky ]-%cid
                       %data = CORRESPONDING #( <travel> except travelId )
        ) to travels ASSIGNING FIELD-SYMBOL(<new_travel>).
        <new_travel>-BeginDate = cl_abap_context_info=>get_system_date( ).
        <new_travel>-EndDate = cl_abap_context_info=>get_system_date( ) + 30.
        <new_travel>-OverallStatus = 'O'.
       "Step 3: Fill booking internal table for booking data creation - %cid_ref - abc123
       append value #( %cid_ref = keys[ key entity %tky = <travel>-%tky ]-%cid )
         to bookings_cba ASSIGNING FIELD-SYMBOL(<bookings_cba>).
       loop at  book_read_result ASSIGNING FIELD-SYMBOL(<booking>) where TravelId = <travel>-TravelId.
           append value #( %cid = keys[ key entity %tky = <travel>-%tky ]-%cid && <booking>-BookingId
                           %data = CORRESPONDING #( book_read_result[ key entity %tky = <booking>-%tky ] EXCEPT travelid )
           )
               to <bookings_cba>-%target ASSIGNING FIELD-SYMBOL(<new_booking>).
           <new_booking>-BookingStatus = 'N'.
           "Step 4: Fill booking supplement internal table for booking suppl data creation
           append value #( %cid_ref = keys[ key entity %tky = <travel>-%tky ]-%cid && <booking>-BookingId )
                   to booksuppl_cba ASSIGNING FIELD-SYMBOL(<booksuppl_cba>).
           loop at booksuppl_read_result ASSIGNING FIELD-SYMBOL(<booksuppl>)
               using KEY entity where TravelId = <travel>-TravelId and
                                      BookingId = <booking>-BookingId.
               append value #( %cid = keys[ key entity %tky = <travel>-%tky ]-%cid && <booking>-BookingId && <booksuppl>-BookingSupplementId
                           %data = CORRESPONDING #( <booksuppl> EXCEPT travelid bookingid )
               )
               to <booksuppl_cba>-%target.
           ENDLOOP.
       ENDLOOP.
   ENDLOOP.
   "Step 5: MODIFY ENTITY EML to create new BO instance using existing data
   MODIFY ENTITIES OF ZAM_AB_travel IN LOCAL MODE
       ENTITY travel
           CREATE FIELDS ( AgencyId CustomerId BeginDate EndDate BookingFee TotalPrice CurrencyCode OverallStatus )
               with travels
                   create by \_Booking FIELDS ( Bookingid BookingDate CustomerId CarrierId ConnectionId FlightDate FlightPrice CurrencyCode BookingStatus )
                       with bookings_cba
                           ENTITY Booking
                               create by \_BookingSuppl FIELDS ( bookingsupplementid supplementid price currencycode )
                                   WITH booksuppl_cba
       MAPPED data(mapped_create).
    mapped-travel = mapped_create-travel.
 ENDMETHOD.
```

<details>
<summary>💡 What the important lines mean (click to open)</summary>

| Line / keyword | What it does |
|---|---|
| `corresponding { ... }` | Inside a mapping, maps the remaining fields by matching names. |
| `READ ENTITIES OF ... ENTITY ... FIELDS ( ... ) WITH ...` | EML read. Always a **mass** operation: you pass a *table* of keys and get a *table* of results, plus `FAILED` and `REPORTED`. |
| `MODIFY ENTITIES OF ... ENTITY ... CREATE/UPDATE/DELETE` | EML write. Goes through the business object, so every validation and determination still runs. |
| `IN LOCAL MODE` | Skip authorisation and feature checks. Correct inside a behavior implementation, because RAP already checked before calling you. |
| `%tky` | *Transactional key* - the complete key of one instance, including its draft flag. Match records on this inside handlers. |
| `%cid` | *Content ID* - a temporary label for a record that does not have a key yet, so the caller can match responses to requests. |

</details>

### Step 3. Expose the Action in processor projection in BDEF of processor

**📄 Behavior Definition - projection (BDEF)** - copy the block below exactly as it is:

```abap
projection;
strict ( 2 );
define behavior for ZAM_AB_TRAVEL_PROCESSOR alias Travel
{
 use create;
 use update;
 use delete;
 use action copyTravel;
 use association _Booking { create; }
}
define behavior for ZAM_AB_BOOKING_PROCESSOR alias Booking
{
 use update;
 use delete;
 use association _Travel;
 use association _BookingSuppl { create; }
}
define behavior for ZAM_AB_BOOKSUPPL_PROCESSOR alias BookSuppl
{
 use update;
 use delete;
 use association _Travel;
 use association _Booking;
}
```

<details>
<summary>💡 What the important lines mean (click to open)</summary>

| Line / keyword | What it does |
|---|---|
| `association to` | A reusable, lazily-evaluated relationship. Cheaper than a JOIN because it only runs when used. |
| `projection;` | This BDEF describes a **projection** layer. It can only re-publish (`use`) what the interface BDEF already allows. |
| `strict ( 2 );` | Turns on the strictest syntax checks. It refuses code that would break in a future release - always switch it on. |
| `use action <Name>` | Re-publishes an action in the projection. Without this line the button never appears, even if the action exists. |
| `use association _Child { create; with draft; }` | Re-publishes a child in the projection and says whether the app may create children and whether they take part in the draft. |
| `define behavior for <Entity> alias <Alias>` | Opens the rulebook for one entity. The `alias` is the short name you use everywhere else in the BDEF. |

</details>

### Step 4. Add the MDE code to expose button

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
       }
   ]
   @UI.selectionField: [{ position: 10 }]
   @UI.lineItem: [{ position: 10 },
                  { type: #FOR_ACTION, dataAction: 'copyTravel', label: 'Copy kardo' }]
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

### Step 5. Working with internal action (reuse) and determination (trigger logic based on condition)

**📄 Behavior Definition (BDEF)** - copy the block below exactly as it is:

```abap
managed implementation in class zbp_am_ab_travel unique;
//guideline to be followed which runs the BDEF in strict mode
strict ( 2 );
define behavior for ZAM_AB_TRAVEL alias Travel
//this is the table where RAP will insert our data
persistent table /dmo/travel_m
//control the enqueue and dequeue
lock master
//who can modify, create, update, delete our data using this BDEF
authorization master ( instance )
//concurrency control - automatic
etag master LastChangedAt
//automatic management of travel id from sequence generator
early numbering
{
 //enabling RAP to generate code for us for create, update, delete
 create;
 update;
 delete;
 field ( readonly ) TravelId;
 field ( mandatory ) BeginDate, EndDate, AgencyId, CustomerId;
 association _Booking { create ( features: instance ) ; }
 //Adding a instance based factory data action to copy my travel
 //itinerary based on exisiting travel
 factory action copyTravel [1];
 //its a piece of code which is intented to be only
 //consumed within our RAP BO
 internal action reCalcTotalPrice;
 //Define determination to execute the code when
 //booking fee or curr code changes so we calc total price
 determination calculateTotalPrice on modify
           { create; field BookingFee, CurrencyCode; }
 //Since we use alias name in MDE (fiori sends) table has _ we need mapping
 mapping for /dmo/travel_m{
   TravelId = travel_id;
   AgencyId = agency_id;
   CustomerId = customer_id;
   BeginDate = begin_date;
   EndDate = end_date;
   TotalPrice = total_price;
   BookingFee = booking_fee;
   CurrencyCode = currency_code;
   Description = description;
   OverallStatus = overall_status;
   CreatedBy = created_by;
   LastChangedBy = last_changed_by;
   CreatedAt = created_at;
   LastChangedAt = last_changed_at;
 }
}
define behavior for ZAM_AB_BOOKING alias Booking
persistent table /dmo/booking_m
//child entities depends on the lock of root entity
lock dependent by _Travel
//auth depedent on the root entity
authorization dependent by _Travel
//concurrency at booking
etag master LastChangedAt
//automatic management of booking id from sequence generator
early numbering
{
 update;
 delete;
 field ( readonly ) TravelId, BookingId;
 association _Travel;
 association _BookingSuppl { create; }
 mapping for /dmo/booking_m{
   TravelId = travel_id;
   BookingId = booking_id;
   BookingDate = booking_date;
   CustomerId = customer_id;
   CarrierId = carrier_id;
   ConnectionId = connection_id;
   FlightDate = flight_date;
   FlightPrice = flight_price;
   CurrencyCode = currency_code;
   BookingStatus = booking_status;
   LastChangedAt = last_changed_at;
 }
}
define behavior for ZAM_AB_BOOKSUPPL alias BookingSuppl
persistent table /dmo/booksuppl_m
//child entities depends on the lock of root entity
lock dependent by _Travel
authorization dependent by _Travel
etag master LastChangedAt
{
 update;
 delete;
 field ( readonly ) TravelId, BookingId;
 association _Travel;
 association _Booking;
 mapping for /dmo/booksuppl_m{
   TravelId = travel_id;
   BookingId = booking_id;
   BookingSupplementId = booking_supplement_id;
   SupplementId = supplement_id;
   Price = price;
   CurrencyCode = currency_code;
   LastChangedAt = last_changed_at;
 }
}
```

<details>
<summary>💡 What the important lines mean (click to open)</summary>

| Line / keyword | What it does |
|---|---|
| `association to` | A reusable, lazily-evaluated relationship. Cheaper than a JOIN because it only runs when used. |
| `managed implementation in class ... unique` | RAP writes the INSERT/UPDATE/DELETE for you; your class only holds the special logic. |
| `strict ( 2 );` | Turns on the strictest syntax checks. It refuses code that would break in a future release - always switch it on. |
| `lock master` | 'I am the root - I own the lock for this whole business object.' Children use `lock dependent by _Travel`. |
| `lock dependent by` | 'I do not own a lock; ask my parent.' Standard for every child entity. |
| `authorization master ( instance )` | 'I decide the permissions for this whole BO.' `( instance )` means the decision is made per record, in code. |
| `authorization dependent by` | 'My permissions come from my parent.' |
| `etag master` | Names the field used for optimistic locking on this entity. |
| `early numbering` | The key is assigned as soon as the user starts creating, so they can see it on screen immediately. |

</details>

### Step 6. Logic for internal action and determination

**📄 ABAP Method Implementation** - copy the block below exactly as it is:

```abap
 METHOD reCalcTotalPrice.
   "EML to read data of travel header (booking fee+currency (target curr))
   "Read booking (price+currency_code)
   "Read supplement (price+currency_code)
   "itab and str to manage price+currency
   "keep adding booking and suppl in common curr to itab
   "currency conversion and total
   "EML to change total price in BO instance
*    Define a structure where we can store all the booking fees and currency code
   TYPES : BEGIN OF ty_amount_per_currency,
             amount        TYPE /dmo/total_price,
             currency_code TYPE /dmo/currency_code,
           END OF ty_amount_per_currency.
   DATA : amounts_per_currencycode TYPE STANDARD TABLE OF ty_amount_per_currency.
*    Read all travel instances, subsequent bookings using EML
   READ ENTITIES OF ZAM_AB_travel IN LOCAL MODE
      ENTITY Travel
      FIELDS ( BookingFee CurrencyCode )
      WITH CORRESPONDING #( keys )
      RESULT DATA(travels).
   READ ENTITIES OF ZAM_AB_travel IN LOCAL MODE
      ENTITY Travel BY \_Booking
      FIELDS ( FlightPrice CurrencyCode )
      WITH CORRESPONDING #( travels )
      RESULT DATA(bookings).
   READ ENTITIES OF ZAM_AB_travel IN LOCAL MODE
      ENTITY Booking BY \_BookingSuppl
      FIELDS ( price CurrencyCode )
      WITH CORRESPONDING #( bookings )
      RESULT DATA(bookingsupplements).
*    Delete the values w/o any currency
   DELETE travels WHERE CurrencyCode IS INITIAL.
   DELETE bookings WHERE CurrencyCode IS INITIAL.
   DELETE bookingsupplements WHERE CurrencyCode IS INITIAL.
*    Total all booking and supplement amounts which are in common currency
   LOOP AT travels ASSIGNING FIELD-SYMBOL(<travel>).
     "Set the first value for total price by adding the booking fee from header
     amounts_per_currencycode = VALUE #( ( amount = <travel>-BookingFee
                                         currency_code = <travel>-CurrencyCode ) ).
*    Loop at all amounts and compare with target currency
     LOOP AT bookings INTO DATA(booking) WHERE TravelId = <travel>-TravelId.
       COLLECT VALUE ty_amount_per_currency( amount = booking-FlightPrice
                                             currency_code = booking-CurrencyCode
       ) INTO amounts_per_currencycode.
     ENDLOOP.
     LOOP AT bookingsupplements INTO DATA(bookingsupplement) WHERE TravelId = <travel>-TravelId.
       COLLECT VALUE ty_amount_per_currency( amount = bookingsupplement-Price
                                             currency_code = booking-CurrencyCode
       ) INTO amounts_per_currencycode.
     ENDLOOP.
     CLEAR <travel>-TotalPrice.
*    Perform currency conversion
     LOOP AT amounts_per_currencycode INTO DATA(amount_per_currencycode).
       IF amount_per_currencycode-currency_code = <travel>-CurrencyCode.
         <travel>-TotalPrice += amount_per_currencycode-amount.
       ELSE.
         /dmo/cl_flight_amdp=>convert_currency(
           EXPORTING
             iv_amount               = amount_per_currencycode-amount
             iv_currency_code_source = amount_per_currencycode-currency_code
             iv_currency_code_target = <travel>-CurrencyCode
             iv_exchange_rate_date   = cl_abap_context_info=>get_system_date( )
           IMPORTING
             ev_amount               = DATA(total_booking_amt)
         ).
         <travel>-TotalPrice = <travel>-TotalPrice + total_booking_amt.
       ENDIF.
     ENDLOOP.
*    Put back the total amount
   ENDLOOP.
*    Return the total amount in mapped so the RAP will modify this data to DB
   MODIFY ENTITIES OF    ZAM_AB_travel IN LOCAL MODE
   ENTITY travel
   UPDATE FIELDS ( TotalPrice )
   WITH CORRESPONDING #( travels ).
 ENDMETHOD.

 METHOD calculateTotalPrice.
   MODIFY ENTITIES OF ZAM_AB_travel IN LOCAL MODE
       ENTITY travel
           EXECUTE reCalcTotalPrice
           FROM CORRESPONDING #( keys ).
 ENDMETHOD.
```

<details>
<summary>💡 What the important lines mean (click to open)</summary>

| Line / keyword | What it does |
|---|---|
| `corresponding { ... }` | Inside a mapping, maps the remaining fields by matching names. |
| `READ ENTITIES OF ... ENTITY ... FIELDS ( ... ) WITH ...` | EML read. Always a **mass** operation: you pass a *table* of keys and get a *table* of results, plus `FAILED` and `REPORTED`. |
| `MODIFY ENTITIES OF ... ENTITY ... CREATE/UPDATE/DELETE` | EML write. Goes through the business object, so every validation and determination still runs. |
| `IN LOCAL MODE` | Skip authorisation and feature checks. Correct inside a behavior implementation, because RAP already checked before calling you. |

</details>

### Step 7. validation

**📄 Behavior Definition (BDEF)** - copy the block below exactly as it is:

```abap
managed implementation in class zbp_am_ab_travel unique;
//guideline to be followed which runs the BDEF in strict mode
strict ( 2 );
define behavior for ZAM_AB_TRAVEL alias Travel
//this is the table where RAP will insert our data
persistent table /dmo/travel_m
//control the enqueue and dequeue
lock master
//who can modify, create, update, delete our data using this BDEF
authorization master ( instance )
//concurrency control - automatic
etag master LastChangedAt
//automatic management of travel id from sequence generator
early numbering
{
 //enabling RAP to generate code for us for create, update, delete
 create;
 update;
 delete;
 field ( readonly ) TravelId;
 field ( mandatory ) BeginDate, EndDate, AgencyId, CustomerId;
 association _Booking { create ( features: instance ) ; }
 //Adding a instance based factory data action to copy my travel
 //itinerary based on exisiting travel
 factory action copyTravel [1];
 //its a piece of code which is intented to be only
 //consumed within our RAP BO
 internal action reCalcTotalPrice;
 //Define determination to execute the code when
 //booking fee or curr code changes so we calc total price
 determination calculateTotalPrice on modify
           { create; field BookingFee, CurrencyCode; }
 //Checking custom business object rules
 validation validateHeaderData on save {create; field CustomerId, BeginDate, EndDate;}
 //Since we use alias name in MDE (fiori sends) table has _ we need mapping
 mapping for /dmo/travel_m{
   TravelId = travel_id;
   AgencyId = agency_id;
   CustomerId = customer_id;
   BeginDate = begin_date;
   EndDate = end_date;
   TotalPrice = total_price;
   BookingFee = booking_fee;
   CurrencyCode = currency_code;
   Description = description;
   OverallStatus = overall_status;
   CreatedBy = created_by;
   LastChangedBy = last_changed_by;
   CreatedAt = created_at;
   LastChangedAt = last_changed_at;
 }
}
define behavior for ZAM_AB_BOOKING alias Booking
persistent table /dmo/booking_m
//child entities depends on the lock of root entity
lock dependent by _Travel
//auth depedent on the root entity
authorization dependent by _Travel
//concurrency at booking
etag master LastChangedAt
//automatic management of booking id from sequence generator
early numbering
{
 update;
 delete;
 field ( readonly ) TravelId, BookingId;
 association _Travel;
 association _BookingSuppl { create; }
 mapping for /dmo/booking_m{
   TravelId = travel_id;
   BookingId = booking_id;
   BookingDate = booking_date;
   CustomerId = customer_id;
   CarrierId = carrier_id;
   ConnectionId = connection_id;
   FlightDate = flight_date;
   FlightPrice = flight_price;
   CurrencyCode = currency_code;
   BookingStatus = booking_status;
   LastChangedAt = last_changed_at;
 }
}
define behavior for ZAM_AB_BOOKSUPPL alias BookingSuppl
persistent table /dmo/booksuppl_m
//child entities depends on the lock of root entity
lock dependent by _Travel
authorization dependent by _Travel
etag master LastChangedAt
{
 update;
 delete;
 field ( readonly ) TravelId, BookingId;
 association _Travel;
 association _Booking;
 mapping for /dmo/booksuppl_m{
   TravelId = travel_id;
   BookingId = booking_id;
   BookingSupplementId = booking_supplement_id;
   SupplementId = supplement_id;
   Price = price;
   CurrencyCode = currency_code;
   LastChangedAt = last_changed_at;
 }
}
```

<details>
<summary>💡 What the important lines mean (click to open)</summary>

| Line / keyword | What it does |
|---|---|
| `association to` | A reusable, lazily-evaluated relationship. Cheaper than a JOIN because it only runs when used. |
| `managed implementation in class ... unique` | RAP writes the INSERT/UPDATE/DELETE for you; your class only holds the special logic. |
| `strict ( 2 );` | Turns on the strictest syntax checks. It refuses code that would break in a future release - always switch it on. |
| `lock master` | 'I am the root - I own the lock for this whole business object.' Children use `lock dependent by _Travel`. |
| `lock dependent by` | 'I do not own a lock; ask my parent.' Standard for every child entity. |
| `authorization master ( instance )` | 'I decide the permissions for this whole BO.' `( instance )` means the decision is made per record, in code. |
| `authorization dependent by` | 'My permissions come from my parent.' |
| `etag master` | Names the field used for optimistic locking on this entity. |
| `early numbering` | The key is assigned as soon as the user starts creating, so they can see it on screen immediately. |

</details>

### Step 8. Code in BIMP

**📄 ABAP Method Implementation** - copy the block below exactly as it is:

```abap
METHOD validateHeaderData.
   "Step 1: Read the travel data
   READ ENTITIES OF ZAM_AB_travel IN LOCAL MODE
       ENTITY travel
       FIELDS ( CustomerId )
       WITH CORRESPONDING #( keys )
       RESULT DATA(lt_travel).
   "Step 2: Declare a sorted table for holding customer ids
   DATA customers TYPE SORTED TABLE OF /dmo/customer WITH UNIQUE KEY customer_id.
   "Step 3: Extract the unique customer IDs in our table
   customers = CORRESPONDING #( lt_travel DISCARDING DUPLICATES MAPPING
                                      customer_id = CustomerId EXCEPT *
    ).
   DELETE customers WHERE customer_id IS INITIAL.
   ""Get the validation done to get all customer ids from db
   ""these are the IDs which are present
   IF customers IS NOT INITIAL.
     SELECT FROM /dmo/customer FIELDS customer_id
     FOR ALL ENTRIES IN @customers
     WHERE customer_id = @customers-customer_id
     INTO TABLE @DATA(lt_cust_db).
   ENDIF.
   ""loop at travel data
   LOOP AT lt_travel INTO DATA(ls_travel).
     IF ( ls_travel-CustomerId IS INITIAL OR
          NOT  line_exists(  lt_cust_db[ customer_id = ls_travel-CustomerId ] ) ).
       ""Inform the RAP framework to terminate the create
       APPEND VALUE #( %tky = ls_travel-%tky ) TO failed-travel.
       APPEND VALUE #( %tky = ls_travel-%tky
                       %element-customerid = if_abap_behv=>mk-on
                       %msg = NEW /dmo/cm_flight_messages(
                                     textid                = /dmo/cm_flight_messages=>customer_unkown
                                     customer_id           = ls_travel-CustomerId
                                     severity              = if_abap_behv_message=>severity-error
       )
       ) TO reported-travel.
     ENDIF.
     IF ls_travel-enddate < ls_travel-begindate.  "end_date before begin_date
       APPEND VALUE #( %tky = ls_travel-%tky ) TO failed-travel.
       APPEND VALUE #( %tky = ls_travel-%tky
                       %msg = NEW /dmo/cm_flight_messages(
                                  textid     = /dmo/cm_flight_messages=>begin_date_bef_end_date
                                  severity   = if_abap_behv_message=>severity-error
                                  begin_date = ls_travel-begindate
                                  end_date   = ls_travel-enddate
                                  travel_id  = ls_travel-travelid )
                       %element-begindate   = if_abap_behv=>mk-on
                       %element-enddate     = if_abap_behv=>mk-on
                    ) TO reported-travel.
     ELSEIF ls_travel-begindate < cl_abap_context_info=>get_system_date( ).  "begin_date must be in the future
       APPEND VALUE #( %tky        = ls_travel-%tky ) TO failed-travel.
       APPEND VALUE #( %tky = ls_travel-%tky
                       %msg = NEW /dmo/cm_flight_messages(
                                   textid   = /dmo/cm_flight_messages=>begin_date_on_or_bef_sysdate
                                   severity = if_abap_behv_message=>severity-error )
                       %element-begindate  = if_abap_behv=>mk-on
                       %element-enddate    = if_abap_behv=>mk-on
                     ) TO reported-travel.
     ENDIF.
   ENDLOOP.
   ""Exercise: Validations
   "1. check if begin and end date is empty
   "2. check if the end date is always > begin date
   "3. begin date of travel should be in future
 ENDMETHOD.
```

<details>
<summary>💡 What the important lines mean (click to open)</summary>

| Line / keyword | What it does |
|---|---|
| `corresponding { ... }` | Inside a mapping, maps the remaining fields by matching names. |
| `validation ... on save` | A gatekeeper at save time. It may only accept or refuse - it must never change data. |
| `READ ENTITIES OF ... ENTITY ... FIELDS ( ... ) WITH ...` | EML read. Always a **mass** operation: you pass a *table* of keys and get a *table* of results, plus `FAILED` and `REPORTED`. |
| `IN LOCAL MODE` | Skip authorisation and feature checks. Correct inside a behavior implementation, because RAP already checked before calling you. |
| `%tky` | *Transactional key* - the complete key of one instance, including its draft flag. Match records on this inside handlers. |
| `%msg` | The message object you attach to a `reported` entry so the user sees a proper error text. |
| `failed-<alias>` | The table of records that could **not** be processed. RAP is a mass framework, so failures are per record, not one exception. |
| `reported-<alias>` | The table of messages to show the user. |

</details>

---

---

## ✅ Final version of all code from Day 10

Everything below is the **complete, unmodified** source from the training material, gathered in one place so you can copy it straight into Eclipse.

### 1. Logic in BIMP in our BPool Class (last session we generated the method copyTravel) - _ABAP Method Implementation_

```abap
METHOD copyTravel.
 "Prepare the itabs with the data that needs to be inserted
   data: travels type table for create ZAM_AB_travel\\Travel,
         bookings_cba type table for create ZAM_AB_travel\\Travel\_Booking,
         booksuppl_cba type table for create ZAM_AB_travel\\Booking\_BookingSuppl.
   "Step 1: Remove the travel instances with initial %cid
   read table keys with key %cid = '' into data(key_with_initial_cid).
   ASSERT key_with_initial_cid is initial.
   "Step 2: Read all travel, booking and booking supplement using EML
   read entities of ZAM_AB_travel in local mode
   entity Travel
       ALL FIELDS WITH CORRESPONDING #( keys )
       RESULT DATA(travel_read_result)
       FAILED failed.
   read entities of ZAM_AB_travel in local mode
   entity Travel by \_Booking
       ALL FIELDS WITH CORRESPONDING #( travel_read_result )
       RESULT DATA(book_read_result)
       FAILED failed.
   read entities of ZAM_AB_travel in local mode
   entity booking by \_BookingSuppl
       ALL FIELDS WITH CORRESPONDING #( book_read_result )
       RESULT DATA(booksuppl_read_result)
       FAILED failed.
   "Step 3: Fill travel internal table for travel data creation - %cid - abc123
   loop at travel_read_result ASSIGNING FIELD-SYMBOL(<travel>).
        "Travel data prepration
        append value #( %cid = keys[ %tky = <travel>-%tky ]-%cid
                       %data = CORRESPONDING #( <travel> except travelId )
        ) to travels ASSIGNING FIELD-SYMBOL(<new_travel>).
        <new_travel>-BeginDate = cl_abap_context_info=>get_system_date( ).
        <new_travel>-EndDate = cl_abap_context_info=>get_system_date( ) + 30.
        <new_travel>-OverallStatus = 'O'.
       "Step 3: Fill booking internal table for booking data creation - %cid_ref - abc123
       append value #( %cid_ref = keys[ key entity %tky = <travel>-%tky ]-%cid )
         to bookings_cba ASSIGNING FIELD-SYMBOL(<bookings_cba>).
       loop at  book_read_result ASSIGNING FIELD-SYMBOL(<booking>) where TravelId = <travel>-TravelId.
           append value #( %cid = keys[ key entity %tky = <travel>-%tky ]-%cid && <booking>-BookingId
                           %data = CORRESPONDING #( book_read_result[ key entity %tky = <booking>-%tky ] EXCEPT travelid )
           )
               to <bookings_cba>-%target ASSIGNING FIELD-SYMBOL(<new_booking>).
           <new_booking>-BookingStatus = 'N'.
           "Step 4: Fill booking supplement internal table for booking suppl data creation
           append value #( %cid_ref = keys[ key entity %tky = <travel>-%tky ]-%cid && <booking>-BookingId )
                   to booksuppl_cba ASSIGNING FIELD-SYMBOL(<booksuppl_cba>).
           loop at booksuppl_read_result ASSIGNING FIELD-SYMBOL(<booksuppl>)
               using KEY entity where TravelId = <travel>-TravelId and
                                      BookingId = <booking>-BookingId.
               append value #( %cid = keys[ key entity %tky = <travel>-%tky ]-%cid && <booking>-BookingId && <booksuppl>-BookingSupplementId
                           %data = CORRESPONDING #( <booksuppl> EXCEPT travelid bookingid )
               )
               to <booksuppl_cba>-%target.
           ENDLOOP.
       ENDLOOP.
   ENDLOOP.
   "Step 5: MODIFY ENTITY EML to create new BO instance using existing data
   MODIFY ENTITIES OF ZAM_AB_travel IN LOCAL MODE
       ENTITY travel
           CREATE FIELDS ( AgencyId CustomerId BeginDate EndDate BookingFee TotalPrice CurrencyCode OverallStatus )
               with travels
                   create by \_Booking FIELDS ( Bookingid BookingDate CustomerId CarrierId ConnectionId FlightDate FlightPrice CurrencyCode BookingStatus )
                       with bookings_cba
                           ENTITY Booking
                               create by \_BookingSuppl FIELDS ( bookingsupplementid supplementid price currencycode )
                                   WITH booksuppl_cba
       MAPPED data(mapped_create).
    mapped-travel = mapped_create-travel.
 ENDMETHOD.
```

### 2. Expose the Action in processor projection in BDEF of processor - _Behavior Definition - projection (BDEF)_

```abap
projection;
strict ( 2 );
define behavior for ZAM_AB_TRAVEL_PROCESSOR alias Travel
{
 use create;
 use update;
 use delete;
 use action copyTravel;
 use association _Booking { create; }
}
define behavior for ZAM_AB_BOOKING_PROCESSOR alias Booking
{
 use update;
 use delete;
 use association _Travel;
 use association _BookingSuppl { create; }
}
define behavior for ZAM_AB_BOOKSUPPL_PROCESSOR alias BookSuppl
{
 use update;
 use delete;
 use association _Travel;
 use association _Booking;
}
```

### 3. Add the MDE code to expose button - _Metadata Extension (MDE)_

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
       }
   ]
   @UI.selectionField: [{ position: 10 }]
   @UI.lineItem: [{ position: 10 },
                  { type: #FOR_ACTION, dataAction: 'copyTravel', label: 'Copy kardo' }]
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
//    CreatedBy;
//    CreatedAt;
//    LastChangedBy;
//    LastChangedAt;
  
}
```

### 4. Working with internal action (reuse) and determination (trigger logic based on condition) - _Behavior Definition (BDEF)_

```abap
managed implementation in class zbp_am_ab_travel unique;
//guideline to be followed which runs the BDEF in strict mode
strict ( 2 );
define behavior for ZAM_AB_TRAVEL alias Travel
//this is the table where RAP will insert our data
persistent table /dmo/travel_m
//control the enqueue and dequeue
lock master
//who can modify, create, update, delete our data using this BDEF
authorization master ( instance )
//concurrency control - automatic
etag master LastChangedAt
//automatic management of travel id from sequence generator
early numbering
{
 //enabling RAP to generate code for us for create, update, delete
 create;
 update;
 delete;
 field ( readonly ) TravelId;
 field ( mandatory ) BeginDate, EndDate, AgencyId, CustomerId;
 association _Booking { create ( features: instance ) ; }
 //Adding a instance based factory data action to copy my travel
 //itinerary based on exisiting travel
 factory action copyTravel [1];
 //its a piece of code which is intented to be only
 //consumed within our RAP BO
 internal action reCalcTotalPrice;
 //Define determination to execute the code when
 //booking fee or curr code changes so we calc total price
 determination calculateTotalPrice on modify
           { create; field BookingFee, CurrencyCode; }
 //Since we use alias name in MDE (fiori sends) table has _ we need mapping
 mapping for /dmo/travel_m{
   TravelId = travel_id;
   AgencyId = agency_id;
   CustomerId = customer_id;
   BeginDate = begin_date;
   EndDate = end_date;
   TotalPrice = total_price;
   BookingFee = booking_fee;
   CurrencyCode = currency_code;
   Description = description;
   OverallStatus = overall_status;
   CreatedBy = created_by;
   LastChangedBy = last_changed_by;
   CreatedAt = created_at;
   LastChangedAt = last_changed_at;
 }
}
define behavior for ZAM_AB_BOOKING alias Booking
persistent table /dmo/booking_m
//child entities depends on the lock of root entity
lock dependent by _Travel
//auth depedent on the root entity
authorization dependent by _Travel
//concurrency at booking
etag master LastChangedAt
//automatic management of booking id from sequence generator
early numbering
{
 update;
 delete;
 field ( readonly ) TravelId, BookingId;
 association _Travel;
 association _BookingSuppl { create; }
 mapping for /dmo/booking_m{
   TravelId = travel_id;
   BookingId = booking_id;
   BookingDate = booking_date;
   CustomerId = customer_id;
   CarrierId = carrier_id;
   ConnectionId = connection_id;
   FlightDate = flight_date;
   FlightPrice = flight_price;
   CurrencyCode = currency_code;
   BookingStatus = booking_status;
   LastChangedAt = last_changed_at;
 }
}
define behavior for ZAM_AB_BOOKSUPPL alias BookingSuppl
persistent table /dmo/booksuppl_m
//child entities depends on the lock of root entity
lock dependent by _Travel
authorization dependent by _Travel
etag master LastChangedAt
{
 update;
 delete;
 field ( readonly ) TravelId, BookingId;
 association _Travel;
 association _Booking;
 mapping for /dmo/booksuppl_m{
   TravelId = travel_id;
   BookingId = booking_id;
   BookingSupplementId = booking_supplement_id;
   SupplementId = supplement_id;
   Price = price;
   CurrencyCode = currency_code;
   LastChangedAt = last_changed_at;
 }
}
```

### 5. Logic for internal action and determination - _ABAP Method Implementation_

```abap
 METHOD reCalcTotalPrice.
   "EML to read data of travel header (booking fee+currency (target curr))
   "Read booking (price+currency_code)
   "Read supplement (price+currency_code)
   "itab and str to manage price+currency
   "keep adding booking and suppl in common curr to itab
   "currency conversion and total
   "EML to change total price in BO instance
*    Define a structure where we can store all the booking fees and currency code
   TYPES : BEGIN OF ty_amount_per_currency,
             amount        TYPE /dmo/total_price,
             currency_code TYPE /dmo/currency_code,
           END OF ty_amount_per_currency.
   DATA : amounts_per_currencycode TYPE STANDARD TABLE OF ty_amount_per_currency.
*    Read all travel instances, subsequent bookings using EML
   READ ENTITIES OF ZAM_AB_travel IN LOCAL MODE
      ENTITY Travel
      FIELDS ( BookingFee CurrencyCode )
      WITH CORRESPONDING #( keys )
      RESULT DATA(travels).
   READ ENTITIES OF ZAM_AB_travel IN LOCAL MODE
      ENTITY Travel BY \_Booking
      FIELDS ( FlightPrice CurrencyCode )
      WITH CORRESPONDING #( travels )
      RESULT DATA(bookings).
   READ ENTITIES OF ZAM_AB_travel IN LOCAL MODE
      ENTITY Booking BY \_BookingSuppl
      FIELDS ( price CurrencyCode )
      WITH CORRESPONDING #( bookings )
      RESULT DATA(bookingsupplements).
*    Delete the values w/o any currency
   DELETE travels WHERE CurrencyCode IS INITIAL.
   DELETE bookings WHERE CurrencyCode IS INITIAL.
   DELETE bookingsupplements WHERE CurrencyCode IS INITIAL.
*    Total all booking and supplement amounts which are in common currency
   LOOP AT travels ASSIGNING FIELD-SYMBOL(<travel>).
     "Set the first value for total price by adding the booking fee from header
     amounts_per_currencycode = VALUE #( ( amount = <travel>-BookingFee
                                         currency_code = <travel>-CurrencyCode ) ).
*    Loop at all amounts and compare with target currency
     LOOP AT bookings INTO DATA(booking) WHERE TravelId = <travel>-TravelId.
       COLLECT VALUE ty_amount_per_currency( amount = booking-FlightPrice
                                             currency_code = booking-CurrencyCode
       ) INTO amounts_per_currencycode.
     ENDLOOP.
     LOOP AT bookingsupplements INTO DATA(bookingsupplement) WHERE TravelId = <travel>-TravelId.
       COLLECT VALUE ty_amount_per_currency( amount = bookingsupplement-Price
                                             currency_code = booking-CurrencyCode
       ) INTO amounts_per_currencycode.
     ENDLOOP.
     CLEAR <travel>-TotalPrice.
*    Perform currency conversion
     LOOP AT amounts_per_currencycode INTO DATA(amount_per_currencycode).
       IF amount_per_currencycode-currency_code = <travel>-CurrencyCode.
         <travel>-TotalPrice += amount_per_currencycode-amount.
       ELSE.
         /dmo/cl_flight_amdp=>convert_currency(
           EXPORTING
             iv_amount               = amount_per_currencycode-amount
             iv_currency_code_source = amount_per_currencycode-currency_code
             iv_currency_code_target = <travel>-CurrencyCode
             iv_exchange_rate_date   = cl_abap_context_info=>get_system_date( )
           IMPORTING
             ev_amount               = DATA(total_booking_amt)
         ).
         <travel>-TotalPrice = <travel>-TotalPrice + total_booking_amt.
       ENDIF.
     ENDLOOP.
*    Put back the total amount
   ENDLOOP.
*    Return the total amount in mapped so the RAP will modify this data to DB
   MODIFY ENTITIES OF    ZAM_AB_travel IN LOCAL MODE
   ENTITY travel
   UPDATE FIELDS ( TotalPrice )
   WITH CORRESPONDING #( travels ).
 ENDMETHOD.

 METHOD calculateTotalPrice.
   MODIFY ENTITIES OF ZAM_AB_travel IN LOCAL MODE
       ENTITY travel
           EXECUTE reCalcTotalPrice
           FROM CORRESPONDING #( keys ).
 ENDMETHOD.
```

### 6. validation - _Behavior Definition (BDEF)_

```abap
managed implementation in class zbp_am_ab_travel unique;
//guideline to be followed which runs the BDEF in strict mode
strict ( 2 );
define behavior for ZAM_AB_TRAVEL alias Travel
//this is the table where RAP will insert our data
persistent table /dmo/travel_m
//control the enqueue and dequeue
lock master
//who can modify, create, update, delete our data using this BDEF
authorization master ( instance )
//concurrency control - automatic
etag master LastChangedAt
//automatic management of travel id from sequence generator
early numbering
{
 //enabling RAP to generate code for us for create, update, delete
 create;
 update;
 delete;
 field ( readonly ) TravelId;
 field ( mandatory ) BeginDate, EndDate, AgencyId, CustomerId;
 association _Booking { create ( features: instance ) ; }
 //Adding a instance based factory data action to copy my travel
 //itinerary based on exisiting travel
 factory action copyTravel [1];
 //its a piece of code which is intented to be only
 //consumed within our RAP BO
 internal action reCalcTotalPrice;
 //Define determination to execute the code when
 //booking fee or curr code changes so we calc total price
 determination calculateTotalPrice on modify
           { create; field BookingFee, CurrencyCode; }
 //Checking custom business object rules
 validation validateHeaderData on save {create; field CustomerId, BeginDate, EndDate;}
 //Since we use alias name in MDE (fiori sends) table has _ we need mapping
 mapping for /dmo/travel_m{
   TravelId = travel_id;
   AgencyId = agency_id;
   CustomerId = customer_id;
   BeginDate = begin_date;
   EndDate = end_date;
   TotalPrice = total_price;
   BookingFee = booking_fee;
   CurrencyCode = currency_code;
   Description = description;
   OverallStatus = overall_status;
   CreatedBy = created_by;
   LastChangedBy = last_changed_by;
   CreatedAt = created_at;
   LastChangedAt = last_changed_at;
 }
}
define behavior for ZAM_AB_BOOKING alias Booking
persistent table /dmo/booking_m
//child entities depends on the lock of root entity
lock dependent by _Travel
//auth depedent on the root entity
authorization dependent by _Travel
//concurrency at booking
etag master LastChangedAt
//automatic management of booking id from sequence generator
early numbering
{
 update;
 delete;
 field ( readonly ) TravelId, BookingId;
 association _Travel;
 association _BookingSuppl { create; }
 mapping for /dmo/booking_m{
   TravelId = travel_id;
   BookingId = booking_id;
   BookingDate = booking_date;
   CustomerId = customer_id;
   CarrierId = carrier_id;
   ConnectionId = connection_id;
   FlightDate = flight_date;
   FlightPrice = flight_price;
   CurrencyCode = currency_code;
   BookingStatus = booking_status;
   LastChangedAt = last_changed_at;
 }
}
define behavior for ZAM_AB_BOOKSUPPL alias BookingSuppl
persistent table /dmo/booksuppl_m
//child entities depends on the lock of root entity
lock dependent by _Travel
authorization dependent by _Travel
etag master LastChangedAt
{
 update;
 delete;
 field ( readonly ) TravelId, BookingId;
 association _Travel;
 association _Booking;
 mapping for /dmo/booksuppl_m{
   TravelId = travel_id;
   BookingId = booking_id;
   BookingSupplementId = booking_supplement_id;
   SupplementId = supplement_id;
   Price = price;
   CurrencyCode = currency_code;
   LastChangedAt = last_changed_at;
 }
}
```

### 7. Code in BIMP - _ABAP Method Implementation_

```abap
METHOD validateHeaderData.
   "Step 1: Read the travel data
   READ ENTITIES OF ZAM_AB_travel IN LOCAL MODE
       ENTITY travel
       FIELDS ( CustomerId )
       WITH CORRESPONDING #( keys )
       RESULT DATA(lt_travel).
   "Step 2: Declare a sorted table for holding customer ids
   DATA customers TYPE SORTED TABLE OF /dmo/customer WITH UNIQUE KEY customer_id.
   "Step 3: Extract the unique customer IDs in our table
   customers = CORRESPONDING #( lt_travel DISCARDING DUPLICATES MAPPING
                                      customer_id = CustomerId EXCEPT *
    ).
   DELETE customers WHERE customer_id IS INITIAL.
   ""Get the validation done to get all customer ids from db
   ""these are the IDs which are present
   IF customers IS NOT INITIAL.
     SELECT FROM /dmo/customer FIELDS customer_id
     FOR ALL ENTRIES IN @customers
     WHERE customer_id = @customers-customer_id
     INTO TABLE @DATA(lt_cust_db).
   ENDIF.
   ""loop at travel data
   LOOP AT lt_travel INTO DATA(ls_travel).
     IF ( ls_travel-CustomerId IS INITIAL OR
          NOT  line_exists(  lt_cust_db[ customer_id = ls_travel-CustomerId ] ) ).
       ""Inform the RAP framework to terminate the create
       APPEND VALUE #( %tky = ls_travel-%tky ) TO failed-travel.
       APPEND VALUE #( %tky = ls_travel-%tky
                       %element-customerid = if_abap_behv=>mk-on
                       %msg = NEW /dmo/cm_flight_messages(
                                     textid                = /dmo/cm_flight_messages=>customer_unkown
                                     customer_id           = ls_travel-CustomerId
                                     severity              = if_abap_behv_message=>severity-error
       )
       ) TO reported-travel.
     ENDIF.
     IF ls_travel-enddate < ls_travel-begindate.  "end_date before begin_date
       APPEND VALUE #( %tky = ls_travel-%tky ) TO failed-travel.
       APPEND VALUE #( %tky = ls_travel-%tky
                       %msg = NEW /dmo/cm_flight_messages(
                                  textid     = /dmo/cm_flight_messages=>begin_date_bef_end_date
                                  severity   = if_abap_behv_message=>severity-error
                                  begin_date = ls_travel-begindate
                                  end_date   = ls_travel-enddate
                                  travel_id  = ls_travel-travelid )
                       %element-begindate   = if_abap_behv=>mk-on
                       %element-enddate     = if_abap_behv=>mk-on
                    ) TO reported-travel.
     ELSEIF ls_travel-begindate < cl_abap_context_info=>get_system_date( ).  "begin_date must be in the future
       APPEND VALUE #( %tky        = ls_travel-%tky ) TO failed-travel.
       APPEND VALUE #( %tky = ls_travel-%tky
                       %msg = NEW /dmo/cm_flight_messages(
                                   textid   = /dmo/cm_flight_messages=>begin_date_on_or_bef_sysdate
                                   severity = if_abap_behv_message=>severity-error )
                       %element-begindate  = if_abap_behv=>mk-on
                       %element-enddate    = if_abap_behv=>mk-on
                     ) TO reported-travel.
     ENDIF.
   ENDLOOP.
   ""Exercise: Validations
   "1. check if begin and end date is empty
   "2. check if the end date is always > begin date
   "3. begin date of travel should be in future
 ENDMETHOD.
```

---

## ⚠️ Traps and tips

- Determination *changes* data, validation *rejects* data. Never try to fix values inside a validation - RAP will ignore you.
- Actions declared in the interface BDEF still need `use action <name>;` in the projection BDEF, or the button never appears.

---

[⬅️ Day 9](Day09_Early_Numbering_And_Feature_Control.md) | [🏠 Summary](00_SUMMARY.md) | [📋 Master Cheat Sheet](00_MASTER_CHEAT_SHEET.md) | [Day 11 ➡️](Day11_OData_V4_Draft_And_Authorisation.md)
