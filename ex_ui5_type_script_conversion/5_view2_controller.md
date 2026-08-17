## Cheat Sheet

1. Convert all methods to arrow function
```
name = (param) : void => {}
```
2. add namespace above controller
```
/**
 * @namespace ey.ap.acc.controller
 */
```
3. adding interface for router parameter
```
interface IRouteArguments {
    zkas: string;
}
```
4. Adding references for Event object and using event types in methods
```
import type { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";

herculis(oEvent: Route$PatternMatchedEvent) : void {}

```

View2.controller.ts
```
import BaseController from  "ey/ap/acc/controller/BaseController"
import MessageBox from  "sap/m/MessageBox"
import MessageToast from    "sap/m/MessageToast"
import type { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import History from "sap/ui/core/routing/History";

interface IRouteArguments {
    zkas: string;
}

/**
 * @namespace ey.ap.acc.controller
 */
export default class View2Controller extends BaseController {   
    onInit(): void {

        //optional chaining operator - ?. - if getRouter() is null or undefined, 
        // it will not throw error, it will return undefined
        // const x = { name : "john", age: 30, address: { city: "New York", state: "NY" } };
        // const city = x?.address?.city; // "New York"
        this.getRouter()?.getRoute("superman")?.attachMatched(this.herculis, this);

    };    

    //Route matched handler function which triggers
    //The route can change manually, browser back-forward button, when user select fruit, user reload ui.
    herculis(oEvent: Route$PatternMatchedEvent) : void {
        debugger;
        //here this - will never point to your controller class object
        // so in order to use this as a object of controller we have to pass while calling it - attachMatched(this.herculis, this);
        //step 1: extract the index of selected fruit
        //create an interface to define the shape of the arguments object
        var sIndex = (oEvent.getParameter("arguments") as IRouteArguments).zkas;
        //step 2: rebuild the element path
        var sPath = "/" + sIndex;
        //Step 3: bind element with view
        this.getView()?.bindElement(sPath,{
            expand: 'To_Supplier'
        });
    };

    onBack() : void {

        //get history instance
        var oHistory = History.getInstance();
        //get previous hash
        var sPreviousHash = oHistory.getPreviousHash();
        if(sPreviousHash !== undefined){
            //navigate back
            window.history.go(-1);
        }else{
            //navigate to default route
            this.getRouter().navTo("RouteView1", {}, true);
        }

    };

    onSave(): void{
        MessageBox.confirm("Would you like to Save?",{
            onClose: function(status){
                debugger;
                if(status === "OK"){
                    MessageToast.show("Your data was saved!");
                }else{
                    MessageBox.error("Oops~ something is fishy");
                }
            }
        });
    };
    onClear(): void{

    }

}
```