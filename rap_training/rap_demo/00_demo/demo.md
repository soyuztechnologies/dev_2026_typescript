
### Table Entity

```
@ClientHandling.type: #CLIENT_DEPENDENT
@AbapCatalog.deliveryClass: #APPLICATION_DATA
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Fifa worldcup'
define root table entity ZATS_FIFA
{
  key team_uuid : sysuuid_x16;
  team_name: abap.char( 60 );
  coach: abap.char( 60 );
  score: abap.int4;
  country: land1;
  ranking: abap.int4;
  created_by: abp_creation_user;
  created_on: abp_creation_tstmpl;
  changed_by: abp_lastchange_user;
  changed_on: abp_lastchange_tstmpl;
  local_last_changed_at: abp_locinst_lastchange_tstmpl;
      
}
```

### Data uploader class 
```
CLASS zcl_ats_fifa_data_manager DEFINITION
  PUBLIC
  FINAL
  CREATE PUBLIC.

  PUBLIC SECTION.
    INTERFACES if_oo_adt_classrun.
  PROTECTED SECTION.
  PRIVATE SECTION.
ENDCLASS.


CLASS zcl_ats_fifa_data_manager IMPLEMENTATION.
  METHOD if_oo_adt_classrun~main.

    " Optional: start from a clean slate
    DELETE FROM zats_fifa.

    DATA lv_timestamp TYPE timestampl.
    GET TIME STAMP FIELD lv_timestamp.

    DATA lt_fifa TYPE STANDARD TABLE OF zats_fifa.

    " Seed values (everything except the admin/key fields)
    TYPES: BEGIN OF ty_seed,
             team_name TYPE zats_fifa-team_name,
             coach     TYPE zats_fifa-coach,
             score     TYPE zats_fifa-score,
             country   TYPE zats_fifa-country,
             ranking   TYPE zats_fifa-ranking,
           END OF ty_seed,
           tt_seed type standard table of ty_seed with deFAULT KEY.

    DATA(lt_seed) = VALUE tt_seed(
      ( team_name = 'Argentina'   coach = 'Lionel Scaloni'    score = 3 country = 'AR' ranking = 1  )
      ( team_name = 'France'      coach = 'Didier Deschamps'  score = 3 country = 'FR' ranking = 2  )
      ( team_name = 'Brazil'      coach = 'Dorival Junior'    score = 2 country = 'BR' ranking = 3  )
      ( team_name = 'England'     coach = 'Thomas Tuchel'     score = 2 country = 'GB' ranking = 4  )
      ( team_name = 'Spain'       coach = 'Luis de la Fuente' score = 4 country = 'ES' ranking = 5  )
      ( team_name = 'Portugal'    coach = 'Roberto Martinez'  score = 2 country = 'PT' ranking = 6  )
      ( team_name = 'Netherlands' coach = 'Ronald Koeman'     score = 1 country = 'NL' ranking = 7  )
      ( team_name = 'Germany'     coach = 'Julian Nagelsmann' score = 2 country = 'DE' ranking = 8  )
      ( team_name = 'Croatia'     coach = 'Zlatko Dalic'      score = 1 country = 'HR' ranking = 9  )
      ( team_name = 'Italy'       coach = 'Luciano Spalletti' score = 0 country = 'IT' ranking = 10 )
    ).

    LOOP AT lt_seed INTO DATA(ls_seed).
      APPEND VALUE #(
        team_uuid             = cl_system_uuid=>create_uuid_x16_static( )
        team_name             = ls_seed-team_name
        coach                 = ls_seed-coach
        score                 = ls_seed-score
        country               = ls_seed-country
        ranking               = ls_seed-ranking
        created_by            = sy-uname
        created_on            = lv_timestamp
        changed_by            = sy-uname
        changed_on            = lv_timestamp
        local_last_changed_at = lv_timestamp
      ) TO lt_fifa.
    ENDLOOP.

    INSERT zats_fifa FROM TABLE @lt_fifa.

    IF sy-subrc = 0.
      COMMIT WORK.
      out->write( |{ lines( lt_fifa ) } records inserted successfully.| ).
      out->write( lt_fifa ).
    ELSE.
      ROLLBACK WORK.
      out->write( 'Insert failed.' ).
    ENDIF.

  ENDMETHOD.
ENDCLASS.
```

### Consumption CDS entity

```
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Consumption cds entity'
@Metadata.ignorePropagatedAnnotations: true
define root view entity ZC_ATS_FIFA as select from ZATS_FIFA
{
    key team_uuid,
    team_name,
    coach,
    score,
    country,
    ranking,
    created_by,
    created_on,
    changed_by,
    changed_on,
    local_last_changed_at
}

```

### Service def

```
@EndUserText.label: 'FIFA'
define service ZSD_ATS_FIFA {
  expose ZC_ATS_FIFA as TeamSet;
}
```

### Service Binding
