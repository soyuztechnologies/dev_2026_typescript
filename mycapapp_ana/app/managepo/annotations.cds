using CatalogService as service from '../../srv/CatalogService';

annotate service.PurchaseOrderSet with @(

    //Add fields to the screen for filtering the data
    UI.SelectionFields: [
        PO_ID,
        PARTNER_GUID.COMPANY_NAME,
        PARTNER_GUID.ADDRESS_GUID.COUNTRY,
        GROSS_AMOUNT,
        OVERALL_STATUS
    ],
    //Add the columns to the table data
    UI.LineItem:[
        {
            $Type : 'UI.DataField',
            Value : PO_ID,
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : PARTNER_GUID.COMPANY_NAME,
        },
        {
            $Type : 'UI.DataField',
            Value : PARTNER_GUID.ADDRESS_GUID.COUNTRY,
        },
        {
            $Type : 'UI.DataField',
            Value : GROSS_AMOUNT,
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'CatalogService.boost',
            Label : 'boost',
            Inline : true,
        },
        {
            $Type : 'UI.DataField',
            Value : OVERALL_STATUS,
            Criticality: Spiderman
        },
    ],
    UI.HeaderInfo:{
        //title of the table- first screen
        TypeName : 'Purchase Order',
        TypeNamePlural: 'Purchase Orders',
        //Second screen title section
        Title: {Value : PO_ID},
        Description: {Value: PARTNER_GUID.COMPANY_NAME},
        ImageUrl: 'https://media.licdn.com/dms/image/v2/C4D0BAQEADNH5e7u7AA/company-logo_200_200/company-logo_200_200/0/1630495746155?e=2147483647&v=beta&t=C0mpGHQBe1jfTxx8oubZgfmrh0PZTHQ5jdRsgtEbOVw'
    },
    //Add tab strip in second page (Facets) - Object Page
    UI.Facets:[
        {
            $Type : 'UI.CollectionFacet',
            Label : 'General Information',
            Facets : [
                {
                    Label: 'Basic Info',
                    $Type : 'UI.ReferenceFacet',
                    Target : '@UI.Identification',
                },
                {
                    Label : 'Pricing Details',
                    $Type : 'UI.ReferenceFacet',
                    Target : '@UI.FieldGroup#Spiderman',
                },
                {
                    Label: 'Additional Data',
                    $Type : 'UI.ReferenceFacet',
                    Target : '@UI.FieldGroup#Superman',
                },
            ],
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Items',
            Target : 'Items/@UI.LineItem'
        },
    ],
    //default block which is always and always ONE - Identification
    //contains the group of fields
    UI.Identification: [
        {
            $Type : 'UI.DataField',
            Value : PO_ID,
        },
        {
            $Type : 'UI.DataField',
            Value : PARTNER_GUID_NODE_KEY,
        },
        {
            $Type : 'UI.DataField',
            Value : NOTE
        },
    ],
    //FieldGroup block that can be multiple and have many fields inside
    UI.FieldGroup #Spiderman: {
        Data : [
            {
                $Type : 'UI.DataField',
                Value : GROSS_AMOUNT,
            },
            {
                $Type : 'UI.DataField',
                Value : NET_AMOUNT,
            },
            {
                $Type : 'UI.DataField',
                Value : TAX_AMOUNT,
            },
        ],
    },
    //Field Group for status data
    //To avoid system getting confused with duplicate annotations we use identifier #
    UI.FieldGroup #Superman: {
        Data: [
            {
                $Type : 'UI.DataField',
                Value : CURRENCY_code,
            },
            {
                $Type : 'UI.DataField',
                Value : OVERALL_STATUS,
            },
            {
                $Type : 'UI.DataField',
                Value : LIFECYCLE_STATUS,
            }
        ]
    }


);

annotate service.PurchaseItemsSet with @(
    UI.HeaderInfo: {
        TypeName : 'PO Item',
        TypeNamePlural: 'Purchase Order Items',
        Title : { Value: PO_ITEM_POS },
        Description : {Value: PRODUCT_GUID.DESCRIPTION}
    },
    UI.LineItem: [
        {
            $Type : 'UI.DataField',
            Value : PO_ITEM_POS,
        },
        {
            $Type : 'UI.DataField',
            Value : PRODUCT_GUID_NODE_KEY,
        },
        {
            $Type : 'UI.DataField',
            Value : GROSS_AMOUNT,
        },
        {
            $Type : 'UI.DataField',
            Value : NET_AMOUNT,
        },
        {
            $Type : 'UI.DataField',
            Value : TAX_AMOUNT,
        },
    ],
    UI.Facets: [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Item Details',
            Target : '@UI.Identification',
        },
    ],
    UI.Identification: [
        {
            $Type : 'UI.DataField',
            Value : PO_ITEM_POS,
        },
        {
            $Type : 'UI.DataField',
            Value : PRODUCT_GUID_NODE_KEY,
        },
        {
            $Type : 'UI.DataField',
            Value : GROSS_AMOUNT,
        },
        {
            $Type : 'UI.DataField',
            Value : NET_AMOUNT,
        },
        {
            $Type : 'UI.DataField',
            Value : TAX_AMOUNT,
        },
        {
            $Type : 'UI.DataField',
            Value : CURRENCY_code,
        },

    ]

);


//annotate a field to get its meaningful text
annotate service.PurchaseOrderSet with {
    @Common.Text: NOTE
    PO_ID;
    @Common.Text: PARTNER_GUID.COMPANY_NAME
    @ValueList.entity : service.BusinessPartnerSet 
    //@UI.Hidden: true
    //@Common : { TextArrangement : #TextOnly }
    PARTNER_GUID;
};

//annotate a field to get its meaningful text
annotate service.PurchaseItemsSet with {
    @Common.Text: PRODUCT_GUID.DESCRIPTION
    //@UI.Hidden: true
    //@Common : { TextArrangement : #TextOnly }
    @ValueList.entity : service.ProductSet
    PRODUCT_GUID;
};

//Design Value help in CAPM for Partner Guid and Product Guid
@cds.odata.valuelist
annotate service.BusinessPartnerSet with @(
    UI.Identification:[
        {
            $Type : 'UI.DataField',
            Value : COMPANY_NAME,
        },
    ]
);

@cds.odata.valuelist
annotate service.ProductSet with @(
    UI.Identification:[
        {
            $Type : 'UI.DataField',
            Value : DESCRIPTION,
        },
    ]
);
annotate service.PurchaseOrderSet with {
    OVERALL_STATUS @(
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'StatusCode',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : OVERALL_STATUS,
                    ValueListProperty : 'code',
                },
            ],
            Label : 'Status',
        },
        Common.ValueListWithFixedValues : true,
)};

annotate service.StatusCode with {
    code @Common.Text : value
};

