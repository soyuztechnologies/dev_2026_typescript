/*
 * Copyright (c) 2026 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { SalesOrderItem } from './SalesOrderItem';
import { SalesOrderItemRequestBuilder } from './SalesOrderItemRequestBuilder';
import { SalesOrderItemPartnerApi } from './SalesOrderItemPartnerApi';
import { SalesOrderItemPricingElementApi } from './SalesOrderItemPricingElementApi';
import { SalesOrderItemTextApi } from './SalesOrderItemTextApi';
import { SalesOrderApi } from './SalesOrderApi';
import { SalesOrderScheduleLineApi } from './SalesOrderScheduleLineApi';
import { VariantConfigurationApi } from './VariantConfigurationApi';
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
  OneToManyLink,
  OneToOneLink
} from '@sap-cloud-sdk/odata-v4';
export class SalesOrderItemApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers
> implements EntityApi<SalesOrderItem<DeSerializersT>, DeSerializersT> {
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
  ): SalesOrderItemApi<DeSerializersT> {
    return new SalesOrderItemApi(deSerializers);
  }

  private navigationPropertyFields!: {
    /**
     * Static representation of the one-to-many navigation property {@link itemPartner} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    ITEM_PARTNER: OneToManyLink<
      SalesOrderItem<DeSerializersT>,
      DeSerializersT,
      SalesOrderItemPartnerApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link itemPricingElement} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    ITEM_PRICING_ELEMENT: OneToManyLink<
      SalesOrderItem<DeSerializersT>,
      DeSerializersT,
      SalesOrderItemPricingElementApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link itemText} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    ITEM_TEXT: OneToManyLink<
      SalesOrderItem<DeSerializersT>,
      DeSerializersT,
      SalesOrderItemTextApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-one navigation property {@link salesOrder_1} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    SALES_ORDER_1: OneToOneLink<
      SalesOrderItem<DeSerializersT>,
      DeSerializersT,
      SalesOrderApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link scheduleLine} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    SCHEDULE_LINE: OneToManyLink<
      SalesOrderItem<DeSerializersT>,
      DeSerializersT,
      SalesOrderScheduleLineApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-one navigation property {@link variantConfiguration} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    VARIANT_CONFIGURATION: OneToOneLink<
      SalesOrderItem<DeSerializersT>,
      DeSerializersT,
      VariantConfigurationApi<DeSerializersT>
    >;
  };

  _addNavigationProperties(
    linkedApis: [
      SalesOrderItemPartnerApi<DeSerializersT>,
      SalesOrderItemPricingElementApi<DeSerializersT>,
      SalesOrderItemTextApi<DeSerializersT>,
      SalesOrderApi<DeSerializersT>,
      SalesOrderScheduleLineApi<DeSerializersT>,
      VariantConfigurationApi<DeSerializersT>
    ]
  ): this {
    this.navigationPropertyFields = {
      ITEM_PARTNER: new OneToManyLink('_ItemPartner', this, linkedApis[0]),
      ITEM_PRICING_ELEMENT: new OneToManyLink(
        '_ItemPricingElement',
        this,
        linkedApis[1]
      ),
      ITEM_TEXT: new OneToManyLink('_ItemText', this, linkedApis[2]),
      SALES_ORDER_1: new OneToOneLink('_SalesOrder', this, linkedApis[3]),
      SCHEDULE_LINE: new OneToManyLink('_ScheduleLine', this, linkedApis[4]),
      VARIANT_CONFIGURATION: new OneToOneLink(
        '_VariantConfiguration',
        this,
        linkedApis[5]
      )
    };
    return this;
  }

  entityConstructor = SalesOrderItem;

  requestBuilder(): SalesOrderItemRequestBuilder<DeSerializersT> {
    return new SalesOrderItemRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    SalesOrderItem<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<SalesOrderItem<DeSerializersT>, DeSerializersT>(this);
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT
  ): CustomField<SalesOrderItem<DeSerializersT>, DeSerializersT, NullableT> {
    return new CustomField(
      fieldName,
      this.entityConstructor,
      this.deSerializers,
      isNullable
    ) as any;
  }

  private _fieldBuilder?: FieldBuilder<typeof SalesOrderItem, DeSerializersT>;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(SalesOrderItem, this.deSerializers);
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    SALES_ORDER: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SALES_ORDER_ITEM: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    HIGHER_LEVEL_ITEM: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SALES_ORDER_ITEM_CATEGORY: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SALES_ORDER_ITEM_TEXT: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PRODUCT: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    ORIGINALLY_REQUESTED_MATERIAL: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PRODUCT_GROUP: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    MATERIAL_BY_CUSTOMER: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    INTERNATIONAL_ARTICLE_NUMBER: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PURCHASE_ORDER_BY_SHIP_TO_PARTY: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PURCHASE_ORDER_BY_CUSTOMER: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CONFD_DELIV_QTY_IN_ORDER_QTY_UNIT: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      false,
      true
    >;
    ORDER_QUANTITY_SAP_UNIT: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    ORDER_QUANTITY_ISO_UNIT: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    REQUESTED_QUANTITY: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      false,
      true
    >;
    REQUESTED_QUANTITY_SAP_UNIT: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    REQUESTED_QUANTITY_ISO_UNIT: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    REFERENCE_SD_DOCUMENT: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    REFERENCE_SD_DOCUMENT_ITEM: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    REFERENCE_SD_DOCUMENT_CATEGORY: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BUSINESS_SOLUTION_ORDER_ITEM: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ITEM_GROSS_WEIGHT: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      false,
      true
    >;
    ITEM_NET_WEIGHT: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      false,
      true
    >;
    ITEM_WEIGHT_SAP_UNIT: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    ITEM_WEIGHT_ISO_UNIT: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    ITEM_VOLUME: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      false,
      true
    >;
    ITEM_VOLUME_SAP_UNIT: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    ITEM_VOLUME_ISO_UNIT: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    REQUESTED_DELIVERY_DATE: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Date',
      true,
      true
    >;
    CONFIRMED_DELIVERY_DATE: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Date',
      true,
      true
    >;
    PRICING_DATE: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Date',
      true,
      true
    >;
    SERVICES_RENDERED_DATE: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Date',
      true,
      true
    >;
    BILLING_DOCUMENT_DATE: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Date',
      true,
      true
    >;
    NET_AMOUNT: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      false,
      true
    >;
    TRANSACTION_CURRENCY: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    TAX_AMOUNT: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      false,
      true
    >;
    CUSTOMER_GROUP: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BATCH: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PLANT: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    STORAGE_LOCATION: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SHIPPING_POINT: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SHIPPING_TYPE: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    ROUTE: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PROPOSED_DELIVERY_ROUTE: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    DELIVERY_PRIORITY: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PARTIAL_DELIVERY_IS_ALLOWED: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    MAX_NMBR_OF_PARTIAL_DELIVERY: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      false,
      true
    >;
    DELIVERY_DATE_TYPE_RULE: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    RECEIVING_POINT: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    DELIVERY_GROUP: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    MEANS_OF_TRANSPORT_TYPE: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    MEANS_OF_TRANSPORT_REF_MATERIAL: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SPECIAL_PROCESSING_CODE: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    INCOTERMS_CLASSIFICATION: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    INCOTERMS_LOCATION_1: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    INCOTERMS_LOCATION_2: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    INCOTERMS_VERSION: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CUSTOMER_PAYMENT_TERMS: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    FIXED_VALUE_DATE: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Date',
      true,
      true
    >;
    CUSTOMER_PRICE_GROUP: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    MATERIAL_PRICING_GROUP: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BUSINESS_AREA: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PROFIT_CENTER: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    MATL_ACCOUNT_ASSIGNMENT_GROUP: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    WBS_ELEMENT_EXTERNAL_ID: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    ITEM_BILLING_BLOCK_REASON: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SALES_DOCUMENT_RJCN_REASON: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PRODUCT_CONFIGURATION: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SD_PROCESS_STATUS: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SD_DOCUMENT_REJECTION_STATUS: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    DELIVERY_STATUS: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BILLING_BLOCK_STATUS: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    ITEM_GENERAL_INCOMPLETION_STATUS: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    DELIVERY_BLOCK_STATUS: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SLS_ORDER_ITEM_DOWN_PAYMENT_STATUS: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    ORDER_RELATED_BILLING_STATUS: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CHML_CMPLNC_STATUS: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    DANGEROUS_GOODS_STATUS: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SAFETY_DATA_SHEET_STATUS: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    TRD_CMPLNC_EMBARGO_STS: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    TRD_CMPLNC_SNCTND_LIST_CHK_STS: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    OVRL_TRD_CMPLNC_LEGAL_CTRL_CHK_STS: OrderableEdmTypeField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SAP_MESSAGES: CollectionField<
      SalesOrderItem<DeSerializers>,
      DeSerializersT,
      Sap_Message,
      false,
      true
    >;
    /**
     * Static representation of the one-to-many navigation property {@link itemPartner} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    ITEM_PARTNER: OneToManyLink<
      SalesOrderItem<DeSerializersT>,
      DeSerializersT,
      SalesOrderItemPartnerApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link itemPricingElement} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    ITEM_PRICING_ELEMENT: OneToManyLink<
      SalesOrderItem<DeSerializersT>,
      DeSerializersT,
      SalesOrderItemPricingElementApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link itemText} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    ITEM_TEXT: OneToManyLink<
      SalesOrderItem<DeSerializersT>,
      DeSerializersT,
      SalesOrderItemTextApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-one navigation property {@link salesOrder_1} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    SALES_ORDER_1: OneToOneLink<
      SalesOrderItem<DeSerializersT>,
      DeSerializersT,
      SalesOrderApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link scheduleLine} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    SCHEDULE_LINE: OneToManyLink<
      SalesOrderItem<DeSerializersT>,
      DeSerializersT,
      SalesOrderScheduleLineApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-one navigation property {@link variantConfiguration} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    VARIANT_CONFIGURATION: OneToOneLink<
      SalesOrderItem<DeSerializersT>,
      DeSerializersT,
      VariantConfigurationApi<DeSerializersT>
    >;
    ALL_FIELDS: AllFields<SalesOrderItem<DeSerializers>>;
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
         * Static representation of the {@link salesOrderItem} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SALES_ORDER_ITEM: fieldBuilder.buildEdmTypeField(
          'SalesOrderItem',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link higherLevelItem} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        HIGHER_LEVEL_ITEM: fieldBuilder.buildEdmTypeField(
          'HigherLevelItem',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link salesOrderItemCategory} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SALES_ORDER_ITEM_CATEGORY: fieldBuilder.buildEdmTypeField(
          'SalesOrderItemCategory',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link salesOrderItemText} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SALES_ORDER_ITEM_TEXT: fieldBuilder.buildEdmTypeField(
          'SalesOrderItemText',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link product} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PRODUCT: fieldBuilder.buildEdmTypeField('Product', 'Edm.String', false),
        /**
         * Static representation of the {@link originallyRequestedMaterial} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ORIGINALLY_REQUESTED_MATERIAL: fieldBuilder.buildEdmTypeField(
          'OriginallyRequestedMaterial',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link productGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PRODUCT_GROUP: fieldBuilder.buildEdmTypeField(
          'ProductGroup',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link materialByCustomer} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        MATERIAL_BY_CUSTOMER: fieldBuilder.buildEdmTypeField(
          'MaterialByCustomer',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link internationalArticleNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INTERNATIONAL_ARTICLE_NUMBER: fieldBuilder.buildEdmTypeField(
          'InternationalArticleNumber',
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
         * Static representation of the {@link purchaseOrderByCustomer} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASE_ORDER_BY_CUSTOMER: fieldBuilder.buildEdmTypeField(
          'PurchaseOrderByCustomer',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link confdDelivQtyInOrderQtyUnit} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONFD_DELIV_QTY_IN_ORDER_QTY_UNIT: fieldBuilder.buildEdmTypeField(
          'ConfdDelivQtyInOrderQtyUnit',
          'Edm.Decimal',
          false
        ),
        /**
         * Static representation of the {@link orderQuantitySapUnit} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ORDER_QUANTITY_SAP_UNIT: fieldBuilder.buildEdmTypeField(
          'OrderQuantitySAPUnit',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link orderQuantityIsoUnit} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ORDER_QUANTITY_ISO_UNIT: fieldBuilder.buildEdmTypeField(
          'OrderQuantityISOUnit',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link requestedQuantity} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        REQUESTED_QUANTITY: fieldBuilder.buildEdmTypeField(
          'RequestedQuantity',
          'Edm.Decimal',
          false
        ),
        /**
         * Static representation of the {@link requestedQuantitySapUnit} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        REQUESTED_QUANTITY_SAP_UNIT: fieldBuilder.buildEdmTypeField(
          'RequestedQuantitySAPUnit',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link requestedQuantityIsoUnit} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        REQUESTED_QUANTITY_ISO_UNIT: fieldBuilder.buildEdmTypeField(
          'RequestedQuantityISOUnit',
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
         * Static representation of the {@link referenceSdDocumentItem} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        REFERENCE_SD_DOCUMENT_ITEM: fieldBuilder.buildEdmTypeField(
          'ReferenceSDDocumentItem',
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
         * Static representation of the {@link businessSolutionOrderItem} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_SOLUTION_ORDER_ITEM: fieldBuilder.buildEdmTypeField(
          'BusinessSolutionOrderItem',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link itemGrossWeight} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ITEM_GROSS_WEIGHT: fieldBuilder.buildEdmTypeField(
          'ItemGrossWeight',
          'Edm.Decimal',
          false
        ),
        /**
         * Static representation of the {@link itemNetWeight} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ITEM_NET_WEIGHT: fieldBuilder.buildEdmTypeField(
          'ItemNetWeight',
          'Edm.Decimal',
          false
        ),
        /**
         * Static representation of the {@link itemWeightSapUnit} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ITEM_WEIGHT_SAP_UNIT: fieldBuilder.buildEdmTypeField(
          'ItemWeightSAPUnit',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link itemWeightIsoUnit} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ITEM_WEIGHT_ISO_UNIT: fieldBuilder.buildEdmTypeField(
          'ItemWeightISOUnit',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link itemVolume} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ITEM_VOLUME: fieldBuilder.buildEdmTypeField(
          'ItemVolume',
          'Edm.Decimal',
          false
        ),
        /**
         * Static representation of the {@link itemVolumeSapUnit} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ITEM_VOLUME_SAP_UNIT: fieldBuilder.buildEdmTypeField(
          'ItemVolumeSAPUnit',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link itemVolumeIsoUnit} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ITEM_VOLUME_ISO_UNIT: fieldBuilder.buildEdmTypeField(
          'ItemVolumeISOUnit',
          'Edm.String',
          false
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
         * Static representation of the {@link confirmedDeliveryDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONFIRMED_DELIVERY_DATE: fieldBuilder.buildEdmTypeField(
          'ConfirmedDeliveryDate',
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
         * Static representation of the {@link netAmount} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        NET_AMOUNT: fieldBuilder.buildEdmTypeField(
          'NetAmount',
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
         * Static representation of the {@link taxAmount} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TAX_AMOUNT: fieldBuilder.buildEdmTypeField(
          'TaxAmount',
          'Edm.Decimal',
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
         * Static representation of the {@link batch} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BATCH: fieldBuilder.buildEdmTypeField('Batch', 'Edm.String', false),
        /**
         * Static representation of the {@link plant} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PLANT: fieldBuilder.buildEdmTypeField('Plant', 'Edm.String', false),
        /**
         * Static representation of the {@link storageLocation} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        STORAGE_LOCATION: fieldBuilder.buildEdmTypeField(
          'StorageLocation',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link shippingPoint} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SHIPPING_POINT: fieldBuilder.buildEdmTypeField(
          'ShippingPoint',
          'Edm.String',
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
         * Static representation of the {@link route} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ROUTE: fieldBuilder.buildEdmTypeField('Route', 'Edm.String', false),
        /**
         * Static representation of the {@link proposedDeliveryRoute} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PROPOSED_DELIVERY_ROUTE: fieldBuilder.buildEdmTypeField(
          'ProposedDeliveryRoute',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link deliveryPriority} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DELIVERY_PRIORITY: fieldBuilder.buildEdmTypeField(
          'DeliveryPriority',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link partialDeliveryIsAllowed} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PARTIAL_DELIVERY_IS_ALLOWED: fieldBuilder.buildEdmTypeField(
          'PartialDeliveryIsAllowed',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link maxNmbrOfPartialDelivery} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        MAX_NMBR_OF_PARTIAL_DELIVERY: fieldBuilder.buildEdmTypeField(
          'MaxNmbrOfPartialDelivery',
          'Edm.Decimal',
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
         * Static representation of the {@link receivingPoint} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        RECEIVING_POINT: fieldBuilder.buildEdmTypeField(
          'ReceivingPoint',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link deliveryGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DELIVERY_GROUP: fieldBuilder.buildEdmTypeField(
          'DeliveryGroup',
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
         * Static representation of the {@link incotermsVersion} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INCOTERMS_VERSION: fieldBuilder.buildEdmTypeField(
          'IncotermsVersion',
          'Edm.String',
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
         * Static representation of the {@link fixedValueDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FIXED_VALUE_DATE: fieldBuilder.buildEdmTypeField(
          'FixedValueDate',
          'Edm.Date',
          true
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
         * Static representation of the {@link materialPricingGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        MATERIAL_PRICING_GROUP: fieldBuilder.buildEdmTypeField(
          'MaterialPricingGroup',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link businessArea} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_AREA: fieldBuilder.buildEdmTypeField(
          'BusinessArea',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link profitCenter} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PROFIT_CENTER: fieldBuilder.buildEdmTypeField(
          'ProfitCenter',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link matlAccountAssignmentGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        MATL_ACCOUNT_ASSIGNMENT_GROUP: fieldBuilder.buildEdmTypeField(
          'MatlAccountAssignmentGroup',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link wbsElementExternalId} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        WBS_ELEMENT_EXTERNAL_ID: fieldBuilder.buildEdmTypeField(
          'WBSElementExternalID',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link itemBillingBlockReason} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ITEM_BILLING_BLOCK_REASON: fieldBuilder.buildEdmTypeField(
          'ItemBillingBlockReason',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link salesDocumentRjcnReason} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SALES_DOCUMENT_RJCN_REASON: fieldBuilder.buildEdmTypeField(
          'SalesDocumentRjcnReason',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link productConfiguration} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PRODUCT_CONFIGURATION: fieldBuilder.buildEdmTypeField(
          'ProductConfiguration',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link sdProcessStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SD_PROCESS_STATUS: fieldBuilder.buildEdmTypeField(
          'SDProcessStatus',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link sdDocumentRejectionStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SD_DOCUMENT_REJECTION_STATUS: fieldBuilder.buildEdmTypeField(
          'SDDocumentRejectionStatus',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link deliveryStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DELIVERY_STATUS: fieldBuilder.buildEdmTypeField(
          'DeliveryStatus',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link billingBlockStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BILLING_BLOCK_STATUS: fieldBuilder.buildEdmTypeField(
          'BillingBlockStatus',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link itemGeneralIncompletionStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ITEM_GENERAL_INCOMPLETION_STATUS: fieldBuilder.buildEdmTypeField(
          'ItemGeneralIncompletionStatus',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link deliveryBlockStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DELIVERY_BLOCK_STATUS: fieldBuilder.buildEdmTypeField(
          'DeliveryBlockStatus',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link slsOrderItemDownPaymentStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SLS_ORDER_ITEM_DOWN_PAYMENT_STATUS: fieldBuilder.buildEdmTypeField(
          'SlsOrderItemDownPaymentStatus',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link orderRelatedBillingStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ORDER_RELATED_BILLING_STATUS: fieldBuilder.buildEdmTypeField(
          'OrderRelatedBillingStatus',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link chmlCmplncStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CHML_CMPLNC_STATUS: fieldBuilder.buildEdmTypeField(
          'ChmlCmplncStatus',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link dangerousGoodsStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DANGEROUS_GOODS_STATUS: fieldBuilder.buildEdmTypeField(
          'DangerousGoodsStatus',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link safetyDataSheetStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SAFETY_DATA_SHEET_STATUS: fieldBuilder.buildEdmTypeField(
          'SafetyDataSheetStatus',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link trdCmplncEmbargoSts} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TRD_CMPLNC_EMBARGO_STS: fieldBuilder.buildEdmTypeField(
          'TrdCmplncEmbargoSts',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link trdCmplncSnctndListChkSts} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TRD_CMPLNC_SNCTND_LIST_CHK_STS: fieldBuilder.buildEdmTypeField(
          'TrdCmplncSnctndListChkSts',
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
        ALL_FIELDS: new AllFields('*', SalesOrderItem)
      };
    }

    return this._schema;
  }
}
