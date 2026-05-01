/**
 * @file View2.controller.ts
 * @namespace ats.mm.product.controller
 *
 * SAP UI5 View2 Controller (Fruit Detail View) - TypeScript Version
 * ==================================================================
 * This is the DETAIL view controller in the SplitApp pattern.
 * It is shown when a user selects a fruit from the master list (View1).
 *
 * RESPONSIBILITIES:
 *   - Bind the selected fruit data to the view (herculis - route callback)
 *   - Open a SelectDialog popup for supplier filtering (onFilter)
 *   - Open a SelectDialog popup for city F4 help (onF4Help)
 *   - Handle selection from both popups (onPopupSelect)
 *   - Navigate to supplier detail view (onSelectSupplier)
 *   - Navigate back to the master view (onBack)
 *   - Show a happiness survey dialog (onSave)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TYPESCRIPT CONCEPTS INTRODUCED IN THIS FILE:
 * ─────────────────────────────────────────────────────────────────────────────
 *   1. Nullable properties: 'Type | null = null'
 *   2. Arrow functions in Promise callbacks (lexical 'this')
 *   3. Promise<T> return type with type casting
 *   4. Route parameter typing with interface
 *   5. Type casting with 'as' for SelectDialog and Table
 *   6. Removing 'var that = this' antipattern with arrow functions
 * ─────────────────────────────────────────────────────────────────────────────
 */

import BaseController from "ats/mm/product/controller/BaseController";
import UIComponent from "sap/ui/core/UIComponent";
import MessageBox from "sap/m/MessageBox";
import MessageToast from "sap/m/MessageToast";

/**
 * Fragment: SAP UI5 module for loading XML fragment files dynamically.
 * Fragment.load() returns a Promise that resolves with the loaded control(s).
 * This allows LAZY LOADING of UI components (they are only created when needed).
 */
import Fragment from "sap/ui/core/Fragment";

import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import Router from "sap/ui/core/routing/Router";
import Event from "sap/ui/base/Event";

/**
 * SelectDialog: SAP UI5 popup dialog for selecting items from a list.
 * Key methods:
 *   - setMultiSelect(bool)           → allow selecting multiple items
 *   - setTitle(string)               → set the dialog title
 *   - bindAggregation("items", conf) → bind data to the list items
 *   - open(searchValue?)             → open the dialog
 */
import SelectDialog from "sap/m/SelectDialog";

/**
 * StandardListItem: List item with title, description, and icon.
 * Used as template when binding the popup's items aggregation.
 */
import StandardListItem from "sap/m/StandardListItem";

/**
 * Table: The sap.m.Table control (used to display supplier data in View2).
 * Key method:
 *   - getBinding("items") → get the items ListBinding for filtering
 */
import Table from "sap/m/Table";

/**
 * ListBinding: The binding for list/table aggregations.
 * Key method: filter(filters) → apply filter conditions.
 */
import ListBinding from "sap/ui/model/ListBinding";

/**
 * Input: The sap.m.Input control.
 * Used as the type for 'this.oField' which stores the input control
 * that triggered the F4 help dialog.
 * Key method: setValue(value: string) → set the input field's value
 */
import Input from "sap/m/Input";

/**
 * Control: Base class for all SAP UI5 UI controls.
 * Fragment.load() returns Promise<Control | Control[]>.
 * We need to import Control to type the Promise callback parameter.
 */
import Control from "sap/ui/core/Control";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * INTERFACE: IFruitRouteArguments
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * TypeScript INTERFACE for type-safe route parameter access.
 * When the 'spiderman' route matches (pattern: "fruits/{fruitId}"),
 * the router passes the captured URL segment as route arguments.
 *
 * Example URL: #fruits/3
 * Route arguments: { fruitId: "3" }
 *
 * SYNTAX: interface InterfaceName { propertyName: type; }
 *
 * Without this interface:
 *   const args = oEvent.getParameter("arguments") as any;
 *   args.fruitId → no type checking, no autocomplete
 *
 * With this interface:
 *   const args = oEvent.getParameter("arguments") as IFruitRouteArguments;
 *   args.fruitId → TypeScript knows it's a string, gives autocomplete
 */
interface IFruitRouteArguments {
    fruitId: string;
}

/**
 * View2 Controller - Detail View (Fruit Details + Supplier List)
 * ─────────────────────────────────────────────────────────────────────────────
 * @namespace ats.mm.product.controller
 */
export default class View2 extends BaseController {

    /**
     * ─────────────────────────────────────────────────────────────────────────
     * CLASS PROPERTIES
     * ─────────────────────────────────────────────────────────────────────────
     *
     * SYNTAX: access-modifier propertyName: Type = initialValue;
     *
     * NULLABLE PROPERTIES: 'Type | null = null'
     * ─────────────────────────────────────────────────────────────────────────
     * TypeScript UNION TYPE syntax: 'Type | null' means "Type OR null"
     *
     * WHY 'null' INSTEAD OF '!'?
     *   - oSupplierPopup and oCityPopup start as null (popup not yet loaded)
     *   - They are assigned ASYNCHRONOUSLY (inside Fragment.load().then())
     *   - The null check 'if (!this.oSupplierPopup)' in onFilter() is INTENTIONAL
     *     business logic (lazy loading: create once, reuse many times)
     *   - Using '| null' with '= null' correctly models this lifecycle
     *
     * CONTRAST with View1's oRouter (uses '!'):
     *   oRouter is ALWAYS assigned in onInit() before any method runs → use '!'
     *   oSupplierPopup is ONLY assigned after user clicks a button → use '| null'
     *
     * JAVASCRIPT (old pattern where properties were in the object literal):
     *   oField: null,
     *   oSupplierPopup: null,
     *   oCityPopup: null,
     */
    private oRouter!: Router;

    /**
     * oField: Reference to the Input control that triggered F4 (value help).
     * Set in onF4Help(), read in onPopupSelect() to set the selected value.
     *
     * 'Input | null = null' → starts as null, assigned when F4 help is opened
     */
    private oField: Input | null = null;

    /**
     * oSupplierPopup: The cached SelectDialog for supplier filtering.
     * null → not yet loaded (first time = Fragment.load() creates it)
     * SelectDialog → loaded and ready to reuse
     *
     * LAZY LOADING PATTERN (efficient):
     *   1st click → Fragment.load() → creates SelectDialog → cached in oSupplierPopup
     *   2nd click → oSupplierPopup is already set → just call .open() (no re-creation)
     */
    private oSupplierPopup: SelectDialog | null = null;

    /**
     * oCityPopup: The cached SelectDialog for city F4 help.
     * Same lazy loading pattern as oSupplierPopup.
     */
    private oCityPopup: SelectDialog | null = null;

    /**
     * onInit() - Initialize Router and Attach Route Handler
     * ─────────────────────────────────────────────────────────────────────────
     *
     * Key pattern here: attachMatched(callback, context)
     *   - 'callback' is the function to call when the route URL pattern matches
     *   - 'context' (this) ensures 'this' inside the callback refers to the controller
     *
     * In JavaScript, 'this' inside a callback changes context.
     * SAP UI5's attachMatched accepts a context parameter to solve this.
     * In modern TypeScript with arrow functions, we can also use:
     *   this.oRouter.getRoute("spiderman").attachMatched((oEvent) => { ... });
     * The arrow function automatically captures 'this' from the enclosing scope.
     */
    public override onInit(): void {
        this.oRouter = (this.getOwnerComponent() as UIComponent).getRouter();

        /**
         * getRoute("spiderman").attachMatched(callback, context)
         * ─────────────────────────────────────────────────────────────────────
         * - "spiderman" → route name defined in manifest.json
         * - this.herculis → the method to call when this route is navigated to
         * - 'this' (second argument) → pass controller as context for 'this' in herculis
         *
         * TYPESCRIPT: attachMatched expects:
         *   attachMatched(fnFunction: Function, oListener?: object): Route
         * The second 'this' parameter sets the execution context (like .bind(this))
         *
         * WITHOUT the context parameter:
         *   Inside herculis, 'this' would be undefined (strict mode) or window (sloppy)
         *   this.getView() would fail with "Cannot read property 'getView' of undefined"
         */
        this.oRouter.getRoute("spiderman")!.attachMatched(this.herculis, this);
    }

    /**
     * herculis() - Route Match Handler for 'spiderman' Route
     * ─────────────────────────────────────────────────────────────────────────
     *
     * Called automatically by the Router when the URL matches "fruits/{fruitId}".
     * Binds the view to the specific fruit element in the JSONModel.
     *
     * NAMING: 'herculis' is a custom name (not a SAP standard).
     *  In real projects, use descriptive names like: onRouteMatched, _onFruitRouteMatched
     *
     * @param oEvent - Route match event with 'arguments' parameter containing route params
     */
    public herculis(oEvent: Event<Record<string, unknown>>): void {
        const oView2 = this.getView()!;

        /**
         * TYPE CASTING ROUTE ARGUMENTS
         * ─────────────────────────────────────────────────────────────────────
         * oEvent.getParameter("arguments")
         *   - Returns the route parameters as captured from the URL
         *   - For route "fruits/{fruitId}", navigating to #fruits/3 gives: { fruitId: "3" }
         *   - TypeScript return type: unknown (can be anything)
         *
         * 'as IFruitRouteArguments'
         *   - TYPE ASSERTION: tells TypeScript "this unknown value is IFruitRouteArguments"
         *   - Allows safe access to '.fruitId' property with type checking
         *   - IFruitRouteArguments interface defined at top of this file
         *
         * SYNTAX: expression as InterfaceType
         */
        const oArgs = oEvent.getParameter("arguments") as IFruitRouteArguments;
        const sIndex: string = oArgs.fruitId;

        // Build the JSONModel path: "/fruits/3" (for example)
        const sPath: string = "/fruits/" + sIndex;

        /**
         * oView2.bindElement(path)
         * ─────────────────────────────────────────────────────────────────────
         * Binds the ENTIRE VIEW to a single element (record) in the data model.
         *
         * ELEMENT BINDING:
         *   - Sets a binding context for the view
         *   - All controls in the view that use relative paths (like "{name}")
         *     will resolve against this element path
         *   - Example: sPath = "/fruits/3"
         *     Then in XML: <Text text="{name}"/> shows fruits[3].name
         *
         * This is the most efficient way to display details for a selected record.
         */
        oView2.bindElement(sPath);
    }

    /**
     * onFilter() - Open Supplier SelectDialog (Lazy Loading Pattern)
     * ─────────────────────────────────────────────────────────────────────────
     *
     * LAZY LOADING PATTERN EXPLAINED:
     *   - Check if popup already exists
     *   - If NO:  load the fragment (creates the SelectDialog), then open it
     *   - If YES: just open the cached dialog (avoid re-creation overhead)
     *
     * This is a very common SAP UI5 pattern for dialog/popup management.
     * Equivalent ABAP pattern: IF lo_alv IS NOT BOUND.
     */
    public onFilter(): void {

        if (!this.oSupplierPopup) {
            /**
             * Fragment.load() - Load an XML Fragment Asynchronously
             * ─────────────────────────────────────────────────────────────────────
             * Fragment.load(config) returns a Promise<Control | Control[]>
             *
             * Configuration:
             *   - id: 'supplier'                            → fragment instance ID prefix
             *   - name: 'ats.mm.product.fragments.popup'    → maps to popup.fragment.xml
             *   - type: 'XML'                               → fragment type (always XML)
             *   - controller: this                          → event handler context
             *
             * WHY 'controller: this'?
             *   The popup.fragment.xml SelectDialog has event handlers
             *   (like confirm="onPopupSelect") that need to call methods on this controller.
             *   Passing 'controller: this' gives the fragment access to controller methods.
             *
             * TYPESCRIPT: Fragment.load() returns Promise<Control | Control[]>
             * We must handle this promise with .then() before using the result.
             */
            Fragment.load({
                id: "supplier",
                name: "ats.mm.product.fragments.popup",
                type: "XML",
                controller: this
            })

            /**
             * .then() - Promise Fulfillment Handler
             * ─────────────────────────────────────────────────────────────────────
             * Runs when Fragment.load() successfully creates the fragment.
             *
             * TYPESCRIPT ARROW FUNCTION SYNTAX: (param: Type) => { ... }
             *   - 'oFragment: Control | Control[]' → parameter with union type
             *   - '=> { ... }'                     → arrow function body
             *
             * CRITICAL TYPESCRIPT ADVANTAGE: ARROW FUNCTIONS vs REGULAR FUNCTIONS
             * ─────────────────────────────────────────────────────────────────────
             * JAVASCRIPT (old - needed 'var that = this'):
             *   var that = this;   // ← save controller reference
             *   Fragment.load({...}).then(function(oFragment) {
             *     that.oSupplierPopup = oFragment;  // 'this' would be wrong here!
             *   });
             *
             * TYPESCRIPT (new - arrow function captures 'this' lexically):
             *   Fragment.load({...}).then((oFragment) => {
             *     this.oSupplierPopup = ...;   // 'this' correctly refers to the controller!
             *   });
             *
             * WHY THIS WORKS:
             * Regular functions create their OWN 'this' binding.
             * Arrow functions do NOT have their own 'this' - they INHERIT 'this'
             * from the ENCLOSING SCOPE (the class method body where they are defined).
             * This is called LEXICAL 'this' binding.
             */
            .then((oFragment: Control | Control[]) => {

                /**
                 * 'as SelectDialog'
                 * ─────────────────────────────────────────────────────────────────────
                 * Fragment.load() returns Control | Control[] (generic return type).
                 * We KNOW the popup.fragment.xml contains a single SelectDialog control.
                 * 'as SelectDialog' is a TYPE ASSERTION to access SelectDialog methods.
                 *
                 * This is safe because we own the fragment XML file and know its structure.
                 */
                this.oSupplierPopup = oFragment as SelectDialog;

                // Enable multi-selection mode for supplier filtering
                this.oSupplierPopup.setMultiSelect(true);
                this.oSupplierPopup.setTitle("Choose Supplier(s)");

                /**
                 * bindAggregation("items", config)
                 * ─────────────────────────────────────────────────────────────────────
                 * Binds the popup's list items to the 'supplier' array in the JSONModel.
                 *
                 * config.path: '/supplier'
                 *   → Points to the root-level 'supplier' array in fruits.json
                 *
                 * config.template: new StandardListItem({...})
                 *   → Template control: SAP UI5 creates one instance per supplier record
                 *   → Properties use {} binding syntax for dynamic data
                 *   → '{city}' binds to supplier[n].city in the model
                 *
                 * TYPESCRIPT: 'new StandardListItem({...})' creates a typed instance.
                 * TypeScript knows StandardListItem's constructor properties from
                 * @openui5/ts-types-esm type definitions.
                 */
                this.oSupplierPopup.bindAggregation("items", {
                    path: "/supplier",
                    template: new StandardListItem({
                        description: "{city}",
                        title:       "{name}",
                        icon:        "sap-icon://supplier"
                    })
                });

                /**
                 * addDependent(control)
                 * ─────────────────────────────────────────────────────────────────────
                 * Adds the popup as a DEPENDENT of the view.
                 * This is required so the popup can access the view's models.
                 *
                 * METAPHOR: The popup (parasite) needs access to the models (blood supply)
                 * from the view (immune system / host). addDependent() grants this access.
                 *
                 * Without addDependent():
                 *   The SelectDialog cannot access the JSONModel
                 *   (which is attached to the view/component, not the dialog)
                 *   → The supplier list would appear empty
                 */
                this.getView()!.addDependent(this.oSupplierPopup);

                // Open the dialog to display the supplier list
                this.oSupplierPopup.open("");

            }); // end of .then()

        } else {
            // Popup already loaded - just open it (no re-creation needed)
            this.oSupplierPopup.open("");
        }
    }

    /**
     * onF4Help() - Open City SelectDialog (F4 / Value Help)
     * ─────────────────────────────────────────────────────────────────────────
     *
     * F4 in SAP terminology = "Field Help" (search help / value help).
     * When the user triggers field help on a city input field,
     * a SelectDialog shows all available cities to choose from.
     *
     * PATTERN: Same lazy loading pattern as onFilter().
     *
     * @param oEvent - Event from the field that triggered F4 help
     *                 oEvent.getSource() = the Input control that fired the event
     */
    public onF4Help(oEvent: Event): void {

        /**
         * Store the INPUT CONTROL reference before loading the popup.
         * After the user selects a city, onPopupSelect() will use this.oField
         * to set the selected city value back into the correct input field.
         *
         * TYPESCRIPT: 'as Input'
         *   oEvent.getSource() returns EventProvider (generic type)
         *   We cast 'as Input' because F4 help is always triggered from an Input control
         *   Input is imported from "sap/m/Input" at the top of this file
         */
        this.oField = oEvent.getSource() as Input;

        if (!this.oCityPopup) {
            Fragment.load({
                id:         "cities",
                name:       "ats.mm.product.fragments.popup",
                type:       "XML",
                controller: this
            })
            .then((oFragment: Control | Control[]) => {
                /**
                 * REUSING popup.fragment.xml FOR BOTH CITY AND SUPPLIER DIALOGS:
                 * ─────────────────────────────────────────────────────────────────────
                 * Note that both onFilter() and onF4Help() load the SAME fragment XML file
                 * ('ats.mm.product.fragments.popup') but with DIFFERENT fragment IDs
                 * ('supplier' and 'cities').
                 *
                 * SAP UI5 Fragment.load() uses the 'id' parameter to create unique control IDs,
                 * allowing the same XML template to be instantiated multiple times
                 * as separate dialog instances with separate settings (title, multi-select).
                 *
                 * This avoids code duplication in the fragment XML while supporting
                 * different configurations (single-select city vs multi-select supplier).
                 */
                this.oCityPopup = oFragment as SelectDialog;
                this.oCityPopup.setTitle("Choose City");

                // Bind to /cities array in the JSONModel (single-select, no setMultiSelect)
                this.oCityPopup.bindAggregation("items", {
                    path: "/cities",
                    template: new StandardListItem({
                        description: "{famousFor}",
                        title:       "{name}",
                        icon:        "sap-icon://home"
                    })
                });

                this.getView()!.addDependent(this.oCityPopup);
                this.oCityPopup.open("");
            });

        } else {
            this.oCityPopup.open("");
        }
    }

    /**
     * onPopupSelect() - Handle Selection from City or Supplier Popup
     * ─────────────────────────────────────────────────────────────────────────
     *
     * This single method handles selections from BOTH popups.
     * We differentiate which popup fired the event by checking the source ID.
     *
     * Event fired by:
     *   - City SelectDialog    → has ID containing "cities"
     *   - Supplier SelectDialog → has ID containing "supplier"
     *
     * Event parameters:
     *   - 'selectedItem'  (for single-select city dialog)
     *   - 'selectedItems' (for multi-select supplier dialog)
     *
     * @param oEvent - SelectDialog confirm/select event
     */
    public onPopupSelect(oEvent: Event<Record<string, unknown>>): void {

        /**
         * Determine WHICH popup fired the event by checking its ID.
         * ─────────────────────────────────────────────────────────────────────
         * oEvent.getSource().getId()
         *   - getSource() → the SelectDialog control that was confirmed
         *   - getId()     → returns the control's unique ID string
         *
         * Fragment IDs prefix the control IDs:
         *   cities::SelectDialog → supplier dialog (id starts with 'cities')
         *   supplier::SelectDialog → supplier dialog (id starts with 'supplier')
         *
         * TYPESCRIPT: getId() returns string → sId is correctly typed as string
         */
        const sId: string = (oEvent.getSource() as Control).getId();

        if (sId.indexOf("cities") !== -1) {

            /**
             * CITY POPUP (single selection)
             * ─────────────────────────────────────────────────────────────────────
             * 'selectedItem' parameter → the single StandardListItem the user chose
             */
            const oSelectedItem = oEvent.getParameter("selectedItem") as StandardListItem;
            const sTitle: string = oSelectedItem.getTitle();

            /**
             * Set the selected city name back into the input field.
             * ─────────────────────────────────────────────────────────────────────
             * 'this.oField!' → Non-null assertion
             *   We know oField is not null here because:
             *   - onF4Help() always sets oField before opening oCityPopup
             *   - onPopupSelect() only runs AFTER the user confirms a selection
             *   - So by the time we reach this code, oField is always set
             *
             * TYPESCRIPT NOTE: Without '!', TypeScript would error:
             *   "Object is possibly 'null'" (because oField type is 'Input | null')
             */
            this.oField!.setValue(sTitle);

        } else {

            /**
             * SUPPLIER POPUP (multi-selection)
             * ─────────────────────────────────────────────────────────────────────
             * 'selectedItems' parameter → array of all selected StandardListItems
             */
            const aSuppliers = oEvent.getParameter("selectedItems") as StandardListItem[];

            /**
             * TYPESCRIPT TYPED ARRAY VARIABLE
             * SYNTAX: const arrayName: ElementType[] = [];
             *
             * 'Filter[]' → array where every element must be a Filter object
             * '= []'     → initialized as empty array
             * TypeScript will error if you try: aFilters.push("string") (wrong type)
             */
            const aFilters: Filter[] = [];

            /**
             * ARROW FUNCTION in forEach
             * ─────────────────────────────────────────────────────────────────────
             * SYNTAX: array.forEach((item: ItemType) => { ... })
             *
             * - '(item: StandardListItem)' → parameter with explicit type
             * - '=>'                        → arrow function syntax
             *
             * TYPESCRIPT BENEFIT: 'item' is typed as StandardListItem,
             * so 'item.getTitle()' has full type checking and autocomplete.
             *
             * Arrow function here has no 'this' issue since we're just
             * working with the 'item' parameter and 'aFilters' (a local variable
             * captured from the enclosing scope - this is called a CLOSURE).
             */
            aSuppliers.forEach((item: StandardListItem) => {
                const sTitle: string = item.getTitle();
                // Create an exact-match filter for each selected supplier name
                const oFilter = new Filter("name", FilterOperator.EQ, sTitle);
                aFilters.push(oFilter);
            });

            // Combine all supplier filters with OR logic
            const oMainFilter: Filter = new Filter({
                filters: aFilters,
                and: false  // OR: show any supplier that matches any selected name
            });

            /**
             * Get the supplier table and apply the filter.
             * ─────────────────────────────────────────────────────────────────────
             * 'as Table' → cast to Table (sap.m.Table) to access getBinding()
             * 'as ListBinding' → cast binding to ListBinding to access filter()
             */
            const oTable = this.getView()!.byId("idSupplierTab") as Table;
            (oTable.getBinding("items") as ListBinding).filter(oMainFilter);
        }
    }

    /**
     * onTry() - Test Confirmation Dialog
     * ─────────────────────────────────────────────────────────────────────────
     * Development test method for verifying fragment event handler wiring.
     * The comment in the original code indicates this was added for testing:
     * "code for fragment event is written [in] who is inviting the fragment"
     *
     * Can be safely removed in production, or repurposed for real functionality.
     */
    public onTry(): void {
        MessageBox.confirm("aa gaya");
    }

    /**
     * onSelectSupplier() - Navigate to Supplier Detail View (View3)
     * ─────────────────────────────────────────────────────────────────────────
     *
     * Called when user presses a supplier row in the supplier table.
     * Extracts the supplier's index from its binding path and navigates to View3.
     *
     * Routing: 'superman' route (pattern: "supplier/{supplierId}")
     *
     * @param oEvent - List itemPress event carrying 'listItem' parameter
     */
    public onSelectSupplier(oEvent: Event<Record<string, unknown>>): void {

        const oListItem = oEvent.getParameter("listItem") as StandardListItem;
        const sPath: string = oListItem.getBindingContext()!.getPath();
        console.log(sPath);

        // Extract index: "/supplier/3" → ["", "supplier", "3"] → "3"
        const sIndex: string = sPath.split("/")[sPath.split("/").length - 1];

        /**
         * Navigate to 'superman' route with supplierId parameter.
         * ─────────────────────────────────────────────────────────────────────
         * Manifest.json route: { "name": "superman", "pattern": "supplier/{supplierId}" }
         * URL result: index.html#supplier/3
         */
        this.oRouter.navTo("superman", {
            supplierId: sIndex
        });
    }

    /**
     * onBack() - Navigate Back to Master View (View1)
     * ─────────────────────────────────────────────────────────────────────────
     *
     * Uses direct container navigation (NavContainer.to()) to navigate back.
     *
     * NOTE: The commented-out original uses direct container navigation.
     * In a modern SAP UI5 app, prefer router-based navigation instead:
     *   this.oRouter.navTo("leftSide");
     *
     * The 'any' cast is needed because:
     *   getParent() returns ManagedObject (generic type without 'to()' method)
     *   We know at runtime it is a NavContainer (which has 'to()')
     */
    public onBack(): void {
        /**
         * TYPE ASSERTION TO 'any'
         * ─────────────────────────────────────────────────────────────────────
         * SYNTAX: (expression as any).method()
         *
         * 'as any' disables TypeScript type checking for this expression.
         * Use as a last resort when you know the runtime type but TypeScript's
         * type system cannot represent it precisely.
         *
         * WHEN IS 'any' ACCEPTABLE?
         *   ✓ When interfacing with dynamic/untyped SAP UI5 container hierarchy
         *   ✓ When the specific type (NavContainer) isn't known at compile time
         *   ✗ Don't use 'any' to silence TypeScript errors on normal code
         *
         * BETTER ALTERNATIVE (import NavContainer and cast precisely):
         *   import NavContainer from "sap/m/NavContainer";
         *   (this.getView()!.getParent() as NavContainer).to("idView1");
         */
        (this.getView()!.getParent() as any).to("idView1");
    }

    /**
     * onSave() - Show Happiness Survey Confirmation Dialog
     * ─────────────────────────────────────────────────────────────────────────
     *
     * Opens a MessageBox.confirm() dialog with a happiness survey question.
     * Handles both OK (thank you message) and Cancel (sorry message) responses.
     */
    public onSave(): void {

        /**
         * MessageBox.confirm(message, config)
         * ─────────────────────────────────────────────────────────────────────
         * Shows a modal confirmation dialog.
         * config.onClose callback receives the action the user took:
         *   'OK'     → user pressed the OK/Confirm button
         *   'CANCEL' → user pressed Cancel or closed the dialog
         *
         * TYPESCRIPT: The onClose callback parameter 'sAction' is typed as string.
         *
         * ARROW FUNCTION NOTE: We use an arrow function for onClose because
         * we don't need 'this' inside it (we only call MessageBox.error which
         * is a static call, not an instance method). Either arrow or regular
         * function works here.
         */
        MessageBox.confirm("Are you happy with Anubhav Trainings?", {
            title: "Happiness Survey",
            onClose: (sAction: string) => {
                if (sAction === "OK") {
                    MessageToast.show("Thank you for your feedback!");
                } else {
                    MessageBox.error(
                        "We are sorry to hear that you are not happy with us. " +
                        "Please let us know how we can improve."
                    );
                }
            }
        });
    }
}
