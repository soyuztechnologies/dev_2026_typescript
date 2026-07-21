sap.ui.define(
    [
        "sap/ui/core/UIComponent"
    ], 
    function(UICompoenent){
        return UICompoenent.extend("ey.ap.acc.Component",{

            metadata: {
                manifest: "json",
            },
            //constructor
            init: function(){
                //we call parent class constructor super->constructor()
                UICompoenent.prototype.init.apply(this);

                //Step 1: Get the router object
                var oRouter = this.getRouter();

                //Step 2: now we need to initilize it, it will scan our manifest file to find
                //        routing configuration which dev need to provide the way they want their app to behave
                oRouter.initialize();

            },
            // createContent: function(){

            //     //we will now create the object of our Root View
            //     var oRootView = new sap.ui.view({
            //         id:"idRootView",
            //         viewName: "ey.ap.acc.view.App",
            //         type: "XML"
            //     });


            //     //these are 2 views which we will add inside our container
            //     var oView1 = new sap.ui.view({
            //         id:"idView1",
            //         viewName: "ey.ap.acc.view.View1",
            //         type: "XML"
            //     });

            //     var oView2 = new sap.ui.view({
            //         id:"idView2",
            //         viewName: "ey.ap.acc.view.View2",
            //         type: "XML"
            //     });
                
            //     var oEmpty = new sap.ui.view({
            //         id:"idEmpty",
            //         viewName: "ey.ap.acc.view.Empty",
            //         type: "XML"
            //     });

            //     //get the app container control from the root view
            //     var oAppCon = oRootView.byId("appCon");

            //     //add our views inside the container to encapsulate
            //     oAppCon.addMasterPage(oView1);
            //     oAppCon.addDetailPage(oEmpty).addDetailPage(oView2);

            //     return oRootView;

            // },
            destroy: function(){

            }


        });
    }
);