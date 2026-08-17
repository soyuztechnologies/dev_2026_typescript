
1. Install the dependencies

npm install -d @openui5/ts-types-esm typescript ui5-tooling-transpile

2. generate tsconfig.json file

tsc --init

3. enhance tsconfig.json as below

```
{
  // Visit https://aka.ms/tsconfig to read more about this file
  "compilerOptions": {
    // File Layout
    "rootDir": "webapp",
    "outDir": "./dist",

    // Environment Settings
    // See also https://aka.ms/tsconfig/module

    // * Specifies the MODULE SYSTEM used in the compiled output.
    //      * "ES2022" = ECMAScript Modules (import/export syntax).
    //      * The ui5-tooling-transpile build plugin converts these ES module
    //      * statements into SAP UI5's AMD-compatible format (sap.ui.define).
    "module": "es2022",
    //  Specifies the JavaScript version TypeScript compiles TO.
    "target": "es2023",

    /**
    * paths: { ... }
    * ---------------
    * Module path ALIASES for TypeScript's type resolution.
    * This maps import paths to where TypeScript finds the TYPE DEFINITIONS.
    *
    * At runtime (in the browser), SAP UI5's module loader handles the actual
    * file loading. These paths only matter at compile/type-check time.
    *
    * Two alias groups:
    *
    * 1. "sap/*" → SAP UI5 type definitions (from @openui5/ts-types-esm package)
    *    Example: import UIComponent from "sap/ui/core/UIComponent"
    *             → TypeScript looks in: node_modules/@openui5/ts-types-esm/types/sap/ui/core/UIComponent.d.ts
    *
    * 2. "com/ats/manageorder/*" → Project's own source files (the app namespace)
    *    Example: import BaseController from "com/ats/manageorder/controller/BaseController"
    *             → TypeScript looks in: ./webapp/controller/BaseController.ts
    *
    * NOTE: This is only for TypeScript resolution. The ui5-tooling-transpile
    * build tool handles actual module resolution using ui5.yaml configuration.
    */
    "types": ["@openui5/ts-types-esm"],

    /**
      improve the path mapping rather using ../../webapp/.. in the import statements.
      This is useful when you have a large project with many nested folders and
      you want to avoid long relative paths in your import statements.
      e.g.
      import { MyComponent } from "../../../../../webapp/components/MyComponent";
      Instead, you can use the path mapping to import it like this:
      import { MyComponent } from "ey/ap/acc/components/MyComponent";
    **/
    "paths": {
        "ey/ap/acc/*": ["./webapp/*"]
    },

    /**
    * allowJs: true
    * --------------
    * Allow TypeScript to import and compile JavaScript (.js) files too.
    * Useful during gradual migration from JavaScript to TypeScript.
    * Once fully migrated to TypeScript, this can be set to false.
    */
    "allowJs": true,

    /**
    * sourceMap: true
    * ----------------
    * Generates .js.map files alongside compiled .js files.
    * Source maps allow browser DevTools to show the original TypeScript
    * source code when debugging, instead of the compiled JavaScript.
    *
    * Without source maps: debug compiled JS → hard to read
    * With source maps:    debug original TS → easy to understand
    */
    "sourceMap": true,

    // Stricter Typechecking Options
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,

    // Style Options
    // "noImplicitReturns": true,
    // "noImplicitOverride": true,
    // "noUnusedLocals": true,
    // "noUnusedParameters": true,
    // "noFallthroughCasesInSwitch": true,
    // "noPropertyAccessFromIndexSignature": true,

    // Recommended Options
    /**
    * strict: false
    * --------------
    * 'strict: true' enables ALL strict type-checking options in one flag.
    * We set it to false here to allow gradual TypeScript adoption.
    *
    * We instead enable specific checks individually below:
    * - noImplicitAny: true       (must specify types)
    * - strictNullChecks: true    (null/undefined must be handled)
    * - noImplicitOverride: true  (must use 'override' keyword)
    *
    * For production apps, set 'strict: true' for maximum type safety.
    */
    "strict": true,
    "jsx": "react-jsx",
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true,
    "moduleDetection": "force",

    /**
    * skipLibCheck: true
    * -------------------
    * Skip type-checking of all .d.ts declaration files in node_modules.
    * This speeds up compilation and avoids errors in third-party type files.
    * Recommended setting for most SAP UI5 projects.
    */
    "skipLibCheck": true,
  },
  // Include all TypeScript and JavaScript files in the webapp folder for compilation
  "include": ["./webapp/**/*"],
  "exclude": [
        "node_modules",
        "dist",
        "**/*.d.ts"
    ]
}
```


4. we will now add builderConfiguration to ui5.yaml file as customTask

builder:
  customTasks:
    - name: ui5-tools-transpile-task
      afterTask: replaceVersion
server:
  customMiddleware:
  - name: ui5-tooling-transpile-middleware
    afterMiddleware: compression

5. Keep changing files and run command to test
```
tsc --noEmit
```