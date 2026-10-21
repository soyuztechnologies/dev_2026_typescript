---Table Equipment Order

```
@EndUserText.label : 'Equipment Request'
@AbapCatalog.enhancement.category : #NOT_EXTENSIBLE
@AbapCatalog.tableCategory : #TRANSPARENT
@AbapCatalog.deliveryClass : #A
@AbapCatalog.dataMaintenance : #RESTRICTED
define table zats_ab_equip {

  key client            : abap.clnt not null;
  key order_uuid        : sysuuid_x16 not null;
  item_text             : abap.char(40);
  category_id           : abap.char(1);
  supplier_name         : abap.char(10);
  @Semantics.amount.currencyCode : 'zats_ab_equip.currency_code'
  unit_price            : abap.curr(13,2);
  currency_code         : abap.cuky;
  quantity              : abap.int4;
  delivery_date         : abap.dats;
  overall_status        : abap.char(1);
  review                : abap.string(0);
  local_created_by      : abp_creation_user;
  local_created_at      : abp_creation_tstmpl;
  local_last_changed_by : abp_locinst_lastchange_user;
  local_last_changed_at : abp_locinst_lastchange_tstmpl;
  last_changed_at       : abp_lastchange_tstmpl;

}
```



-----Value help entities

```
@AbapCatalog.viewEnhancementCategory: [#NONE]
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'ZATS_AB_STATUS'
@Metadata.ignorePropagatedAnnotations: true
define view entity ZATS_AB_STATUS
  as select from I_Language
{
      @ObjectModel.text.element: ['Description']
  key cast( 'A' as abap.char(1) )           as Value,
      @Semantics.text: true
      cast( 'Approved' as abap.char(40) )   as Description
}
where Language = $session.system_language

union select from I_Language
{
  key cast( 'R' as abap.char(1) )           as Value,
      cast( 'Rejected' as abap.char(40) )   as Description
}
where Language = $session.system_language

union select from I_Language
{
  key cast( 'I' as abap.char(1) )           as Value,
      cast( 'In Process' as abap.char(40) ) as Description
}
where Language = $session.system_language

union select from I_Language
{
  key cast( 'N' as abap.char(1) )           as Value,
      cast( 'New' as abap.char(40) )        as Description
}
where Language = $session.system_language
```


----product category

```

@AbapCatalog.viewEnhancementCategory: [#NONE]
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'ZATS_AB_PRODCAT'
@Metadata.ignorePropagatedAnnotations: true
define view entity ZATS_AB_PRODCAT
  as select from I_Language
{
      @ObjectModel.text.element: ['Description']
  key cast( 'H' as abap.char(1) )              as Value,
      @Semantics.text: true
      cast( 'Headsets' as abap.char(40) )      as Description
}
where Language = $session.system_language

union select from I_Language
{
  key cast( 'N' as abap.char(1) )              as Value,
      cast( 'Notebooks' as abap.char(40) )     as Description
}
where Language = $session.system_language

union select from I_Language
{
  key cast( 'M' as abap.char(1) )              as Value,
      cast( 'Mobile Phones' as abap.char(40) ) as Description
}
where Language = $session.system_language
```


----company names

```
@AbapCatalog.viewEnhancementCategory: [#NONE]
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'ZATS_AB_COMPANY'
@Metadata.ignorePropagatedAnnotations: true
define view entity ZATS_AB_COMPANY
  as select from I_Language
{
      @ObjectModel.text.element: ['Description']
  key cast( '01' as abap.char(10) )                as Value,
      @Semantics.text: true
      cast( 'Anubhav Trainings' as abap.char(40) ) as Description
}
where Language = $session.system_language

union select from I_Language
{
  key cast( '02' as abap.char(10) )                as Value,
      cast( 'Bosch' as abap.char(40) )             as Description
}
where Language = $session.system_language

union select from I_Language
{
  key cast( '03' as abap.char(10) )                as Value,
      cast( 'Space X' as abap.char(40) )           as Description
}
where Language = $session.system_language

union select from I_Language
{
  key cast( '04' as abap.char(10) )                as Value,
      cast( 'Applied Materials' as abap.char(40) ) as Description
}
where Language = $session.system_language

union select from I_Language
{
  key cast( '05' as abap.char(10) )                as Value,
      cast( 'Scan Disk' as abap.char(40) )         as Description
}
where Language = $session.system_language

union select from I_Language
{
  key cast( '06' as abap.char(10) )                as Value,
      cast( 'Binance' as abap.char(40) )           as Description
}
where Language = $session.system_language
```

----Generate RAP BO using RAP generator


----data generator class

```
CLASS zcl_ats_ab_equip_datagen DEFINITION
  PUBLIC
  FINAL
  CREATE PUBLIC.

  PUBLIC SECTION.
    INTERFACES if_oo_adt_classrun.
ENDCLASS.



CLASS zcl_ats_ab_equip_datagen IMPLEMENTATION.

  METHOD if_oo_adt_classrun~main.

    DATA lt_create TYPE TABLE FOR CREATE zr_ats_ab_equip.

    DATA(lv_today) = cl_abap_context_info=>get_system_date( ).

    " Clean up old test data so the class can be rerun
    DELETE FROM zats_ab_equip.

    " 10 unique entries - OrderUUID is generated by managed numbering
    lt_create = VALUE #(
      ( %cid = 'C01' ItemText = 'Sennheiser Momentum 4'  CategoryId = 'H' SupplierName = '01'
        UnitPrice = '349.00'  CurrencyCode = 'EUR' Quantity = 5  DeliveryDate = lv_today + 7
        OverallStatus = 'N' Review = 'Noise cancelling headsets for the support team' )
      ( %cid = 'C02' ItemText = 'Bose QuietComfort 45'   CategoryId = 'H' SupplierName = '02'
        UnitPrice = '299.00'  CurrencyCode = 'EUR' Quantity = 8  DeliveryDate = lv_today + 10
        OverallStatus = 'I' Review = 'Headsets for new joiners in the sales team' )
      ( %cid = 'C03' ItemText = 'Jabra Evolve2 65'       CategoryId = 'H' SupplierName = '05'
        UnitPrice = '219.00'  CurrencyCode = 'USD' Quantity = 12 DeliveryDate = lv_today + 14
        OverallStatus = 'A' Review = 'Call center headset replacement' )
      ( %cid = 'C04' ItemText = 'Lenovo ThinkPad X1'     CategoryId = 'N' SupplierName = '03'
        UnitPrice = '1650.00' CurrencyCode = 'EUR' Quantity = 4  DeliveryDate = lv_today + 21
        OverallStatus = 'A' Review = 'Laptops for SAP developers' )
      ( %cid = 'C05' ItemText = 'Dell Latitude 7440'     CategoryId = 'N' SupplierName = '04'
        UnitPrice = '1390.00' CurrencyCode = 'USD' Quantity = 6  DeliveryDate = lv_today + 18
        OverallStatus = 'R' Review = 'Rejected - budget not approved this quarter' )
      ( %cid = 'C06' ItemText = 'Apple MacBook Pro 14'   CategoryId = 'N' SupplierName = '06'
        UnitPrice = '1999.00' CurrencyCode = 'USD' Quantity = 2  DeliveryDate = lv_today + 30
        OverallStatus = 'N' Review = 'Video editing machines for YouTube content' )
      ( %cid = 'C07' ItemText = 'HP EliteBook 840'       CategoryId = 'N' SupplierName = '01'
        UnitPrice = '85000.00' CurrencyCode = 'INR' Quantity = 10 DeliveryDate = lv_today + 12
        OverallStatus = 'I' Review = 'Training lab laptops' )
      ( %cid = 'C08' ItemText = 'iPhone 16'              CategoryId = 'M' SupplierName = '02'
        UnitPrice = '999.00'  CurrencyCode = 'EUR' Quantity = 3  DeliveryDate = lv_today + 5
        OverallStatus = 'A' Review = 'Phones for field managers' )
      ( %cid = 'C09' ItemText = 'Samsung Galaxy S25'     CategoryId = 'M' SupplierName = '05'
        UnitPrice = '899.00'  CurrencyCode = 'USD' Quantity = 7  DeliveryDate = lv_today + 9
        OverallStatus = 'N' Review = 'Test devices for mobile Fiori apps' )
      ( %cid = 'C10' ItemText = 'Google Pixel 9'         CategoryId = 'M' SupplierName = '03'
        UnitPrice = '74999.00' CurrencyCode = 'INR' Quantity = 4 DeliveryDate = lv_today + 15
        OverallStatus = 'R' Review = 'Rejected - duplicate request' )
    ).

    " Create via EML
    MODIFY ENTITIES OF zr_ats_ab_equip
      ENTITY ZrAtsAbEquip
        CREATE FIELDS ( ItemText CategoryId SupplierName UnitPrice CurrencyCode
                        Quantity DeliveryDate OverallStatus Review )
        WITH lt_create
      MAPPED   DATA(ls_mapped)
      FAILED   DATA(ls_failed)
      REPORTED DATA(ls_reported).

    IF ls_failed IS NOT INITIAL.
      out->write( |Create failed for { lines( ls_failed-zratsabequip ) } entries| ).
      ROLLBACK ENTITIES.
      RETURN.
    ENDIF.

    " Persist to the database
    COMMIT ENTITIES
      RESPONSE OF zr_ats_ab_equip
      FAILED   DATA(ls_commit_failed)
      REPORTED DATA(ls_commit_reported).

    IF ls_commit_failed IS NOT INITIAL.
      out->write( 'Commit failed - check validations in the behavior pool' ).
      RETURN.
    ENDIF.

    out->write( |{ lines( ls_mapped-zratsabequip ) } equipment requests created:| ).
    LOOP AT ls_mapped-zratsabequip INTO DATA(ls_key).
      out->write( |{ ls_key-%cid } -> { ls_key-OrderUUID }| ).
    ENDLOOP.

  ENDMETHOD.

ENDCLASS.

```

----change root with to show value help

```
@AccessControl.authorizationCheck: #MANDATORY
@Metadata.allowExtensions: true
@ObjectModel.sapObjectNodeType.name: 'ZATS_AB_EQUIP'
@EndUserText.label: 'Equipment Request'
define root view entity ZR_ATS_AB_EQUIP
  as select from zats_ab_equip
  association [0..1] to ZATS_AB_PRODCAT as _Category on $projection.CategoryId    = _Category.Value
  association [0..1] to ZATS_AB_COMPANY as _Supplier on $projection.SupplierName  = _Supplier.Value
  association [0..1] to ZATS_AB_STATUS  as _Status   on $projection.OverallStatus = _Status.Value
{
      @EndUserText.label: 'Order UUID'
  key order_uuid            as OrderUUID,
      @EndUserText.label: 'Item Name'
      item_text             as ItemText,
      @EndUserText.label: 'Product Category'
      @ObjectModel.text.element: [ 'CategoryText' ]
      @Consumption.valueHelpDefinition: [{ entity: { name: 'ZATS_AB_PRODCAT', element: 'Value' },
                                         useForValidation: true }]
      category_id           as CategoryId,
      @EndUserText.label: 'Category Text'
      _Category.Description as CategoryText,

      @EndUserText.label: 'Supplier Name'
      @ObjectModel.text.element: [ 'SupplierText' ]
      @Consumption.valueHelpDefinition: [{ entity: { name: 'ZATS_AB_COMPANY', element: 'Value' },
                                           useForValidation: true }]
      supplier_name         as SupplierName,
      @EndUserText.label: 'Supplier Text'
      _Supplier.Description as SupplierText,

      @EndUserText.label: 'Unit Price'
      @Semantics.amount.currencyCode: 'CurrencyCode'
      unit_price            as UnitPrice,
      @EndUserText.label: 'Currency'
      @Consumption.valueHelpDefinition: [ {
        entity.name: 'I_CurrencyStdVH',
        entity.element: 'Currency',
        useForValidation: true
      } ]


      currency_code         as CurrencyCode,
      @EndUserText.label: 'Quantity'
      quantity              as Quantity,
      @EndUserText.label: 'Delivery Date'
      delivery_date         as DeliveryDate,
      @EndUserText.label: 'Overall Status'
      @ObjectModel.text.element: [ 'StatusText' ]
      @Consumption.valueHelpDefinition: [{ entity: { name: 'ZATS_AB_STATUS', element: 'Value' },
                                         useForValidation: true }]
      overall_status        as OverallStatus,
      @EndUserText.label: 'Status Text'
      _Status.Description   as StatusText,
      @EndUserText.label: 'Review'
      review                as Review,
      @EndUserText.label: 'Created By'
      @Semantics.user.createdBy: true
      local_created_by      as LocalCreatedBy,
      @EndUserText.label: 'Created At'
      @Semantics.systemDateTime.createdAt: true
      local_created_at      as LocalCreatedAt,
      @EndUserText.label: 'Last Changed By'
      @Semantics.user.localInstanceLastChangedBy: true
      local_last_changed_by as LocalLastChangedBy,
      @EndUserText.label: 'Local Last Changed At'
      @Semantics.systemDateTime.localInstanceLastChangedAt: true
      local_last_changed_at as LocalLastChangedAt,
      @EndUserText.label: 'Last Changed At'
      @Semantics.systemDateTime.lastChangedAt: true
      last_changed_at       as LastChangedAt,

      /* Associations */
      _Category,
      _Supplier,
      _Status
}
```

--Regenerate Draft Table
--Expose Service Definition with new entity

```
@EndUserText: {
  label: 'Service Definition for ZC_ATS_AB_EQUIP'
}
@ObjectModel: {
  leadingEntity: {
    name: 'ZC_ATS_AB_EQUIP'
  }
}
```

```
define service ZUI_ATS_AB_EQUIP_O4
  provider contracts odata_v4_ui {
  expose ZC_ATS_AB_EQUIP as Equipment;
  expose ZATS_AB_STATUS  as Status;
  expose ZATS_AB_COMPANY as Company;
  expose ZATS_AB_PRODCAT as Category;
}
```

----change mde for ui layout

```
@Metadata.layer: #CORE
@UI.headerInfo.title.type: #STANDARD
@UI.headerInfo.title.value: 'OrderUUID'
@UI.headerInfo.description.type: #STANDARD
@UI.headerInfo.description.value: 'OrderUUID'
annotate view ZC_ATS_AB_EQUIP with
{
  @UI.facet: [ {
    label: 'General Information',
    id: 'GeneralInfo',
    purpose: #STANDARD,
    position: 10 ,
    type: #IDENTIFICATION_REFERENCE
  },
  {
    label: 'Product Review',
    id: 'ProductReview',
    purpose: #STANDARD,
    position: 20 ,
    type: #FIELDGROUP_REFERENCE,
    targetQualifier: 'ReviewGroup'
  } ]
  @EndUserText.label: 'OrderUUID'
  @UI.selectionField: [ {
    position: 10
  } ]
  @UI.lineItem: [ {
    position: 10 ,
    label: 'Order ID'
  } ]
  OrderUUID;

  @EndUserText.label: 'ItemText'
  @UI.identification: [ {
    position: 200 ,
    label: 'ItemText'
  } ]
  @UI.lineItem: [ {
    position: 200 ,
    label: 'ItemText'
  } ]
  ItemText;

  @EndUserText.label: 'CategoryID'
  @UI.identification: [ {
    position: 30 ,
    label: 'CategoryID'
  } ]
  @UI.lineItem: [ {
    position: 30 ,
    label: 'CategoryID'
  } ]
  @UI.selectionField: [ {
    position: 30
  } ]
  CategoryId;

  @EndUserText.label: 'SupplierName'
  @UI.identification: [ {
    position: 40 ,
    label: 'SupplierName'
  } ]
  @UI.lineItem: [ {
    position: 40 ,
    label: 'SupplierName'
  } ]
  @UI.selectionField: [ {
    position: 40
  } ]
  SupplierName;

  @EndUserText.label: 'UnitPrice'
  @UI.identification: [ {
    position: 50 ,
    label: 'UnitPrice'
  } ]
  @UI.lineItem: [ {
    position: 50 ,
    label: 'UnitPrice'
  } ]
  UnitPrice;

  @EndUserText.label: 'Quantity'
  @UI.identification: [ {
    position: 60 ,
    label: 'Quantity'
  } ]
  @UI.lineItem: [ {
    position: 60 ,
    label: 'Quantity'
  } ]
  Quantity;

  @EndUserText.label: 'DeliveryDate'
  @UI.identification: [ {
    position: 70 ,
    label: 'DeliveryDate'
  } ]
  DeliveryDate;

  @EndUserText.label: 'OverallStatus'
  @UI.identification: [ {
    position: 80 ,
    label: 'OverallStatus'
  } ]
  @UI.lineItem: [ {
    position: 80 ,
    label: 'OverallStatus'
  } ]
  @UI.selectionField: [ {
    position: 80
  } ]
  OverallStatus;

  @EndUserText.label: 'Review'
  @UI.multiLineText: true
  @UI.fieldGroup: [ {
    qualifier: 'ReviewGroup',
    position: 10 ,
    label: 'Description'
  } ]
  Review;

}
```