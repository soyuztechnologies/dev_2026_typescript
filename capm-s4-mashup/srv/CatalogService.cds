using { anubhav.trainings as db } from '../db/schema';

service CatalogService {
  // local entities from Step 1
  entity Materials as projection on db.Material;
  entity Plants    as projection on db.Plant;

  // remote S/4HANA mashup surface
  function getSalesOrders() returns array of SalesOrder;

  action createSalesOrder(order: SalesOrderInput) returns SalesOrder;

  
  type SalesOrder {
    salesOrder         : String;
    salesOrderType     : String;
    soldToParty        : String;
    salesOrganization  : String;
    items              : array of SalesOrderItemView;
  }

  type SalesOrderItemView {
    salesOrderItem        : String;
    material              : String;
    requestedQuantity     : String;
    requestedQuantityUnit : String;
  }

  type SalesOrderItemInput {
    salesOrderItem        : String;
    material              : String;
    requestedQuantity     : String;
    requestedQuantityUnit : String;
  }

  type SalesOrderInput {
    salesOrderType        : String;
    salesOrganization     : String;
    distributionChannel   : String;
    organizationDivision  : String;
    salesDistrict         : String;
    soldToParty           : String;
    salesOrderDate        : String;
    items                 : array of SalesOrderItemInput;
  }
}