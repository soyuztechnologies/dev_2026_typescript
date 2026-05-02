using GWSAMPLE_BASIC.SalesOrderSet as AnubhavOrders from '../srv/external/GWSAMPLE_BASIC';
using GWSAMPLE_BASIC.BusinessPartnerSet as AnubhavPartners from '../srv/external/GWSAMPLE_BASIC';
using GWSAMPLE_BASIC.ContactSet as AnubhavContacts from '../srv/external/GWSAMPLE_BASIC';

namespace anubhav.srv;

/// @cds.persistence.skip: Skips persistence for this entity in the database
/// @singular: Defines the singular form of the entity name
@cds.persistence.skip
@singular: 'ExtendedSalesOrder'
entity SalesOrdersExt {
  salesOrderNumber: String;
  customerID: String;
  customerName: String;        //including legal form
  currencyCode: String;
  grossAmt: Decimal;
  netAmt: Decimal;
  contactName: String;         //first + last name
  contactPhone: String;
  contactEmail: String;
}

@cds.persistence.skip
@singular: 'SalesOrder'
entity SalesOrders as projection on AnubhavOrders;

@cds.persistence.skip
@singular: 'BusinessPartner'
entity BusinessPartners as projection on AnubhavPartners {
  key BusinessPartnerID,
  CompanyName,
  CurrencyCode,
  BusinessPartnerRole,
  LegalForm
};

@cds.persistence.skip
@singular: 'Contact'
entity Contacts as projection on AnubhavContacts {
  key ContactGuid,
  BusinessPartnerID,
  FirstName,
  LastName,
  PhoneNumber,
  EmailAddress
}