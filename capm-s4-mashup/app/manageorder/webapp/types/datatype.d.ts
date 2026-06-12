// ----- A single line item inside a sales order -----
export interface SalesOrderItem {
    salesOrderItem: string;
    material: string;
    requestedQuantity: string;
    requestedQuantityUnit: string;
}

// ----- One sales order (header + its items) -----
export interface SalesOrder {
    salesOrder: string;
    salesOrderType: string;
    salesOrganization: string;
    distributionChannel?: string;
    organizationDivision?: string;
    salesDistrict?: string;
    soldToParty: string;
    salesOrderDate?: string;
    items?: SalesOrderItem[];
}

// ----- OData V4 wraps collections in a "value" array -----
export interface SalesOrdersResponse {
    value: SalesOrder[];
}

// ----- Shape returned by the createSalesOrder action -----
export interface CreateOrderResponse extends SalesOrder {
    // the action echoes the full order back, incl. the new salesOrder id
}

// ----- Error envelope returned by OData on failure -----
export interface ODataError {
    error?: {
        code?: string;
        message?: string;
    };
}

// ----- Value-help row shapes used by the fragments -----
export interface Supplier {
    name: string;
    city: string;
}

export interface City {
    name: string;
    famousFor: string;
}

export interface NewSalesOrder {
    salesOrderType: string;
    salesOrganization: string;
    distributionChannel: string;
    organizationDivision: string;
    salesDistrict: string;
    soldToParty: string;
    salesOrderDate: string;
    items: SalesOrderItem[];
}