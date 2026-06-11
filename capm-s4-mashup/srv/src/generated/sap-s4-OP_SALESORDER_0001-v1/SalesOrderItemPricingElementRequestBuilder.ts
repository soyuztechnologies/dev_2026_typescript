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
import { SalesOrderItemPricingElement } from './SalesOrderItemPricingElement';

/**
 * Request builder class for operations supported on the {@link SalesOrderItemPricingElement} entity.
 */
export class SalesOrderItemPricingElementRequestBuilder<
  T extends DeSerializers = DefaultDeSerializers
> extends RequestBuilder<SalesOrderItemPricingElement<T>, T> {
  /**
   * Returns a request builder for querying all `SalesOrderItemPricingElement` entities.
   * @returns A request builder for creating requests to retrieve all `SalesOrderItemPricingElement` entities.
   */
  getAll(): GetAllRequestBuilder<SalesOrderItemPricingElement<T>, T> {
    return new GetAllRequestBuilder<SalesOrderItemPricingElement<T>, T>(
      this.entityApi
    );
  }

  /**
   * Returns a request builder for creating a `SalesOrderItemPricingElement` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `SalesOrderItemPricingElement`.
   */
  create(
    entity: SalesOrderItemPricingElement<T>
  ): CreateRequestBuilder<SalesOrderItemPricingElement<T>, T> {
    return new CreateRequestBuilder<SalesOrderItemPricingElement<T>, T>(
      this.entityApi,
      entity
    );
  }

  /**
   * Returns a request builder for retrieving one `SalesOrderItemPricingElement` entity based on its keys.
   * @param salesOrder Key property. See {@link SalesOrderItemPricingElement.salesOrder}.
   * @param salesOrderItem Key property. See {@link SalesOrderItemPricingElement.salesOrderItem}.
   * @param pricingProcedureStep Key property. See {@link SalesOrderItemPricingElement.pricingProcedureStep}.
   * @param pricingProcedureCounter Key property. See {@link SalesOrderItemPricingElement.pricingProcedureCounter}.
   * @returns A request builder for creating requests to retrieve one `SalesOrderItemPricingElement` entity based on its keys.
   */
  getByKey(
    salesOrder: DeserializedType<T, 'Edm.String'>,
    salesOrderItem: DeserializedType<T, 'Edm.String'>,
    pricingProcedureStep: DeserializedType<T, 'Edm.String'>,
    pricingProcedureCounter: DeserializedType<T, 'Edm.String'>
  ): GetByKeyRequestBuilder<SalesOrderItemPricingElement<T>, T> {
    return new GetByKeyRequestBuilder<SalesOrderItemPricingElement<T>, T>(
      this.entityApi,
      {
        SalesOrder: salesOrder,
        SalesOrderItem: salesOrderItem,
        PricingProcedureStep: pricingProcedureStep,
        PricingProcedureCounter: pricingProcedureCounter
      }
    );
  }

  /**
   * Returns a request builder for updating an entity of type `SalesOrderItemPricingElement`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `SalesOrderItemPricingElement`.
   */
  update(
    entity: SalesOrderItemPricingElement<T>
  ): UpdateRequestBuilder<SalesOrderItemPricingElement<T>, T> {
    return new UpdateRequestBuilder<SalesOrderItemPricingElement<T>, T>(
      this.entityApi,
      entity
    );
  }

  /**
   * Returns a request builder for deleting an entity of type `SalesOrderItemPricingElement`.
   * @param salesOrder Key property. See {@link SalesOrderItemPricingElement.salesOrder}.
   * @param salesOrderItem Key property. See {@link SalesOrderItemPricingElement.salesOrderItem}.
   * @param pricingProcedureStep Key property. See {@link SalesOrderItemPricingElement.pricingProcedureStep}.
   * @param pricingProcedureCounter Key property. See {@link SalesOrderItemPricingElement.pricingProcedureCounter}.
   * @returns A request builder for creating requests that delete an entity of type `SalesOrderItemPricingElement`.
   */
  delete(
    salesOrder: string,
    salesOrderItem: string,
    pricingProcedureStep: string,
    pricingProcedureCounter: string
  ): DeleteRequestBuilder<SalesOrderItemPricingElement<T>, T>;
  /**
   * Returns a request builder for deleting an entity of type `SalesOrderItemPricingElement`.
   * @param entity Pass the entity to be deleted.
   * @returns A request builder for creating requests that delete an entity of type `SalesOrderItemPricingElement` by taking the entity as a parameter.
   */
  delete(
    entity: SalesOrderItemPricingElement<T>
  ): DeleteRequestBuilder<SalesOrderItemPricingElement<T>, T>;
  delete(
    salesOrderOrEntity: any,
    salesOrderItem?: string,
    pricingProcedureStep?: string,
    pricingProcedureCounter?: string
  ): DeleteRequestBuilder<SalesOrderItemPricingElement<T>, T> {
    return new DeleteRequestBuilder<SalesOrderItemPricingElement<T>, T>(
      this.entityApi,
      salesOrderOrEntity instanceof SalesOrderItemPricingElement
        ? salesOrderOrEntity
        : {
            SalesOrder: salesOrderOrEntity!,
            SalesOrderItem: salesOrderItem!,
            PricingProcedureStep: pricingProcedureStep!,
            PricingProcedureCounter: pricingProcedureCounter!
          }
    );
  }
}
