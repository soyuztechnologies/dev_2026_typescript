import BaseController from "./BaseController";
import MessageBox from "sap/m/MessageBox";
import MessageToast from "sap/m/MessageToast";
import JSONModel from "sap/ui/model/json/JSONModel";
import UIComponent from "sap/ui/core/UIComponent";
import Router from "sap/m/routing/Router";
import Table from "sap/m/Table";
import {
    NewSalesOrder,
    SalesOrder,
    SalesOrderItem,
    CreateOrderResponse,
    ODataError
} from "../types/datatype";

/**
 * @namespace com.ats.manageorder.controller
 */
export default class Add extends BaseController {
    private oRouter: Router;

    public override onInit(): void {
        // here we need the router object - get it from our Component
        this.oRouter =
            (this.getOwnerComponent() as UIComponent).getRouter() as Router;
        // whenever the add route is hit, start with a fresh empty order
        this.oRouter.getRoute("addOrder")?.attachMatched(this.resetForm, this);
    }

    private resetForm(): void {
        // default payload mirrors the demo order; typed as NewSalesOrder (no id yet)
        const oNewOrder: NewSalesOrder = {
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
        this.getView()?.setModel(new JSONModel(oNewOrder), "newOrder");
    }

    public onAddItem(): void {
        // add a new empty item row to the table
        const oModel = this.getView()?.getModel("newOrder") as JSONModel;
        const aItems = oModel.getProperty("/items") as SalesOrderItem[];
        aItems.push({
            salesOrderItem: "",
            material: "",
            requestedQuantity: "",
            requestedQuantityUnit: ""
        });
        oModel.setProperty("/items", aItems);
    }

    public onDeleteItem(): void {
        // Step 1: get the selected row of the items table
        const oTable = this.getView()?.byId("idNewItems") as Table;
        const oItem = oTable.getSelectedItem();
        if (!oItem) {
            MessageToast.show("Please select an item to delete.");
            return;
        }
        // Step 2: find the index of the row inside the items array
        const sPath = oItem.getBindingContext("newOrder")!.getPath();
        const iIndex = parseInt(sPath.split("/").pop()!, 10);
        // Step 3: remove that row and refresh the binding
        const oModel = this.getView()?.getModel("newOrder") as JSONModel;
        const aItems = oModel.getProperty("/items") as SalesOrderItem[];
        aItems.splice(iIndex, 1);
        oModel.setProperty("/items", aItems);
    }

    public onSave(): void {
        // collect the order data the user entered (input shape, no id yet)
        const oOrder = (this.getView()!
            .getModel("newOrder") as JSONModel).getData() as NewSalesOrder;

        // POST to the CAP action createSalesOrder(order: SalesOrderInput)
        fetch("/odata/v4/catalog/createSalesOrder", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ order: oOrder })
        })
        .then(async (oResponse: Response) => {
            // read body together with the http status so we can show S/4 errors
            const body = await oResponse.json();
            return { ok: oResponse.ok, body };
        })
        .then((oResult: { ok: boolean; body: CreateOrderResponse & ODataError }) => {
            if (!oResult.ok) {
                const sMsg = oResult.body?.error?.message ?? "Create failed.";
                MessageBox.error(sMsg);
                return;
            }
            MessageToast.show(`Sales order ${oResult.body.salesOrder} created.`);

            // put the freshly created order at the top of the shared list
            const oOrdersModel = (this.getOwnerComponent() as UIComponent)
                .getModel("orders") as JSONModel;
            const aOrders: SalesOrder[] =
                Array.isArray(oOrdersModel.getData()) ? oOrdersModel.getData() : [];
            aOrders.unshift(oResult.body);
            oOrdersModel.setData(aOrders);

            // open the new order in front of the user - it is now at index 0
            this.oRouter.navTo("spiderman", { orderId: 0 });
        })
        .catch((oError: Error) => {
            MessageBox.error("Create failed: " + oError.message);
        });
    }

    public onCancel(): void {
        // leave the create screen without saving
        this.oRouter.navTo("leftSide");
    }
}