Step 1: Create value help Entity for Item text

```
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Item Text Value Help'
define view entity ZI_ATS_AB_ITEMTEXT_VH
  as select distinct from zats_ab_equip
{
  key item_text   as ItemText,
  key category_id as CategoryId
}
where item_text <> ''

```

Step 2 : Integrate value help

      @Consumption.valueHelpDefinition: [{
          entity: { name: 'ZI_ATS_AB_ITEMTEXT_VH', element: 'ItemText' },
          additionalBinding: [{ localElement: 'CategoryId',
                                element: 'CategoryId',
                                usage: #FILTER }],
                                useForValidation: false
        }]
      item_text             as ItemText,


Step 3: Define recommendation for the field

```
managed implementation in class ZBP_R_ATS_AB_EQUIP unique;
strict ( 2 );
with draft;
extensible;
define behavior for ZR_ATS_AB_EQUIP alias ZrAtsAbEquip
persistent table ZATS_AB_EQUIP
extensible
draft table ZATS_AB_EQUIP_D
etag master LocalLastChangedAt
lock master total etag LastChangedAt
authorization master( global )
with additional save with full data
{
  field ( readonly )
   OrderUUID,
   LocalCreatedBy,
   LocalCreatedAt,
   LocalLastChangedBy,
   LocalLastChangedAt,
   LastChangedAt;

  field ( numbering : managed )
   OrderUUID;

  action (features : instance) approveRequest result [1] $self;

  create;
  update;
  delete;

  event eqip_req_accepted parameter ZA_ATS_AB_EQUIPMENT;
  event StatusUpdated for side effects;

  //step 1: add recommendation
  field (recommendations) itemtext;
  recommendation function getItemTexts;


  side effects {
    event StatusUpdated affects field ( OverallStatus, Review );
    recommendation function getItemTexts executed on field CategoryId;
  }



  draft action Activate optimized;
  draft action Discard;
  draft action Edit;
  draft action Resume;
  draft determine action Prepare;

  mapping for ZATS_AB_EQUIP corresponding extensible
  {
    OrderUUID = ORDER_UUID;
    ItemText = ITEM_TEXT;
    CategoryID = CATEGORY_ID;
    SupplierName = SUPPLIER_NAME;
    UnitPrice = UNIT_PRICE;
    CurrencyCode = CURRENCY_CODE;
    Quantity = QUANTITY;
    DeliveryDate = DELIVERY_DATE;
    OverallStatus = OVERALL_STATUS;
    Review = REVIEW;
    LocalCreatedBy = LOCAL_CREATED_BY;
    LocalCreatedAt = LOCAL_CREATED_AT;
    LocalLastChangedBy = LOCAL_LAST_CHANGED_BY;
    LocalLastChangedAt = LOCAL_LAST_CHANGED_AT;
    LastChangedAt = LAST_CHANGED_AT;
  }

}
```

Step 4: Expose recommendation in the projection layer

```
projection implementation in class ZBP_C_ATS_AB_EQUIP unique;
strict ( 2 );
extensible;
use draft;
use side effects;
use recommendations;
define behavior for ZC_ATS_AB_EQUIP alias ZcAtsAbEquip
extensible
use etag
{
  use create;
  use update;
  use delete;

  use action approveRequest;
  use event StatusUpdated;

  use action Edit;
  use action Activate;
  use action Discard;
  use action Resume;
  use action Prepare;

}
```
Step 5 : Custom class for recommendation data

```
"=====================================================================
" 3. UTILITY CLASS - DETERMINISTIC APPROACH (Tabular AI via ISLM)
"    Objects: ZIF_ITEMS_RECO, ZIF_RECOMMENDATION_RESULT, zcl_ats_ab_util_tabai
"    Dependency: ZCL_PRODUCT_PREDICTION_2 (your ISLM inference consumer class,
"    from the video - returns CL_ISLM_INFERENCE_HTTP_CLIENT)
"=====================================================================
"------------------------ zcl_ats_ab_util_tabai -----------------------
CLASS zcl_ats_ab_util_tabai DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    TYPES: BEGIN OF ty_product_suggestion,
             value     TYPE string,
             score     TYPE decfloat34,
             suggested TYPE abap_bool,
           END OF ty_product_suggestion,
           tt_product_suggestion TYPE STANDARD TABLE OF ty_product_suggestion
                                 WITH EMPTY KEY.

    CONSTANTS: c_top_rows     TYPE i          VALUE 1,
               c_score_high   TYPE decfloat34 VALUE '0.8',
               c_score_medium TYPE decfloat34 VALUE '0.6',
               c_score_low    TYPE decfloat34 VALUE '0.2'.

    CLASS-METHODS get_item_suggestions
      IMPORTING iv_category_id        TYPE zats_ab_equip-category_id
      RETURNING VALUE(rt_suggestions) TYPE tt_product_suggestion.
ENDCLASS.


CLASS zcl_ats_ab_util_tabai IMPLEMENTATION.

  METHOD get_item_suggestions.

    SELECT FROM zats_ab_equip
      FIELDS item_text           AS value,
             CASE
               WHEN SUM( quantity ) > 10 THEN @c_score_high
               WHEN SUM( quantity ) >= 5 THEN @c_score_medium
               ELSE @c_score_low
             END                 AS score,
             @abap_true          AS suggested,
             SUM( quantity )     AS total_qty
      WHERE category_id = @iv_category_id
        AND item_text  <> @space
        AND quantity    > 0
      GROUP BY item_text
      ORDER BY score DESCENDING, total_qty DESCENDING, value ASCENDING
      INTO CORRESPONDING FIELDS OF TABLE @rt_suggestions
      UP TO @c_top_rows ROWS.

  ENDMETHOD.

ENDCLASS.


```

Step 6 : method for integration

```
  METHOD getItemTexts.

    DATA: lv_orderuid  TYPE ZR_ATS_AB_EQUIP-OrderUUID,
          lv_ordercat  TYPE ZR_ATS_AB_EQUIP-CategoryId.

    READ ENTITIES OF ZR_ATS_AB_EQUIP IN LOCAL MODE
      ENTITY ZrAtsAbEquip
        FIELDS ( OrderUUID CategoryID )
        WITH CORRESPONDING #( keys )
      RESULT DATA(lt_read_result).

    ASSIGN lt_read_result[ 1 ] TO FIELD-SYMBOL(<s_read_result>).
    IF sy-subrc = 0.
      lv_orderuid  = <s_read_result>-OrderUUID.
      lv_ordercat = <s_read_result>-CategoryID.
    ENDIF.

    "****************** Tabular AI ******************
    IF lv_ordercat IS NOT INITIAL.
      DATA(lt_items) = zcl_ats_ab_util_tabai=>get_item_suggestions(
        EXPORTING iv_category_id = CONV #( lv_ordercat )
         ).
    ENDIF.

    " %tky already contains %pky, so assigning %tky is enough
    result = VALUE #( ( %tky                = keys[ 1 ]-%tky
                        %param-zratsabequip = VALUE #(
                          ItemText = COND #( WHEN lines( lt_items ) > 0
                                                  AND lv_ordercat IS NOT INITIAL
                                             THEN CORRESPONDING #( lt_items )
                                             ELSE VALUE #( ) ) ) ) ).

  ENDMETHOD.
```
