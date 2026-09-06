# Day 15 - CI/CD and Transport Management

> **Subscribing to CI/CD and CTMS, service keys, roles, spaces, transport landscape and the pipeline**

> Phase E - Fiori & Deployment (Days 12-15) - Build the Fiori app in BAS, deploy it, publish it, and transport it.

**🎯 Goal of the day.** Automate the path from a Git commit to a running app in QLT and PROD.

---

## 📋 Cheat Sheet - keep this open

### Today's quick reference

| Thing | Value / Syntax |
|---|---|
| `Subscribe` | Service Marketplace > Continuous Integration & Delivery, and Cloud Transport Management |
| **CTMS instance** | plan `standard`, then create a **service key** |
| **Roles needed** | `TransportOperator`, `TransportManager` (CTMS); `CICD Service Administrator` (CI/CD) |
| `Spaces` | create `QLT` and `PROD`; note each **space GUID** |
| **Deploy URL pattern** | `https://deploy-service.cf.<region>.hana.ondemand.com/slprot/<my-space-guid>/slp` |
| `Sample` | `https://deploy-service.cf.us10-001.hana.ondemand.com/slprot/<my-space-guid>/slp` |
| **CTMS help** | https://help.sap.com/docs/cloud-transport-management |
| **CF API endpoint** | BTP cockpit subaccount Overview page |

### Eclipse / ADT keys you will use constantly

| Key | Action |
|---|---|
| `Ctrl+Shift+A` | Search any object in the whole system |
| `Ctrl+F3` | Activate the current object |
| `Ctrl+1` | Quick fix - RAP generates code skeletons for you |
| `Ctrl+Space` | Code completion |
| `Ctrl+Click` | Navigate to the object under the cursor |
| `Ctrl+7` | Comment / uncomment a block |
| `F2` | Show a method signature |
| `F8` | Data preview (table / CDS entity) |
| `F9` | Run the class |

### The RAP layer cake (memorise this)

```text
Database tables            <- where the data really sits
   |
Interface CDS entity       <- stable, reusable model       (ZAM_AB_TRAVEL)
   |
Behavior Definition        <- the rulebook                 (.bdef)
   |
Projection CDS entity      <- one app's view of the model  (ZAM_AB_TRAVEL_PROCESSOR)
   |
Projection BDEF            <- which rules this app may use
   |
Metadata Extension (MDE)   <- the screen layout, @UI.*
   |
Service Definition         <- which entities are allowed out
   |
Service Binding            <- the actual OData V2 / V4 URL
   |
Fiori Elements app         <- built from the annotations, no JavaScript needed
```

---

## 🧱 What you will build today

- Subscriptions to **Continuous Integration & Delivery** and **Cloud Transport Management (CTMS)**.
- A CTMS **service instance** and **service key**.
- **Role collections** for transport administration, assigned to your users.
- Two Cloud Foundry **spaces**: `QLT` and `PROD`.
- A **transport landscape** (nodes + route) in CTMS.
- A **CI/CD job** with a webhook on your Git repository.

## 🧠 Concepts first, in plain English

Read this before touching the keyboard. Every idea is explained the way you would explain it to a school student.

**CI/CD**

*Continuous Integration / Continuous Delivery*. A robot that watches your Git repo, and on every commit builds the app, tests it and deploys it. No human clicking.

**Pipeline**

The recipe the robot follows: build, then test, then upload to transport, then deploy.

**Webhook**

Git's doorbell. When you push, Git calls a URL and the CI/CD service wakes up. The webhook secret proves the call really came from your repo.

**CTMS**

*Cloud Transport Management*. The cloud version of the classic transport request. It moves the *same built artefact* from DEV to QLT to PROD - so what you tested is exactly what ships.

**Transport node and route**

A **node** is a destination (QLT, PROD). A **route** is an allowed arrow between nodes. Routes stop anyone shipping straight from DEV to PROD.

**Space**

A Cloud Foundry compartment inside your subaccount. Separate spaces for QLT and PROD keep test data away from real data.

**Service key**

Again the machine-to-machine credential - this time so CI/CD can talk to CTMS on your behalf.

**Role collection**

A bundle of BTP roles you assign to a person. `TransportOperator` and `TransportManager` are the ones needed to move transports.

---

## 🛠️ Hands-on, step by step

### Step 1. Subscribe to CICD and CTMS service


![Day 15 - screenshot 1](images/day15_01.png)


![Day 15 - screenshot 2](images/day15_02.png)

### Step 2. We now create a service instance for CTMS


![Day 15 - screenshot 3](images/day15_03.png)


![Day 15 - screenshot 4](images/day15_04.png)

### Step 3. Then create a service key


![Day 15 - screenshot 5](images/day15_05.png)

![Day 15 - screenshot 6](images/day15_06.png)

### Step 4. Assign the role to both of your IDP users


![Day 15 - screenshot 7](images/day15_07.png)

Create new role collection to manage transport at runtime


![Day 15 - screenshot 8](images/day15_08.png)


![Day 15 - screenshot 9](images/day15_09.png)

Assign role collection to our user


![Day 15 - screenshot 10](images/day15_10.png)

![Day 15 - screenshot 11](images/day15_11.png)


![Day 15 - screenshot 12](images/day15_12.png)

Now we create spaces where we deploy our app

### Step 5. Two spaces - QLT and PROD


![Day 15 - screenshot 13](images/day15_13.png)

### Step 6. Note down space id in a notepad file


![Day 15 - screenshot 14](images/day15_14.png)

![Day 15 - screenshot 15](images/day15_15.png)

### Step 7. Prepare URL


![Day 15 - screenshot 16](images/day15_16.png)

🔗 <https://help.sap.com/docs/cloud-transport-management/sap-cloud-transport-management/creating-destinations-using-sap-cloud-deployment-service-with-basic-authentication>

### Step 8. You can use sample URL - https://deploy-service.cf.us10-001.hana.ondemand.com/slprot/<my-space-guid>/slp


![Day 15 - screenshot 17](images/day15_17.png)


![Day 15 - screenshot 18](images/day15_18.png)

### Step 9. Configure landscape for transport in CTMS


![Day 15 - screenshot 19](images/day15_19.png)


![Day 15 - screenshot 20](images/day15_20.png)

![Day 15 - screenshot 21](images/day15_21.png)

![Day 15 - screenshot 22](images/day15_22.png)

### Step 10. Configure Pipeline in CI CD service


![Day 15 - screenshot 23](images/day15_23.png)

Copy Service key


![Day 15 - screenshot 24](images/day15_24.png)


![Day 15 - screenshot 25](images/day15_25.png)

![Day 15 - screenshot 26](images/day15_26.png)

### Step 11. Add the repository


![Day 15 - screenshot 27](images/day15_27.png)

### Step 12. Generate webhook credentials and copy in notepad


![Day 15 - screenshot 28](images/day15_28.png)


![Day 15 - screenshot 29](images/day15_29.png)

### Step 13. Copy the URL


![Day 15 - screenshot 30](images/day15_30.png)

Share with Anubhav

### Step 14. Create a new job


![Day 15 - screenshot 31](images/day15_31.png)

### Step 15. Get api end point and a/c details


![Day 15 - screenshot 32](images/day15_32.png)


![Day 15 - screenshot 33](images/day15_33.png)

![Day 15 - screenshot 34](images/day15_34.png)

---

---

## ⚠️ Traps and tips

- Keep a notepad file. This day generates a service key, two space GUIDs, a webhook secret and an API endpoint - you will need all four again.
- Region matters. Every URL on this day contains a region code such as `us10-001`; copy yours from the cockpit, do not trust the screenshot.

---

[⬅️ Day 14](Day14_Deploy_And_Publish_To_Launchpad.md) | [🏠 Summary](00_SUMMARY.md) | [📋 Master Cheat Sheet](00_MASTER_CHEAT_SHEET.md) | [Day 16 ➡️](Day16_Custom_Entities_And_Unmanaged_RAP.md)
