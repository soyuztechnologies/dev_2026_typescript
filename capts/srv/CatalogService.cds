using anubhav.srv.BusinessPartners from '../db/schema.cds';
using anubhav.srv.Contacts from '../db/schema.cds';
using anubhav.srv.SalesOrders from '../db/schema.cds';
using anubhav.srv.SalesOrdersExt from '../db/schema.cds';

service CatalogService @(path: '/CatalogService') {
  entity BusinessPartnersSet as projection on BusinessPartners;
  entity ContactsSet as projection on Contacts;
  entity SalesOrdersSet as projection on SalesOrders;
  entity SalesOrdersExtended as projection on SalesOrdersExt;
}