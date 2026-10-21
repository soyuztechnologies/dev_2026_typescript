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

  side effects {
    event StatusUpdated affects field ( OverallStatus, Review );
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

-----
class ZBP_R_ATS_AB_EQUIP definition
  public
  abstract
  final
  for behavior of ZR_ATS_AB_EQUIP .

public section.
    TYPES t_equip_for_change TYPE STRUCTURE FOR CHANGE ZR_ATS_AB_EQUIP\\ZrAtsAbEquip.
protected section.
private section.
ENDCLASS.



CLASS ZBP_R_ATS_AB_EQUIP IMPLEMENTATION.
ENDCLASS.

-----

CLASS lsc_zr_ats_ab_equip DEFINITION INHERITING FROM cl_abap_behavior_saver.

  PROTECTED SECTION.

    METHODS save_modified REDEFINITION.

ENDCLASS.

CLASS lsc_zr_ats_ab_equip IMPLEMENTATION.

  METHOD save_modified.

    DATA : events_to_be_raied type table for event ZR_ATS_AB_EQUIP~eqip_req_accepted.


    "Raise the event whenever the status is changed
    if update-zratsabequip is not initial.

        LOOP at update-zratsabequip into data(update_equipment).

            clear events_to_be_raied.

            if update_equipment-%control-OverallStatus = if_abap_behv=>mk-on and
                update_equipment-OverallStatus = 'I'.

                data(process_monitor_string) = zcl_ats_ab_orch=>run_via_bgpf_tx_uncontrolled(

                        i_rap_bo_entity =  update_equipment

                        ).

            ENDIF.

            if update_equipment-%control-OverallStatus = if_abap_behv=>mk-on.

                data : status_updated type table for event ZR_ATS_AB_EQUIP~StatusUpdated.

                APPEND INITIAL LINE TO status_updated.
                status_updated[ 1 ] = CORRESPONDING #( update_equipment ).
                raise entity event ZR_ATS_AB_EQUIP~StatusUpdated from status_updated.

            endif.

            if update_equipment-%control-OverallStatus = if_abap_behv=>mk-on and
                update_equipment-OverallStatus = 'A'.

                append INITIAL LINE TO events_to_be_raied.
                events_to_be_raied[ 1 ] = CORRESPONDING #( update_equipment
                                                                mapping
                                                                %key = %key
                                                                order_uuid = OrderUUID ).
                raise entity event ZR_ATS_AB_EQUIP~eqip_req_accepted from events_to_be_raied.

            ENDIF.

        endloop.

    endif.


  ENDMETHOD.

ENDCLASS.

CLASS LHC_ZR_ATS_AB_EQUIP DEFINITION INHERITING FROM CL_ABAP_BEHAVIOR_HANDLER.
  PRIVATE SECTION.
    METHODS:
      GET_GLOBAL_AUTHORIZATIONS FOR GLOBAL AUTHORIZATION
        IMPORTING
           REQUEST requested_authorizations FOR ZrAtsAbEquip
        RESULT result,
      get_instance_features FOR INSTANCE FEATURES
            keys REQUEST requested_features FOR ZrAtsAbEquip RESULT result.

          METHODS approveRequest FOR MODIFY
            keys FOR ACTION ZrAtsAbEquip~approveRequest RESULT result.
ENDCLASS.

CLASS LHC_ZR_ATS_AB_EQUIP IMPLEMENTATION.
  METHOD GET_GLOBAL_AUTHORIZATIONS.
  ENDMETHOD.
  METHOD get_instance_features.

  "Step 1: Read the travel data with status
   READ ENTITIES OF ZR_ATS_AB_EQUIP in local mode
       ENTITY ZrAtsAbEquip
           FIELDS ( OrderUUID overallstatus  )
           with     CORRESPONDING #( keys )
       RESULT data(requests)
       FAILED failed.

   result = value #( for requestw in requests
                       ( %tky = requestw-%tky
                         %action-approveRequest = COND #( WHEN requestw-OverallStatus = 'A'
                                                           then if_abap_behv=>fc-o-disabled
                                                           else if_abap_behv=>fc-o-enabled
                         )

                       )
                   ).

  ENDMETHOD.

  METHOD approveRequest.

     ""Perform the change of BO instance to change status
   MODIFY ENTITIES OF ZR_ATS_AB_EQUIP
       ENTITY ZrAtsAbEquip
           UPDATE FIELDS ( OverallStatus )
           WITH VALUE #( for key in keys ( %tky = key-%tky
                                           %is_draft = key-%is_draft
                                           OverallStatus = 'I'
            )  ).
   ""Read the BO instance on which we want to make the changes
   READ ENTITIES OF ZR_ATS_AB_EQUIP
       ENTITY ZrAtsAbEquip
           ALL FIELDS
               WITH CORRESPONDING #( keys )
                   RESULT data(lt_results).
   result = value #( for travel in lt_results ( %tky = travel-%tky
                                                %param = travel
   ) ).

  ENDMETHOD.

ENDCLASS.


------


*"* use this source file for the definition and implementation of
*"* local helper classes, interface definitions and type
*"* declarations
class lcl_equipment DEFINITION INHERITING FROM cl_abap_behavior_event_handler.

    PRIVATE SECTION.
        methods get_uuid RETURNING VALUE(uuid) type sysuuid_x16.
        methods on_request_accepted for entity event
            accepted for ZrAtsAbEquip~eqip_req_accepted.

ENDCLASS.

CLASS lcl_equipment IMPLEMENTATION.

  METHOD get_uuid.
    try.
        uuid = cl_system_uuid=>create_uuid_x16_static(  ).
    catch cx_uuid_error.
    endtry.
  ENDMETHOD.

  METHOD on_request_accepted.

    "Close the active modify phase
    cl_abap_tx=>save(  ).

    "loop over the transffered data from event and insert in our table
    LOOP at accepted REFERENCE INTO data(lr_accepted).

        data lr_equip_accepted type zats_ab_status_t.
        data lr_abs_equip  type ZA_ATS_AB_EQUIPMENT.
        MOVE-CORRESPONDING lr_accepted->* to lr_abs_equip.
        lr_equip_accepted-uuid = get_uuid( ).
        lr_equip_accepted-total_cost = lr_abs_equip-quantity * lr_abs_equip-unitprice.
        lr_equip_accepted-category_id = lr_abs_equip-categoryid.
        lr_equip_accepted-currency_code = lr_abs_equip-currencycode.
        lr_equip_accepted-supplier_name = lr_abs_equip-suppliername.
        lr_equip_accepted-item_text = lr_abs_equip-itemtext.
        lr_equip_accepted-order_uuid = lr_abs_equip-order_uuid.
        insert zats_ab_status_t from @lr_equip_accepted.

    ENDLOOP.

  ENDMETHOD.

ENDCLASS.


------

CLASS zcl_ats_ab_long_running DEFINITION
  PUBLIC
  FINAL
  CREATE PUBLIC .

  PUBLIC SECTION.

    INTERFACES if_oo_adt_classrun .

    METHODS constructor
        IMPORTING i_rap_bo_key type sysuuid_x16 OPTIONAL.

    METHODS review_equip_request
        RETURNING value(review) type string.

  PROTECTED SECTION.
  PRIVATE SECTION.
    DATA : rap_bo_key type sysuuid_x16.
ENDCLASS.



CLASS zcl_ats_ab_long_running IMPLEMENTATION.


  METHOD if_oo_adt_classrun~main.
  ENDMETHOD.
  METHOD constructor.
    rap_bo_key = i_rap_bo_key.
  ENDMETHOD.

  METHOD review_equip_request.

    data: overall_status type char1,
          review_text    type string.


    "Select the data from db based on the key of my BO - calculate the total cost
    select single ( quantity * unit_price ) as total_price from
        ZATS_AB_EQUIP where order_uuid = @rap_bo_key
        into @data(total_price).

    wait up to 5 seconds.

    if total_price < 3000 and total_price > 0.
        overall_status = 'A'.
        review_text = |{ cl_abap_context_info=>get_system_date(  ) } : Approved Successfully Processed|.
    else.
        overall_status = 'R'.
        review_text = |{ cl_abap_context_info=>get_system_date(  ) } : Rejected Due to exeeding amount|.
    endif.

    "modify our BO instance using RAP EML
    MODIFY ENTITIES OF ZR_ATS_AB_EQUIP
    entity ZrAtsAbEquip
    update fields ( overallstatus review )
    with value #( (
                        %tky-OrderUUID = rap_bo_key
                        OverallStatus = overall_status
                        review = review_text
                ) )
    FAILED data(modify_failed)
    REPORTED data(modify_reported).

    "Commit the change
    COMMIT ENTITIES RESPONSES
        FAILED data(commit_failed)
        REPORTED data(commit_reported).

  ENDMETHOD.

ENDCLASS.

-------

CLASS zcl_ats_ab_orch DEFINITION
  PUBLIC
  FINAL
  CREATE PUBLIC .

  PUBLIC SECTION.

    INTERFACES if_serializable_object .
    INTERFACES if_bgmc_operation .
    INTERFACES if_bgmc_op_single_tx_uncontr .

    CLASS-METHODS run_via_bgpf_tx_uncontrolled
        IMPORTING i_rap_bo_entity type ZBP_R_ATS_AB_EQUIP=>t_equip_for_change
        RETURNING VALUE(r_process_monitor_string) type string.

    METHODS CONSTRUCTOR
        IMPORTING i_rap_bo_entity type ZBP_R_ATS_AB_EQUIP=>t_equip_for_change.

    CONSTANTS:
            BEGIN OF bgpf_state,
                unknown   type int1 value is initial,
                erroneous type int1 value 1,
                new       type int1 value 2,
                running   type int1 value 3,
                successful type int1 value 4,
                started type int1 value 99,
            END OF bgpf_state.

  PROTECTED SECTION.
  PRIVATE SECTION.
    data rap_bo_line type ZBP_R_ATS_AB_EQUIP=>t_equip_for_change.
ENDCLASS.



CLASS zcl_ats_ab_orch IMPLEMENTATION.


  METHOD if_bgmc_op_single_tx_uncontr~execute.

    data rap_update type ref to zcl_ats_ab_long_running.

    rap_update = new #( i_rap_bo_key = rap_bo_line-OrderUUID ).

    rap_update->review_equip_request(  ).

  ENDMETHOD.

  METHOD constructor.
    rap_bo_line = i_rap_bo_entity.
  ENDMETHOD.

  METHOD run_via_bgpf_tx_uncontrolled.

    try.

        data(process_monitor) = cl_bgmc_process_factory=>get_default( )->create(
                                )->set_name( |Long running business logid for { i_rap_bo_entity-OrderUUID }|
                                )->set_operation_tx_uncontrolled( new zcl_ats_ab_orch( i_rap_bo_entity )
                                )->save_for_execution( ).

        r_process_monitor_string = process_monitor->to_string( ).

    catch cx_bgmc into data(lx_bgmc).

    endtry.

  ENDMETHOD.

ENDCLASS.

------

projection implementation in class ZBP_C_ATS_AB_EQUIP unique;
strict ( 2 );
extensible;
use draft;
use side effects;
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


