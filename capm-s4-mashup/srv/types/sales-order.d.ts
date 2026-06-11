export interface SalesOrderItemInput {
  salesOrderItem: string;
  material: string;
  requestedQuantity: string;
  requestedQuantityUnit: string;
}

export interface SalesOrderInput {
  salesOrderType: string;
  salesOrganization: string;
  distributionChannel: string;
  organizationDivision: string;
  salesDistrict: string;
  soldToParty: string;
  salesOrderDate: string;
  items: SalesOrderItemInput[];
}

export interface SalesOrderItemView {
  salesOrderItem: string;
  material: string;
  requestedQuantity: string;
  requestedQuantityUnit: string;
}

export interface SalesOrderView {
  salesOrder: string;
  salesOrderType: string;
  soldToParty: string;
  salesOrganization: string;
  items: SalesOrderItemView[];
}

export type ODataVersion = 'v2' | 'v4';

export interface S4Config {
  url: string;
  username: string;
  password: string;
  odataVersion: ODataVersion;
}