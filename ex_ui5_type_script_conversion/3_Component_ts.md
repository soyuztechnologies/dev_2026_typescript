# Convert Component.ts

- adding interface sap.ui.core.IAsyncContentCreation
- must inclide @namespace
- explain the messaging in case some old code is there
- when have to select multiple lines Ctrl+Alt+Up/Down , even from back side
- New way of initializing the Component using index.html

```
import UIComponent from "sap/ui/core/UIComponent";
import Messaging from "sap/ui/core/Messaging";

/**
 * @namespace ey.ap.acc
 */
export default class Component extends UIComponent {
    
    //needs to be accessed by framework for our static information
    
    public static metadata = {
        interface: ['sap.ui.core.IAsyncContentCreation'],
        manifest: "json",
    };

    //init method
    public init(): void {
                //we call parent class constructor super->constructor()
                // UIComponent.prototype.init.apply(this);
                // since we using classes, we can call super class
                super.init();

                //Step 1: Get the router object
                var oRouter = this.getRouter();

                //Step 2: now we need to initilize it, it will scan our manifest file to find
                //        routing configuration which dev need to provide the way they want their app to behave
                oRouter.initialize();

                //var oMessageManager = sap.ui.getCore().getMessageManager().getMessageModel();
                var oMessageManager = Messaging.getMessageModel();

            }
}
```

index.html for async issue of router and views issue in console
new way to create Component.js

```
<html>
    <head>

        <!-- UI5 bootstrap -> its piece of code we write using script tag -->
        <!-- to load the ui5 framework and library -->
        <script src="https://ui5.sap.com/resources/sap-ui-core.js"
                data-sap-ui-libs="sap.m"
                data-sap-ui-theme="sap_horizon_dark"
                data-sap-ui-bindingSyntax="complex"
                data-sap-ui-resourceroots='{
                    "ey.ap.acc":"./"
                }'
                data-sap-ui-on-init="module:sap/ui/core/ComponentSupport">
        </script>
        
        <!-- <script>

            var oCompnentContainer = new sap.ui.core.ComponentContainer({
                name : "ey.ap.acc"
            })            ;

            oCompnentContainer.placeAt("content");

        </script> -->
    </head>
    <!-- <body class="sapUiBody">
        <div id="content"></div>
    </body> -->
    <body class="sapUiBody" id="content">
        <div
            data-sap-ui-component
            data-id="container"
            data-name="ey.ap.acc"
            data-height="100%"
            data-settings='{"id": "ey.ap.acc"}'>
        </div>
    </body>

</html>
```