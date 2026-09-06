# Appendix — SAP Fiori: JavaScript → TypeScript

> ## ⚠️ Read this box first
>
> **This chapter is NOT from the training material.**
>
> The *Applied Material RAP Training* document contains **no JavaScript and no TypeScript**. Its entire Fiori story is annotation-driven Fiori Elements (`@UI.*` in metadata extension files) plus visual customising in the BAS Page Editor. That is deliberate on the trainer's part — the whole point of Days 6–7 is that **you get a complete app without writing UI code**.
>
> Every snippet in **Day01–Day19** is reproduced byte-for-byte from your document. **Nothing in those files was written by the guide author.**
>
> This appendix is the opposite: **every snippet here was written by the guide author** as reference material, because you asked for JS→TS coverage. Treat it as a companion, not as part of the course.
>
> TypeScript support in UI5 moves quickly. Verify package names and versions against the current [SAPUI5 TypeScript documentation](https://sdk.openui5.org/topic/eded636b85a8478d9808ea3fbb32557a) and the [`ui5-typescript-helloworld`](https://github.com/SAP/ui5-typescript-helloworld) sample before starting real work.

[🏠 Summary](00_SUMMARY.md) | [📋 Master Cheat Sheet](00_MASTER_CHEAT_SHEET.md) | [⬅️ Day 19](Day19_Attachments_RAP_Generator_Clean_Core.md)

---

## 📋 Cheat Sheet

| Thing | Value |
|---|---|
| SAPUI5 types | `@sapui5/types` (OpenUI5: `@openui5/types`) |
| Older type package names | `@sapui5/ts-types-esm`, `@sapui5/ts-types` |
| Transpiler | `ui5-tooling-transpile` (custom UI5 task **and** middleware) |
| Custom control interfaces | `@ui5/ts-interface-generator` |
| New TS app | `yo @sap/fiori` → tick **Enable TypeScript** |
| Official sample | https://github.com/SAP/ui5-typescript-helloworld |
| Type check only | `npx tsc --noEmit` |
| Gradual migration switch | `"allowJs": true` in `tsconfig.json` |
| Strictness switch | `"strict": true` — turn on **last**, not first |

### The three-line mental model

```text
You write            .ts files with ES module imports
ui5-tooling-transpile turns them into  sap.ui.define(...) AMD modules
The browser gets      ordinary UI5 JavaScript — the runtime never knows
```

TypeScript is a **build-time** tool. There is no TypeScript in the browser and no TypeScript in your deployed HTML5 repository artefact. This matters: it means conversion is a **zero-risk-to-runtime** change, and it means you can convert one file at a time.

---

## 🧠 Concepts first, in plain English

**What TypeScript actually is**

JavaScript with labels on the boxes. In JavaScript you can write `oInput.setValue(42)` and only find out at 3 a.m. in production that `setValue` wanted a string. TypeScript reads the label, notices the mismatch, and underlines it in red while you type.

The labels are thrown away before the code ships. Your app is still JavaScript.

**Why it matters more in UI5 than in most frameworks**

UI5 has thousands of classes and methods, most named similarly, most taking objects with many optional properties. Nobody remembers whether it is `attachSelectionChange` or `attachSelectChange`, or what shape the event parameter is. With types installed, the editor tells you — and refuses to compile the wrong guess.

**AMD vs ES modules**

Classic UI5 uses **AMD**: `sap.ui.define(["sap/m/Button"], function(Button) { ... })`. TypeScript speaks **ES modules**: `import Button from "sap/m/Button";`. The transpiler translates the second into the first. This is the single biggest visual difference when you open a converted file.

**Why the RAP part of this course is unaffected**

Everything in Days 1–12 is ABAP. Everything in Days 6–7 is annotations. TypeScript enters only when you need behaviour that Fiori Elements cannot express through annotations — a custom column formatter, a custom section, a non-standard action handler. If your app is pure Fiori Elements, **you may never need this appendix at all.**

---

## 🗺️ When to convert, and when not to

| Situation | Verdict |
|---|---|
| Pure Fiori Elements app, annotations only (this course, Days 6–14) | **Do not bother.** There is no code to convert. |
| A handful of controller extensions on a Fiori Elements app | Worth it — extensions are exactly where type errors hide |
| Freestyle SAPUI5 app with real controller logic | **Yes.** Highest payoff. |
| Custom UI5 controls | **Yes**, plus `@ui5/ts-interface-generator` |
| Legacy app nobody will touch again | Leave it alone. Conversion has a cost and no benefit. |
| App you are about to hand to another team | Yes — types are documentation that cannot go stale |

---

## 🛠️ Path A — start a new app in TypeScript

By far the easiest route. The generator wires up everything.

### Step 1. Generate with TypeScript enabled

```bash
# In a BAS terminal, from your projects folder
yo @sap/fiori
```

Choose your template (for a RAP service, **List Report Object Page** V4), point it at your service binding from Day 11, and when the generator asks, tick:

```text
? Enable TypeScript  ->  Yes
```

That single answer gives you a `tsconfig.json`, the type packages, the transpiler task and middleware already configured in `ui5.yaml`, and a `.ts` controller instead of a `.js` one.

### Step 2. Confirm the pieces landed

```bash
cat tsconfig.json
grep -A3 "ui5-tooling-transpile" ui5.yaml
npx tsc --noEmit          # should print nothing
```

`npx tsc --noEmit` is your friend for the rest of your life. It type-checks without producing any output files.

---

## 🛠️ Path B — convert an existing JavaScript app

The important principle: **convert one file at a time, keep the app running the whole way.** Never do a big-bang rename.

### Step 1. Commit first

```bash
git add . && git commit -m "before TypeScript conversion"
```

If it goes badly, `git checkout .` costs you nothing. Day 14 already covered why this habit matters.

### Step 2. Install the toolchain

```bash
npm install --save-dev typescript @sapui5/types ui5-tooling-transpile
```

Use `@openui5/types` instead if you are on OpenUI5. Match the **major.minor** of the types package to your UI5 runtime version — mismatched types produce errors on code that works perfectly.

### Step 3. Add `tsconfig.json`

Note `allowJs: true` and `strict: false`. Both are temporary, and both are what make incremental conversion possible.

```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "es2022",
    "moduleResolution": "node",
    "skipLibCheck": true,
    "allowJs": true,
    "strict": false,
    "noEmitOnError": true,
    "types": ["@sapui5/types"],
    "paths": {
      "com/mycompany/myapp/*": ["./webapp/*"]
    }
  },
  "include": ["webapp/**/*"]
}
```

<details>
<summary>💡 What the important lines mean</summary>

| Line | What it does |
|---|---|
| `"allowJs": true` | Lets `.ts` and `.js` files coexist. **This is the key to gradual migration.** Without it you must convert everything at once. |
| `"strict": false` | Turn strictness off at the start. You want the app running before you want it perfect. |
| `"types": ["@sapui5/types"]` | Loads the UI5 type definitions so `import Button from "sap/m/Button"` resolves. |
| `"paths"` | Maps your app's namespace to `webapp/`, so `import Foo from "com/mycompany/myapp/Foo"` works. Replace with your real namespace. |
| `"skipLibCheck": true` | Do not type-check inside `node_modules`. Saves a lot of time and noise. |
| `"noEmitOnError": true` | Do not produce output if there are type errors — fail loudly rather than shipping something broken. |
| `"module": "es2022"` | You write ES modules; the transpiler converts them to UI5's AMD format. |

</details>

### Step 4. Wire the transpiler into `ui5.yaml`

The **task** handles `ui5 build`; the **middleware** handles `ui5 serve`. You need both, or the app will work in dev and break in the build (or vice versa).

```yaml
builder:
  customTasks:
    - name: ui5-tooling-transpile-task
      afterTask: replaceVersion
server:
  customMiddleware:
    - name: ui5-tooling-transpile-middleware
      afterMiddleware: compression
      configuration:
        debug: true
```

### Step 5. Convert your first file

Pick the **smallest, dullest** file you have — a formatter or a utility module, not your main controller.

**Before** (`webapp/model/formatter.js`):

```javascript
sap.ui.define([], function () {
    "use strict";

    return {
        statusText: function (sStatus) {
            switch (sStatus) {
                case "O": return "Open";
                case "A": return "Accepted";
                case "X": return "Rejected";
                default:  return sStatus;
            }
        }
    };
});
```

**After** (`webapp/model/formatter.ts`):

```typescript
export function statusText(sStatus: string): string {
    switch (sStatus) {
        case "O": return "Open";
        case "A": return "Accepted";
        case "X": return "Rejected";
        default:  return sStatus;
    }
}
```

Delete the `.js`, add the `.ts`, run `npx tsc --noEmit`, then `ui5 serve` and click through the app. Commit. That is one file done.

### Step 6. Convert a controller

**Before** (`webapp/controller/Main.controller.js`):

```javascript
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("com.mycompany.myapp.controller.Main", {
        onInit: function () {
            this._sTravelId = "";
        },

        onPress: function (oEvent) {
            var sId = oEvent.getSource().getBindingContext().getProperty("TravelId");
            MessageToast.show("Travel " + sId);
        }
    });
});
```

**After** (`webapp/controller/Main.controller.ts`):

```typescript
import Controller from "sap/ui/core/mvc/Controller";
import MessageToast from "sap/m/MessageToast";
import Event from "sap/ui/base/Event";
import Button from "sap/m/Button";
import Context from "sap/ui/model/odata/v4/Context";

/**
 * @namespace com.mycompany.myapp.controller
 */
export default class Main extends Controller {

    private sTravelId = "";

    public onInit(): void {
        this.sTravelId = "";
    }

    public onPress(oEvent: Event): void {
        const oSource = oEvent.getSource() as Button;
        const oContext = oSource.getBindingContext() as Context;
        const sId = oContext.getProperty("TravelId") as string;
        MessageToast.show(`Travel ${sId}`);
    }
}
```

<details>
<summary>💡 What changed, line by line</summary>

| Change | Why |
|---|---|
| `sap.ui.define([...], function(...))` → `import` statements | ES module syntax. The transpiler converts it back to AMD for the browser. |
| `Controller.extend("full.namespace.Main", {...})` → `export default class Main extends Controller` | Real class syntax. The namespace moves into the `@namespace` JSDoc comment — **the transpiler reads that comment to rebuild the UI5 class name, so it is not optional.** |
| `onInit: function () {}` → `public onInit(): void {}` | Class method syntax, with an explicit return type. |
| `this._sTravelId` → `private sTravelId` | TypeScript has real visibility keywords, so the `_` naming convention becomes unnecessary. |
| `var sId = ...` → `const sId = ... as string` | `getProperty` returns `any`, so you assert the type you expect. Every `as` is a place where **you** are taking responsibility, not the compiler. |
| `"Travel " + sId` → `` `Travel ${sId}` `` | Template literal. Not required by TypeScript, just easier to read. |

</details>

### Step 7. Repeat, then tighten

Convert files one at a time, committing after each. When the last `.js` is gone:

```json
{
  "compilerOptions": {
    "allowJs": false,
    "strict": true
  }
}
```

Now `npx tsc --noEmit` will produce a fresh wave of errors — mostly missing null checks. This is the point where TypeScript starts genuinely finding bugs rather than just describing your code. Fix them in a separate commit.

---

## 🛠️ Path C — TypeScript in a Fiori Elements extension

This is the case most relevant to *this* course. Your RAP app from Days 6–14 is pure annotations; you add TypeScript only where annotations run out.

A controller extension on an Object Page, in TypeScript:

```typescript
import ControllerExtension from "sap/ui/core/mvc/ControllerExtension";
import ExtensionAPI from "sap/fe/templates/ObjectPage/ExtensionAPI";
import MessageBox from "sap/m/MessageBox";

/**
 * @namespace com.mycompany.travel.ext.controller
 */
export default class ObjectPageExt extends ControllerExtension<ExtensionAPI> {

    static overrides = {
        editFlow: {
            onAfterSave(this: ObjectPageExt): void {
                MessageBox.success("Travel request saved.");
            }
        }
    };

    public onCustomAction(): void {
        const oContext = this.base.getExtensionAPI().getBindingContext();
        MessageBox.information(`Acting on: ${oContext?.getPath()}`);
    }
}
```

<details>
<summary>💡 What the important lines mean</summary>

| Line | What it does |
|---|---|
| `ControllerExtension<ExtensionAPI>` | The generic parameter types `this.base.getExtensionAPI()`, so the editor knows which Fiori Elements API methods exist. |
| `static overrides = { editFlow: { ... } }` | How Fiori Elements extensions hook the standard flow. `onAfterSave` fires after the RAP `Activate` action succeeds. |
| `onAfterSave(this: ObjectPageExt)` | An explicit `this` parameter. Needed because the method sits inside a plain object literal, where TypeScript cannot infer `this`. |
| `oContext?.getPath()` | Optional chaining. Under `"strict": true` the compiler *requires* you to handle the possibility that there is no binding context. This is the compiler earning its keep. |

</details>

Reach for this when you need: a custom column formatter, a custom section, a button whose logic is more than a straight RAP action call, or client-side validation before a save. Everything else — and it is most things — belongs in the MDE file from Day 7.

---

## 🛠️ Custom controls

Custom controls need one extra tool, because UI5 generates getters and setters from your metadata at runtime and TypeScript cannot see them.

```bash
npm install --save-dev @ui5/ts-interface-generator
npx @ui5/ts-interface-generator --watch
```

It writes a `*.gen.d.ts` next to each control, declaring the generated `getText()` / `setText()` / `attachPress()` methods. Commit those files; regenerate whenever you change the metadata block.

---

## ⚠️ Traps and tips

- **Match the types version to your runtime version.** `@sapui5/types@1.120` against a 1.108 runtime will flag methods that do not exist yet in your system, and miss ones that do.
- **The `@namespace` JSDoc comment is load-bearing.** Delete it and the transpiler cannot work out the UI5 class name. The app fails at runtime with a confusing error and the compiler says nothing.
- **Turn on `strict` last.** Turning it on first buries you in errors before anything runs, and that is how conversions get abandoned halfway.
- **`as` is a promise, not a check.** `oEvent.getSource() as Button` tells the compiler to stop asking. If it is actually an `Input`, you get the same runtime crash you would have got in JavaScript. Use it deliberately and sparingly.
- **You need both the task and the middleware.** Only the middleware → works with `ui5 serve`, breaks on `ui5 build`. Only the task → the reverse. Both are in Step 4 for a reason.
- **`npx tsc --noEmit` before every commit.** The dev server is more forgiving than the build; the build is more forgiving than production.
- **Do not convert to look modern.** Convert where there is logic worth protecting. A Fiori Elements app with three annotation files and no controller code gains nothing from TypeScript except a longer build.

---

[🏠 Summary](00_SUMMARY.md) | [📋 Master Cheat Sheet](00_MASTER_CHEAT_SHEET.md) | [⬅️ Day 19](Day19_Attachments_RAP_Generator_Clean_Core.md)
