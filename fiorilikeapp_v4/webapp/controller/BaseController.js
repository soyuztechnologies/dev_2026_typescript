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