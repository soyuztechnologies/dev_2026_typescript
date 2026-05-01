/**
 * @file Empty.controller.ts
 * @namespace ats.mm.product.controller
 *
 * SAP UI5 Empty Controller - TypeScript Version
 * ==============================================
 * Controller for the INITIAL DETAIL VIEW: Empty.view.xml.
 *
 * In a SAP UI5 SplitApp (master-detail layout), the detail area
 * must always show SOMETHING - it cannot be blank.
 *
 * The Empty view is a PLACEHOLDER that is shown in the detail area
 * when no fruit has been selected yet (initial state of the app).
 *
 * USER FLOW:
 *   1. App opens → SplitApp shows:
 *      Master (left):  View1 - Fruit List
 *      Detail (right): Empty - "Please select a fruit to see details"
 *
 *   2. User selects a fruit in View1 →
 *      Router navigates to 'spiderman' route →
 *      Detail area shows View2 (Fruit Details)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * This controller is intentionally empty.
 * If the Empty view needs a message, button, or image in the future,
 * add handler methods here.
 *
 * Example enhancement:
 *   public onNavigateToFirstFruit(): void {
 *     const oRouter = this.getOwnerComponent()!.getRouter();
 *     oRouter.navTo("spiderman", { fruitId: "0" });
 *   }
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * JAVASCRIPT (old):
 *   sap.ui.define(["ats/mm/product/controller/BaseController"],
 *     function(BaseController) {
 *       return BaseController.extend("ats.mm.product.controller.Empty", {});
 *     }
 *   );
 */
import BaseController from "ats/mm/product/controller/BaseController";

/**
 * @namespace ats.mm.product.controller
 */

/**
 * Empty Controller Class - Placeholder for the initial detail view.
 *
 * TYPESCRIPT NOTE: An empty class with 'extends' is perfectly valid.
 * TypeScript does NOT require you to add members to a class.
 * The class still inherits everything from BaseController and Controller.
 */
export default class Empty extends BaseController {
    // Placeholder controller for the initial detail view.
    // Add event handler methods here if the Empty view needs interactivity.
}
