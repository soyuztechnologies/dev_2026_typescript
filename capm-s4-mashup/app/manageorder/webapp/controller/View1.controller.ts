import BaseController from "./BaseController";
import MessageBox from "sap/m/MessageBox";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import JSONModel from "sap/ui/model/json/JSONModel";
import UIComponent from "sap/ui/core/UIComponent";
import Router from "sap/m/routing/Router";
import List from "sap/m/List";
import ListBinding from "sap/ui/model/ListBinding";
import { SalesOrdersResponse } from "../types/datatype";
import { SearchField$SearchEvent } from "sap/m/SearchField";
import { ListBase$SelectionChangeEvent } from "sap/m/ListBase";

/**
 * @namespace com.ats.manageorder.controller
 */
export default class View1 extends BaseController {
    private oRouter: Router;

    public override onInit(): void {
        // here we need the router object - get it from our Component
        this.oRouter =
            (this.getOwnerComponent() as UIComponent).getRouter() as Router;
        // create a JSON model to hold the sales orders, shared with View2
        (this.getOwnerComponent() as UIComponent)
            .setModel(new JSONModel(), "orders");
        // load the orders when the app starts
        this.getSalesOrders();
    }

    public getSalesOrders(): void {
        fetch("/odata/v4/catalog/getSalesOrders()", {
            headers: { Accept: "application/json" }
        })
        .then((oResponse: Response) => oResponse.json())
        .then((oData: SalesOrdersResponse) => {
            const oModel = (this.getOwnerComponent() as UIComponent)
                .getModel("orders") as JSONModel;
            oModel.setData(oData.value || []);
        })
        .catch((oError: Error) => {
            MessageBox.error(
                "Unable to load sales orders: " + oError.message);
        });
    }

    public onAdd(): void {
        // navigate to the Add view to create a brand new sales order
        this.oRouter.navTo("addOrder");
    }

    public onSearch(oEvent: SearchField$SearchEvent): void {
        // Step 1: extract the query parameter
        const searchStr = oEvent.getParameter("query") ?? "";
        // Step 2: construct the filter conditions
        const oFilter1 = new Filter("salesOrder", FilterOperator.Contains, searchStr);
        const oFilter2 = new Filter("salesOrderType", FilterOperator.Contains, searchStr);
        // Step 3: combine with OR
        const oFilter = new Filter({ filters: [oFilter1, oFilter2], and: false });
        // Step 4: get the list and inject the filter
        const oList = this.getView()?.byId("idList") as List;
        (oList.getBinding("items") as ListBinding)?.filter(oFilter);
    }

    public onItemPress(oEvent: ListBase$SelectionChangeEvent): void {
        // get the clicked list item and its binding path e.g. /3
        const oListItem = oEvent.getParameter("listItem");
        const sPath = oListItem!.getBindingContext("orders")!.getPath();
        const aParts = sPath.split("/");
        const sIndex = aParts[aParts.length - 1];
        // navigate to the detail view passing the selected order index
        this.oRouter.navTo("spiderman", { orderId: sIndex });
    }
}