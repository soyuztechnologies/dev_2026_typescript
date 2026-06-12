import BaseController from "./BaseController";
import UIComponent from "sap/ui/core/UIComponent";
import Router from "sap/m/routing/Router";
import { Route$MatchedEvent } from "sap/ui/core/routing/Route";
import Input from "sap/m/Input";
import SelectDialog from "sap/m/SelectDialog";

/**
 * @namespace com.ats.manageorder.controller
 */
export default class View2 extends BaseController {
    private oRouter: Router;
    private oField?: Input;
    private oSupplierPopup?: SelectDialog;
    private oCityPopup?: SelectDialog;

    public override onInit(): void {
        this.oRouter =
          (this.getOwnerComponent() as UIComponent)
            .getRouter() as Router;
        this.oRouter.getRoute("spiderman")
          ?.attachMatched(this.herculis, this);
    }

    private herculis(oEvent: Route$MatchedEvent): void {
        const oView2 = this.getView()!;
        const sIndex =
          (oEvent.getParameter("arguments") as { orderId: string }).orderId;
        oView2.bindElement({ path: "/" + sIndex, model: "orders" });
    }
    // ...onFilter / onF4Help / onPopupSelect
}