# Day 13 - Building the Fiori App in BAS and Setting Up the Launchpad

> **Fiori Elements project from the V4 service, Page Editor customising, plus SAP CIS and Build Workzone**

> Phase E - Fiori & Deployment (Days 12-15) - Build the Fiori app in BAS, deploy it, publish it, and transport it.

**🎯 Goal of the day.** Generate a real Fiori project, customise it without code, and prepare the launchpad your business users will log into.

---

## 📋 Cheat Sheet - keep this open

### Today's quick reference

| Thing | Value / Syntax |
|---|---|
| **New Fiori project** | BAS > Ctrl+Shift+P > **Fiori: Open Application Generator** |
| `Template` | List Report Object Page (V4) |
| **Page Editor** | right-click the page in Application Info > Page Map / Page Editor |
| `CIS` | BTP cockpit > Service Marketplace > Cloud Identity Services, service type **productive** |
| **CIS admin password** | set from the SAP email; this material uses `Welcome1` |
| `Trust` | Security > Trust Configuration > New Trust Configuration |
| **Work Zone** | Service Marketplace > SAP Build Work Zone, standard edition |
| **Temp email** | https://temp-mail.org/ |
| **Test as a user** | always in an **incognito window** so your admin session does not leak in |

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

- A **Fiori Elements List Report / Object Page** project pointing at your V4 service.
- Customisations with the **Page Editor**: flexible column layout, list report settings.
- An **SAP Cloud Identity Services (CIS)** tenant, with **trust** established to your BTP subaccount.
- A **SAP Build Work Zone** subscription, a **site**, and a real **business user**.

## 🧠 Concepts first, in plain English

Read this before touching the keyboard. Every idea is explained the way you would explain it to a school student.

**Fiori Elements**

Pre-built page templates. You supply annotations; SAP supplies the screen. This is why Days 6-7 spent so long on `@UI` annotations - they *are* the UI.

**List Report / Object Page**

The two-page pattern behind most SAP apps: a filterable list, then a detail page. It matches the RAP root + children model exactly.

**Page Editor**

A visual editor in BAS. Ticking a box there writes an annotation or a manifest change for you - so you can still see exactly what changed in the source.

**Flexible Column Layout**

List on the left, detail on the right, both visible. Better than full-screen navigation when users compare records.

**Identity Provider (IdP)**

The service that stores usernames and passwords. BTP's default IdP is for *developers*. Business users belong in a **custom IdP** - that is what CIS gives you.

**Trust configuration**

You tell BTP 'I trust this IdP to vouch for users'. Without trust, CIS users cannot log in to your apps.

**Build Work Zone**

The launchpad: the tile-covered home page users see. Apps do not appear there automatically - you register them via catalogs, groups and roles.

**Why a temp email?**

Purely so you can register a *second*, non-admin user and experience the app the way a real business user does. A trainer's trick, not a production practice.

---

## 🛠️ Hands-on, step by step

### Step 1. Continue to select our service (note: it takes lot of time to load service)


![Day 13 - screenshot 1](images/day13_01.png)


![Day 13 - screenshot 2](images/day13_02.png)


![Day 13 - screenshot 3](images/day13_03.png)


![Day 13 - screenshot 4](images/day13_04.png)

![Day 13 - screenshot 5](images/day13_05.png)

### Step 2. Test the app


![Day 13 - screenshot 6](images/day13_06.png)


![Day 13 - screenshot 7](images/day13_07.png)

![Day 13 - screenshot 8](images/day13_08.png)


![Day 13 - screenshot 9](images/day13_09.png)

### Step 3. Now we can customize app with our own requirement


![Day 13 - screenshot 10](images/day13_10.png)


![Day 13 - screenshot 11](images/day13_11.png)

### Step 4. With the flexible layout ON


![Day 13 - screenshot 12](images/day13_12.png)

### Step 5. Edit List Report Feature


![Day 13 - screenshot 13](images/day13_13.png)


![Day 13 - screenshot 14](images/day13_14.png)

![Day 13 - screenshot 15](images/day13_15.png)

Test the app

### Step 6. Create SAP CIS and SAP Build Workzone


![Day 13 - screenshot 16](images/day13_16.png)

Service type: productive

You will get email from SAP to set admin password, Set your admin password as Welcome1

### Step 7. Now we establish Trust with CIS service in BTP a/c

Create Build Workzone Subscription now


![Day 13 - screenshot 17](images/day13_17.png)

![Day 13 - screenshot 18](images/day13_18.png)

![Day 13 - screenshot 19](images/day13_19.png)

![Day 13 - screenshot 20](images/day13_20.png)


![Day 13 - screenshot 21](images/day13_21.png)


![Day 13 - screenshot 22](images/day13_22.png)

Create a temp email

🔗 <https://temp-mail.org/>

piwemig448@mirarmax.com - Alex Methew

### Step 8. Now with CIS we will register a business user


![Day 13 - screenshot 23](images/day13_23.png)

### Step 9. Now the temp email a/c receive an email, use the activation link in incognito window to reset password


![Day 13 - screenshot 24](images/day13_24.png)

### Step 10. Now we add the Admin role for ourself (custom idp user of yours)


![Day 13 - screenshot 25](images/day13_25.png)


![Day 13 - screenshot 26](images/day13_26.png)

### Step 11. Add business user and assign basic role to access launchpad


![Day 13 - screenshot 27](images/day13_27.png)

![Day 13 - screenshot 28](images/day13_28.png)

### Step 12. As a admin we create a site


![Day 13 - screenshot 29](images/day13_29.png)


![Day 13 - screenshot 30](images/day13_30.png)

### Step 13. Launch site created and give URL to busines user in incognito window so they can access empty site


![Day 13 - screenshot 31](images/day13_31.png)

---

---

## ⚠️ Traps and tips

- Loading the service list in the generator is slow the first time - it is downloading your whole `$metadata`. Let it finish.
- Keep two browsers (or normal + incognito) open: one as admin, one as business user. You will switch constantly.

---

[⬅️ Day 12](Day12_Precheck_Augment_Virtual_Elements_BAS.md) | [🏠 Summary](00_SUMMARY.md) | [📋 Master Cheat Sheet](00_MASTER_CHEAT_SHEET.md) | [Day 14 ➡️](Day14_Deploy_And_Publish_To_Launchpad.md)
