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
const cds = require('@sap/cds');
require('dotenv').config();
const moment = require('moment');

module.exports = cds.service.impl(async function(srv){

    const { MySalesOrder } = this.entities;
    
    var getAllSalesOrders = async function(){
        const { opApiSalesOrderSrv0001 } = require('./src/generated/OP_API_SALES_ORDER_SRV_0001');
        const { salesOrderApi } = opApiSalesOrderSrv0001();
        const dataSalesData = await salesOrderApi.requestBuilder().getAll().top(30)
        .select(
            salesOrderApi.schema.SALES_ORDER,
            salesOrderApi.schema.SALES_ORGANIZATION,
            salesOrderApi.schema.SALES_ORDER_TYPE,
            salesOrderApi.schema.SOLD_TO_PARTY,
            salesOrderApi.schema.PAYMENT_METHOD,
            salesOrderApi.schema.TO_ITEM
        )
        .execute({
            // destinationName: "CFN"
            "url": process.env.URL,
            "username": process.env.USER,
            "password": process.env.PASSWORD
        });
        return dataSalesData;
    };

    srv.on('READ', MySalesOrder, async(req) => {
        return await getAllSalesOrders().then(
            salesOrderTable => {
                var aRecord = [];
                console.log(salesOrderTable);
                salesOrderTable.forEach(element => {
                    var item = {};
                    item.SalesOrder = element.salesOrder;
                    item.SalesOrganization = element.salesOrganization;
                    item.SalesOrderType = element.salesOrderType;
                    item.SoldToParty = element.soldToParty;
                    item.PaymentMethod = element.paymentMethod;
                    if(element.toItem[0]){
                        item.Material = element.toItem[0].material;
                        item.RequestedQuantity = element.toItem[0].requestedQuantity;
                        item.NetAmount = element.toItem[0].netAmount;
                    }else{
                        item.Material = "";
                        item.RequestedQuantity = "";
                        item.NetAmount = "";
                    }
                    
                    aRecord.push(item);
                });
                return aRecord;
            }
        );
    });

    srv.on('CREATE', MySalesOrder, async (req) => {

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
                    url: process.env.URL,
                    username: process.env.USER,
                    password: process.env.PASSWORD
                });

            return result;

        } catch (error) {
            console.error(error);
            req.error(500, error.message);
        }

    });
});
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

