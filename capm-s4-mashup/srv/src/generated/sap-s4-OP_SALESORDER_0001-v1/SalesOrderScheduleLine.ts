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
import type { SalesOrderScheduleLineApi } from './SalesOrderScheduleLineApi';
import { SalesOrderItem, SalesOrderItemType } from './SalesOrderItem';
import { SalesOrder, SalesOrderType } from './SalesOrder';

/**
 * This class represents the entity "SalesOrderScheduleLine" of service "com.sap.gateway.srvd_a2x.api_salesorder.v0001".
 */
export class SalesOrderScheduleLine<
  T extends DeSerializers = DefaultDeSerializers
>
  extends Entity
  implements SalesOrderScheduleLineType<T>
{
  /**
   * Technical entity name for SalesOrderScheduleLine.
   */
  static override _entityName = 'SalesOrderScheduleLine';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/';
  /**
   * All key fields of the SalesOrderScheduleLine entity.
   */
  static _keys = ['SalesOrder', 'SalesOrderItem', 'ScheduleLine'];
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
   * Schedule Line.
   * Maximum length: 4.
   */
  declare scheduleLine: DeserializedType<T, 'Edm.String'>;
  /**
   * Schedule Line Category.
   * Maximum length: 2.
   */
  declare scheduleLineCategory: DeserializedType<T, 'Edm.String'>;
  /**
   * Schedule Line Order Quantity.
   * @nullable
   */
  declare scheduleLineOrderQuantity?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Order Quantity Sap Unit.
   * Maximum length: 3.
   */
  declare orderQuantitySapUnit: DeserializedType<T, 'Edm.String'>;
  /**
   * Order Quantity Iso Unit.
   * Maximum length: 3.
   */
  declare orderQuantityIsoUnit: DeserializedType<T, 'Edm.String'>;
  /**
   * Requested Delivery Date.
   * @nullable
   */
  declare requestedDeliveryDate?: DeserializedType<T, 'Edm.Date'> | null;
  /**
   * Confirmed Delivery Date.
   * @nullable
   */
  declare confirmedDeliveryDate?: DeserializedType<T, 'Edm.Date'> | null;
  /**
   * Confd Order Qty By Matl Avail Check.
   * @nullable
   */
  declare confdOrderQtyByMatlAvailCheck?: DeserializedType<
    T,
    'Edm.Decimal'
  > | null;
  /**
   * Delivered Qty In Order Qty Unit.
   */
  declare deliveredQtyInOrderQtyUnit: DeserializedType<T, 'Edm.Decimal'>;
  /**
   * Open Confd Deliv Qty In Ord Qty Unit.
   */
  declare openConfdDelivQtyInOrdQtyUnit: DeserializedType<T, 'Edm.Decimal'>;
  /**
   * Corrected Qty In Order Qty Unit.
   */
  declare correctedQtyInOrderQtyUnit: DeserializedType<T, 'Edm.Decimal'>;
  /**
   * Deliv Block Reason For Sched Line.
   * Maximum length: 2.
   */
  declare delivBlockReasonForSchedLine: DeserializedType<T, 'Edm.String'>;
  /**
   * Purchase Requisition.
   * Maximum length: 10.
   */
  declare purchaseRequisition: DeserializedType<T, 'Edm.String'>;
  /**
   * Purchase Requisition Item.
   * Maximum length: 5.
   * @nullable
   */
  declare purchaseRequisitionItem?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Goods Movement Type.
   * Maximum length: 3.
   */
  declare goodsMovementType: DeserializedType<T, 'Edm.String'>;
  /**
   * One-to-one navigation property to the {@link SalesOrderItem} entity.
   */
  declare item?: SalesOrderItem<T> | null;
  /**
   * One-to-one navigation property to the {@link SalesOrder} entity.
   */
  declare salesOrder_1?: SalesOrder<T> | null;

  constructor(_entityApi: SalesOrderScheduleLineApi<T>) {
    super(_entityApi);
  }
}

export interface SalesOrderScheduleLineType<
  T extends DeSerializers = DefaultDeSerializers
> {
  salesOrder: DeserializedType<T, 'Edm.String'>;
  salesOrderItem: DeserializedType<T, 'Edm.String'>;
  scheduleLine: DeserializedType<T, 'Edm.String'>;
  scheduleLineCategory: DeserializedType<T, 'Edm.String'>;
  scheduleLineOrderQuantity?: DeserializedType<T, 'Edm.Decimal'> | null;
  orderQuantitySapUnit: DeserializedType<T, 'Edm.String'>;
  orderQuantityIsoUnit: DeserializedType<T, 'Edm.String'>;
  requestedDeliveryDate?: DeserializedType<T, 'Edm.Date'> | null;
  confirmedDeliveryDate?: DeserializedType<T, 'Edm.Date'> | null;
  confdOrderQtyByMatlAvailCheck?: DeserializedType<T, 'Edm.Decimal'> | null;
  deliveredQtyInOrderQtyUnit: DeserializedType<T, 'Edm.Decimal'>;
  openConfdDelivQtyInOrdQtyUnit: DeserializedType<T, 'Edm.Decimal'>;
  correctedQtyInOrderQtyUnit: DeserializedType<T, 'Edm.Decimal'>;
  delivBlockReasonForSchedLine: DeserializedType<T, 'Edm.String'>;
  purchaseRequisition: DeserializedType<T, 'Edm.String'>;
  purchaseRequisitionItem?: DeserializedType<T, 'Edm.String'> | null;
  goodsMovementType: DeserializedType<T, 'Edm.String'>;
  item?: SalesOrderItemType<T> | null;
  salesOrder_1?: SalesOrderType<T> | null;
}
