/*
 * Copyright (c) 2026 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { SalesOrder } from './SalesOrder';
import { SalesOrderRequestBuilder } from './SalesOrderRequestBuilder';
import { SalesOrderItemApi } from './SalesOrderItemApi';
import { SalesOrderPartnerApi } from './SalesOrderPartnerApi';
import { SalesOrderPricingElementApi } from './SalesOrderPricingElementApi';
import { SalesOrderTextApi } from './SalesOrderTextApi';
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
  Time,
  OrderableEdmTypeField,
  CollectionField,
  OneToManyLink
} from '@sap-cloud-sdk/odata-v4';
export class SalesOrderApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers
> implements EntityApi<SalesOrder<DeSerializersT>, DeSerializersT> {
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
  ): SalesOrderApi<DeSerializersT> {
    return new SalesOrderApi(deSerializers);
  }

  private navigationPropertyFields!: {
    /**
     * Static representation of the one-to-many navigation property {@link item} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    ITEM: OneToManyLink<
      SalesOrder<DeSerializersT>,
      DeSerializersT,
      SalesOrderItemApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link partner} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    PARTNER: OneToManyLink<
      SalesOrder<DeSerializersT>,
      DeSerializersT,
      SalesOrderPartnerApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link pricingElement} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    PRICING_ELEMENT: OneToManyLink<
      SalesOrder<DeSerializersT>,
      DeSerializersT,
      SalesOrderPricingElementApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link text} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TEXT: OneToManyLink<
      SalesOrder<DeSerializersT>,
      DeSerializersT,
      SalesOrderTextApi<DeSerializersT>
    >;
  };

  _addNavigationProperties(
    linkedApis: [
      SalesOrderItemApi<DeSerializersT>,
      SalesOrderPartnerApi<DeSerializersT>,
      SalesOrderPricingElementApi<DeSerializersT>,
      SalesOrderTextApi<DeSerializersT>
    ]
  ): this {
    this.navigationPropertyFields = {
      ITEM: new OneToManyLink('_Item', this, linkedApis[0]),
      PARTNER: new OneToManyLink('_Partner', this, linkedApis[1]),
      PRICING_ELEMENT: new OneToManyLink(
        '_PricingElement',
        this,
        linkedApis[2]
      ),
      TEXT: new OneToManyLink('_Text', this, linkedApis[3])
    };
    return this;
  }

  entityConstructor = SalesOrder;

  requestBuilder(): SalesOrderRequestBuilder<DeSerializersT> {
    return new SalesOrderRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    SalesOrder<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<SalesOrder<DeSerializersT>, DeSerializersT>(this);
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT
  ): CustomField<SalesOrder<DeSerializersT>, DeSerializersT, NullableT> {
    return new CustomField(
      fieldName,
      this.entityConstructor,
      this.deSerializers,
      isNullable
    ) as any;
  }

  private _fieldBuilder?: FieldBuilder<typeof SalesOrder, DeSerializersT>;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(SalesOrder, this.deSerializers);
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    SALES_ORDER: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SALES_ORDER_TYPE: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SALES_ORDER_PROCESSING_TYPE: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SOLD_TO_PARTY: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SALES_ORGANIZATION: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    DISTRIBUTION_CHANNEL: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    REFERENCE_DISTRIBUTION_CHANNEL: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    ORGANIZATION_DIVISION: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SALES_OFFICE: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SALES_GROUP: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SALES_DISTRICT: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CREATED_BY_USER: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CREATION_DATE: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.Date',
      true,
      true
    >;
    CREATION_TIME: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.TimeOfDay',
      false,
      true
    >;
    LAST_CHANGE_DATE_TIME: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.DateTimeOffset',
      true,
      true
    >;
    LAST_CHANGED_BY_USER: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PURCHASE_ORDER_BY_CUSTOMER: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PURCHASE_ORDER_BY_SHIP_TO_PARTY: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CUSTOMER_PURCHASE_ORDER_TYPE: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CUSTOMER_PURCHASE_ORDER_DATE: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.Date',
      true,
      true
    >;
    BUSINESS_SOLUTION_ORDER: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    REFERENCE_SD_DOCUMENT: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    REFERENCE_SD_DOCUMENT_CATEGORY: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SD_DOCUMENT_REASON: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SALES_ORDER_DATE: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.Date',
      true,
      true
    >;
    REQUESTED_DELIVERY_DATE: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.Date',
      true,
      true
    >;
    PRICING_DATE: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.Date',
      true,
      true
    >;
    SERVICES_RENDERED_DATE: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.Date',
      true,
      true
    >;
    BILLING_DOCUMENT_DATE: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.Date',
      true,
      true
    >;
    PROPOSED_BILLING_DOCUMENT_TYPE: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    TOTAL_NET_AMOUNT: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      false,
      true
    >;
    TRANSACTION_CURRENCY: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    DELIVERY_DATE_TYPE_RULE: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SHIPPING_CONDITION: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    COMPLETE_DELIVERY_IS_DEFINED: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      false,
      true
    >;
    SLS_DOC_IS_RLVT_FOR_PROOF_OF_DELIV: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      false,
      true
    >;
    SHIPPING_TYPE: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    RECEIVING_POINT: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    MEANS_OF_TRANSPORT_TYPE: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    MEANS_OF_TRANSPORT_REF_MATERIAL: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SPECIAL_PROCESSING_CODE: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    INCOTERMS_CLASSIFICATION: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    INCOTERMS_VERSION: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    INCOTERMS_LOCATION_1: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    INCOTERMS_LOCATION_2: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SD_PRICING_PROCEDURE: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CUSTOMER_PRICE_GROUP: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PRICE_LIST_TYPE: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    FIXED_VALUE_DATE: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.Date',
      true,
      true
    >;
    TAX_DEPARTURE_COUNTRY: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    VAT_REGISTRATION_COUNTRY: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    IS_EU_TRIANGULAR_DEAL: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      false,
      true
    >;
    CUSTOMER_PAYMENT_TERMS: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PAYMENT_METHOD: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BILLING_COMPANY_CODE: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CONTROLLING_AREA: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CUSTOMER_ACCOUNT_ASSIGNMENT_GROUP: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    ASSIGNMENT_REFERENCE: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    ACCOUNTING_DOC_EXTERNAL_REFERENCE: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CUSTOMER_CREDIT_ACCOUNT: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    HEADER_BILLING_BLOCK_REASON: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    DELIVERY_BLOCK_REASON: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SALES_ORDER_APPROVAL_REASON: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CUSTOMER_GROUP: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    ADDITIONAL_CUSTOMER_GROUP_1: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    ADDITIONAL_CUSTOMER_GROUP_2: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    ADDITIONAL_CUSTOMER_GROUP_3: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    ADDITIONAL_CUSTOMER_GROUP_4: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    ADDITIONAL_CUSTOMER_GROUP_5: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    OVERALL_SD_PROCESS_STATUS: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    OVERALL_DELIVERY_BLOCK_STATUS: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    OVERALL_BILLING_BLOCK_STATUS: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    OVERALL_DELIVERY_STATUS: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    TOTAL_CREDIT_CHECK_STATUS: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    OVERALL_SD_DOCUMENT_REJECTION_STS: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    TOTAL_BLOCK_STATUS: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    HDR_GENERAL_INCOMPLETION_STATUS: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    OVRL_ITM_GENERAL_INCOMPLETION_STS: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    OVERALL_SD_DOC_REFERENCE_STATUS: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SALES_DOC_APPROVAL_STATUS: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    OVERALL_CHML_CMPLNC_STATUS: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    OVERALL_DANGEROUS_GOODS_STATUS: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    OVERALL_SAFETY_DATA_SHEET_STATUS: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    OVERALL_TRD_CMPLNC_EMBARGO_STS: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    OVRL_TRD_CMPLNC_SNCTND_LIST_CHK_STS: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    OVRL_TRD_CMPLNC_LEGAL_CTRL_CHK_STS: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SALES_ORDER_DOWN_PAYMENT_STATUS: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    OVERALL_ORD_RELTD_BILLG_STATUS: OrderableEdmTypeField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SAP_MESSAGES: CollectionField<
      SalesOrder<DeSerializers>,
      DeSerializersT,
      Sap_Message,
      false,
      true
    >;
    /**
     * Static representation of the one-to-many navigation property {@link item} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    ITEM: OneToManyLink<
      SalesOrder<DeSerializersT>,
      DeSerializersT,
      SalesOrderItemApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link partner} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    PARTNER: OneToManyLink<
      SalesOrder<DeSerializersT>,
      DeSerializersT,
      SalesOrderPartnerApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link pricingElement} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    PRICING_ELEMENT: OneToManyLink<
      SalesOrder<DeSerializersT>,
      DeSerializersT,
      SalesOrderPricingElementApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link text} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TEXT: OneToManyLink<
      SalesOrder<DeSerializersT>,
      DeSerializersT,
      SalesOrderTextApi<DeSerializersT>
    >;
    ALL_FIELDS: AllFields<SalesOrder<DeSerializers>>;
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
         * Static representation of the {@link salesOrderType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SALES_ORDER_TYPE: fieldBuilder.buildEdmTypeField(
          'SalesOrderType',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link salesOrderProcessingType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SALES_ORDER_PROCESSING_TYPE: fieldBuilder.buildEdmTypeField(
          'SalesOrderProcessingType',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link soldToParty} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SOLD_TO_PARTY: fieldBuilder.buildEdmTypeField(
          'SoldToParty',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link salesOrganization} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SALES_ORGANIZATION: fieldBuilder.buildEdmTypeField(
          'SalesOrganization',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link distributionChannel} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DISTRIBUTION_CHANNEL: fieldBuilder.buildEdmTypeField(
          'DistributionChannel',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link referenceDistributionChannel} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        REFERENCE_DISTRIBUTION_CHANNEL: fieldBuilder.buildEdmTypeField(
          'ReferenceDistributionChannel',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link organizationDivision} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ORGANIZATION_DIVISION: fieldBuilder.buildEdmTypeField(
          'OrganizationDivision',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link salesOffice} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SALES_OFFICE: fieldBuilder.buildEdmTypeField(
          'SalesOffice',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link salesGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SALES_GROUP: fieldBuilder.buildEdmTypeField(
          'SalesGroup',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link salesDistrict} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SALES_DISTRICT: fieldBuilder.buildEdmTypeField(
          'SalesDistrict',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link createdByUser} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CREATED_BY_USER: fieldBuilder.buildEdmTypeField(
          'CreatedByUser',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link creationDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CREATION_DATE: fieldBuilder.buildEdmTypeField(
          'CreationDate',
          'Edm.Date',
          true
        ),
        /**
         * Static representation of the {@link creationTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CREATION_TIME: fieldBuilder.buildEdmTypeField(
          'CreationTime',
          'Edm.TimeOfDay',
          false
        ),
        /**
         * Static representation of the {@link lastChangeDateTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        LAST_CHANGE_DATE_TIME: fieldBuilder.buildEdmTypeField(
          'LastChangeDateTime',
          'Edm.DateTimeOffset',
          true,
          7
        ),
        /**
         * Static representation of the {@link lastChangedByUser} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        LAST_CHANGED_BY_USER: fieldBuilder.buildEdmTypeField(
          'LastChangedByUser',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link purchaseOrderByCustomer} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASE_ORDER_BY_CUSTOMER: fieldBuilder.buildEdmTypeField(
          'PurchaseOrderByCustomer',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link purchaseOrderByShipToParty} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASE_ORDER_BY_SHIP_TO_PARTY: fieldBuilder.buildEdmTypeField(
          'PurchaseOrderByShipToParty',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link customerPurchaseOrderType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER_PURCHASE_ORDER_TYPE: fieldBuilder.buildEdmTypeField(
          'CustomerPurchaseOrderType',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link customerPurchaseOrderDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER_PURCHASE_ORDER_DATE: fieldBuilder.buildEdmTypeField(
          'CustomerPurchaseOrderDate',
          'Edm.Date',
          true
        ),
        /**
         * Static representation of the {@link businessSolutionOrder} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_SOLUTION_ORDER: fieldBuilder.buildEdmTypeField(
          'BusinessSolutionOrder',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link referenceSdDocument} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        REFERENCE_SD_DOCUMENT: fieldBuilder.buildEdmTypeField(
          'ReferenceSDDocument',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link referenceSdDocumentCategory} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        REFERENCE_SD_DOCUMENT_CATEGORY: fieldBuilder.buildEdmTypeField(
          'ReferenceSDDocumentCategory',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link sdDocumentReason} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SD_DOCUMENT_REASON: fieldBuilder.buildEdmTypeField(
          'SDDocumentReason',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link salesOrderDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SALES_ORDER_DATE: fieldBuilder.buildEdmTypeField(
          'SalesOrderDate',
          'Edm.Date',
          true
        ),
        /**
         * Static representation of the {@link requestedDeliveryDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        REQUESTED_DELIVERY_DATE: fieldBuilder.buildEdmTypeField(
          'RequestedDeliveryDate',
          'Edm.Date',
          true
        ),
        /**
         * Static representation of the {@link pricingDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PRICING_DATE: fieldBuilder.buildEdmTypeField(
          'PricingDate',
          'Edm.Date',
          true
        ),
        /**
         * Static representation of the {@link servicesRenderedDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SERVICES_RENDERED_DATE: fieldBuilder.buildEdmTypeField(
          'ServicesRenderedDate',
          'Edm.Date',
          true
        ),
        /**
         * Static representation of the {@link billingDocumentDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BILLING_DOCUMENT_DATE: fieldBuilder.buildEdmTypeField(
          'BillingDocumentDate',
          'Edm.Date',
          true
        ),
        /**
         * Static representation of the {@link proposedBillingDocumentType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PROPOSED_BILLING_DOCUMENT_TYPE: fieldBuilder.buildEdmTypeField(
          'ProposedBillingDocumentType',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link totalNetAmount} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TOTAL_NET_AMOUNT: fieldBuilder.buildEdmTypeField(
          'TotalNetAmount',
          'Edm.Decimal',
          false
        ),
        /**
         * Static representation of the {@link transactionCurrency} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TRANSACTION_CURRENCY: fieldBuilder.buildEdmTypeField(
          'TransactionCurrency',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link deliveryDateTypeRule} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DELIVERY_DATE_TYPE_RULE: fieldBuilder.buildEdmTypeField(
          'DeliveryDateTypeRule',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link shippingCondition} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SHIPPING_CONDITION: fieldBuilder.buildEdmTypeField(
          'ShippingCondition',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link completeDeliveryIsDefined} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        COMPLETE_DELIVERY_IS_DEFINED: fieldBuilder.buildEdmTypeField(
          'CompleteDeliveryIsDefined',
          'Edm.Boolean',
          false
        ),
        /**
         * Static representation of the {@link slsDocIsRlvtForProofOfDeliv} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SLS_DOC_IS_RLVT_FOR_PROOF_OF_DELIV: fieldBuilder.buildEdmTypeField(
          'SlsDocIsRlvtForProofOfDeliv',
          'Edm.Boolean',
          false
        ),
        /**
         * Static representation of the {@link shippingType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SHIPPING_TYPE: fieldBuilder.buildEdmTypeField(
          'ShippingType',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link receivingPoint} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        RECEIVING_POINT: fieldBuilder.buildEdmTypeField(
          'ReceivingPoint',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link meansOfTransportType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        MEANS_OF_TRANSPORT_TYPE: fieldBuilder.buildEdmTypeField(
          'MeansOfTransportType',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link meansOfTransportRefMaterial} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        MEANS_OF_TRANSPORT_REF_MATERIAL: fieldBuilder.buildEdmTypeField(
          'MeansOfTransportRefMaterial',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link specialProcessingCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SPECIAL_PROCESSING_CODE: fieldBuilder.buildEdmTypeField(
          'SpecialProcessingCode',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link incotermsClassification} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INCOTERMS_CLASSIFICATION: fieldBuilder.buildEdmTypeField(
          'IncotermsClassification',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link incotermsVersion} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INCOTERMS_VERSION: fieldBuilder.buildEdmTypeField(
          'IncotermsVersion',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link incotermsLocation1} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INCOTERMS_LOCATION_1: fieldBuilder.buildEdmTypeField(
          'IncotermsLocation1',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link incotermsLocation2} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INCOTERMS_LOCATION_2: fieldBuilder.buildEdmTypeField(
          'IncotermsLocation2',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link sdPricingProcedure} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SD_PRICING_PROCEDURE: fieldBuilder.buildEdmTypeField(
          'SDPricingProcedure',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link customerPriceGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER_PRICE_GROUP: fieldBuilder.buildEdmTypeField(
          'CustomerPriceGroup',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link priceListType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PRICE_LIST_TYPE: fieldBuilder.buildEdmTypeField(
          'PriceListType',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link fixedValueDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FIXED_VALUE_DATE: fieldBuilder.buildEdmTypeField(
          'FixedValueDate',
          'Edm.Date',
          true
        ),
        /**
         * Static representation of the {@link taxDepartureCountry} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TAX_DEPARTURE_COUNTRY: fieldBuilder.buildEdmTypeField(
          'TaxDepartureCountry',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link vatRegistrationCountry} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        VAT_REGISTRATION_COUNTRY: fieldBuilder.buildEdmTypeField(
          'VATRegistrationCountry',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link isEuTriangularDeal} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        IS_EU_TRIANGULAR_DEAL: fieldBuilder.buildEdmTypeField(
          'IsEUTriangularDeal',
          'Edm.Boolean',
          false
        ),
        /**
         * Static representation of the {@link customerPaymentTerms} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER_PAYMENT_TERMS: fieldBuilder.buildEdmTypeField(
          'CustomerPaymentTerms',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link paymentMethod} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PAYMENT_METHOD: fieldBuilder.buildEdmTypeField(
          'PaymentMethod',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link billingCompanyCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BILLING_COMPANY_CODE: fieldBuilder.buildEdmTypeField(
          'BillingCompanyCode',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link controllingArea} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONTROLLING_AREA: fieldBuilder.buildEdmTypeField(
          'ControllingArea',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link customerAccountAssignmentGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER_ACCOUNT_ASSIGNMENT_GROUP: fieldBuilder.buildEdmTypeField(
          'CustomerAccountAssignmentGroup',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link assignmentReference} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ASSIGNMENT_REFERENCE: fieldBuilder.buildEdmTypeField(
          'AssignmentReference',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link accountingDocExternalReference} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ACCOUNTING_DOC_EXTERNAL_REFERENCE: fieldBuilder.buildEdmTypeField(
          'AccountingDocExternalReference',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link customerCreditAccount} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER_CREDIT_ACCOUNT: fieldBuilder.buildEdmTypeField(
          'CustomerCreditAccount',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link headerBillingBlockReason} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        HEADER_BILLING_BLOCK_REASON: fieldBuilder.buildEdmTypeField(
          'HeaderBillingBlockReason',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link deliveryBlockReason} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DELIVERY_BLOCK_REASON: fieldBuilder.buildEdmTypeField(
          'DeliveryBlockReason',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link salesOrderApprovalReason} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SALES_ORDER_APPROVAL_REASON: fieldBuilder.buildEdmTypeField(
          'SalesOrderApprovalReason',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link customerGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER_GROUP: fieldBuilder.buildEdmTypeField(
          'CustomerGroup',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link additionalCustomerGroup1} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ADDITIONAL_CUSTOMER_GROUP_1: fieldBuilder.buildEdmTypeField(
          'AdditionalCustomerGroup1',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link additionalCustomerGroup2} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ADDITIONAL_CUSTOMER_GROUP_2: fieldBuilder.buildEdmTypeField(
          'AdditionalCustomerGroup2',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link additionalCustomerGroup3} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ADDITIONAL_CUSTOMER_GROUP_3: fieldBuilder.buildEdmTypeField(
          'AdditionalCustomerGroup3',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link additionalCustomerGroup4} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ADDITIONAL_CUSTOMER_GROUP_4: fieldBuilder.buildEdmTypeField(
          'AdditionalCustomerGroup4',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link additionalCustomerGroup5} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ADDITIONAL_CUSTOMER_GROUP_5: fieldBuilder.buildEdmTypeField(
          'AdditionalCustomerGroup5',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link overallSdProcessStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        OVERALL_SD_PROCESS_STATUS: fieldBuilder.buildEdmTypeField(
          'OverallSDProcessStatus',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link overallDeliveryBlockStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        OVERALL_DELIVERY_BLOCK_STATUS: fieldBuilder.buildEdmTypeField(
          'OverallDeliveryBlockStatus',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link overallBillingBlockStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        OVERALL_BILLING_BLOCK_STATUS: fieldBuilder.buildEdmTypeField(
          'OverallBillingBlockStatus',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link overallDeliveryStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        OVERALL_DELIVERY_STATUS: fieldBuilder.buildEdmTypeField(
          'OverallDeliveryStatus',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link totalCreditCheckStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TOTAL_CREDIT_CHECK_STATUS: fieldBuilder.buildEdmTypeField(
          'TotalCreditCheckStatus',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link overallSdDocumentRejectionSts} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        OVERALL_SD_DOCUMENT_REJECTION_STS: fieldBuilder.buildEdmTypeField(
          'OverallSDDocumentRejectionSts',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link totalBlockStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TOTAL_BLOCK_STATUS: fieldBuilder.buildEdmTypeField(
          'TotalBlockStatus',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link hdrGeneralIncompletionStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        HDR_GENERAL_INCOMPLETION_STATUS: fieldBuilder.buildEdmTypeField(
          'HdrGeneralIncompletionStatus',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link ovrlItmGeneralIncompletionSts} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        OVRL_ITM_GENERAL_INCOMPLETION_STS: fieldBuilder.buildEdmTypeField(
          'OvrlItmGeneralIncompletionSts',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link overallSdDocReferenceStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        OVERALL_SD_DOC_REFERENCE_STATUS: fieldBuilder.buildEdmTypeField(
          'OverallSDDocReferenceStatus',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link salesDocApprovalStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SALES_DOC_APPROVAL_STATUS: fieldBuilder.buildEdmTypeField(
          'SalesDocApprovalStatus',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link overallChmlCmplncStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        OVERALL_CHML_CMPLNC_STATUS: fieldBuilder.buildEdmTypeField(
          'OverallChmlCmplncStatus',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link overallDangerousGoodsStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        OVERALL_DANGEROUS_GOODS_STATUS: fieldBuilder.buildEdmTypeField(
          'OverallDangerousGoodsStatus',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link overallSafetyDataSheetStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        OVERALL_SAFETY_DATA_SHEET_STATUS: fieldBuilder.buildEdmTypeField(
          'OverallSafetyDataSheetStatus',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link overallTrdCmplncEmbargoSts} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        OVERALL_TRD_CMPLNC_EMBARGO_STS: fieldBuilder.buildEdmTypeField(
          'OverallTrdCmplncEmbargoSts',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link ovrlTrdCmplncSnctndListChkSts} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        OVRL_TRD_CMPLNC_SNCTND_LIST_CHK_STS: fieldBuilder.buildEdmTypeField(
          'OvrlTrdCmplncSnctndListChkSts',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link ovrlTrdCmplncLegalCtrlChkSts} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        OVRL_TRD_CMPLNC_LEGAL_CTRL_CHK_STS: fieldBuilder.buildEdmTypeField(
          'OvrlTrdCmplncLegalCtrlChkSts',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link salesOrderDownPaymentStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SALES_ORDER_DOWN_PAYMENT_STATUS: fieldBuilder.buildEdmTypeField(
          'SalesOrderDownPaymentStatus',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link overallOrdReltdBillgStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        OVERALL_ORD_RELTD_BILLG_STATUS: fieldBuilder.buildEdmTypeField(
          'OverallOrdReltdBillgStatus',
          'Edm.String',
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
        ALL_FIELDS: new AllFields('*', SalesOrder)
      };
    }

    return this._schema;
  }
}
