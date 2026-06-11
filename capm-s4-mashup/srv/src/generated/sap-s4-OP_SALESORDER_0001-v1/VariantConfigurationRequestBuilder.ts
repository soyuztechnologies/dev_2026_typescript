/*
 * Copyright (c) 2026 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import {
  CreateRequestBuilder,
  DeSerializers,
  DefaultDeSerializers,
  DeleteRequestBuilder,
  DeserializedType,
  GetAllRequestBuilder,
  GetByKeyRequestBuilder,
  RequestBuilder,
  UpdateRequestBuilder
} from '@sap-cloud-sdk/odata-v4';
import { VariantConfiguration } from './VariantConfiguration';

/**
 * Request builder class for operations supported on the {@link VariantConfiguration} entity.
 */
export class VariantConfigurationRequestBuilder<
  T extends DeSerializers = DefaultDeSerializers
> extends RequestBuilder<VariantConfiguration<T>, T> {
  /**
   * Returns a request builder for querying all `VariantConfiguration` entities.
   * @returns A request builder for creating requests to retrieve all `VariantConfiguration` entities.
   */
  getAll(): GetAllRequestBuilder<VariantConfiguration<T>, T> {
    return new GetAllRequestBuilder<VariantConfiguration<T>, T>(this.entityApi);
  }

  /**
   * Returns a request builder for creating a `VariantConfiguration` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `VariantConfiguration`.
   */
  create(
    entity: VariantConfiguration<T>
  ): CreateRequestBuilder<VariantConfiguration<T>, T> {
    return new CreateRequestBuilder<VariantConfiguration<T>, T>(
      this.entityApi,
      entity
    );
  }

  /**
   * Returns a request builder for retrieving one `VariantConfiguration` entity based on its keys.
   * @param varConfigurationBusObjectKey Key property. See {@link VariantConfiguration.varConfigurationBusObjectKey}.
   * @param varConfigurationBusObjectType Key property. See {@link VariantConfiguration.varConfigurationBusObjectType}.
   * @returns A request builder for creating requests to retrieve one `VariantConfiguration` entity based on its keys.
   */
  getByKey(
    varConfigurationBusObjectKey: DeserializedType<T, 'Edm.String'>,
    varConfigurationBusObjectType: DeserializedType<T, 'Edm.String'>
  ): GetByKeyRequestBuilder<VariantConfiguration<T>, T> {
    return new GetByKeyRequestBuilder<VariantConfiguration<T>, T>(
      this.entityApi,
      {
        VarConfigurationBusObjectKey: varConfigurationBusObjectKey,
        VarConfigurationBusObjectType: varConfigurationBusObjectType
      }
    );
  }

  /**
   * Returns a request builder for updating an entity of type `VariantConfiguration`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `VariantConfiguration`.
   */
  update(
    entity: VariantConfiguration<T>
  ): UpdateRequestBuilder<VariantConfiguration<T>, T> {
    return new UpdateRequestBuilder<VariantConfiguration<T>, T>(
      this.entityApi,
      entity
    );
  }

  /**
   * Returns a request builder for deleting an entity of type `VariantConfiguration`.
   * @param varConfigurationBusObjectKey Key property. See {@link VariantConfiguration.varConfigurationBusObjectKey}.
   * @param varConfigurationBusObjectType Key property. See {@link VariantConfiguration.varConfigurationBusObjectType}.
   * @returns A request builder for creating requests that delete an entity of type `VariantConfiguration`.
   */
  delete(
    varConfigurationBusObjectKey: string,
    varConfigurationBusObjectType: string
  ): DeleteRequestBuilder<VariantConfiguration<T>, T>;
  /**
   * Returns a request builder for deleting an entity of type `VariantConfiguration`.
   * @param entity Pass the entity to be deleted.
   * @returns A request builder for creating requests that delete an entity of type `VariantConfiguration` by taking the entity as a parameter.
   */
  delete(
    entity: VariantConfiguration<T>
  ): DeleteRequestBuilder<VariantConfiguration<T>, T>;
  delete(
    varConfigurationBusObjectKeyOrEntity: any,
    varConfigurationBusObjectType?: string
  ): DeleteRequestBuilder<VariantConfiguration<T>, T> {
    return new DeleteRequestBuilder<VariantConfiguration<T>, T>(
      this.entityApi,
      varConfigurationBusObjectKeyOrEntity instanceof VariantConfiguration
        ? varConfigurationBusObjectKeyOrEntity
        : {
            VarConfigurationBusObjectKey: varConfigurationBusObjectKeyOrEntity!,
            VarConfigurationBusObjectType: varConfigurationBusObjectType!
          }
    );
  }
}
