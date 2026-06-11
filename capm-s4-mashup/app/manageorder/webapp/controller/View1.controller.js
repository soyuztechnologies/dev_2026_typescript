sap.ui.define(
    ["com/ats/manageorder/controller/BaseController",
     "sap/m/MessageBox",
     "sap/m/MessageToast",
     "sap/ui/model/Filter",
     "sap/ui/model/FilterOperator",
     "sap/ui/model/json/JSONModel"
    ],
    function (BaseController, MessageBox, MessageToast, Filter, FilterOperator, JSONModel) {
        return BaseController.extend("com.ats.manageorder.controller.View1", {
            onInit: function () {
                //here we need router object - get it from our Component.js
                this.oRouter = this.getOwnerComponent().getRouter();
                //create a JSON model to hold the sales orders coming from getSalesOrders
                //set it on the component so the detail view (View2) reads the same data
                this.getOwnerComponent().setModel(new JSONModel(), "orders");
                //load the orders when the app starts
                this.getSalesOrders();
            },
            getSalesOrders: function () {
                var that = this;
                //call the unbound function getSalesOrders exposed by the CAP service (see srv/tester.http)
                fetch("/odata/v4/catalog/getSalesOrders()", {
                    headers: { "Accept": "application/json" }
                })
                .then(function (oResponse) {
                    return oResponse.json();
                })
                .then(function (oData) {
                    //OData V4 returns the collection inside the "value" property
                    that.getOwnerComponent().getModel("orders").setData(oData.value || []);
                })
                .catch(function (oError) {
                    MessageBox.error("Unable to load sales orders: " + oError.message);
                });
            },
            onAdd: function (){
                //navigate to the Add view to create a brand new sales order
                this.oRouter.navTo("addOrder");
            },
            onSearch: function(oEvent){
                //Step 1: here we will extract the query parameter
                var searchStr = oEvent.getParameter("query");
                //Step 2: construct the filter condition
                var oFilter1 = new Filter("salesOrder", FilterOperator.Contains, searchStr);
                var oFilter2 = new Filter("salesOrderType", FilterOperator.Contains, searchStr);
                //Step 3: Put condition in an array
                var aFilter = [oFilter1, oFilter2];
                //Step: Now going to tell computer to use OR operator for filter
                var oFilter = new Filter({
                    filters: aFilter,
                    and: false
                });
                //Step 4: get the list control object
                var oList = this.getView().byId("idList");
                //Step 5: Inject the filter inside the binding of items to filter items
                oList.getBinding("items").filter(oFilter);
            },
            onItemPress: function(oEvent){
                //Step 1: get the object of the listItem on which user clicked
                var oListItem = oEvent.getParameter("listItem");
                //Step 2: Get the path of the element inside the orders model e.g. /3
                var sPath = oListItem.getBindingContext("orders").getPath();
                //extract the index from path e.g. inp = /3 => ["","3"] ==> 3
                var sIndex = sPath.split("/")[sPath.split("/").length - 1];
                //Step 3: Navigate to the detail view passing the index of the selected order
                this.oRouter.navTo("spiderman",{
                    orderId: sIndex
                });
            }


        });
    }
);
