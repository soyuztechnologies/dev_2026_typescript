/*
 * Copyright (c) 2026 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { SalesOrderScheduleLine } from './SalesOrderScheduleLine';
import { SalesOrderScheduleLineRequestBuilder } from './SalesOrderScheduleLineRequestBuilder';
import { SalesOrderItemApi } from './SalesOrderItemApi';
import { SalesOrderApi } from './SalesOrderApi';
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
  OneToOneLink
} from '@sap-cloud-sdk/odata-v4';
export class SalesOrderScheduleLineApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers
> implements EntityApi<SalesOrderScheduleLine<DeSerializersT>, DeSerializersT> {
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
  ): SalesOrderScheduleLineApi<DeSerializersT> {
    return new SalesOrderScheduleLineApi(deSerializers);
  }

  private navigationPropertyFields!: {
    /**
     * Static representation of the one-to-one navigation property {@link item} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    ITEM: OneToOneLink<
      SalesOrderScheduleLine<DeSerializersT>,
      DeSerializersT,
      SalesOrderItemApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-one navigation property {@link salesOrder_1} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    SALES_ORDER_1: OneToOneLink<
      SalesOrderScheduleLine<DeSerializersT>,
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

  entityConstructor = SalesOrderScheduleLine;

  requestBuilder(): SalesOrderScheduleLineRequestBuilder<DeSerializersT> {
    return new SalesOrderScheduleLineRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    SalesOrderScheduleLine<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<
      SalesOrderScheduleLine<DeSerializersT>,
      DeSerializersT
    >(this);
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT
  ): CustomField<
    SalesOrderScheduleLine<DeSerializersT>,
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
    typeof SalesOrderScheduleLine,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        SalesOrderScheduleLine,
        this.deSerializers
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    SALES_ORDER: OrderableEdmTypeField<
      SalesOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SALES_ORDER_ITEM: OrderableEdmTypeField<
      SalesOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SCHEDULE_LINE: OrderableEdmTypeField<
      SalesOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SCHEDULE_LINE_CATEGORY: OrderableEdmTypeField<
      SalesOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SCHEDULE_LINE_ORDER_QUANTITY: OrderableEdmTypeField<
      SalesOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    ORDER_QUANTITY_SAP_UNIT: OrderableEdmTypeField<
      SalesOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    ORDER_QUANTITY_ISO_UNIT: OrderableEdmTypeField<
      SalesOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    REQUESTED_DELIVERY_DATE: OrderableEdmTypeField<
      SalesOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.Date',
      true,
      true
    >;
    CONFIRMED_DELIVERY_DATE: OrderableEdmTypeField<
      SalesOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.Date',
      true,
      true
    >;
    CONFD_ORDER_QTY_BY_MATL_AVAIL_CHECK: OrderableEdmTypeField<
      SalesOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    DELIVERED_QTY_IN_ORDER_QTY_UNIT: OrderableEdmTypeField<
      SalesOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      false,
      true
    >;
    OPEN_CONFD_DELIV_QTY_IN_ORD_QTY_UNIT: OrderableEdmTypeField<
      SalesOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      false,
      true
    >;
    CORRECTED_QTY_IN_ORDER_QTY_UNIT: OrderableEdmTypeField<
      SalesOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      false,
      true
    >;
    DELIV_BLOCK_REASON_FOR_SCHED_LINE: OrderableEdmTypeField<
      SalesOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PURCHASE_REQUISITION: OrderableEdmTypeField<
      SalesOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PURCHASE_REQUISITION_ITEM: OrderableEdmTypeField<
      SalesOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    GOODS_MOVEMENT_TYPE: OrderableEdmTypeField<
      SalesOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    /**
     * Static representation of the one-to-one navigation property {@link item} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    ITEM: OneToOneLink<
      SalesOrderScheduleLine<DeSerializersT>,
      DeSerializersT,
      SalesOrderItemApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-one navigation property {@link salesOrder_1} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    SALES_ORDER_1: OneToOneLink<
      SalesOrderScheduleLine<DeSerializersT>,
      DeSerializersT,
      SalesOrderApi<DeSerializersT>
    >;
    ALL_FIELDS: AllFields<SalesOrderScheduleLine<DeSerializers>>;
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
         * Static representation of the {@link scheduleLine} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SCHEDULE_LINE: fieldBuilder.buildEdmTypeField(
          'ScheduleLine',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link scheduleLineCategory} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SCHEDULE_LINE_CATEGORY: fieldBuilder.buildEdmTypeField(
          'ScheduleLineCategory',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link scheduleLineOrderQuantity} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SCHEDULE_LINE_ORDER_QUANTITY: fieldBuilder.buildEdmTypeField(
          'ScheduleLineOrderQuantity',
          'Edm.Decimal',
          true
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
         * Static representation of the {@link confdOrderQtyByMatlAvailCheck} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONFD_ORDER_QTY_BY_MATL_AVAIL_CHECK: fieldBuilder.buildEdmTypeField(
          'ConfdOrderQtyByMatlAvailCheck',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link deliveredQtyInOrderQtyUnit} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DELIVERED_QTY_IN_ORDER_QTY_UNIT: fieldBuilder.buildEdmTypeField(
          'DeliveredQtyInOrderQtyUnit',
          'Edm.Decimal',
          false
        ),
        /**
         * Static representation of the {@link openConfdDelivQtyInOrdQtyUnit} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        OPEN_CONFD_DELIV_QTY_IN_ORD_QTY_UNIT: fieldBuilder.buildEdmTypeField(
          'OpenConfdDelivQtyInOrdQtyUnit',
          'Edm.Decimal',
          false
        ),
        /**
         * Static representation of the {@link correctedQtyInOrderQtyUnit} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CORRECTED_QTY_IN_ORDER_QTY_UNIT: fieldBuilder.buildEdmTypeField(
          'CorrectedQtyInOrderQtyUnit',
          'Edm.Decimal',
          false
        ),
        /**
         * Static representation of the {@link delivBlockReasonForSchedLine} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DELIV_BLOCK_REASON_FOR_SCHED_LINE: fieldBuilder.buildEdmTypeField(
          'DelivBlockReasonForSchedLine',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link purchaseRequisition} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASE_REQUISITION: fieldBuilder.buildEdmTypeField(
          'PurchaseRequisition',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link purchaseRequisitionItem} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASE_REQUISITION_ITEM: fieldBuilder.buildEdmTypeField(
          'PurchaseRequisitionItem',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link goodsMovementType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        GOODS_MOVEMENT_TYPE: fieldBuilder.buildEdmTypeField(
          'GoodsMovementType',
          'Edm.String',
          false
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', SalesOrderScheduleLine)
      };
    }

    return this._schema;
  }
}
