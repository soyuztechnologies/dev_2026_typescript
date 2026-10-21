Step 1: Add side effect and determination

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

  //add logic for supporting recommendations
  field (recommendations) ItemText;
  recommendation function getItemTexts;

  side effects {
    event StatusUpdated affects field ( OverallStatus, Review );
    recommendation function getItemTexts
        executed on field CategoryId;
    field ItemText affects field Review;
  }

  determination productReview on modify { create; field ItemText; }



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

Step 2: Class to call the claude code

```
"=====================================================================
" 5. UTILITY CLASS - DIRECT ANTHROPIC API (generative product review)
"    No ISLM scenario / no Gen AI Hub - plain HTTPS call with API key
"    Endpoint : https://api.anthropic.com/v1/messages
"=====================================================================
CLASS zcl_items_util_anthropic DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    INTERFACES if_oo_adt_classrun.

    CLASS-METHODS get_reco_value_from_anthropic
      IMPORTING iv_itemtext TYPE string
      EXPORTING ev_notes    TYPE string.

    CLASS-METHODS get_prompt_payload
      IMPORTING iv_itemtext     TYPE string
      RETURNING VALUE(rv_value) TYPE string.

  PRIVATE SECTION.
    CONSTANTS:
      c_url         TYPE string VALUE 'https://api.anthropic.com/v1/messages',
      c_api_key     TYPE string VALUE '<YOUR API KEY>',   " <-- put your key here
      c_api_version TYPE string VALUE '2023-06-01',               " required header
      c_model       TYPE string VALUE 'claude-haiku-5-5'.         " or 'claude-sonnet-5-5'

    " Response structure (only the parts we need)
    TYPES:
      BEGIN OF ty_content,
        type TYPE string,
        text TYPE string,
      END OF ty_content,
      tt_content TYPE STANDARD TABLE OF ty_content WITH EMPTY KEY,

      BEGIN OF ty_error,
        type    TYPE string,
        message TYPE string,
      END OF ty_error,

      BEGIN OF ty_response,
        content     TYPE tt_content,
        stop_reason TYPE string,
        error       TYPE ty_error,
      END OF ty_response.
ENDCLASS.


CLASS zcl_items_util_anthropic IMPLEMENTATION.

    METHOD if_oo_adt_classrun~main.

    DATA: lv_notes TYPE string.

    " Sample items to review
    DATA(lt_items) = VALUE string_table(
      ( `Samsung Galaxy S24 Ultra 256GB Titanium Gray` ) ).

    LOOP AT lt_items INTO DATA(lv_item).

      out->write( |==================================================| ).
      out->write( |Item: { lv_item }| ).
      out->write( |--------------------------------------------------| ).

      " Optional: print the JSON payload being sent
      out->write( |Payload:| ).
      out->write( zcl_items_util_anthropic=>get_prompt_payload( lv_item ) ).
      out->write( |--------------------------------------------------| ).

      " Call Anthropic API
      zcl_items_util_anthropic=>get_reco_value_from_anthropic(
        EXPORTING iv_itemtext = lv_item
        IMPORTING ev_notes    = lv_notes ).

      IF lv_notes IS INITIAL.
        out->write( |No response received.| ).
      ELSE.
        out->write( |Claude response:| ).
        out->write( lv_notes ).
      ENDIF.

    ENDLOOP.

  ENDMETHOD.


  METHOD get_prompt_payload.
    CHECK iv_itemtext IS NOT INITIAL.

    " Escape quotes/backslashes so the item text can't break the JSON
    DATA(lv_item) = escape( val = iv_itemtext format = cl_abap_format=>e_json_string ).

    " Differences vs. OpenAI format:
    "  - 'system' is a top-level field, not a message
    "  - 'max_tokens' is mandatory
    "  - roles must alternate user/assistant, so the few-shot example
    "    is a user question + assistant answer pair
    CONCATENATE
      '{"model": "' c_model '",'                                                     cl_abap_char_utilities=>cr_lf
      '"max_tokens": 500,'                                                          cl_abap_char_utilities=>cr_lf
      '"system": "You are an IT Product Review assistant based on description.",'    cl_abap_char_utilities=>cr_lf
      '"messages": ['                                                                cl_abap_char_utilities=>cr_lf
      '  {"role": "user", "content": "Example 1: Analyze: `iPhone 16 Plus 128GB Black`."},' cl_abap_char_utilities=>cr_lf
      '  {"role": "assistant", "content": "Apple."},'                                cl_abap_char_utilities=>cr_lf
      '  {"role": "user", "content": "Analyze the type of the product and highlight 3 to 4 specific feature phrases and display in bullet points: '
      lv_item
      '."}'                                                                          cl_abap_char_utilities=>cr_lf
      ']}'
      INTO rv_value RESPECTING BLANKS.
  ENDMETHOD.


  METHOD get_reco_value_from_anthropic.

    DATA: lv_payload TYPE string,
          lv_body    TYPE string,
          ls_status  TYPE if_web_http_response=>http_status,
          ls_resp    TYPE ty_response.

    CLEAR ev_notes.
    lv_payload = get_prompt_payload( iv_itemtext ).
    CHECK lv_payload IS NOT INITIAL.

    " ---- 1. HTTP call ------------------------------------------------
    TRY.
        DATA(lo_dest)   = cl_http_destination_provider=>create_by_url( c_url ).
        DATA(lo_client) = cl_web_http_client_manager=>create_by_http_destination( lo_dest ).

        DATA(lo_req) = lo_client->get_http_request( ).
        lo_req->set_header_fields( VALUE #(
          ( name = 'Content-Type'      value = 'application/json' )
          ( name = 'x-api-key'         value = c_api_key )
          ( name = 'anthropic-version' value = c_api_version ) ) ).
        lo_req->set_text( lv_payload ).

        DATA(lo_http_resp) = lo_client->execute( if_web_http_client=>post ).
        ls_status = lo_http_resp->get_status( ).
        lv_body   = lo_http_resp->get_text( ).
        lo_client->close( ).

      CATCH cx_http_dest_provider_error cx_web_http_client_error INTO DATA(lx_http).
        ev_notes = lx_http->get_text( ).          " surface the error in Notes
        RETURN.
    ENDTRY.

    " ---- 2. Parse JSON -----------------------------------------------
    /ui2/cl_json=>deserialize( EXPORTING json = lv_body
                               CHANGING  data = ls_resp ).

    IF ls_status-code <> 200.
      ev_notes = |Anthropic API error { ls_status-code }: { ls_resp-error-message }|.
      RETURN.
    ENDIF.

    " ---- 3. Collect text blocks from content[] -----------------------
    LOOP AT ls_resp-content INTO DATA(ls_block) WHERE type = 'text'.
      ev_notes = ev_notes && ls_block-text.
    ENDLOOP.
  ENDMETHOD.

ENDCLASS.
```

Step 3: Determination implementation

```

  METHOD productReview.

    READ ENTITIES OF ZR_ATS_AB_EQUIP IN LOCAL MODE
        ENTITY ZrAtsAbEquip
        FIELDS ( ItemText Review )
        WITH CORRESPONDING #( keys )
        RESULT data(itemlists).


    LOOP at itemlists ASSIGNING FIELD-SYMBOL(<itemlist>).

        if <itemlist>-ItemText is not initial.

            zcl_items_util_anthropic=>get_reco_value_from_anthropic(
              EXPORTING
                iv_itemtext = CONV #( <itemlist>-ItemText )
              IMPORTING
                ev_notes    = data(lv_response)
            ).
            <itemlist>-Review = lv_response.

        ENDIF.

    ENDLOOP.

    MODIFY ENTITIES OF ZR_ATS_AB_EQUIP IN LOCAL MODE
        ENTITY ZrAtsAbEquip
        UPDATE FIELDS ( Review )
        WITH VALUE #( FOR itemlist in itemlists (
                %tky = itemlist-%tky
                Review = itemlist-Review
         ) ).


  ENDMETHOD.

```