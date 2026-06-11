sap.ui.define(
    ["com/ats/manageorder/controller/BaseController",
     "sap/m/MessageBox",
     "sap/m/MessageToast",
     "sap/ui/core/Fragment",
     "sap/ui/model/FilterOperator",
     "sap/ui/model/Filter"
    ], 
    function (BaseController, MessageBox, MessageToast, Fragment, FilterOperator, Filter) {
        return BaseController.extend("com.ats.manageorder.controller.View2", {
            onInit: function(){
                this.oRouter = this.getOwnerComponent().getRouter();
                //we have to explicitly pass the object of the controller class
                this.oRouter.getRoute("spiderman").attachMatched(this.herculis, this)
            },
            //In the herculis function, we cannot access 'this' pointer as the object of the controller
            //To get the object of Controller in this pointer, we need to pass it explicitly
            herculis: function(oEvent){
                //here we can get the view2 object
                var oView2 = this.getView();
                //prepare the path using the index of the selected order
                var sIndex = oEvent.getParameter("arguments").orderId;
                //bind the detail view to the selected order inside the "orders" model
                oView2.bindElement({
                    path: "/" + sIndex,
                    model: "orders"
                });
                //debugger;
            },
            oField: null,
            oSupplierPopup: null,
            oCityPopup: null,
            onFilter: function(){
                //So if the fragment object is not there, then create it
                //Else, just open
                //When in ABAP we have a PBO - IF lo_alv IS NOT BOUND
                if(!this.oSupplierPopup){
                    //load - is a promise
                    //Option 2: Create a local variable where you hold the controller object
                    var that = this;
                    Fragment.load({
                        id: 'supplier',
                        name: 'com.ats.manageorder.fragments.popup',
                        type: 'XML',
                        controller: this
                    })
                    //handle once the promise is fulfilled
                    .then(
                        //promise function
                        function(oFragment){
                            debugger;
                            //here we will not have access to controller object via this
                            //so to get the this variable as our controller object, we have to pass it
                            //We can access any local variable inside the event handler
                            that.oSupplierPopup = oFragment;
                            //Set multi select only for supplier
                            that.oSupplierPopup.setMultiSelect(true);
                            //Change the title
                            that.oSupplierPopup.setTitle("Choose Supplier(s)");
                            //Now we bind the items aggregation of our popup
                            that.oSupplierPopup.bindAggregation("items",{
                                path: '/supplier',
                                template: new sap.m.StandardListItem({
                                    description: '{city}',
                                    title: '{name}',
                                    icon: 'sap-icon://supplier'
                                })
                            });
                            //Allow the access of model (liver, heart) to fragment(parasite) through view (immune system)
                            that.getView().addDependent(that.oSupplierPopup);
                            that.oSupplierPopup.open();
                        }
                        //Option 1: .bind(this)
                        //in bind(this) we are explicitly passing the controller object to the promise function
                        //so inside the promise function 'this' pointer can access our controller object
                    );
                    
                }else{
                     this.oSupplierPopup.open();
                }
                //MessageBox.confirm("This functionality is under construction 👍");
                
            },
            onF4Help: function(oEvent){
                ///Take the object of the field on which F4 was pressed
                this.oField = oEvent.getSource();
                //So if the fragment object is not there, then create it
                //Else, just open
                //When in ABAP we have a PBO - IF lo_alv IS NOT BOUND
                if(!this.oCityPopup){
                    //load - is a promise
                    //Option 2: Create a local variable where you hold the controller object
                    var that = this;
                    Fragment.load({
                        id: 'cities',
                        name: 'com.ats.manageorder.fragments.popup',
                        type: 'XML',
                        controller: this
                    })
                    //handle once the promise is fulfilled
                    .then(
                        //promise function
                        function(oFragment){
                            debugger;
                            //here we will not have access to controller object via this
                            //so to get the this variable as our controller object, we have to pass it
                            //We can access any local variable inside the event handler
                            that.oCityPopup = oFragment;
                            //Change the title
                            that.oCityPopup.setTitle("Choose City");
                            //Now we bind the items aggregation of our popup
                            that.oCityPopup.bindAggregation("items",{
                                path: '/cities',
                                template: new sap.m.StandardListItem({
                                    description: '{famousFor}',
                                    title: '{name}',
                                    icon: 'sap-icon://home'
                                })
                            });
                            //Allow the access of model (liver, heart) to fragment(parasite) through view (immune system)
                            that.getView().addDependent(that.oCityPopup);
                            that.oCityPopup.open();
                        }
                        //Option 1: .bind(this)
                        //in bind(this) we are explicitly passing the controller object to the promise function
                        //so inside the promise function 'this' pointer can access our controller object
                    );
                    
                }else{
                     this.oCityPopup.open();
                }
                //MessageBox.confirm("This functionality is under construction 👍");
                
            },
            onPopupSelect: function(oEvent){
                //get the id of the object
                var sId = oEvent.getSource().getId();
                if (sId.indexOf("cities") != -1){
                    //Step 1: get the selected item
                    var oSelectedItem = oEvent.getParameter("selectedItem");
                    //Step 2 : get the title value from standard list item
                    var sTitle = oSelectedItem.getTitle();
                    //Step 2: Set the value to the field inside the table
                    this.oField.setValue(sTitle);
                }else{
                    //Step 1: get all the selected supplier objects
                    var aSuppliers = oEvent.getParameter("selectedItems");
                    var aFilters = [];
                    //Step 2: loop over each and create a filter
                    aSuppliers.forEach(function(item){
                        var sTitle = item.getTitle();
                        var oFilter = new Filter("name", FilterOperator.EQ, sTitle);
                        aFilters.push(oFilter);
                    });
                    //Step 3: Make the filter as OR filter
                    var oMainFilter = new Filter({
                        filters: aFilters,
                        and: false
                    });
                    //Get the supplier table object
                    var oTable = this.getView().byId("idSupplierTab");
                    //Inject the filter to table ites
                    oTable.getBinding("items").filter(oMainFilter);
                }
                
            },
            //code for fragment event is written who is inviting the fragment
            //we embed the fragment in v2, hence the code is written in v2 ka controller
            onTry: function(){
                MessageBox.confirm("aa gaya");
            },
            onSelectSupplier: function(oEvent){
                //Step 1: get the item
                var oListItem = oEvent.getParameter("listItem");
                //Step 2: Get the path of the element
                var sPath = oListItem.getBindingContextPath();
                console.log(sPath);
                //extract the index from path e.g. inp = /fruits/3 => ["fruits","3"] ==> 3
                var sIndex = sPath.split("/")[sPath.split("/").length - 1];
                //Router to navigate to view3
                this.oRouter.navTo("superman",{
                    supplierId : sIndex
                });
            },
            onBack: function (){
                //navigate back to the master list of orders
                this.oRouter.navTo("leftSide");
            },
            onSave: function (){
                MessageBox.confirm("Are you happy with Anubhav Trainings?",{
                    title: "Happiness Survey",
                    onClose: function (sAction){
                        if (sAction === "OK"){
                            MessageToast.show("Thank you for your feedback!");
                        } else {
                            MessageBox.error("We are sorry to hear that you are not happy with us. Please let us know how we can improve.");
                        }
                    }
                });
            }

        });
    }
);