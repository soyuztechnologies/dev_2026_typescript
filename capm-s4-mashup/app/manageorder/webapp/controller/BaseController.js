sap.ui.define(
    ["sap/ui/core/mvc/Controller",
     "com/ats/manageorder/util/formatter"
    ],
    function (Controller, Formatter) {
        return Controller.extend("com.ats.manageorder.controller.BaseController", {
            formatter: Formatter
            // here we can define some common methods which will be used in all controllers
        });
    }
)