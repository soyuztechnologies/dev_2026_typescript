https://services.odata.org/Experimental/OData/OData.svc/

1. download metadata and put in external folder

2. install npm install @sap-cloud-sdk/http-client

3. cds import to create csn

4. add code to package json

```
"cds": {
    "requires": {
      "OP_API_SALES_ORDER_SRV_0001": {
        "kind": "odata-v2",
        "model": "srv/external/OP_API_SALES_ORDER_SRV_0001"
      },
      "NorthWind": {
        "kind": "odata",
        "model": "srv/external/NorthWind",
        "credentials": {
          "url": "https://services.odata.org/Experimental/OData/OData.svc"
        },
        "[production]": {
          "credentials": {
            "destination": "NorthWind"
          }
        }
      },
      "[production]": {
        "auth": {
          "kind": "xsuaa",
          "restrict_all_services": false
        }
      }
    }
  }
```

3. create cds file

```
using {NorthWind as external} from './external/NorthWind.csn';
service AnubhavNorth @(path:'AnubhavNorth') {
    @readonly
    entity Products as projection on external.Products {
        key ID, Name, Description, ReleaseDate, DiscontinuedDate, Rating, Price
    };
}
```

4. create js file

```
const cds = require('@sap/cds');
module.exports = cds.service.impl(async function() {
	const { Products } = this.entities;
	const service = await cds.connect.to('NorthWind');

	this.on('READ', Products, request => {
		return service.tx(request).run(request.query);
	});
});
```

-----------
mbt build

cf deploy