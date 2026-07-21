sap.ui.define(
    //while we add dependencies, use module name
    [
        "ey/ap/acc/controller/BaseController",
        "sap/m/MessageBox",
        "sap/m/MessageToast",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator"
    ], 
    function(BaseController, MessageBox, MessageToast, Filter, FilterOperator){
        return BaseController.extend("ey.ap.acc.controller.MachineComponents",{
            onInit: function(){

                this.getRouter().getRoute("superman").attachMatched(this.herculis, this);

            },
            onTabSelect: function(oEvent){
                var key = oEvent.getParameter("selectedKey");
                var oTableBinding = this.getView().byId("idMachineComponentsTable").getBinding("items");
                switch (key) {
                    case "all":
                        oTableBinding.filter([]);
                        break;
                    case "cheaper":
                        oTableBinding.filter([
                            new Filter({
                                path: "component",
                                operator: FilterOperator.Any,
                                variable: "c",
                                condition : new Filter("c/quantity", FilterOperator.LT, 1.5)
                            })
                        ]);
                        
                        break;
                    case "expensive":
                         oTableBinding.filter([
                            new Filter({
                                path: "component",
                                operator: FilterOperator.All,
                                variable: "c",
                                condition : new Filter("c/quantity", FilterOperator.GT, 1.5)
                            })
                        ]);
                        break;
                    default:
                        break;
                }
            },
            //Route matched handler function which triggers
            //The route can change manually, browser back-forward button, when user select fruit, user reload ui.
            herculis: function(oEvent){
                // debugger;
                //here this - will never point to your controller class object
                // so in order to use this as a object of controller we have to pass while calling it - attachMatched(this.herculis, this);
                
                //step 1: extract the index of selected fruit
                var sIndex = oEvent.getParameter("arguments").zkas;
                //step 2: rebuild the element path
                var sPath = "/" + sIndex;
                //Step 3: bind element with view
                this.getView().bindElement(sPath,{
                    $expand: {
                        'operation' : {
                            $filter : 'status eq \'OPEN\''
                        }
                    }
                });


            },
            onBack: function(){

                //step 1: get the parent control
                var oAppCon = this.getView().getParent();
                //step 2: container have the power to navigate to 2nd child
                oAppCon.to("idView1");

            },
            onSave: function(){
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
            },
            onClear: function(){

            }

        });
    }
);