sap.ui.define(
    //while we add dependencies, use module name
    [
        "ey/ap/acc/controller/BaseController"
    ], 
    function(BaseController){
        return BaseController.extend("ey.ap.acc.controller.Empty",{

            onInit: function(){
                //debugger;
                //this.getOwnerComponent().getManifest()
                //this.getOwnerComponent().getModel()
            },  


        });
    }
);