sap.ui.define(
    ["com/ats/manageorder/controller/BaseController",
     "sap/m/MessageBox",
     "sap/m/MessageToast",
    "sap/ui/core/routing/History"], 
    function (BaseController, MessageBox, MessageToast, History) {
        return BaseController.extend("com.ats.manageorder.controller.View3", {
            onInit: function(){
                this.oRouter = this.getOwnerComponent().getRouter();
                //we have to explicitly pass the object of the controller class
                this.oRouter.getRoute("superman").attachMatched(this.herculis, this)
            },
            //In the herculis function, we cannot access 'this' pointer as the object of the controller
            //To get the object of Controller in this pointer, we need to pass it explicitly
            herculis: function(oEvent){
                //here we can get the view2 object
                var oView3 = this.getView();
                //prepare the path using the index
                var sIndex = oEvent.getParameter("arguments").supplierId;
                var sPath = "/supplier/" + sIndex;
                oView3.bindElement(sPath);
                //debugger;
            },
            onBack: function () {
                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();

                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("", {}, true);
                }
            }
            // onBack: function (){
            //     //TODO: Implement navigation to View1 
            //     //calling mother
            //     var oAppCon = this.getView().getParent();
            //     //navigate to view1
            //     oAppCon.to("idView1");
            // }

        });
    }
);