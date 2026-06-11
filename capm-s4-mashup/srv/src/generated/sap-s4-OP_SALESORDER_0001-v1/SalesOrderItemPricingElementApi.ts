/*
 * Copyright (c) 2026 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { SalesOrderItemPricingElement } from './SalesOrderItemPricingElement';
import { SalesOrderItemPricingElementRequestBuilder } from './SalesOrderItemPricingElementRequestBuilder';
import { SalesOrderItemApi } from './SalesOrderItemApi';
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
export class SalesOrderItemPricingElementApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers
> implements EntityApi<
  SalesOrderItemPricingElement<DeSerializersT>,
  DeSerializersT
> {
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
  ): SalesOrderItemPricingElementApi<DeSerializersT> {
    return new SalesOrderItemPricingElementApi(deSerializers);
  }

  private navigationPropertyFields!: {
    /**
     * Static representation of the one-to-one navigation property {@link item} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    ITEM: OneToOneLink<
      SalesOrderItemPricingElement<DeSerializersT>,
      DeSerializersT,
      SalesOrderItemApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-one navigation property {@link salesOrder_1} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    SALES_ORDER_1: OneToOneLink<
      SalesOrderItemPricingElement<DeSerializersT>,
      DeSerializersT,
      SalesOrderApi<DeSerializersT>
    >;
  };

  _addNavigationProperties(
    linkedApis: [
      SalesOrderItemApi<DeSerializersT>,
      SalesOrderApi<DeSerializersT>
    ]
  ): this {
    this.navigationPropertyFields = {
      ITEM: new OneToOneLink('_Item', this, linkedApis[0]),
      SALES_ORDER_1: new OneToOneLink('_SalesOrder', this, linkedApis[1])
    };
    return this;
  }

  entityConstructor = SalesOrderItemPricingElement;

  requestBuilder(): SalesOrderItemPricingElementRequestBuilder<DeSerializersT> {
    return new SalesOrderItemPricingElementRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    SalesOrderItemPricingElement<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<
      SalesOrderItemPricingElement<DeSerializersT>,
      DeSerializersT
    >(this);
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT
  ): CustomField<
    SalesOrderItemPricingElement<DeSerializersT>,
    DeSerializersT,
    NullableT
  > {
    return new CustomField(
      fieldName,
      this.entityConstructor,
      this.deSerializers,
      isNullable
    ) as any;
  }

  private _fieldBuilder?: FieldBuilder<
    typeof SalesOrderItemPricingElement,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        SalesOrderItemPricingElement,
        this.deSerializers
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    SALES_ORDER: OrderableEdmTypeField<
      SalesOrderItemPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SALES_ORDER_ITEM: OrderableEdmTypeField<
      SalesOrderItemPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PRICING_PROCEDURE_STEP: OrderableEdmTypeField<
      SalesOrderItemPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PRICING_PROCEDURE_COUNTER: OrderableEdmTypeField<
      SalesOrderItemPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CONDITION_TYPE: OrderableEdmTypeField<
      SalesOrderItemPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CONDITION_CALCULATION_TYPE: OrderableEdmTypeField<
      SalesOrderItemPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CONDITION_RATE_AMOUNT: OrderableEdmTypeField<
      SalesOrderItemPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    CONDITION_CURRENCY: OrderableEdmTypeField<
      SalesOrderItemPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CONDITION_QUANTITY: OrderableEdmTypeField<
      SalesOrderItemPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    CONDITION_BASE_QUANTITY: OrderableEdmTypeField<
      SalesOrderItemPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    CONDITION_QUANTITY_SAP_UNIT: OrderableEdmTypeField<
      SalesOrderItemPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CONDITION_QUANTITY_ISO_UNIT: OrderableEdmTypeField<
      SalesOrderItemPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CONDITION_RATE_RATIO: OrderableEdmTypeField<
      SalesOrderItemPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    CONDITION_RATE_RATIO_SAP_UNIT: OrderableEdmTypeField<
      SalesOrderItemPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CONDITION_RATE_RATIO_ISO_UNIT: OrderableEdmTypeField<
      SalesOrderItemPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CONDITION_AMOUNT: OrderableEdmTypeField<
      SalesOrderItemPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    CONDITION_BASE_AMOUNT: OrderableEdmTypeField<
      SalesOrderItemPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    TRANSACTION_CURRENCY: OrderableEdmTypeField<
      SalesOrderItemPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SAP_MESSAGES: CollectionField<
      SalesOrderItemPricingElement<DeSerializers>,
      DeSerializersT,
      Sap_Message,
      false,
      true
    >;
    /**
     * Static representation of the one-to-one navigation property {@link item} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    ITEM: OneToOneLink<
      SalesOrderItemPricingElement<DeSerializersT>,
      DeSerializersT,
      SalesOrderItemApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-one navigation property {@link salesOrder_1} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    SALES_ORDER_1: OneToOneLink<
      SalesOrderItemPricingElement<DeSerializersT>,
      DeSerializersT,
      SalesOrderApi<DeSerializersT>
    >;
    ALL_FIELDS: AllFields<SalesOrderItemPricingElement<DeSerializers>>;
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
         * Static representation of the {@link pricingProcedureStep} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PRICING_PROCEDURE_STEP: fieldBuilder.buildEdmTypeField(
          'PricingProcedureStep',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link pricingProcedureCounter} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PRICING_PROCEDURE_COUNTER: fieldBuilder.buildEdmTypeField(
          'PricingProcedureCounter',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link conditionType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_TYPE: fieldBuilder.buildEdmTypeField(
          'ConditionType',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link conditionCalculationType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_CALCULATION_TYPE: fieldBuilder.buildEdmTypeField(
          'ConditionCalculationType',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link conditionRateAmount} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_RATE_AMOUNT: fieldBuilder.buildEdmTypeField(
          'ConditionRateAmount',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link conditionCurrency} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_CURRENCY: fieldBuilder.buildEdmTypeField(
          'ConditionCurrency',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link conditionQuantity} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_QUANTITY: fieldBuilder.buildEdmTypeField(
          'ConditionQuantity',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link conditionBaseQuantity} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_BASE_QUANTITY: fieldBuilder.buildEdmTypeField(
          'ConditionBaseQuantity',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link conditionQuantitySapUnit} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_QUANTITY_SAP_UNIT: fieldBuilder.buildEdmTypeField(
          'ConditionQuantitySAPUnit',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link conditionQuantityIsoUnit} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_QUANTITY_ISO_UNIT: fieldBuilder.buildEdmTypeField(
          'ConditionQuantityISOUnit',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link conditionRateRatio} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_RATE_RATIO: fieldBuilder.buildEdmTypeField(
          'ConditionRateRatio',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link conditionRateRatioSapUnit} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_RATE_RATIO_SAP_UNIT: fieldBuilder.buildEdmTypeField(
          'ConditionRateRatioSAPUnit',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link conditionRateRatioIsoUnit} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_RATE_RATIO_ISO_UNIT: fieldBuilder.buildEdmTypeField(
          'ConditionRateRatioISOUnit',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link conditionAmount} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_AMOUNT: fieldBuilder.buildEdmTypeField(
          'ConditionAmount',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link conditionBaseAmount} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_BASE_AMOUNT: fieldBuilder.buildEdmTypeField(
          'ConditionBaseAmount',
          'Edm.Decimal',
          true
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
        ALL_FIELDS: new AllFields('*', SalesOrderItemPricingElement)
      };
    }

    return this._schema;
  }
}
