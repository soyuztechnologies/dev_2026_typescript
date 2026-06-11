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
import { SalesOrderPartner } from './SalesOrderPartner';

/**
 * Request builder class for operations supported on the {@link SalesOrderPartner} entity.
 */
export class SalesOrderPartnerRequestBuilder<
  T extends DeSerializers = DefaultDeSerializers
> extends RequestBuilder<SalesOrderPartner<T>, T> {
  /**
   * Returns a request builder for querying all `SalesOrderPartner` entities.
   * @returns A request builder for creating requests to retrieve all `SalesOrderPartner` entities.
   */
  getAll(): GetAllRequestBuilder<SalesOrderPartner<T>, T> {
    return new GetAllRequestBuilder<SalesOrderPartner<T>, T>(this.entityApi);
  }

  /**
   * Returns a request builder for creating a `SalesOrderPartner` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `SalesOrderPartner`.
   */
  create(
    entity: SalesOrderPartner<T>
  ): CreateRequestBuilder<SalesOrderPartner<T>, T> {
    return new CreateRequestBuilder<SalesOrderPartner<T>, T>(
      this.entityApi,
      entity
    );
  }

  /**
   * Returns a request builder for retrieving one `SalesOrderPartner` entity based on its keys.
   * @param salesOrder Key property. See {@link SalesOrderPartner.salesOrder}.
   * @param partnerFunction Key property. See {@link SalesOrderPartner.partnerFunction}.
   * @returns A request builder for creating requests to retrieve one `SalesOrderPartner` entity based on its keys.
   */
  getByKey(
    salesOrder: DeserializedType<T, 'Edm.String'>,
    partnerFunction: DeserializedType<T, 'Edm.String'>
  ): GetByKeyRequestBuilder<SalesOrderPartner<T>, T> {
    return new GetByKeyRequestBuilder<SalesOrderPartner<T>, T>(this.entityApi, {
      SalesOrder: salesOrder,
      PartnerFunction: partnerFunction
    });
  }

  /**
   * Returns a request builder for updating an entity of type `SalesOrderPartner`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `SalesOrderPartner`.
   */
  update(
    entity: SalesOrderPartner<T>
  ): UpdateRequestBuilder<SalesOrderPartner<T>, T> {
    return new UpdateRequestBuilder<SalesOrderPartner<T>, T>(
      this.entityApi,
      entity
    );
  }

  /**
   * Returns a request builder for deleting an entity of type `SalesOrderPartner`.
   * @param salesOrder Key property. See {@link SalesOrderPartner.salesOrder}.
   * @param partnerFunction Key property. See {@link SalesOrderPartner.partnerFunction}.
   * @returns A request builder for creating requests that delete an entity of type `SalesOrderPartner`.
   */
  delete(
    salesOrder: string,
    partnerFunction: string
  ): DeleteRequestBuilder<SalesOrderPartner<T>, T>;
  /**
   * Returns a request builder for deleting an entity of type `SalesOrderPartner`.
   * @param entity Pass the entity to be deleted.
   * @returns A request builder for creating requests that delete an entity of type `SalesOrderPartner` by taking the entity as a parameter.
   */
  delete(
    entity: SalesOrderPartner<T>
  ): DeleteRequestBuilder<SalesOrderPartner<T>, T>;
  delete(
    salesOrderOrEntity: any,
    partnerFunction?: string
  ): DeleteRequestBuilder<SalesOrderPartner<T>, T> {
    return new DeleteRequestBuilder<SalesOrderPartner<T>, T>(
      this.entityApi,
      salesOrderOrEntity instanceof SalesOrderPartner
        ? salesOrderOrEntity
        : {
            SalesOrder: salesOrderOrEntity!,
            PartnerFunction: partnerFunction!
          }
    );
  }
}
