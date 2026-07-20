namespace anubhav.cds;

using { anubhav.db.master, anubhav.db.transaction  } from './datamodel';

context CDSViews {
    define view![POWorkList] as 
        select from transaction.purchaseorder{
            key PO_ID as![PurchaseOrderId],
            key Items.PO_ITEM_POS as![ItemPosition],
            PARTNER_GUID.BP_ID as![PartnerId],
            PARTNER_GUID.COMPANY_NAME as![CompanyName],
            GROSS_AMOUNT as![GrossAmount],
            NET_AMOUNT as![NetAmount],
            TAX_AMOUNT as![TaxAmount],
            CURRENCY as![CurrencyCode],
            OVERALL_STATUS as![OverallStatus],
            Items.PRODUCT_GUID.PRODUCT_ID as![ProductId],
            Items.PRODUCT_GUID.DESCRIPTION as![Description],
            PARTNER_GUID.ADDRESS_GUID.CITY as![City],
            PARTNER_GUID.ADDRESS_GUID.COUNTRY as![Country]
        };

    define view![ProductValueHelp] as 
        select from master.product{
            @EndUserText.label:[
                {
                    language: 'EN',
                    text: 'Product Id'
                },
                {
                    language: 'DE',
                    text: 'Prodkt Id'
                }
            ]
            PRODUCT_ID as![ProductId],
            @EndUserText.label:[
                {
                    language: 'EN',
                    text: 'Product Description'
                },
                {
                    language: 'DE',
                    text: 'Prodkt Decripon'
                }
            ]
            DESCRIPTION as![Description]
        };

    define view![ItemView] as 
        select from transaction.poitems{
            key PARENT_KEY.PARTNER_GUID.NODE_KEY as![CustomerId],
            key PRODUCT_GUID.NODE_KEY as![ProductId],
            CURRENCY as![CurrencyCode],
            GROSS_AMOUNT as![GrossAmount],
            NET_AMOUNT as![NetAmount],
            TAX_AMOUNT as![TaxAmount],
            PARENT_KEY.OVERALL_STATUS as![Status]
        };

    define view ProductView as select from master.product
        //Mixin is a keyword to define lose coupling 
        //which will never load the data from product and items table together
        //it will first load product and later ONDEMAND does the join to load Items data
        mixin{
            //View on View
            PO_ORDER: Association to many ItemView on PO_ORDER.ProductId = $projection.ProductId
        } into {
            NODE_KEY as![ProductId],
            DESCRIPTION as![Description],
            CATEGORY as![Category],
            PRICE as![Price],
            SUPPLIER_GUID.BP_ID as![SupplierId],
            SUPPLIER_GUID.COMPANY_NAME as![CompanyName],
            SUPPLIER_GUID.ADDRESS_GUID.COUNTRY as![Country],
            //Exposed association - @ runtime we load data on-demand 
            PO_ORDER as![To_Items]
        };

    define view CProductValuesView as 
        select from ProductView{
            ProductId,
            Country,
            round(sum(To_Items.GrossAmount),2) as![TotalAmount],
            To_Items.CurrencyCode as![CurrencyCode]
        }group by ProductId,
            Country, To_Items.CurrencyCode

}