Step 1: make sure we already have on top

with additional save                         // <-- needed: RAISE ENTITY EVENT + bgPF start only allowed in save phase


Step 2: Change Action code to change status to In Process


Step 3: Define type in global behavior pool class

```
PUBLIC SECTION.
    TYPES t_equip_for_change TYPE STRUCTURE FOR CHANGE ZR_ATS_AB_EQUIP\\ZrAtsAbEquip.
```

Step 3: Create Custom Class to orchestrate the background work

```
CLASS zcl_demo2 DEFINITION
  PUBLIC
  FINAL
  CREATE PUBLIC .

  PUBLIC SECTION.

    INTERFACES if_serializable_object .
    INTERFACES if_bgmc_operation .
    INTERFACES if_bgmc_op_single_tx_uncontr .


    CLASS-METHODS run_via_bgpf_tx_uncontrolled
      IMPORTING i_rap_bo_entity                 TYPE ZBP_R_ATS_AB_EQUIP=>t_equip_for_change
      RETURNING VALUE(r_process_monitor_string) TYPE string.

    METHODS constructor
      IMPORTING i_rap_bo_entity TYPE ZBP_R_ATS_AB_EQUIP=>t_equip_for_change.

    CONSTANTS:
      BEGIN OF bgpf_state,
        unknown    TYPE int1 VALUE IS INITIAL,
        erroneous  TYPE int1 VALUE 1,
        new        TYPE int1 VALUE 2,
        running    TYPE int1 VALUE 3,
        successful TYPE int1 VALUE 4,
        started    TYPE int1 VALUE 99,
      END OF bgpf_state.

  PROTECTED SECTION.
  PRIVATE SECTION.
    DATA rap_bo_line TYPE ZBP_R_ATS_AB_EQUIP=>t_equip_for_change .
ENDCLASS.



CLASS zcl_demo2 IMPLEMENTATION.

  METHOD constructor.
    rap_bo_line = i_rap_bo_entity.
  ENDMETHOD.

  METHOD if_bgmc_op_single_tx_uncontr~execute.

    DATA rap_update TYPE REF TO zcl_actual_code .

    rap_update = NEW #(
       i_rap_bo_key = rap_bo_line-OrderUUID
    ).

    rap_update->review_travel_bo( ).


  ENDMETHOD.

  METHOD run_via_bgpf_tx_uncontrolled.
    TRY.
        DATA(process_monitor) = cl_bgmc_process_factory=>get_default( )->create(
                               )->set_name( |Long running process { i_rap_bo_entity-OrderUUID }|
                               )->set_operation_tx_uncontrolled( NEW zcl_demo2( i_rap_bo_entity )
                               )->save_for_execution( ).
        r_process_monitor_string = process_monitor->to_string( ).
      CATCH cx_bgmc INTO DATA(lx_bgmc).
    ENDTRY.
  ENDMETHOD.

ENDCLASS.
```


Step 4 : Actual code that will be executed in bg if the total price < 2000 auto approve

```
*"* Global class ZRAP200_EXTERNAL_EML_CALL_665
*"* The "long running" review workflow executed inside bgPF.
*"* Its COMMIT ENTITIES runs the saver again -> Status changed ->
*"* RAISE ENTITY EVENT StatusUpdated -> side effect refreshes the UI.
*"* Lines 1-44 were not visible in the screenshot - reconstructed.
CLASS zcl_actual_code DEFINITION
  PUBLIC
  FINAL
  CREATE PUBLIC .

  PUBLIC SECTION.
    INTERFACES if_oo_adt_classrun.

    METHODS constructor
      IMPORTING i_rap_bo_key TYPE sysuuid_x16    OPTIONAL
                .

    METHODS review_travel_bo
      RETURNING VALUE(notification) TYPE string.

  PROTECTED SECTION.
  PRIVATE SECTION.
    DATA rap_bo_key TYPE sysuuid_x16.
ENDCLASS.



CLASS zcl_actual_code IMPLEMENTATION.

  METHOD constructor.
    rap_bo_key = i_rap_bo_key.
  ENDMETHOD.

  METHOD if_oo_adt_classrun~main.
    "for testing with F9: pick any travel which is in review (planned)
    SELECT SINGLE order_uuid FROM zats_ab_equip
      WHERE overall_status = 'I'
      INTO ( @rap_bo_key ).
    IF sy-subrc <> 0.
      out->write( 'No equip request in status In Process found' ).
      RETURN.
    ENDIF.

    "call the dummy review workflow process
    DATA(notification) = review_travel_bo( ).

    out->write( |[Notification] { notification } for { rap_bo_key }.| ).
  ENDMETHOD.

  METHOD review_travel_bo.

    DATA : overall_status type char1,
           review type c LENGTH 10.

    "dummy time-intensive review workflow process
    SELECT SINGLE ( quantity * unit_price ) as total_price FROM zats_ab_equip
        WHERE order_uuid = @rap_bo_key
        INTO @DATA(total_price).

    WAIT UP TO 8 SECONDS.

    IF total_price < 2000 AND total_price > 0.
      overall_status = 'A'.
      review = |{ cl_abap_context_info=>get_system_time( ) }: Review WF successfully processed|.
    ELSE.
      overall_status = 'R'.
      review = |{ cl_abap_context_info=>get_system_time( ) }: Review WF cancellation|.
    ENDIF.

    "modify relevant travel instance
    MODIFY ENTITIES OF ZR_ATS_AB_EQUIP
       ENTITY ZrAtsAbEquip
       UPDATE FIELDS ( overallstatus review )
       WITH VALUE #( ( %tky-OrderUUID    = rap_bo_key
                       overallstatus       = overall_status
                       review = review ) )
    FAILED DATA(modify_failed)
    REPORTED DATA(modify_reported).

    "commit changes
    COMMIT ENTITIES RESPONSES
        FAILED   DATA(commit_failed)
        REPORTED DATA(commit_reported).
  ENDMETHOD.

ENDCLASS.

```


Step 5: Inside the loop , if status is In Process Trigger Bg job

```
      LOOP AT update-travel INTO DATA(update_travel).
        CLEAR events_to_be_raised.
............
            if update_equipment-%control-OverallStatus = if_abap_behv=>mk-on and
                update_equipment-OverallStatus = 'I'.

                 "start review workflow if the review status is set to planned
                DATA(process_monitor_string) = zcl_demo2=>run_via_bgpf_tx_uncontrolled(
                  EXPORTING
                    i_rap_bo_entity = update_equipment
                ).

            ENDIF.
............
      ENDLOOP.
```

-- How to refresh UI automatically

Step 6: define event without parameter, only used to trigger a UI refresh

```

    // event without parameter, only used to trigger a UI refresh
  event StatusUpdated for side effects;

  side effects
  {
    event StatusUpdated affects field ( OverallStatus, Review );
  }
```

Step 7: use side effect and expose event

```
use side effects;

use event StatusUpdated;

```

Step 8 : Integrate the Raise of event on status change

```
if update_equipment-%control-OverallStatus = if_abap_behv=>mk-on.

                DATA : status_updated type table for event ZR_ATS_AB_EQUIP~StatusUpdated.

                append INITIAL LINE TO status_updated.
                status_updated[ 1 ] = CORRESPONDING #( update_equipment
                                                                mapping
                                                                %key = %key ).
                raise entity event ZR_ATS_AB_EQUIP~StatusUpdated from status_updated.
            endif.
```

