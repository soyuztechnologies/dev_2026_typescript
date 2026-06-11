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
import type { SalesOrderItemTextApi } from './SalesOrderItemTextApi';
import { SalesOrderItem, SalesOrderItemType } from './SalesOrderItem';
import { SalesOrder, SalesOrderType } from './SalesOrder';

/**
 * This class represents the entity "SalesOrderItemText" of service "com.sap.gateway.srvd_a2x.api_salesorder.v0001".
 */
export class SalesOrderItemText<T extends DeSerializers = DefaultDeSerializers>
  extends Entity
  implements SalesOrderItemTextType<T>
{
  /**
   * Technical entity name for SalesOrderItemText.
   */
  static override _entityName = 'SalesOrderItemText';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/';
  /**
   * All key fields of the SalesOrderItemText entity.
   */
  static _keys = ['SalesOrder', 'SalesOrderItem', 'Language', 'LongTextID'];
  /**
   * Sales Order.
   * Maximum length: 10.
   */
  declare salesOrder: DeserializedType<T, 'Edm.String'>;
  /**
   * Sales Order Item.
   * Maximum length: 6.
   */
  declare salesOrderItem: DeserializedType<T, 'Edm.String'>;
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
   * One-to-one navigation property to the {@link SalesOrderItem} entity.
   */
  declare item?: SalesOrderItem<T> | null;
  /**
   * One-to-one navigation property to the {@link SalesOrder} entity.
   */
  declare salesOrder_1?: SalesOrder<T> | null;

  constructor(_entityApi: SalesOrderItemTextApi<T>) {
    super(_entityApi);
  }
}

export interface SalesOrderItemTextType<
  T extends DeSerializers = DefaultDeSerializers
> {
  salesOrder: DeserializedType<T, 'Edm.String'>;
  salesOrderItem: DeserializedType<T, 'Edm.String'>;
  language: DeserializedType<T, 'Edm.String'>;
  longTextId: DeserializedType<T, 'Edm.String'>;
  longText: DeserializedType<T, 'Edm.String'>;
  sapMessages: Sap_Message<T>[];
  item?: SalesOrderItemType<T> | null;
  salesOrder_1?: SalesOrderType<T> | null;
}
