/*
 * Copyright (c) 2026 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { SalesOrderApi } from './SalesOrderApi';
import { SalesOrderItemApi } from './SalesOrderItemApi';
import { SalesOrderItemPartnerApi } from './SalesOrderItemPartnerApi';
import { SalesOrderItemPricingElementApi } from './SalesOrderItemPricingElementApi';
import { SalesOrderItemTextApi } from './SalesOrderItemTextApi';
import { SalesOrderPartnerApi } from './SalesOrderPartnerApi';
import { SalesOrderPricingElementApi } from './SalesOrderPricingElementApi';
import { SalesOrderScheduleLineApi } from './SalesOrderScheduleLineApi';
import { SalesOrderTextApi } from './SalesOrderTextApi';
import { VariantConfigurationApi } from './VariantConfigurationApi';
import BigNumber from 'bignumber.js';
import { Moment, Duration } from 'moment';
import {
  defaultDeSerializers,
  DeSerializers,
  DefaultDeSerializers,
  mergeDefaultDeSerializersWith,
  Time
} from '@sap-cloud-sdk/odata-v4';
import { batch, changeset } from './BatchRequest';

export function sapS4OpSalesorder0001V1<
  BinaryT = string,
  BooleanT = boolean,
  ByteT = number,
  DecimalT = BigNumber,
  DoubleT = number,
  FloatT = number,
  Int16T = number,
  Int32T = number,
  Int64T = BigNumber,
  GuidT = string,
  SByteT = number,
  SingleT = number,
  StringT = string,
  AnyT = any,
  DateTimeOffsetT = Moment,
  DateT = Moment,
  DurationT = Duration,
  TimeOfDayT = Time,
  EnumT = any
>(
  deSerializers: Partial<
    DeSerializers<
      BinaryT,
      BooleanT,
      ByteT,
      DecimalT,
      DoubleT,
      FloatT,
      Int16T,
      Int32T,
      Int64T,
      GuidT,
      SByteT,
      SingleT,
      StringT,
      AnyT,
      DateTimeOffsetT,
      DateT,
      DurationT,
      TimeOfDayT,
      EnumT
    >
  > = defaultDeSerializers as any
): SapS4OpSalesorder0001V1<
  DeSerializers<
    BinaryT,
    BooleanT,
    ByteT,
    DecimalT,
    DoubleT,
    FloatT,
    Int16T,
    Int32T,
    Int64T,
    GuidT,
    SByteT,
    SingleT,
    StringT,
    AnyT,
    DateTimeOffsetT,
    DateT,
    DurationT,
    TimeOfDayT,
    EnumT
  >
> {
  return new SapS4OpSalesorder0001V1(
    mergeDefaultDeSerializersWith(deSerializers)
  );
}
class SapS4OpSalesorder0001V1<
  DeSerializersT extends DeSerializers = DefaultDeSerializers
> {
  private apis: Record<string, any> = {};
  private deSerializers: DeSerializersT;

  constructor(deSerializers: DeSerializersT) {
    this.deSerializers = deSerializers;
  }

  private initApi(key: string, entityApi: any): any {
    if (!this.apis[key]) {
      this.apis[key] = entityApi._privateFactory(this.deSerializers);
    }
    return this.apis[key];
  }

  get salesOrderApi(): SalesOrderApi<DeSerializersT> {
    const api = this.initApi('salesOrderApi', SalesOrderApi);
    const linkedApis = [
      this.initApi('salesOrderItemApi', SalesOrderItemApi),
      this.initApi('salesOrderPartnerApi', SalesOrderPartnerApi),
      this.initApi('salesOrderPricingElementApi', SalesOrderPricingElementApi),
      this.initApi('salesOrderTextApi', SalesOrderTextApi)
    ];
    api._addNavigationProperties(linkedApis);
    return api;
  }

  get salesOrderItemApi(): SalesOrderItemApi<DeSerializersT> {
    const api = this.initApi('salesOrderItemApi', SalesOrderItemApi);
    const linkedApis = [
      this.initApi('salesOrderItemPartnerApi', SalesOrderItemPartnerApi),
      this.initApi(
        'salesOrderItemPricingElementApi',
        SalesOrderItemPricingElementApi
      ),
      this.initApi('salesOrderItemTextApi', SalesOrderItemTextApi),
      this.initApi('salesOrderApi', SalesOrderApi),
      this.initApi('salesOrderScheduleLineApi', SalesOrderScheduleLineApi),
      this.initApi('variantConfigurationApi', VariantConfigurationApi)
    ];
    api._addNavigationProperties(linkedApis);
    return api;
  }

  get salesOrderItemPartnerApi(): SalesOrderItemPartnerApi<DeSerializersT> {
    const api = this.initApi(
      'salesOrderItemPartnerApi',
      SalesOrderItemPartnerApi
    );
    const linkedApis = [
      this.initApi('salesOrderItemApi', SalesOrderItemApi),
      this.initApi('salesOrderApi', SalesOrderApi)
    ];
    api._addNavigationProperties(linkedApis);
    return api;
  }

  get salesOrderItemPricingElementApi(): SalesOrderItemPricingElementApi<DeSerializersT> {
    const api = this.initApi(
      'salesOrderItemPricingElementApi',
      SalesOrderItemPricingElementApi
    );
    const linkedApis = [
      this.initApi('salesOrderItemApi', SalesOrderItemApi),
      this.initApi('salesOrderApi', SalesOrderApi)
    ];
    api._addNavigationProperties(linkedApis);
    return api;
  }

  get salesOrderItemTextApi(): SalesOrderItemTextApi<DeSerializersT> {
    const api = this.initApi('salesOrderItemTextApi', SalesOrderItemTextApi);
    const linkedApis = [
      this.initApi('salesOrderItemApi', SalesOrderItemApi),
      this.initApi('salesOrderApi', SalesOrderApi)
    ];
    api._addNavigationProperties(linkedApis);
    return api;
  }

  get salesOrderPartnerApi(): SalesOrderPartnerApi<DeSerializersT> {
    const api = this.initApi('salesOrderPartnerApi', SalesOrderPartnerApi);
    const linkedApis = [this.initApi('salesOrderApi', SalesOrderApi)];
    api._addNavigationProperties(linkedApis);
    return api;
  }

  get salesOrderPricingElementApi(): SalesOrderPricingElementApi<DeSerializersT> {
    const api = this.initApi(
      'salesOrderPricingElementApi',
      SalesOrderPricingElementApi
    );
    const linkedApis = [this.initApi('salesOrderApi', SalesOrderApi)];
    api._addNavigationProperties(linkedApis);
    return api;
  }

  get salesOrderScheduleLineApi(): SalesOrderScheduleLineApi<DeSerializersT> {
    const api = this.initApi(
      'salesOrderScheduleLineApi',
      SalesOrderScheduleLineApi
    );
    const linkedApis = [
      this.initApi('salesOrderItemApi', SalesOrderItemApi),
      this.initApi('salesOrderApi', SalesOrderApi)
    ];
    api._addNavigationProperties(linkedApis);
    return api;
  }

  get salesOrderTextApi(): SalesOrderTextApi<DeSerializersT> {
    const api = this.initApi('salesOrderTextApi', SalesOrderTextApi);
    const linkedApis = [this.initApi('salesOrderApi', SalesOrderApi)];
    api._addNavigationProperties(linkedApis);
    return api;
  }

  get variantConfigurationApi(): VariantConfigurationApi<DeSerializersT> {
    return this.initApi('variantConfigurationApi', VariantConfigurationApi);
  }

  get batch(): typeof batch {
    return batch;
  }

  get changeset(): typeof changeset {
    return changeset;
  }
}
