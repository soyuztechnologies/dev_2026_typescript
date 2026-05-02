import { BusinessPartnerSet, ContactSet, SalesOrderSet } from '#cds-models/GWSAMPLE_BASIC'
import { SalesOrdersExtended } from '#cds-models/CatalogService'
import { ApplicationService, Request, Query, predicate } from '@sap/cds'


const cds = require('@sap/cds')
require('dotenv').config()

module.exports = class CatalogService extends cds.ApplicationService { init() {

  const { BusinessPartnersSet, ContactsSet, SalesOrdersSet, SalesOrdersExtended } = cds.entities('CatalogService')

  this.on ('READ', [BusinessPartnersSet, ContactsSet, SalesOrdersSet], async (req: Request) => {
    console.log('Custom handler for READ on BusinessPartnersSet, ContactsSet, SalesOrdersSet')
    
    const gatewaySampleService = await cds.connect.to('GWSAMPLE_BASIC', {
      credentials: {
        url: process.env.GATEWAY_URL,
        username: process.env.GATEWAY_USERNAME,
        password: process.env.GATEWAY_PASSWORD
      }
    });
    const reply = await gatewaySampleService.run (req.query)
    req.reply (reply)
    
  })


  this.on ('READ', [SalesOrdersExtended], async (salesOrdersExtended: SalesOrdersExtended, req: Request) => {
    console.log('Custom handler for READ on SalesOrdersExtended', salesOrdersExtended)
    
    const gatewaySampleService = await cds.connect.to('GWSAMPLE_BASIC', {
      credentials: {
        url: process.env.GATEWAY_URL,
        username: process.env.GATEWAY_USERNAME,
        password: process.env.GATEWAY_PASSWORD
      }
    });

    const orders = await getOrders(req.query);

    const partnerIds = [...new Set(orders.map((order: SalesOrderSet) => order.CustomerID))]
    
    const partners: BusinessPartnerSet[] =
         await gatewaySampleService.run (SELECT`FROM GWSAMPLE_BASIC.BusinessPartnerSet 
                  { BusinessPartnerID, CompanyName, LegalForm } 
                  WHERE BusinessPartnerID IN ${partnerIds}`);
    const contacts: ContactSet[] =
         await gatewaySampleService.run (SELECT`FROM GWSAMPLE_BASIC.ContactSet 
                  { BusinessPartnerID, FirstName, LastName, PhoneNumber, EmailAddress } 
                  WHERE BusinessPartnerID IN ${partnerIds}`);      
    

    const extendedOrders: SalesOrdersExtended[] = orders.map((order: SalesOrderSet) => {
      
      const partner = partners.find((p: BusinessPartnerSet) => p.BusinessPartnerID === order.CustomerID)
      const contact = contacts.find((c: ContactSet) => c.BusinessPartnerID === order.CustomerID)

      return {
        salesOrderNumber: order.SalesOrderID,
        currencyCode: order.CurrencyCode,
        grossAmt: order.GrossAmount,
        netAmt:  order.NetAmount,
        customerID: partner?.BusinessPartnerID,
        customerName: `${partner?.CompanyName} ${partner?.LegalForm}` ,
        contactName: `${contact?.FirstName} ${contact?.LastName}` ,
        contactPhone: `${contact?.PhoneNumber}` ,
        contactEmail: `${contact?.EmailAddress}` 
      } as SalesOrdersExtended

    })

    return extendedOrders;
    
  })

  async function getOrders(extQuery: Query): Promise<SalesOrderSet[]> {
    const gatewaySampleService = await cds.connect.to('GWSAMPLE_BASIC', {
      credentials: {
        url: process.env.GATEWAY_URL,
        username: process.env.GATEWAY_USERNAME,
        password: process.env.GATEWAY_PASSWORD
      }
    });
    const query = SELECT`FROM CatalogService.SalesOrdersSet 
                  { SalesOrderID, CurrencyCode, GrossAmount, CustomerID, NetAmount } limit 20`
    const orders = await gatewaySampleService.run (query)
    return orders
  }

  return super.init()
}}
