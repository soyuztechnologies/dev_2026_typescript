/**
 * @file App.controller.ts
 * @namespace ats.mm.product.controller
 *
 * SAP UI5 App Controller - TypeScript Version
 * ============================================
 * This is the controller for the ROOT VIEW: App.view.xml.
 *
 * App.view.xml typically contains the SplitApp control (or NavContainer)
 * which hosts all master and detail views.
 *
 * WHY IS THIS CONTROLLER EMPTY?
 * The App controller is intentionally empty because:
 *   1. The SplitApp layout manages its own master/detail navigation
 *   2. View-specific logic lives in View1, View2, View3 controllers
 *   3. App.view.xml serves purely as a layout container
 *   4. All shared logic is in BaseController (formatter, etc.)
 *
 * If you need app-level event handling (e.g., side navigation toggle,
 * global search, header button events), add methods here.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * INHERITANCE CHAIN for this controller:
 *
 *   Controller (sap.ui.core.mvc)
 *     └── BaseController (our custom base)
 *           └── App  ← THIS CLASS
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * JAVASCRIPT (old):
 *   sap.ui.define(["ats/mm/product/controller/BaseController"],
 *     function(BaseController) {
 *       return BaseController.extend("ats.mm.product.controller.App", {});
 *     }
 *   );
 *
 * TYPESCRIPT (new):
 *   import BaseController from "ats/mm/product/controller/BaseController";
 *   export default class App extends BaseController {}
 *
 * NOTE: Even an empty TypeScript class with 'extends' inherits everything:
 *   - this.formatter         (from BaseController)
 *   - this.getView()         (from Controller)
 *   - this.getOwnerComponent() (from Controller)
 *   - All lifecycle methods: onInit, onExit, onBeforeRendering, onAfterRendering
 */

/**
 * Import BaseController - our project's common base class.
 * TypeScript resolves: "ats/mm/product/controller/BaseController"
 *   → ./webapp/controller/BaseController.ts (via tsconfig.json paths)
 */
import BaseController from "ats/mm/product/controller/BaseController";

/**
 * @namespace ats.mm.product.controller
 *
 * Required annotation for SAP UI5 TypeScript class registry.
 */

/**
 * App Controller Class
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * SYNTAX: export default class ClassName extends ParentClass { }
 *
 * This class body is INTENTIONALLY EMPTY ('{ }').
 * In TypeScript, an empty class body is valid and just inherits from parent.
 *
 * SAP UI5 manifest.json links this class to App.view.xml:
 *   "rootView": {
 *     "viewName": "ats.mm.product.view.App",
 *     "type": "XML",
 *     "controllerName": "ats.mm.product.controller.App"
 *   }
 *
 * TYPESCRIPT FACT: Even without declaring any members,
 * the 'App' class has full access to inherited members:
 *   this.formatter → from BaseController.formatter
 *   this.getView() → from Controller.getView()
 */
export default class App extends BaseController {
    // App-level event handlers can be added here if needed.
    // Currently empty - all layout management is handled by
    // the SplitApp control in App.view.xml and child controllers.
}
