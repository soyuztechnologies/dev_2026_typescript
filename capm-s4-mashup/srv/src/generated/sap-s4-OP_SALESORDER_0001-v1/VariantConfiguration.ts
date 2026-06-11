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
import type { VariantConfigurationApi } from './VariantConfigurationApi';

/**
 * This class represents the entity "VariantConfiguration" of service "com.sap.gateway.srvd_a2x.api_salesorder.v0001".
 */
export class VariantConfiguration<
  T extends DeSerializers = DefaultDeSerializers
>
  extends Entity
  implements VariantConfigurationType<T>
{
  /**
   * Technical entity name for VariantConfiguration.
   */
  static override _entityName = 'VariantConfiguration';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/';
  /**
   * All key fields of the VariantConfiguration entity.
   */
  static _keys = [
    'VarConfigurationBusObjectKey',
    'VarConfigurationBusObjectType'
  ];
  /**
   * Var Configuration Bus Object Key.
   * Maximum length: 50.
   */
  declare varConfigurationBusObjectKey: DeserializedType<T, 'Edm.String'>;
  /**
   * Var Configuration Bus Object Type.
   * Maximum length: 30.
   */
  declare varConfigurationBusObjectType: DeserializedType<T, 'Edm.String'>;
  /**
   * Var Confign Status.
   * Maximum length: 1.
   */
  declare varConfignStatus: DeserializedType<T, 'Edm.String'>;

  constructor(_entityApi: VariantConfigurationApi<T>) {
    super(_entityApi);
  }
}

export interface VariantConfigurationType<
  T extends DeSerializers = DefaultDeSerializers
> {
  varConfigurationBusObjectKey: DeserializedType<T, 'Edm.String'>;
  varConfigurationBusObjectType: DeserializedType<T, 'Edm.String'>;
  varConfignStatus: DeserializedType<T, 'Edm.String'>;
}
