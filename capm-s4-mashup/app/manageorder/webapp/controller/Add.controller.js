sap.ui.define(
    ["com/ats/manageorder/controller/BaseController",
     "sap/m/MessageBox",
     "sap/m/MessageToast",
     "sap/ui/model/json/JSONModel"
    ],
    function (BaseController, MessageBox, MessageToast, JSONModel) {
        return BaseController.extend("com.ats.manageorder.controller.Add", {
            onInit: function () {
                //here we need router object - get it from our Component.js
                this.oRouter = this.getOwnerComponent().getRouter();
                //whenever the add route is hit, start with a fresh empty order
                this.oRouter.getRoute("addOrder").attachMatched(this.resetForm, this);
            },
            resetForm: function () {
                //default payload mirrors srv/tester.http so the demo can be saved as-is
                var oNewOrder = {
                    salesOrderType: "TA",
                    salesOrganization: "BMGB",
                    distributionChannel: "DB",
                    organizationDivision: "AC",
                    salesDistrict: "000001",
                    soldToParty: "49",
                    salesOrderDate: "2026-04-06",
                    items: [
                        {
                            salesOrderItem: "10",
                            material: "220",
                            requestedQuantity: "5",
                            requestedQuantityUnit: "PCE"
                        }
                    ]
                };
                this.getView().setModel(new JSONModel(oNewOrder), "newOrder");
            },
            onAddItem: function () {
                //add a new empty item row to the table
                var oModel = this.getView().getModel("newOrder");
                var aItems = oModel.getProperty("/items");
                aItems.push({
                    salesOrderItem: "",
                    material: "",
                    requestedQuantity: "",
                    requestedQuantityUnit: ""
                });
                oModel.setProperty("/items", aItems);
            },
            onDeleteItem: function () {
                //Step 1: get the selected row of the items table
                var oTable = this.getView().byId("idNewItems");
                var oItem = oTable.getSelectedItem();
                if (!oItem) {
                    MessageToast.show("Please select an item to delete.");
                    return;
                }
                //Step 2: find the index of the row inside the items array
                var sPath = oItem.getBindingContext("newOrder").getPath();
                var iIndex = parseInt(sPath.split("/")[sPath.split("/").length - 1], 10);
                //Step 3: remove that row and refresh the binding
                var oModel = this.getView().getModel("newOrder");
                var aItems = oModel.getProperty("/items");
                aItems.splice(iIndex, 1);
                oModel.setProperty("/items", aItems);
            },
            onSave: function () {
                var that = this;
                //collect the order data the user entered
                var oOrder = this.getView().getModel("newOrder").getData();
                //POST to the CAP action createSalesOrder(order: SalesOrderInput) - see srv/tester.http
                fetch("/odata/v4/catalog/createSalesOrder", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({ order: oOrder })
                })
                .then(function (oResponse) {
                    //read the body together with the http status so we can show S/4 errors
                    return oResponse.json().then(function (oData) {
                        return { ok: oResponse.ok, body: oData };
                    });
                })
                .then(function (oResult) {
                    if (!oResult.ok) {
                        var sMsg = (oResult.body && oResult.body.error && oResult.body.error.message) || "Create failed.";
                        MessageBox.error(sMsg);
                        return;
                    }
                    MessageToast.show("Sales order " + oResult.body.salesOrder + " created.");
                    //put the freshly created order at the top of the shared list
                    var oOrdersModel = that.getOwnerComponent().getModel("orders");
                    var aOrders = oOrdersModel.getData();
                    if (!Array.isArray(aOrders)) {
                        aOrders = [];
                    }
                    aOrders.unshift(oResult.body);
                    oOrdersModel.setData(aOrders);
                    //open the new order in front of the user - it is now at index 0
                    that.oRouter.navTo("spiderman", { orderId: 0 });
                })
                .catch(function (oError) {
                    MessageBox.error("Create failed: " + oError.message);
                });
            },
            onCancel: function () {
                //leave the create screen without saving
                this.oRouter.navTo("leftSide");
            }
        });
    }
);
