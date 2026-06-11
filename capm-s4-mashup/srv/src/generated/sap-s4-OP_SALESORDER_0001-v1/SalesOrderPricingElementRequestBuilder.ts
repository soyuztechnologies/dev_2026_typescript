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
import { SalesOrderPricingElement } from './SalesOrderPricingElement';

/**
 * Request builder class for operations supported on the {@link SalesOrderPricingElement} entity.
 */
export class SalesOrderPricingElementRequestBuilder<
  T extends DeSerializers = DefaultDeSerializers
> extends RequestBuilder<SalesOrderPricingElement<T>, T> {
  /**
   * Returns a request builder for querying all `SalesOrderPricingElement` entities.
   * @returns A request builder for creating requests to retrieve all `SalesOrderPricingElement` entities.
   */
  getAll(): GetAllRequestBuilder<SalesOrderPricingElement<T>, T> {
    return new GetAllRequestBuilder<SalesOrderPricingElement<T>, T>(
      this.entityApi
    );
  }

  /**
   * Returns a request builder for creating a `SalesOrderPricingElement` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `SalesOrderPricingElement`.
   */
  create(
    entity: SalesOrderPricingElement<T>
  ): CreateRequestBuilder<SalesOrderPricingElement<T>, T> {
    return new CreateRequestBuilder<SalesOrderPricingElement<T>, T>(
      this.entityApi,
      entity
    );
  }

  /**
   * Returns a request builder for retrieving one `SalesOrderPricingElement` entity based on its keys.
   * @param salesOrder Key property. See {@link SalesOrderPricingElement.salesOrder}.
   * @param pricingProcedureStep Key property. See {@link SalesOrderPricingElement.pricingProcedureStep}.
   * @param pricingProcedureCounter Key property. See {@link SalesOrderPricingElement.pricingProcedureCounter}.
   * @returns A request builder for creating requests to retrieve one `SalesOrderPricingElement` entity based on its keys.
   */
  getByKey(
    salesOrder: DeserializedType<T, 'Edm.String'>,
    pricingProcedureStep: DeserializedType<T, 'Edm.String'>,
    pricingProcedureCounter: DeserializedType<T, 'Edm.String'>
  ): GetByKeyRequestBuilder<SalesOrderPricingElement<T>, T> {
    return new GetByKeyRequestBuilder<SalesOrderPricingElement<T>, T>(
      this.entityApi,
      {
        SalesOrder: salesOrder,
        PricingProcedureStep: pricingProcedureStep,
        PricingProcedureCounter: pricingProcedureCounter
      }
    );
  }

  /**
   * Returns a request builder for updating an entity of type `SalesOrderPricingElement`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `SalesOrderPricingElement`.
   */
  update(
    entity: SalesOrderPricingElement<T>
  ): UpdateRequestBuilder<SalesOrderPricingElement<T>, T> {
    return new UpdateRequestBuilder<SalesOrderPricingElement<T>, T>(
      this.entityApi,
      entity
    );
  }

  /**
   * Returns a request builder for deleting an entity of type `SalesOrderPricingElement`.
   * @param salesOrder Key property. See {@link SalesOrderPricingElement.salesOrder}.
   * @param pricingProcedureStep Key property. See {@link SalesOrderPricingElement.pricingProcedureStep}.
   * @param pricingProcedureCounter Key property. See {@link SalesOrderPricingElement.pricingProcedureCounter}.
   * @returns A request builder for creating requests that delete an entity of type `SalesOrderPricingElement`.
   */
  delete(
    salesOrder: string,
    pricingProcedureStep: string,
    pricingProcedureCounter: string
  ): DeleteRequestBuilder<SalesOrderPricingElement<T>, T>;
  /**
   * Returns a request builder for deleting an entity of type `SalesOrderPricingElement`.
   * @param entity Pass the entity to be deleted.
   * @returns A request builder for creating requests that delete an entity of type `SalesOrderPricingElement` by taking the entity as a parameter.
   */
  delete(
    entity: SalesOrderPricingElement<T>
  ): DeleteRequestBuilder<SalesOrderPricingElement<T>, T>;
  delete(
    salesOrderOrEntity: any,
    pricingProcedureStep?: string,
    pricingProcedureCounter?: string
  ): DeleteRequestBuilder<SalesOrderPricingElement<T>, T> {
    return new DeleteRequestBuilder<SalesOrderPricingElement<T>, T>(
      this.entityApi,
      salesOrderOrEntity instanceof SalesOrderPricingElement
        ? salesOrderOrEntity
        : {
            SalesOrder: salesOrderOrEntity!,
            PricingProcedureStep: pricingProcedureStep!,
            PricingProcedureCounter: pricingProcedureCounter!
          }
    );
  }
}
