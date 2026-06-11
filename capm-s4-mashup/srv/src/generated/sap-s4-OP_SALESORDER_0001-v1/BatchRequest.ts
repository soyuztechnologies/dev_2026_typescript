/*
 * Copyright (c) 2026 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import {
  CreateRequestBuilder,
  DeleteRequestBuilder,
  DeSerializers,
  GetAllRequestBuilder,
  GetByKeyRequestBuilder,
  ODataBatchRequestBuilder,
  UpdateRequestBuilder,
  BatchChangeSet
} from '@sap-cloud-sdk/odata-v4';
import { transformVariadicArgumentToArray } from '@sap-cloud-sdk/util';
import {
  SalesOrder,
  SalesOrderItem,
  SalesOrderItemPartner,
  SalesOrderItemPricingElement,
  SalesOrderItemText,
  SalesOrderPartner,
  SalesOrderPricingElement,
  SalesOrderScheduleLine,
  SalesOrderText,
  VariantConfiguration
} from './index';

/**
 * Batch builder for operations supported on the Sap S4 Op Salesorder 0001 V1.
 * @param requests The requests of the batch.
 * @returns A request builder for batch.
 */
export function batch<DeSerializersT extends DeSerializers>(
  ...requests: Array<
    | ReadSapS4OpSalesorder0001V1RequestBuilder<DeSerializersT>
    | BatchChangeSet<DeSerializersT>
  >
): ODataBatchRequestBuilder<DeSerializersT>;
export function batch<DeSerializersT extends DeSerializers>(
  requests: Array<
    | ReadSapS4OpSalesorder0001V1RequestBuilder<DeSerializersT>
    | BatchChangeSet<DeSerializersT>
  >
): ODataBatchRequestBuilder<DeSerializersT>;
export function batch<DeSerializersT extends DeSerializers>(
  first:
    | undefined
    | ReadSapS4OpSalesorder0001V1RequestBuilder<DeSerializersT>
    | BatchChangeSet<DeSerializersT>
    | Array<
        | ReadSapS4OpSalesorder0001V1RequestBuilder<DeSerializersT>
        | BatchChangeSet<DeSerializersT>
      >,
  ...rest: Array<
    | ReadSapS4OpSalesorder0001V1RequestBuilder<DeSerializersT>
    | BatchChangeSet<DeSerializersT>
  >
): ODataBatchRequestBuilder<DeSerializersT> {
  return new ODataBatchRequestBuilder(
    defaultSapS4OpSalesorder0001V1Path,
    transformVariadicArgumentToArray(first, rest)
  );
}

/**
 * Change set constructor consists of write operations supported on the Sap S4 Op Salesorder 0001 V1.
 * @param requests The requests of the change set.
 * @returns A change set for batch.
 */
export function changeset<DeSerializersT extends DeSerializers>(
  ...requests: Array<WriteSapS4OpSalesorder0001V1RequestBuilder<DeSerializersT>>
): BatchChangeSet<DeSerializersT>;
export function changeset<DeSerializersT extends DeSerializers>(
  requests: Array<WriteSapS4OpSalesorder0001V1RequestBuilder<DeSerializersT>>
): BatchChangeSet<DeSerializersT>;
export function changeset<DeSerializersT extends DeSerializers>(
  first:
    | undefined
    | WriteSapS4OpSalesorder0001V1RequestBuilder<DeSerializersT>
    | Array<WriteSapS4OpSalesorder0001V1RequestBuilder<DeSerializersT>>,
  ...rest: Array<WriteSapS4OpSalesorder0001V1RequestBuilder<DeSerializersT>>
): BatchChangeSet<DeSerializersT> {
  return new BatchChangeSet(transformVariadicArgumentToArray(first, rest));
}

export const defaultSapS4OpSalesorder0001V1Path = '/';
export type ReadSapS4OpSalesorder0001V1RequestBuilder<
  DeSerializersT extends DeSerializers
> =
  | GetAllRequestBuilder<SalesOrder<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<SalesOrderItem<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<SalesOrderItemPartner<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<
      SalesOrderItemPricingElement<DeSerializersT>,
      DeSerializersT
    >
  | GetAllRequestBuilder<SalesOrderItemText<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<SalesOrderPartner<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<
      SalesOrderPricingElement<DeSerializersT>,
      DeSerializersT
    >
  | GetAllRequestBuilder<SalesOrderScheduleLine<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<SalesOrderText<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<VariantConfiguration<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<SalesOrder<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<SalesOrderItem<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<
      SalesOrderItemPartner<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<
      SalesOrderItemPricingElement<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<SalesOrderItemText<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<SalesOrderPartner<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<
      SalesOrderPricingElement<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<
      SalesOrderScheduleLine<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<SalesOrderText<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<
      VariantConfiguration<DeSerializersT>,
      DeSerializersT
    >;
export type WriteSapS4OpSalesorder0001V1RequestBuilder<
  DeSerializersT extends DeSerializers
> =
  | CreateRequestBuilder<SalesOrder<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<SalesOrder<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<SalesOrder<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<SalesOrderItem<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<SalesOrderItem<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<SalesOrderItem<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<SalesOrderItemPartner<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<SalesOrderItemPartner<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<SalesOrderItemPartner<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<
      SalesOrderItemPricingElement<DeSerializersT>,
      DeSerializersT
    >
  | UpdateRequestBuilder<
      SalesOrderItemPricingElement<DeSerializersT>,
      DeSerializersT
    >
  | DeleteRequestBuilder<
      SalesOrderItemPricingElement<DeSerializersT>,
      DeSerializersT
    >
  | CreateRequestBuilder<SalesOrderItemText<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<SalesOrderItemText<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<SalesOrderItemText<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<SalesOrderPartner<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<SalesOrderPartner<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<SalesOrderPartner<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<
      SalesOrderPricingElement<DeSerializersT>,
      DeSerializersT
    >
  | UpdateRequestBuilder<
      SalesOrderPricingElement<DeSerializersT>,
      DeSerializersT
    >
  | DeleteRequestBuilder<
      SalesOrderPricingElement<DeSerializersT>,
      DeSerializersT
    >
  | CreateRequestBuilder<SalesOrderScheduleLine<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<SalesOrderScheduleLine<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<SalesOrderScheduleLine<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<SalesOrderText<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<SalesOrderText<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<SalesOrderText<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<VariantConfiguration<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<VariantConfiguration<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<VariantConfiguration<DeSerializersT>, DeSerializersT>;
