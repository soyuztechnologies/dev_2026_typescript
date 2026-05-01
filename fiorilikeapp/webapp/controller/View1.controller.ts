/**
 * @file View1.controller.ts
 * @namespace ats.mm.product.controller
 *
 * SAP UI5 View1 Controller (Fruit List / Master View) - TypeScript Version
 * =========================================================================
 * This is the MASTER view controller in the SplitApp pattern.
 * It manages the fruit list on the left side of the screen.
 *
 * RESPONSIBILITIES:
 *   - Initialize the router reference on view creation (onInit)
 *   - Navigate to the fruit detail view when a list item is pressed (onNext / onItemPress)
 *   - Filter the fruit list when the user types in the search box (onSearch)
 *   - Delete a fruit from the list (onDelete)
 *   - Show an order confirmation toast (onOrderNow)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TYPESCRIPT CONCEPTS INTRODUCED IN THIS FILE:
 * ─────────────────────────────────────────────────────────────────────────────
 *   1. Private class properties with '!'  (definite assignment assertion)
 *   2. override keyword for lifecycle methods
 *   3. Event type parameter: Event from "sap/ui/base/Event"
 *   4. Type casting with 'as' keyword
 *   5. Non-null assertion operator '!'
 *   6. Generic typed methods: getParameter<T>(name)
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * ES6 IMPORTS
 * ─────────────────────────────────────────────────────────────────────────────
 * Each import loads one SAP UI5 module.
 * All paths use slashes (SAP module path convention):
 *   "sap/m/MessageBox" = sap.m.MessageBox library
 *
 * The build tool (ui5-tooling-transpile) converts these to:
 *   sap.ui.define([...paths...], function(...classes...) { ... });
 */
import BaseController from "ats/mm/product/controller/BaseController";
import UIComponent from "sap/ui/core/UIComponent";

/**
 * MessageBox: displays modal dialog boxes (confirm, alert, error, etc.)
 * Used in SAP UI5 to show blocking dialogs that require user acknowledgement.
 */
import MessageBox from "sap/m/MessageBox";

/**
 * MessageToast: displays non-blocking notification messages at the bottom
 * of the screen. Disappears automatically after a few seconds.
 * Ideal for "success" confirmations like "Order placed successfully!"
 */
import MessageToast from "sap/m/MessageToast";

/**
 * Filter: Represents a single filter condition on a data binding.
 * Constructor: new Filter(path, operator, value)
 * Example: new Filter("name", FilterOperator.Contains, "Apple")
 *   → matches all records where 'name' contains 'Apple'
 */
import Filter from "sap/ui/model/Filter";

/**
 * FilterOperator: Enum of comparison operators for Filter conditions.
 * Common values:
 *   FilterOperator.Contains  → field contains value (case-insensitive)
 *   FilterOperator.EQ        → field equals value exactly
 *   FilterOperator.StartsWith → field starts with value
 *   FilterOperator.BT        → field is between two values
 */
import FilterOperator from "sap/ui/model/FilterOperator";

/**
 * Router: SAP UI5's client-side routing engine.
 * Used to navigate between views by URL hash patterns.
 * Configured in manifest.json's "routing" section.
 */
import Router from "sap/ui/core/routing/Router";

/**
 * Event: The base class for all SAP UI5 control events.
 * All event handler functions (onSearch, onItemPress, etc.) receive
 * an 'Event' object as their parameter, which provides:
 *   - oEvent.getSource()          → the control that fired the event
 *   - oEvent.getParameter(name)   → get a named parameter of the event
 */
import Event from "sap/ui/base/Event";

/**
 * List: The SAP UI5 sap.m.List control.
 * Provides methods like:
 *   - getBinding("items")  → get the items ListBinding
 *   - removeItem(item)     → remove an item from the list
 */
import List from "sap/m/List";

/**
 * StandardListItem: The standard list item control used in sap.m.List.
 * Provides:
 *   - getTitle()                  → get the title text
 *   - getBindingContextPath()     → get the model path of the bound data
 */
import StandardListItem from "sap/m/StandardListItem";

/**
 * ListBinding: The data binding for list/table aggregations.
 * Key method:
 *   - filter(filters)   → apply filter conditions to the displayed items
 */
import ListBinding from "sap/ui/model/ListBinding";

/**
 * @namespace ats.mm.product.controller
 */

/**
 * View1 Controller - Master View (Fruit List)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * JAVASCRIPT (old way):
 *   BaseController.extend("ats.mm.product.controller.View1", {
 *     oRouter: null,
 *     onInit: function() { this.oRouter = this.getOwnerComponent().getRouter(); }
 *   });
 *
 * TYPESCRIPT (new way):
 *   class View1 extends BaseController {
 *     private oRouter!: Router;
 *     public override onInit(): void { this.oRouter = ...; }
 *   }
 */
export default class View1 extends BaseController {

    /**
     * ─────────────────────────────────────────────────────────────────────────
     * PRIVATE CLASS PROPERTY: oRouter
     * ─────────────────────────────────────────────────────────────────────────
     *
     * SYNTAX: access-modifier propertyName!: TypeAnnotation;
     *
     * 'private'
     *   → Only accessible within the View1 class.
     *   → Cannot be accessed from outside: view1Instance.oRouter → ERROR
     *   → TypeScript access modifiers: public | protected | private
     *
     * 'oRouter'
     *   → SAP naming convention: 'o' prefix = object
     *
     * '!: Router'
     *   → '!' is the DEFINITE ASSIGNMENT ASSERTION operator
     *   → It tells TypeScript: "I guarantee this property will be assigned
     *     before it is used, even though I'm not assigning it here."
     *   → Without '!', TypeScript would error: "Property 'oRouter' has no initializer
     *     and is not definitely assigned in the constructor."
     *   → We assign it in onInit(), but TypeScript can't verify that lifecycle
     *     methods are called before the property is used.
     *
     * ALTERNATIVE without '!':
     *   private oRouter: Router | null = null;
     *   → Then check: if (this.oRouter) { this.oRouter.navTo(...) }
     *   → More verbose but safer; use this for properties that might genuinely be null
     *
     * ': Router'
     *   → Type annotation: TypeScript knows oRouter has all Router methods
     *   → IDE autocomplete shows: oRouter.navTo(), oRouter.getRoute(), etc.
     */
    private oRouter!: Router;

    /**
     * ─────────────────────────────────────────────────────────────────────────
     * onInit() - Controller Lifecycle Method (OVERRIDE)
     * ─────────────────────────────────────────────────────────────────────────
     *
     * Called automatically by SAP UI5 AFTER the view's XML is parsed and
     * all controls are created, but BEFORE the view is rendered to the DOM.
     *
     * SYNTAX: public override methodName(): void { ... }
     *
     * 'override'
     *   → Declares that this method overrides Controller.onInit()
     *   → Required by noImplicitOverride: true in tsconfig.json
     *   → SAP UI5 Controller lifecycle methods: onInit, onExit,
     *     onBeforeRendering, onAfterRendering
     *
     * WHAT WE DO HERE:
     * Get the Router from the Component and store it in this.oRouter.
     * We call this.getOwnerComponent()! because:
     *   - getOwnerComponent() returns UIComponent | undefined
     *   - '!' (non-null assertion) tells TypeScript "I know it's not undefined"
     *   - The owner component always exists when a controller's view is active
     */
    public override onInit(): void {
        /**
         * NON-NULL ASSERTION: this.getOwnerComponent()!
         * ─────────────────────────────────────────────────────────────────────
         * '!' after an expression tells TypeScript: "I guarantee this is NOT null/undefined."
         *
         * SYNTAX: expression! → treats expression as non-null/non-undefined
         *
         * When to use '!':
         *   ✓ When you are 100% sure the value is not null/undefined
         *   ✓ When TypeScript's type inference is overly conservative
         *   ✗ Don't use '!' when there's a real possibility of null
         *
         * Here: getOwnerComponent() returns UIComponent | undefined
         * But in practice, a controller ALWAYS has an owner component.
         * So '!' is appropriate here.
         *
         * SAFER ALTERNATIVE (use when in doubt):
         *   const oOwner = this.getOwnerComponent();
         *   if (oOwner) {
         *     this.oRouter = oOwner.getRouter();
         *   }
         */
        this.oRouter = (this.getOwnerComponent() as UIComponent).getRouter();
    }

    /**
     * onNext() - Navigate to Fruit Detail View (View2)
     * ─────────────────────────────────────────────────────────────────────────
     *
     * SYNTAX: public methodName(paramName: paramType): returnType { ... }
     *
     * Called when:
     *   1. Directly: this.onNext(sIndex) from onItemPress()
     *   2. From XML view button press (if wired directly): press=".onNext"
     *      In that case, pass a static index value.
     *
     * @param sIndex - String index of the selected fruit in the JSONModel array
     *                 Example: "3" for /fruits/3
     *                 TypeScript: ': string' enforces callers must pass a string
     */
    public onNext(sIndex: string): void {
        /**
         * Router.navTo(routeName, parameters, replace?)
         * ─────────────────────────────────────────────────────────────────────
         * Navigates to a named route defined in manifest.json.
         *
         * PARAMETERS:
         *   'spiderman'         → route name (matches "name" in manifest.json routes)
         *   { fruitId: sIndex } → route parameters (fills in {fruitId} in the pattern)
         *
         * Manifest.json route config:
         *   { "name": "spiderman", "pattern": "fruits/{fruitId}", "target": "modi" }
         *
         * URL result: index.html#fruits/3  (when sIndex = "3")
         *
         * TYPESCRIPT: The second parameter is typed as { [key: string]: string }
         * by the Router type definition in @openui5/ts-types-esm.
         */
        this.oRouter.navTo("spiderman", {
            fruitId: sIndex
        });
    }

    /**
     * onOrderNow() - Show Order Confirmation Toast
     * ─────────────────────────────────────────────────────────────────────────
     *
     * Triggered from XML view: press=".onOrderNow"
     * Uses MessageToast for non-blocking success notification.
     *
     * MessageToast.show(message, options?)
     * - message: string to display
     * - options: { duration, width, my, at, of, offset, collision, onClose, autoClose }
     *
     * TYPESCRIPT: No parameters, no return value (': void')
     */
    public onOrderNow(): void {
        MessageToast.show("Order placed successfully!");
    }

    /**
     * onSearch() - Filter the Fruit List
     * ─────────────────────────────────────────────────────────────────────────
     *
     * Triggered from XML view: search=".onSearch"
     * The SearchField control fires a 'search' event when user presses Enter
     * or the search button.
     *
     * @param oEvent - SAP UI5 Event object from the SearchField control
     *                 TypeScript: 'Event' type imported from "sap/ui/base/Event"
     *
     * FILTER LOGIC:
     *   Create two filters (name contains + taste contains) combined with OR
     *   Then inject into the list binding to filter displayed items.
     */
    public onSearch(oEvent: Event<Record<string, unknown>>): void {

        /**
         * STEP 1: Extract the search query string from the event
         * ─────────────────────────────────────────────────────────────────────
         * oEvent.getParameter("query")
         *   - "query" is the parameter name for SearchField's search event
         *   - Returns what the user typed in the search box
         *
         * TYPESCRIPT: getParameter() returns 'any' type (because SAP UI5 events
         * can carry different parameter types). We cast to 'string' using 'as'.
         *
         * TYPE CASTING SYNTAX: expression as TargetType
         *   'value as string' tells TypeScript: "treat this 'any' value as a string"
         *
         * This is a TYPE ASSERTION, not runtime conversion.
         * It does NOT convert the value - it only affects TypeScript's type checker.
         * If the value is actually not a string at runtime, no error is thrown.
         */
        const searchStr: string = oEvent.getParameter("query") as string;

        /**
         * STEP 2: Construct filter conditions
         * ─────────────────────────────────────────────────────────────────────
         * new Filter(path, operator, value)
         *
         * oFilter1: match fruits where 'name' CONTAINS the search string
         * oFilter2: match fruits where 'taste' CONTAINS the search string
         *
         * FilterOperator.Contains:
         *   - Case-insensitive substring match
         *   - "apple" matches "Apple", "pineAPPLE", etc.
         *
         * TYPESCRIPT: TypeScript knows the Filter constructor signature from
         * @openui5/ts-types-esm type definitions, providing parameter hints.
         */
        const oFilter1: Filter = new Filter("name",  FilterOperator.Contains, searchStr);
        const oFilter2: Filter = new Filter("taste", FilterOperator.Contains, searchStr);

        /**
         * STEP 3: Combine filters into an array
         * ─────────────────────────────────────────────────────────────────────
         * TYPESCRIPT ARRAY TYPE SYNTAX: Type[]  or  Array<Type>
         *   Filter[]       → array where every element is a Filter object
         *   Array<Filter>  → same thing, generic array syntax
         *
         * Both are equivalent. 'Filter[]' is more concise (preferred).
         */
        const aFilters: Filter[] = [oFilter1, oFilter2];

        /**
         * STEP 4: Create a combined OR filter
         * ─────────────────────────────────────────────────────────────────────
         * new Filter({ filters: [], and: false })
         *   - 'filters': array of Filter objects to combine
         *   - 'and: false' → use OR logic (match if ANY filter matches)
         *   - 'and: true'  → use AND logic (match only if ALL filters match)
         *
         * RESULT: Show fruits where name contains search text
         *         OR taste contains search text
         *
         * TYPESCRIPT: Object literal type - TypeScript checks the property names
         * and types match the Filter constructor's expected configuration object.
         */
        const oFilter: Filter = new Filter({
            filters: aFilters,
            and: false          // OR logic: match name OR taste
        });

        /**
         * STEP 5: Get the List control by its view ID
         * ─────────────────────────────────────────────────────────────────────
         * this.getView()
         *   - Returns the XMLView instance associated with this controller
         *   - Return type: View | undefined
         *
         * '!' → Non-null assertion: we know the view exists in onSearch
         *
         * .byId("idList")
         *   - Returns the control with id="idList" in the view's XML
         *   - Return type: Control | undefined (TypeScript can't know which control type)
         *
         * 'as List'
         *   - TYPE CAST: tell TypeScript this control is specifically a List
         *   - Gives access to List-specific methods (removeItem, getBinding, etc.)
         *   - This is safe because we KNOW idList is a sap.m.List in the XML view
         */
        const oList = this.getView()!.byId("idList") as List;

        /**
         * STEP 6: Apply the filter to the list's items binding
         * ─────────────────────────────────────────────────────────────────────
         * oList.getBinding("items")
         *   - Gets the data binding attached to the "items" aggregation
         *   - "items" is the aggregation that holds the list items
         *   - Returns: Binding | undefined
         *
         * 'as ListBinding'
         *   - Cast to ListBinding since items bindings are always ListBindings
         *   - ListBinding has the filter() method we need
         *
         * .filter(oFilter)
         *   - Applies the filter condition to the binding
         *   - Only items matching the filter will be displayed in the list
         *   - The underlying JSONModel data is NOT modified; only the view changes
         *   - Passing an empty filter restores all items: binding.filter([])
         */
        (oList.getBinding("items") as ListBinding).filter(oFilter);
    }

    /**
     * onItemPress() - Handle List Item Selection (Navigation to View2)
     * ─────────────────────────────────────────────────────────────────────────
     *
     * Triggered from XML view: itemPress=".onItemPress"
     * The sap.m.List fires 'itemPress' when a list item is clicked/tapped.
     *
     * PATTERN: Extract the selected item's binding path → parse the index
     *           → call onNext(index) to navigate to View2.
     *
     * @param oEvent - SAP UI5 Event carrying 'listItem' parameter
     */
    public onItemPress(oEvent: Event<Record<string, unknown>>): void {

        /**
         * STEP 1: Get the clicked/pressed list item object
         * ─────────────────────────────────────────────────────────────────────
         * oEvent.getParameter("listItem")
         *   - "listItem" is the parameter name for List's itemPress event
         *   - Returns the StandardListItem that was pressed
         *
         * 'as StandardListItem'
         *   - Cast to StandardListItem to access title and binding path
         *   - TypeScript can now see: getTitle(), getBindingContextPath(), etc.
         */
        const oListItem = oEvent.getParameter("listItem") as StandardListItem;

        /**
         * STEP 2 (extra): Log the title for debugging
         * ─────────────────────────────────────────────────────────────────────
         * oListItem.getTitle()
         *   - Returns the text shown as the title in the list item
         *   - Return type: string (from StandardListItem type definitions)
         *
         * TYPESCRIPT: console.log() accepts 'any' type, so no cast needed.
         * The 'string' annotation makes the intent explicit.
         */
        const sText: string = oListItem.getTitle();
        console.log(sText);

        /**
         * STEP 3: Get the data binding path of the selected item
         * ─────────────────────────────────────────────────────────────────────
         * getBindingContextPath()
         *   - Returns the OData/JSON model path of the bound data object
         *   - For a JSONModel with path /fruits/3, returns: "/fruits/3"
         *   - We need this path to extract the index number
         */
        const sPath: string = oListItem.getBindingContext()!.getPath();
        console.log(sPath);

        /**
         * STEP 4: Extract the numeric index from the path string
         * ─────────────────────────────────────────────────────────────────────
         * Example: sPath = "/fruits/3"
         *   sPath.split("/")           → ["", "fruits", "3"]
         *   [...].length - 1           → index 2
         *   split("/")[length - 1]     → "3"
         *
         * TYPESCRIPT:
         * - String.split() returns string[] (array of strings)
         * - Array indexing with [n] returns string (from string[] type)
         * - The type is correctly inferred as 'string' by TypeScript
         *
         * We call split() twice here for simplicity (matches original code).
         * Refactored alternative: const parts = sPath.split("/"); const sIndex = parts[parts.length - 1];
         */
        const sIndex: string = sPath.split("/")[sPath.split("/").length - 1];

        // STEP 5: Navigate to View2 with the extracted fruit index
        this.onNext(sIndex);
    }

    /**
     * onDelete() - Remove a Fruit Item from the List
     * ─────────────────────────────────────────────────────────────────────────
     *
     * Triggered from XML view: delete=".onDelete"
     * The sap.m.List fires 'delete' event when user swipes/clicks the delete icon.
     *
     * NOTE: This only removes the item from the UI list control.
     * It does NOT modify the underlying JSONModel data.
     * The item will reappear if the view is refreshed/re-bound.
     *
     * For persistent deletion, you would call model.setData() or
     * send an OData DELETE request.
     *
     * @param oEvent - SAP UI5 Event carrying 'listItem' parameter
     */
    public onDelete(oEvent: Event<Record<string, unknown>>): void {

        /**
         * STEP 1: Get the item that needs to be deleted
         * ─────────────────────────────────────────────────────────────────────
         * The 'delete' event fires with 'listItem' parameter = the item to delete
         * 'as StandardListItem' → cast to access ListItem methods
         */
        const oItemDelete = oEvent.getParameter("listItem") as StandardListItem;

        /**
         * STEP 2: Get the List control (the source of the event)
         * ─────────────────────────────────────────────────────────────────────
         * oEvent.getSource()
         *   - Returns the control that fired the event (the List control)
         *   - Return type: EventProvider (parent class)
         *   - 'as List' → cast to List to access removeItem() method
         *
         * WHY USE getSource() INSTEAD OF byId("idList")?
         *   getSource() is more RESILIENT: if the control's ID changes in XML,
         *   getSource() still works. byId("idList") would break with an ID rename.
         */
        const oList = oEvent.getSource() as List;

        /**
         * STEP 3: Remove the item from the list
         * ─────────────────────────────────────────────────────────────────────
         * oList.removeItem(item)
         *   - Removes the specified item from the List's items aggregation
         *   - The item disappears from the UI immediately
         *   - Returns the removed item (or -1 if not found)
         *
         * TYPESCRIPT: removeItem() expects a ListItemBase parameter.
         * StandardListItem extends ListItemBase, so this is type-safe.
         */
        oList.removeItem(oItemDelete);
    }
}
