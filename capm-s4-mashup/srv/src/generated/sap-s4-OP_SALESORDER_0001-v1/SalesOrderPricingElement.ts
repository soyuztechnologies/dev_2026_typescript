/*
 * Copyright (c) 2026 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import {
  Entity,
  DefaultDeSerializers,
  DeSerializers,
  DeserializedType
} from '@sap-cloud-sdk/odata-v4';
import { Sap_Message } from './Sap_Message';
import type { SalesOrderPricingElementApi } from './SalesOrderPricingElementApi';
import { SalesOrder, SalesOrderType } from './SalesOrder';

/**
 * This class represents the entity "SalesOrderPricingElement" of service "com.sap.gateway.srvd_a2x.api_salesorder.v0001".
 */
export class SalesOrderPricingElement<
  T extends DeSerializers = DefaultDeSerializers
>
  extends Entity
  implements SalesOrderPricingElementType<T>
{
  /**
   * Technical entity name for SalesOrderPricingElement.
   */
  static override _entityName = 'SalesOrderPricingElement';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/';
  /**
   * All key fields of the SalesOrderPricingElement entity.
   */
  static _keys = [
    'SalesOrder',
    'PricingProcedureStep',
    'PricingProcedureCounter'
  ];
  /**
   * Sales Order.
   * Maximum length: 10.
   */
  declare salesOrder: DeserializedType<T, 'Edm.String'>;
  /**
   * Pricing Procedure Step.
   * Maximum length: 3.
   */
  declare pricingProcedureStep: DeserializedType<T, 'Edm.String'>;
  /**
   * Pricing Procedure Counter.
   * Maximum length: 3.
   */
  declare pricingProcedureCounter: DeserializedType<T, 'Edm.String'>;
  /**
   * Condition Type.
   * Maximum length: 4.
   */
  declare conditionType: DeserializedType<T, 'Edm.String'>;
  /**
   * Condition Calculation Type.
   * Maximum length: 3.
   */
  declare conditionCalculationType: DeserializedType<T, 'Edm.String'>;
  /**
   * Condition Rate Amount.
   * @nullable
   */
  declare conditionRateAmount?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Condition Currency.
   * Maximum length: 3.
   */
  declare conditionCurrency: DeserializedType<T, 'Edm.String'>;
  /**
   * Condition Quantity.
   * @nullable
   */
  declare conditionQuantity?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Condition Base Quantity.
   * @nullable
   */
  declare conditionBaseQuantity?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Condition Quantity Sap Unit.
   * Maximum length: 3.
   */
  declare conditionQuantitySapUnit: DeserializedType<T, 'Edm.String'>;
  /**
   * Condition Quantity Iso Unit.
   * Maximum length: 3.
   */
  declare conditionQuantityIsoUnit: DeserializedType<T, 'Edm.String'>;
  /**
   * Condition Rate Ratio.
   * @nullable
   */
  declare conditionRateRatio?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Condition Rate Ratio Sap Unit.
   * Maximum length: 3.
   */
  declare conditionRateRatioSapUnit: DeserializedType<T, 'Edm.String'>;
  /**
   * Condition Rate Ratio Iso Unit.
   * Maximum length: 3.
   */
  declare conditionRateRatioIsoUnit: DeserializedType<T, 'Edm.String'>;
  /**
   * Condition Amount.
   * @nullable
   */
  declare conditionAmount?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Condition Base Amount.
   * @nullable
   */
  declare conditionBaseAmount?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Transaction Currency.
   * Maximum length: 3.
   */
  declare transactionCurrency: DeserializedType<T, 'Edm.String'>;
  /**
   * Sap Messages.
   */
  declare sapMessages: Sap_Message<T>[];
  /**
   * One-to-one navigation property to the {@link SalesOrder} entity.
   */
  declare salesOrder_1?: SalesOrder<T> | null;

  constructor(_entityApi: SalesOrderPricingElementApi<T>) {
    super(_entityApi);
  }
}

export interface SalesOrderPricingElementType<
  T extends DeSerializers = DefaultDeSerializers
> {
  salesOrder: DeserializedType<T, 'Edm.String'>;
  pricingProcedureStep: DeserializedType<T, 'Edm.String'>;
  pricingProcedureCounter: DeserializedType<T, 'Edm.String'>;
  conditionType: DeserializedType<T, 'Edm.String'>;
  conditionCalculationType: DeserializedType<T, 'Edm.String'>;
  conditionRateAmount?: DeserializedType<T, 'Edm.Decimal'> | null;
  conditionCurrency: DeserializedType<T, 'Edm.String'>;
  conditionQuantity?: DeserializedType<T, 'Edm.Decimal'> | null;
  conditionBaseQuantity?: DeserializedType<T, 'Edm.Decimal'> | null;
  conditionQuantitySapUnit: DeserializedType<T, 'Edm.String'>;
  conditionQuantityIsoUnit: DeserializedType<T, 'Edm.String'>;
  conditionRateRatio?: DeserializedType<T, 'Edm.Decimal'> | null;
  conditionRateRatioSapUnit: DeserializedType<T, 'Edm.String'>;
  conditionRateRatioIsoUnit: DeserializedType<T, 'Edm.String'>;
  conditionAmount?: DeserializedType<T, 'Edm.Decimal'> | null;
  conditionBaseAmount?: DeserializedType<T, 'Edm.Decimal'> | null;
  transactionCurrency: DeserializedType<T, 'Edm.String'>;
  sapMessages: Sap_Message<T>[];
  salesOrder_1?: SalesOrderType<T> | null;
}
