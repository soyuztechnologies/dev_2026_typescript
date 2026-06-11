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
import type { SalesOrderTextApi } from './SalesOrderTextApi';
import { SalesOrder, SalesOrderType } from './SalesOrder';

/**
 * This class represents the entity "SalesOrderText" of service "com.sap.gateway.srvd_a2x.api_salesorder.v0001".
 */
export class SalesOrderText<T extends DeSerializers = DefaultDeSerializers>
  extends Entity
  implements SalesOrderTextType<T>
{
  /**
   * Technical entity name for SalesOrderText.
   */
  static override _entityName = 'SalesOrderText';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/';
  /**
   * All key fields of the SalesOrderText entity.
   */
  static _keys = ['SalesOrder', 'Language', 'LongTextID'];
  /**
   * Sales Order.
   * Maximum length: 10.
   */
  declare salesOrder: DeserializedType<T, 'Edm.String'>;
  /**
   * Language.
   * Maximum length: 2.
   */
  declare language: DeserializedType<T, 'Edm.String'>;
  /**
   * Long Text Id.
   * Maximum length: 4.
   */
  declare longTextId: DeserializedType<T, 'Edm.String'>;
  /**
   * Long Text.
   */
  declare longText: DeserializedType<T, 'Edm.String'>;
  /**
   * Sap Messages.
   */
  declare sapMessages: Sap_Message<T>[];
  /**
   * One-to-one navigation property to the {@link SalesOrder} entity.
   */
  declare salesOrder_1?: SalesOrder<T> | null;

  constructor(_entityApi: SalesOrderTextApi<T>) {
    super(_entityApi);
  }
}

export interface SalesOrderTextType<
  T extends DeSerializers = DefaultDeSerializers
> {
  salesOrder: DeserializedType<T, 'Edm.String'>;
  language: DeserializedType<T, 'Edm.String'>;
  longTextId: DeserializedType<T, 'Edm.String'>;
  longText: DeserializedType<T, 'Edm.String'>;
  sapMessages: Sap_Message<T>[];
  salesOrder_1?: SalesOrderType<T> | null;
}
