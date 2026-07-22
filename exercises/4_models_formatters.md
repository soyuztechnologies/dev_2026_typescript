# 1. Convert models.ts->js

```
import JSONModel from "sap/ui/model/json/JSONModel";
import Device from "sap/ui/Device";

export default{
    createDeviceModel(): JSONModel {
        var oModel = new JSONModel(Device);
        oModel.setDefaultBindingMode("OneWay");
        return oModel;
    }
}

```

# 2. formatter.ts

```
export default{
    getStatus(code: String) : String{
            switch (code) {
                case "A":
                    return "Available";
                    break;
                case "O":
                    return "Out of Stock";
                    break;
                case "D":
                    return "Discontinued";
                    break;            
                default:
                    return "Oops!"
                    break;
            }
        },
    getStatusColor(code: String): String{
            switch (code) {
                case "A":
                    return "Success";
                    break;
                case "O":
                    return "Warning";
                    break;
                case "D":
                    return "Error";
                    break;            
                default:
                    return "Error"
                    break;
            }
        }
}
```