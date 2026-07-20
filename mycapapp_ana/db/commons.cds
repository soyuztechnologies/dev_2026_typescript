namespace anubhav.common;
using { Currency } from '@sap/cds/common';


//reusable type - data element in abap
type Guid: String(32);

//domain fix values M - male, F - Female, U - Unknown
type Gender: String(1) enum{
    male = 'M';
    female = 'F';
    undisclosed = 'U';
}

type OrderStatus: String(1) enum{
    New = 'N';
    InProcess = 'I';
    Approved = 'A';
    Rejected = 'X';
    Pending = 'P';
    Delivered = 'D';
}

//reference field for quantity and currency
//@ - annotations that have special significance in CAPM
type AmountT: Decimal(10,2) @(
    Semantic.amount.currencyCode: 'CURRENCY_code'
    //sap.unit: 'CURRENCY_code'
);

//custom structure (aspect)
//When we refer a field type that refer to another entity - that entity have a key e.g. 
//in this example Currency has key name code
//The column name of this structure will be COLUMN_KEY = CURRENCY_code
aspect Amount{
    CURRENCY: Currency @(title: '{i18n>CURRENCY}');
    GROSS_AMOUNT: AmountT @(title: '{i18n>GROSS_AMOUNT}');
    NET_AMOUNT: AmountT @(title: '{i18n>NET_AMOUNT}');
    TAX_AMOUNT: AmountT @(title: '{i18n>TAX_AMOUNT}');
}

type PhoneNumber : String(30) @assert.format : '^[6-9]\d{9}$';
type Email: String(250) @assert.format : '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$';
