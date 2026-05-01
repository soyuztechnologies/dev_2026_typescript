/**
 * @file View3.controller.ts
 * @namespace ats.mm.product.controller
 *
 * SAP UI5 View3 Controller (Supplier Detail View) - TypeScript Version
 * =====================================================================
 * This controller manages the SUPPLIER DETAIL VIEW shown when a user
 * selects a supplier from the supplier table in View2.
 *
 * RESPONSIBILITIES:
 *   - Initialize router and attach 'superman' route handler (onInit)
 *   - Bind the selected supplier's data to the view (herculis)
 *   - Navigate back to the previous view using browser history (onBack)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TYPESCRIPT CONCEPTS INTRODUCED IN THIS FILE:
 * ─────────────────────────────────────────────────────────────────────────────
 *   1. Custom interface for route arguments (ISupplierRouteArguments)
 *   2. History API usage with typed return value (string | undefined)
 *   3. Browser History API via 'window.history' (typed in 'DOM' lib)
 *   4. Conditional navigation logic with TypeScript type guards
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * NAVIGATION FLOW:
 *   View1 (Fruit List)
 *     ↓ user selects a fruit
 *   View2 (Fruit Details + Supplier Table)
 *     ↓ user selects a supplier
 *   View3 (Supplier Details)  ← THIS VIEW
 *     ↓ user clicks Back
 *   View2 (or browser history back)
 */

import BaseController from "ats/mm/product/controller/BaseController";
import UIComponent from "sap/ui/core/UIComponent";

/**
 * MessageBox and MessageToast are imported for potential future use.
 * Currently View3 doesn't use them, but they're kept to match
 * the original JavaScript file's dependencies.
 *
 * TypeScript IMPORTANT: Unused imports are flagged as warnings/errors
 * when 'noUnusedLocals: true' is set in tsconfig.json.
 * We keep them commented out below to maintain parity with original code.
 * Uncomment if you add functionality that needs them.
 */
// import MessageBox from "sap/m/MessageBox";
// import MessageToast from "sap/m/MessageToast";

/**
 * History: SAP UI5's browser history tracking utility.
 *
 * SAP UI5 maintains its OWN history stack (separate from the browser's history)
 * because SAP UI5 apps use URL hash-based routing (#route).
 * The browser's history API doesn't differentiate between hash changes.
 *
 * History.getInstance() → returns the singleton History instance
 * History.getPreviousHash() → returns the previous URL hash, or undefined
 *   if there is no previous hash (user opened the app directly on this view)
 */
import History from "sap/ui/core/routing/History";

import Router from "sap/ui/core/routing/Router";
import Event from "sap/ui/base/Event";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * INTERFACE: ISupplierRouteArguments
 * ─────────────────────────────────────────────────────────────────────────────
 * Typed interface for the 'superman' route parameters.
 *
 * Route pattern in manifest.json: "supplier/{supplierId}"
 * When URL is: #supplier/4
 * Route arguments: { supplierId: "4" }
 *
 * Same pattern as IFruitRouteArguments in View2.controller.ts.
 * Interfaces are defined per-file (not shared) because each has different properties.
 */
interface ISupplierRouteArguments {
    supplierId: string;
}

/**
 * @namespace ats.mm.product.controller
 */

/**
 * View3 Controller - Supplier Detail View
 */
export default class View3 extends BaseController {

    /**
     * oRouter: Cached reference to the application Router.
     * SYNTAX: private oRouter!: Router;
     * '!' → definite assignment assertion (assigned in onInit before use)
     */
    private oRouter!: Router;

    /**
     * onInit() - Initialize Router and Attach Route Match Handler
     * ─────────────────────────────────────────────────────────────────────────
     *
     * Identical pattern to View2.onInit() but for the 'superman' route.
     * The 'superman' route pattern is: "supplier/{supplierId}"
     */
    public override onInit(): void {
        this.oRouter = (this.getOwnerComponent() as UIComponent).getRouter();

        /**
         * Attach 'herculis' as the handler when URL matches "supplier/{supplierId}".
         *
         * 'getRoute("superman")!'
         *   - getRoute() returns Route | undefined (the route might not exist)
         *   - '!' non-null assertion: we KNOW "superman" is defined in manifest.json
         *
         * 'attachMatched(this.herculis, this)'
         *   - First 'this': reference to the herculis method
         *   - Second 'this': the context in which herculis will run (this controller)
         *
         * Without the second 'this', inside herculis:
         *   this.getView() → ERROR: "this is undefined" (in strict mode)
         */
        this.oRouter.getRoute("superman")!.attachMatched(this.herculis, this);
    }

    /**
     * herculis() - Route Match Handler for 'superman' Route
     * ─────────────────────────────────────────────────────────────────────────
     *
     * Called automatically by the Router when URL matches "supplier/{supplierId}".
     * Binds the view to the specific supplier element in the JSONModel.
     *
     * ELEMENT BINDING EXPLANATION:
     * ─────────────────────────────────────────────────────────────────────────
     * After bindElement("/supplier/4"):
     *   All controls with relative binding paths in View3.view.xml will show
     *   the supplier at index 4 from the JSONModel.
     *
     *   XML: <Text text="{name}"/>       → shows supplier[4].name
     *   XML: <Text text="{city}"/>       → shows supplier[4].city
     *   XML: <Text text="{contactNo}"/>  → shows supplier[4].contactNo
     *
     * @param oEvent - Route match event with 'arguments' parameter
     */
    public herculis(oEvent: Event<Record<string, unknown>>): void {
        const oView3 = this.getView()!;

        /**
         * TYPE-SAFE ROUTE ARGUMENT ACCESS
         * ─────────────────────────────────────────────────────────────────────
         * Same pattern as View2.herculis() but using ISupplierRouteArguments.
         *
         * oEvent.getParameter("arguments") returns unknown type.
         * 'as ISupplierRouteArguments' → type assertion gives us typed access.
         *
         * oArgs.supplierId → TypeScript knows this is a string (from the interface)
         */
        const oArgs = oEvent.getParameter("arguments") as ISupplierRouteArguments;
        const sIndex: string = oArgs.supplierId;

        // Build the JSONModel path for this supplier
        const sPath: string = "/supplier/" + sIndex;

        // Bind the entire view to this supplier's data
        oView3.bindElement(sPath);
    }

    /**
     * onBack() - Smart Back Navigation Using SAP UI5 History
     * ─────────────────────────────────────────────────────────────────────────
     *
     * This implements a SMART BACK BUTTON that handles two scenarios:
     *
     * SCENARIO 1: User navigated TO this view from within the app (normal flow)
     *   → sPreviousHash is defined (e.g., "#fruits/3")
     *   → Use browser's window.history.go(-1) to go back
     *   → This preserves the scroll position and state of the previous view
     *
     * SCENARIO 2: User bookmarked or directly opened this view URL
     *   → sPreviousHash is undefined (no previous hash in SAP UI5's history)
     *   → Cannot go back (there's nothing to go back to)
     *   → Fall back: navigate to the default route ("leftSide" - shows View1)
     *
     * This is a BEST PRACTICE in SAP UI5 for back navigation.
     * Always use History to check if there's actually something to go back to.
     */
    public onBack(): void {

        /**
         * History.getInstance()
         * ─────────────────────────────────────────────────────────────────────
         * SINGLETON PATTERN: History has only ONE instance for the entire app.
         * getInstance() returns that single shared instance.
         *
         * TYPESCRIPT: History.getInstance() return type is History (the class itself)
         * We annotate 'oHistory' as type History to enable IDE autocomplete
         * for History's methods: getPreviousHash(), getHistoryLength(), etc.
         */
        const oHistory: History = History.getInstance();

        /**
         * getPreviousHash()
         * ─────────────────────────────────────────────────────────────────────
         * Returns the URL hash of the PREVIOUS navigation step.
         *
         * TYPESCRIPT RETURN TYPE: string | undefined
         * - string    → there IS a previous page (user navigated here from within app)
         * - undefined → NO previous page (user opened this URL directly/bookmarked)
         *
         * SYNTAX: const variableName: string | undefined = ...;
         *
         * TYPESCRIPT UNION TYPE: 'string | undefined'
         *   Means the variable can hold EITHER a string value OR undefined.
         *   TypeScript will ENFORCE that we check for undefined before using it as a string.
         *
         * Without the '| undefined' type:
         *   TypeScript wouldn't know this can be undefined → dangerous assumption
         *
         * The TYPE GUARD 'if (sPreviousHash !== undefined)' below is what TypeScript
         * calls NARROWING: inside the if block, TypeScript KNOWS it's a string.
         * Outside the if (in the else), TypeScript knows it's undefined.
         */
        const sPreviousHash: string | undefined = oHistory.getPreviousHash();

        if (sPreviousHash !== undefined) {
            /**
             * Browser History API: window.history.go(-1)
             * ─────────────────────────────────────────────────────────────────────
             * 'window' is the browser's global object (typed in TypeScript's DOM lib).
             * 'window.history' is the browser's History API object.
             * '.go(-1)' navigates one step BACK in the browser's session history.
             *
             * TYPESCRIPT: 'window' and 'window.history.go()' are typed by the DOM
             * library ('lib: ["DOM"]' in tsconfig.json).
             * Without '"DOM"' in lib, TypeScript wouldn't know about 'window'.
             *
             * TypeScript knows:
             *   window.history      → History interface (browser DOM History)
             *   window.history.go   → (delta?: number): void
             *
             * NOTE: Inside the if block, sPreviousHash is narrowed to 'string'
             * (TypeScript removes 'undefined' from the union type after the check).
             */
            window.history.go(-1);

        } else {
            /**
             * FALLBACK: Navigate to the default route
             * ─────────────────────────────────────────────────────────────────────
             * When there's no previous hash, we can't go back.
             * Navigate to the root/default route ("leftSide" = empty pattern "").
             *
             * oRouter.navTo(routeName, parameters, replace?)
             *   - ""      → route with pattern "" (the leftSide route, shows View1)
             *   - {}      → no route parameters needed for the default route
             *   - true    → 'replace' flag: replaces current history entry
             *               (pressing browser Back won't come back here again)
             *
             * TYPESCRIPT: getOwnerComponent()! non-null assertion (see onInit for explanation)
             * We get the router fresh here (not using this.oRouter) because this is
             * the fallback path and we want to be explicit about the operation.
             */
            const oRouter: Router = (this.getOwnerComponent() as UIComponent).getRouter();
            oRouter.navTo("", {}, true);
        }
    }

    /**
     * COMMENTED-OUT ALTERNATIVE onBack() implementation:
     * ─────────────────────────────────────────────────────────────────────────
     * Original JavaScript had this simpler version (direct container navigation):
     *
     * onBack(): void {
     *   (this.getView()!.getParent() as any).to("idView1");
     * }
     *
     * This was replaced by the History-based navigation above because:
     * 1. History-based navigation works with browser Back button
     * 2. History-based navigation handles direct URL access gracefully
     * 3. Direct container navigation (.to()) bypasses the router (not recommended)
     *
     * The History approach is SAP UI5 Best Practice for back navigation.
     */
}
