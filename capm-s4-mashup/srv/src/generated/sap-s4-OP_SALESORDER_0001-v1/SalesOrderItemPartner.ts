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
import type { SalesOrderItemPartnerApi } from './SalesOrderItemPartnerApi';
import { SalesOrderItem, SalesOrderItemType } from './SalesOrderItem';
import { SalesOrder, SalesOrderType } from './SalesOrder';

/**
 * This class represents the entity "SalesOrderItemPartner" of service "com.sap.gateway.srvd_a2x.api_salesorder.v0001".
 */
export class SalesOrderItemPartner<
  T extends DeSerializers = DefaultDeSerializers
>
  extends Entity
  implements SalesOrderItemPartnerType<T>
{
  /**
   * Technical entity name for SalesOrderItemPartner.
   */
  static override _entityName = 'SalesOrderItemPartner';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/';
  /**
   * All key fields of the SalesOrderItemPartner entity.
   */
  static _keys = ['SalesOrder', 'SalesOrderItem', 'PartnerFunction'];
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
   * Partner Function.
   * Maximum length: 2.
   */
  declare partnerFunction: DeserializedType<T, 'Edm.String'>;
  /**
   * Customer.
   * Maximum length: 10.
   * @nullable
   */
  declare customer?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Supplier.
   * Maximum length: 10.
   * @nullable
   */
  declare supplier?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Personnel.
   * Maximum length: 8.
   * @nullable
   */
  declare personnel?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Contact Person.
   * Maximum length: 10.
   * @nullable
   */
  declare contactPerson?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Reference Business Partner.
   * Maximum length: 10.
   */
  declare referenceBusinessPartner: DeserializedType<T, 'Edm.String'>;
  /**
   * Business Partner Name 1.
   * Maximum length: 40.
   */
  declare businessPartnerName1: DeserializedType<T, 'Edm.String'>;
  /**
   * Business Partner Name 2.
   * Maximum length: 40.
   */
  declare businessPartnerName2: DeserializedType<T, 'Edm.String'>;
  /**
   * Business Partner Name 3.
   * Maximum length: 40.
   */
  declare businessPartnerName3: DeserializedType<T, 'Edm.String'>;
  /**
   * Business Partner Name 4.
   * Maximum length: 40.
   */
  declare businessPartnerName4: DeserializedType<T, 'Edm.String'>;
  /**
   * Street Name.
   * Maximum length: 60.
   */
  declare streetName: DeserializedType<T, 'Edm.String'>;
  /**
   * Street Prefix Name 1.
   * Maximum length: 40.
   */
  declare streetPrefixName1: DeserializedType<T, 'Edm.String'>;
  /**
   * Street Prefix Name 2.
   * Maximum length: 40.
   */
  declare streetPrefixName2: DeserializedType<T, 'Edm.String'>;
  /**
   * Street Suffix Name 1.
   * Maximum length: 40.
   */
  declare streetSuffixName1: DeserializedType<T, 'Edm.String'>;
  /**
   * Street Suffix Name 2.
   * Maximum length: 40.
   */
  declare streetSuffixName2: DeserializedType<T, 'Edm.String'>;
  /**
   * House Number.
   * Maximum length: 10.
   */
  declare houseNumber: DeserializedType<T, 'Edm.String'>;
  /**
   * Postal Code.
   * Maximum length: 10.
   */
  declare postalCode: DeserializedType<T, 'Edm.String'>;
  /**
   * City Name.
   * Maximum length: 40.
   */
  declare cityName: DeserializedType<T, 'Edm.String'>;
  /**
   * District Name.
   * Maximum length: 40.
   */
  declare districtName: DeserializedType<T, 'Edm.String'>;
  /**
   * Region.
   * Maximum length: 3.
   */
  declare region: DeserializedType<T, 'Edm.String'>;
  /**
   * Country.
   * Maximum length: 3.
   */
  declare country: DeserializedType<T, 'Edm.String'>;
  /**
   * International Phone Number.
   * Maximum length: 30.
   */
  declare internationalPhoneNumber: DeserializedType<T, 'Edm.String'>;
  /**
   * International Mobile Phone Number.
   * Maximum length: 30.
   */
  declare internationalMobilePhoneNumber: DeserializedType<T, 'Edm.String'>;
  /**
   * Po Box.
   * Maximum length: 10.
   */
  declare poBox: DeserializedType<T, 'Edm.String'>;
  /**
   * Po Box Postal Code.
   * Maximum length: 10.
   */
  declare poBoxPostalCode: DeserializedType<T, 'Edm.String'>;
  /**
   * Form Of Address.
   * Maximum length: 4.
   */
  declare formOfAddress: DeserializedType<T, 'Edm.String'>;
  /**
   * Correspondence Language.
   * Maximum length: 2.
   */
  declare correspondenceLanguage: DeserializedType<T, 'Edm.String'>;
  /**
   * Email Address.
   * Maximum length: 241.
   */
  declare emailAddress: DeserializedType<T, 'Edm.String'>;
  /**
   * Tax Jurisdiction.
   * Maximum length: 15.
   */
  declare taxJurisdiction: DeserializedType<T, 'Edm.String'>;
  /**
   * Transport Zone.
   * Maximum length: 10.
   */
  declare transportZone: DeserializedType<T, 'Edm.String'>;
  /**
   * Unloading Point Name.
   * Maximum length: 25.
   * @nullable
   */
  declare unloadingPointName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Vat Registration.
   * Maximum length: 20.
   * @nullable
   */
  declare vatRegistration?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Partner Is Specific For Sd Doc Item.
   */
  declare partnerIsSpecificForSdDocItem: DeserializedType<T, 'Edm.Boolean'>;
  /**
   * Sd Doc Partner Addr Is Doc Specific.
   */
  declare sdDocPartnerAddrIsDocSpecific: DeserializedType<T, 'Edm.Boolean'>;
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

  constructor(_entityApi: SalesOrderItemPartnerApi<T>) {
    super(_entityApi);
  }
}

export interface SalesOrderItemPartnerType<
  T extends DeSerializers = DefaultDeSerializers
> {
  salesOrder: DeserializedType<T, 'Edm.String'>;
  salesOrderItem: DeserializedType<T, 'Edm.String'>;
  partnerFunction: DeserializedType<T, 'Edm.String'>;
  customer?: DeserializedType<T, 'Edm.String'> | null;
  supplier?: DeserializedType<T, 'Edm.String'> | null;
  personnel?: DeserializedType<T, 'Edm.String'> | null;
  contactPerson?: DeserializedType<T, 'Edm.String'> | null;
  referenceBusinessPartner: DeserializedType<T, 'Edm.String'>;
  businessPartnerName1: DeserializedType<T, 'Edm.String'>;
  businessPartnerName2: DeserializedType<T, 'Edm.String'>;
  businessPartnerName3: DeserializedType<T, 'Edm.String'>;
  businessPartnerName4: DeserializedType<T, 'Edm.String'>;
  streetName: DeserializedType<T, 'Edm.String'>;
  streetPrefixName1: DeserializedType<T, 'Edm.String'>;
  streetPrefixName2: DeserializedType<T, 'Edm.String'>;
  streetSuffixName1: DeserializedType<T, 'Edm.String'>;
  streetSuffixName2: DeserializedType<T, 'Edm.String'>;
  houseNumber: DeserializedType<T, 'Edm.String'>;
  postalCode: DeserializedType<T, 'Edm.String'>;
  cityName: DeserializedType<T, 'Edm.String'>;
  districtName: DeserializedType<T, 'Edm.String'>;
  region: DeserializedType<T, 'Edm.String'>;
  country: DeserializedType<T, 'Edm.String'>;
  internationalPhoneNumber: DeserializedType<T, 'Edm.String'>;
  internationalMobilePhoneNumber: DeserializedType<T, 'Edm.String'>;
  poBox: DeserializedType<T, 'Edm.String'>;
  poBoxPostalCode: DeserializedType<T, 'Edm.String'>;
  formOfAddress: DeserializedType<T, 'Edm.String'>;
  correspondenceLanguage: DeserializedType<T, 'Edm.String'>;
  emailAddress: DeserializedType<T, 'Edm.String'>;
  taxJurisdiction: DeserializedType<T, 'Edm.String'>;
  transportZone: DeserializedType<T, 'Edm.String'>;
  unloadingPointName?: DeserializedType<T, 'Edm.String'> | null;
  vatRegistration?: DeserializedType<T, 'Edm.String'> | null;
  partnerIsSpecificForSdDocItem: DeserializedType<T, 'Edm.Boolean'>;
  sdDocPartnerAddrIsDocSpecific: DeserializedType<T, 'Edm.Boolean'>;
  sapMessages: Sap_Message<T>[];
  item?: SalesOrderItemType<T> | null;
  salesOrder_1?: SalesOrderType<T> | null;
}
