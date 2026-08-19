mkdir s4hext

cd s4hext

cds init
--create folder srv/external
--import 1.0.0 edmx file

cds import srv/external/OP_API_SALES_ORDER_SRV_0001.edmx

npm install -D @sap-cloud-sdk/generator
npm install @sap-cloud-sdk/odata-v2

npx generate-odata-client --transpile --input srv/external --outputDir srv/src/generated

npm install dotenv

--Create .env file like below, in main folder not inside srv

    USER=***
    PASSWORD=***
    URL=http://122.162.240.164:8010
    BACKUP_URL=https://s4hana10.saraswatitechnologies.in:44310

--in code consume as below

            require('dotenv').config();

            "url": process.env.URL,
            "username": process.env.USER,
            "password": process.env.PASSWORD


### CatalogService.cds
```
namespace btps4salesext.srv;

using { OP_API_SALES_ORDER_SRV_0001 as external  } from './external/OP_API_SALES_ORDER_SRV_0001.csn';

service CatalogService @(path:'CatalogService') {

    entity MySalesOrder as projection on external.A_SalesOrder;

}
```
### CatalogService.js

```
const cds = require('@sap/cds')
require('dotenv').config();
const moment = require('moment');

module.exports = class CatalogService extends cds.ApplicationService { init() {

  const { MySalesOrder } = cds.entities('bosch.s4hext.CatalogService')

  const getAllOrders = async function(orderId){
    const { opApiSalesOrderSrv0001 } = require("./src/generated/OP_API_SALES_ORDER_SRV_0001");
    const { salesOrderApi } = opApiSalesOrderSrv0001();
    if(orderId){
        const dataSales = await salesOrderApi.requestBuilder().getByKey(orderId)
                                    .select(
                                      salesOrderApi.schema.SALES_ORDER,
                                      salesOrderApi.schema.SALES_ORGANIZATION,
                                      salesOrderApi.schema.SALES_ORDER_TYPE,
                                      salesOrderApi.schema.SOLD_TO_PARTY,
                                      salesOrderApi.schema.DISTRIBUTION_CHANNEL,
                                      salesOrderApi.schema.ORGANIZATION_DIVISION,
                                      salesOrderApi.schema.PAYMENT_METHOD,
                                      salesOrderApi.schema.TO_ITEM
                                    )
                                    .execute({
                                      // destinationName: "S4HANA"
                                      "url": process.env.URL,
                                      "username" : process.env.USER,
                                      "password": process.env.PASSWORD
                                    });
          return [dataSales];   
    }else{
            const dataSales = await salesOrderApi.requestBuilder().getAll()
                                    .select(
                                      salesOrderApi.schema.SALES_ORDER,
                                      salesOrderApi.schema.SALES_ORGANIZATION,
                                      salesOrderApi.schema.SALES_ORDER_TYPE,
                                      salesOrderApi.schema.SOLD_TO_PARTY,
                                      salesOrderApi.schema.DISTRIBUTION_CHANNEL,
                                      salesOrderApi.schema.ORGANIZATION_DIVISION,
                                      salesOrderApi.schema.PAYMENT_METHOD,
                                      salesOrderApi.schema.TO_ITEM
                                    )
                                    .top(20)
                                    .execute({
                                      // destinationName: "S4HANA"
                                      "url": process.env.URL,
                                      "username" : process.env.USER,
                                      "password": process.env.PASSWORD
                                    });
          return dataSales;         
                          }                
  }


  this.on ('CREATE', MySalesOrder, async (req) => {
    const payload = req.data;

        const { opApiSalesOrderSrv0001 } = require('./src/generated/OP_API_SALES_ORDER_SRV_0001');
        const { salesOrderApi, salesOrderItemApi } = opApiSalesOrderSrv0001();

        try {

            const salesOrder = salesOrderApi.entityBuilder()
                .salesOrderType(payload.SalesOrderType)
                .salesOrganization(payload.SalesOrganization)
                .distributionChannel(payload.DistributionChannel)
                .organizationDivision(payload.OrganizationDivision)
                .salesDistrict(payload.SalesDistrict)
                .soldToParty(payload.SoldToParty)
                .salesOrderDate(moment(payload.SalesOrderDate))
                .build();

            const items = payload.to_Item.results.map(item => {
                return salesOrderItemApi.entityBuilder()
                    .salesOrderItem(item.SalesOrderItem)
                    .material(item.Material)
                    .requestedQuantity(item.RequestedQuantity)
                    .requestedQuantityUnit(item.RequestedQuantityUnit)
                    .build();
            });

            salesOrder.toItem = items;

            const result = await salesOrderApi
                .requestBuilder()
                .create(salesOrder)
                .execute({
                    // destinationName: "S4HANA"
                    url: process.env.URL,
                    username: process.env.USER,
                    password: process.env.PASSWORD
                });

            return result;

        } catch (error) {
            console.error(error);
            req.error(500, error.message);
        }


  })

  this.on ('READ', MySalesOrder, async (req) => {
    debugger;
    const orderId = req.data.SalesOrder;
    return await getAllOrders(orderId).then(
      allOrders => {
        var aRecord = [];
        //console.log(allOrders);
        allOrders.forEach(element => {
          var item = {};
          item.SalesOrder = element.salesOrder;
          item.SalesOrganization = element.salesOrganization;
          item.SalesOrderType = element.salesOrderType;
          item.SoldToParty = element.soldToParty;
          item.PaymentMethod = element.PaymentMethod;
          item.DistributionChannel = element.distributionChannel;
          item.OrganizationDivision = element.organizationDivision;
          if(element.toItem[0]){
            item.Material = element.toItem[0].material;
            item.RequestedQuantity = element.toItem[0].requestedQuantity;
            item.NetAmount = element.toItem[0].netAmount;
          }else{
            item.Material = "";
            item.RequestedQuantity = 0;
            item.NetAmount = 0;
          }
          aRecord.push(item);
          console.log(aRecord)  ;
        });

        
        return aRecord;
      }
      
    );

  })


  return super.init()
}}


```

tester.http
```
http://localhost:4004/odata/v4/CatalogService/MySalesOrder

###Load prod
http://localhost:4004/odata/v4/AnubhavNorth/Products

###POST 
POST http://localhost:4004/odata/v4/CatalogService/MySalesOrder
Content-Type: application/json

{
        "SalesOrderType": "OR",
        "SalesOrganization": "BMGB",
        "DistributionChannel": "DB",
        "OrganizationDivision": "AC",
        "SalesDistrict": "000001",
        "SoldToParty": "49",
        "SalesOrderDate": "2026-04-05",
        "to_Item": {
            "results": [
            {
                "SalesOrderItem": "10",
                "Material": "220",
                "RequestedQuantity": "5",
                "RequestedQuantityUnit": "PC"
            }
            ]
        }
}
```


cf create-service xsuaa application myxsuaa 

cf create-service-key myxsuaa myxsuaa-key 

cds bind --to myxsuaa:myxsuaa-key 

cf create-service destination lite mydest

cf create-service-key mydest mydest-key 

cds bind --to mydest:mydest-key 

cds run --profile hybrid

