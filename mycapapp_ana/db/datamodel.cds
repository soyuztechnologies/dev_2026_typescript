namespace anubhav.db;
using { anubhav.common as common } from './commons';
//like in ABAP we have standard table for T100, T005, T010
using { Currency, cuid } from '@sap/cds/common';
using { Attachments } from '@cap-js/attachments';

context master {
    
    //foreign ky table - ADDRESS_GUID
    entity businesspartner{
        key NODE_KEY: common.Guid @(title: '{i18n>PARTNER_KEY}');
        BP_ROLE: String(2);
        EMAIL_ADDRESS: String(125);
        PHONE_NUMBER: String(32);
        FAX_NUMBER: String(32);
        WEB_ADDRESS: String(44);
        COMPANY_NAME: String(250) @(title: '{i18n>COMPANY_NAME}');
        BP_ID: String(32) @(title: '{i18n>PARTNER_ID}');
        //COLUMN NAME - ADDRESS_GUID_NODE_KEY
        ADDRESS_GUID: Association to one address;
    }

    //check table, whoes primary is NODE_KEY
    entity address{
        key NODE_KEY: common.Guid;
        CITY: String(44);
        POSTAL_CODE: String(8);
        STREET: String(44);
        BUILDING: String(128);
        COUNTRY: String(44) @(title: '{i18n>COUNTRY}');
        ADDRESS_TYPE: String(44);
        VAL_START_DATE: Date;
        VAL_END_DATE: Date;
        LATITUDE: Decimal;
        LONGITUDE: Decimal;
        //$self - which represent the primary key of current table
        businesspartner: Association to one businesspartner on
                            businesspartner.ADDRESS_GUID = $self
    }

    //cuid - is a aspect which is provided by SAP out-of-box
    entity employee: cuid {
        nameFirst: String(256);
        nameMiddle: String(256);
        nameLast: String(256);
        nameInitials: String(40);
        sex: common.Gender;
        language: String(1);
        phoneNumber: common.PhoneNumber;
        email: common.Email;
        loginName: String(12);
        Currency : Currency;
        salaryAmount: common.AmountT;
        accountNumber: String(16);
        bankId: String(40);
        bankName: String(64);
    };

    //master data products
    entity product {
        key NODE_KEY: common.Guid @(title: '{i18n>PRODUCT_KEY}');
        PRODUCT_ID: String(28) @(title: '{i18n>PRODUCT_ID}');
        TYPE_CODE: String(2);
        CATEGORY: String(32);
        DESCRIPTION: localized String(255) @(title: '{i18n>DESCRIPTION}');
        SUPPLIER_GUID: Association to one master.businesspartner;
        TAX_TARIF_CODE: Integer;
        MEASURE_UNIT: String(2);
        WEIGHT_MEASURE: Decimal(5, 2);
        WEIGHT_UNIT: String(2);
        CURRENCY_CODE: String(4);
        PRICE:  Decimal(15,2);
        WIDTH:  Decimal(5,2);
        DEPTH:  Decimal(5,2);
        HEIGHT: Decimal(5,2);
        DIM_UNIT: String(2);
    }

    entity StatusCode  {
        key code: String(1);
        value : String(10);
    }
}

context transaction {
    entity purchaseorder: common.Amount, cuid{
        //key NODE_KEY: common.Guid @(title: '{i18n>PO_KEY}');
        PO_ID: String(32) @(title: '{i18n>PO_ID}');
        PARTNER_GUID : Association to master.businesspartner @(title: '{i18n>PARTNER_KEY}');
        LIFECYCLE_STATUS: String(1) @(title: '{i18n>OVERALL_STATUS}');
        OVERALL_STATUS: common.OrderStatus @(title: '{i18n>OVERALL_STATUS}');
        NOTE: String(100) @(title: '{i18n>NOTE}');
        Items: Composition of  many poitems on Items.PARENT_KEY = $self @(title: '{i18n>PO_ITEM_KEY}');
        attachments: Composition of many Attachments;
    }

    entity poitems: common.Amount, cuid{
        //key NODE_KEY: common.Guid @(title: '{i18n>PO_ITEM_KEY}');
        PARENT_KEY: Association to purchaseorder @(title: '{i18n>PO_KEY}');
        PO_ITEM_POS: Integer @(title: '{i18n>PO_ITEM_POS}');
        PRODUCT_GUID : Association to master.product @(title: '{i18n>PRODUCT_KEY}');        
    }
}
