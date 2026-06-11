/*
 * Copyright (c) 2026 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { SalesOrderPartner } from './SalesOrderPartner';
import { SalesOrderPartnerRequestBuilder } from './SalesOrderPartnerRequestBuilder';
import { SalesOrderApi } from './SalesOrderApi';
import { Sap_Message } from './Sap_Message';
import {
  CustomField,
  defaultDeSerializers,
  DefaultDeSerializers,
  DeSerializers,
  AllFields,
  entityBuilder,
  EntityBuilderType,
  EntityApi,
  FieldBuilder,
  OrderableEdmTypeField,
  CollectionField,
  OneToOneLink
} from '@sap-cloud-sdk/odata-v4';
export class SalesOrderPartnerApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers
> implements EntityApi<SalesOrderPartner<DeSerializersT>, DeSerializersT> {
  public deSerializers: DeSerializersT;

  private constructor(
    deSerializers: DeSerializersT = defaultDeSerializers as any
  ) {
    this.deSerializers = deSerializers;
  }

  /**
   * Do not use this method or the constructor directly.
   * Use the service function as described in the documentation to get an API instance.
   */
  public static _privateFactory<
    DeSerializersT extends DeSerializers = DefaultDeSerializers
  >(
    deSerializers: DeSerializersT = defaultDeSerializers as any
  ): SalesOrderPartnerApi<DeSerializersT> {
    return new SalesOrderPartnerApi(deSerializers);
  }

  private navigationPropertyFields!: {
    /**
     * Static representation of the one-to-one navigation property {@link salesOrder_1} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    SALES_ORDER_1: OneToOneLink<
      SalesOrderPartner<DeSerializersT>,
      DeSerializersT,
      SalesOrderApi<DeSerializersT>
    >;
  };

  _addNavigationProperties(linkedApis: [SalesOrderApi<DeSerializersT>]): this {
    this.navigationPropertyFields = {
      SALES_ORDER_1: new OneToOneLink('_SalesOrder', this, linkedApis[0])
    };
    return this;
  }

  entityConstructor = SalesOrderPartner;

  requestBuilder(): SalesOrderPartnerRequestBuilder<DeSerializersT> {
    return new SalesOrderPartnerRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    SalesOrderPartner<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<SalesOrderPartner<DeSerializersT>, DeSerializersT>(
      this
    );
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT
  ): CustomField<SalesOrderPartner<DeSerializersT>, DeSerializersT, NullableT> {
    return new CustomField(
      fieldName,
      this.entityConstructor,
      this.deSerializers,
      isNullable
    ) as any;
  }

  private _fieldBuilder?: FieldBuilder<
    typeof SalesOrderPartner,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        SalesOrderPartner,
        this.deSerializers
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    SALES_ORDER: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PARTNER_FUNCTION: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CUSTOMER: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SUPPLIER: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PERSONNEL: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CONTACT_PERSON: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    REFERENCE_BUSINESS_PARTNER: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BUSINESS_PARTNER_NAME_1: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BUSINESS_PARTNER_NAME_2: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BUSINESS_PARTNER_NAME_3: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BUSINESS_PARTNER_NAME_4: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    STREET_NAME: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    STREET_PREFIX_NAME_1: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    STREET_PREFIX_NAME_2: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    STREET_SUFFIX_NAME_1: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    STREET_SUFFIX_NAME_2: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    HOUSE_NUMBER: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    POSTAL_CODE: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CITY_NAME: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    DISTRICT_NAME: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    REGION: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    COUNTRY: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    INTERNATIONAL_PHONE_NUMBER: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    INTERNATIONAL_MOBILE_PHONE_NUMBER: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    INTERNATIONAL_FAX_NUMBER: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PO_BOX: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PO_BOX_POSTAL_CODE: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    FORM_OF_ADDRESS: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CORRESPONDENCE_LANGUAGE: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    EMAIL_ADDRESS: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    TAX_JURISDICTION: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    TRANSPORT_ZONE: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    UNLOADING_POINT_NAME: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    VAT_REGISTRATION: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SD_DOC_PARTNER_ADDR_IS_DOC_SPECIFIC: OrderableEdmTypeField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      false,
      true
    >;
    SAP_MESSAGES: CollectionField<
      SalesOrderPartner<DeSerializers>,
      DeSerializersT,
      Sap_Message,
      false,
      true
    >;
    /**
     * Static representation of the one-to-one navigation property {@link salesOrder_1} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    SALES_ORDER_1: OneToOneLink<
      SalesOrderPartner<DeSerializersT>,
      DeSerializersT,
      SalesOrderApi<DeSerializersT>
    >;
    ALL_FIELDS: AllFields<SalesOrderPartner<DeSerializers>>;
  };

  get schema() {
    if (!this._schema) {
      const fieldBuilder = this.fieldBuilder;
      this._schema = {
        /**
         * Static representation of the {@link salesOrder} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SALES_ORDER: fieldBuilder.buildEdmTypeField(
          'SalesOrder',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link partnerFunction} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PARTNER_FUNCTION: fieldBuilder.buildEdmTypeField(
          'PartnerFunction',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link customer} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER: fieldBuilder.buildEdmTypeField(
          'Customer',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link supplier} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SUPPLIER: fieldBuilder.buildEdmTypeField(
          'Supplier',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link personnel} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PERSONNEL: fieldBuilder.buildEdmTypeField(
          'Personnel',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link contactPerson} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONTACT_PERSON: fieldBuilder.buildEdmTypeField(
          'ContactPerson',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link referenceBusinessPartner} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        REFERENCE_BUSINESS_PARTNER: fieldBuilder.buildEdmTypeField(
          'ReferenceBusinessPartner',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link businessPartnerName1} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_NAME_1: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerName1',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link businessPartnerName2} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_NAME_2: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerName2',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link businessPartnerName3} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_NAME_3: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerName3',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link businessPartnerName4} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_NAME_4: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerName4',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link streetName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        STREET_NAME: fieldBuilder.buildEdmTypeField(
          'StreetName',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link streetPrefixName1} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        STREET_PREFIX_NAME_1: fieldBuilder.buildEdmTypeField(
          'StreetPrefixName1',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link streetPrefixName2} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        STREET_PREFIX_NAME_2: fieldBuilder.buildEdmTypeField(
          'StreetPrefixName2',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link streetSuffixName1} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        STREET_SUFFIX_NAME_1: fieldBuilder.buildEdmTypeField(
          'StreetSuffixName1',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link streetSuffixName2} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        STREET_SUFFIX_NAME_2: fieldBuilder.buildEdmTypeField(
          'StreetSuffixName2',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link houseNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        HOUSE_NUMBER: fieldBuilder.buildEdmTypeField(
          'HouseNumber',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link postalCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        POSTAL_CODE: fieldBuilder.buildEdmTypeField(
          'PostalCode',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link cityName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CITY_NAME: fieldBuilder.buildEdmTypeField(
          'CityName',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link districtName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DISTRICT_NAME: fieldBuilder.buildEdmTypeField(
          'DistrictName',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link region} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        REGION: fieldBuilder.buildEdmTypeField('Region', 'Edm.String', false),
        /**
         * Static representation of the {@link country} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        COUNTRY: fieldBuilder.buildEdmTypeField('Country', 'Edm.String', false),
        /**
         * Static representation of the {@link internationalPhoneNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INTERNATIONAL_PHONE_NUMBER: fieldBuilder.buildEdmTypeField(
          'InternationalPhoneNumber',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link internationalMobilePhoneNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INTERNATIONAL_MOBILE_PHONE_NUMBER: fieldBuilder.buildEdmTypeField(
          'InternationalMobilePhoneNumber',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link internationalFaxNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INTERNATIONAL_FAX_NUMBER: fieldBuilder.buildEdmTypeField(
          'InternationalFaxNumber',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link poBox} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PO_BOX: fieldBuilder.buildEdmTypeField('POBox', 'Edm.String', false),
        /**
         * Static representation of the {@link poBoxPostalCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PO_BOX_POSTAL_CODE: fieldBuilder.buildEdmTypeField(
          'POBoxPostalCode',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link formOfAddress} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FORM_OF_ADDRESS: fieldBuilder.buildEdmTypeField(
          'FormOfAddress',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link correspondenceLanguage} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CORRESPONDENCE_LANGUAGE: fieldBuilder.buildEdmTypeField(
          'CorrespondenceLanguage',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link emailAddress} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        EMAIL_ADDRESS: fieldBuilder.buildEdmTypeField(
          'EmailAddress',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link taxJurisdiction} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TAX_JURISDICTION: fieldBuilder.buildEdmTypeField(
          'TaxJurisdiction',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link transportZone} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TRANSPORT_ZONE: fieldBuilder.buildEdmTypeField(
          'TransportZone',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link unloadingPointName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        UNLOADING_POINT_NAME: fieldBuilder.buildEdmTypeField(
          'UnloadingPointName',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link vatRegistration} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        VAT_REGISTRATION: fieldBuilder.buildEdmTypeField(
          'VATRegistration',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link sdDocPartnerAddrIsDocSpecific} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SD_DOC_PARTNER_ADDR_IS_DOC_SPECIFIC: fieldBuilder.buildEdmTypeField(
          'SDDocPartnerAddrIsDocSpecific',
          'Edm.Boolean',
          false
        ),
        /**
         * Static representation of the {@link sapMessages} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SAP_MESSAGES: fieldBuilder.buildCollectionField(
          'SAP__Messages',
          Sap_Message,
          false
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', SalesOrderPartner)
      };
    }

    return this._schema;
  }
}
