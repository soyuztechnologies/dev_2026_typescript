# 1. Change first file BaseController.js --> ts

- Add import statements
```
import Controller from 'sap/ui/core/mvc/Controller';
import UIComponent from 'sap/ui/core/UIComponent';
import type Router from 'sap/ui/core/routing/Router';
import * as formatter from 'ey/ap/acc/util/formatter';
```

syntax for class
```
export default class CLASSNAME extends PARENTCLASS{
    
    onInit(): void {}

    public VARIABLE = VALUE;

    public override BASECLASSMETHOD(): RETURN {
		return super.BASECLASSMETHD() as DATATYPE;
	}

    SELFFUNCTION = (eventObj: type) : void => {
        --code
    }

}
```

Java Script Code
```
sap.ui.define(
    [ 
            "sap/ui/core/mvc/Controller",
            "ey/ap/acc/util/formatter"
     ],
    function(Controller, Formatter){

        return Controller.extend("ey.ap.acc.controller.BaseController",{

            formatter: Formatter,
            getRouter: function(){
                return this.getOwnerComponent().getRouter();
            }

        });
    }
)
```

Type Script code for BaseController
```
import Controller from 'sap/ui/core/mvc/Controller';
import UIComponent from 'sap/ui/core/UIComponent';
import type Router from 'sap/ui/core/routing/Router';
import * as formatter from 'ey/ap/acc/util/formatter';

export default class BaseController extends Controller {
    onInit(): void {}

    // expose formatter utility
    public formatter = formatter;

    	/**
	 * Convenience method to get the components' router instance.
	 * @returns The router instance
	 */
	public getRouter(): Router {
		return (this.getOwnerComponent() as UIComponent).getRouter();
	}
}
```

Error will come so add namespace
```
/**
 * @namespace com.ats.manageorder.controller
 */
```

the issue will fix for console error as getRouter() not found and app runs properly.

# 2. Change first file App.controller.js --> ts

```
import BaseController from "ey/ap/acc/controller/BaseController";

export default class App extends BaseController {
    onInit(): void {
        
    }
}
```

# 3. Empty.controller.ts

```
export default class Empty extends BaseController {
    onInit(): void {
        
    }
}
```