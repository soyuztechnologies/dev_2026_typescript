## Cheat sheet

1. Create reusable types and type guard for odata types/anubhav.d.ts
```
export interface ODataV2Metadata {
    id: string;
    uri: string;
    type: string;
    etag?: string;
}

export interface ODataV2Deferred {
    __deferred: { uri: string };
}

export interface ODataV2Entity {
    __metadata: ODataV2Metadata;
}

/** Single-record read: GET /ProductSet('HT-1002') */
export interface ODataV2Response<T extends ODataV2Entity> {
    d: T;
}


export interface Product extends ODataV2Entity {
    PRODUCT_ID: string;
    TYPE_CODE: string;
    CATEGORY: string;
    NAME: string;
    DESCRIPTION: string;
    SUPPLIER_ID: string;
    SUPPLIER_NAME: string;
    TAX_TARIF_CODE: string;
    PRICE: string;
    CURRENCY_CODE: string;
    DIM_UNIT: string;
    PRODUCT_PIC_URL: string;
    To_Supplier: ODataV2Deferred | Supplier;
}

export interface Supplier extends ODataV2Entity {
    BP_ID: string;
    BP_ROLE: string;
    EMAIL_ADDRESS: string;
    PHONE_NUMBER: string;
    WEB_ADDRESS: string;
    COMPANY_NAME: string;
    CITY: string;
    COUNTRY: string;
}

export declare function isProductResponse(v: unknown): v is ODataV2Response<Product>;

export declare function isSupplierResponse(v: unknown): v is ODataV2Response<Supplier>;
```

2. reuse of types and odata type guard
```
import type {
    isProductResponse, isSupplierResponse,
    Supplier, Product, ODataV2Response
} from '../types/anubhav';
```

3. Mode type and variable
```
    type Mode = 'Create' | 'Update';

    private oLocalModel: JSONModel | null = null;
    private oSupplierPopup : SelectDialog | null = null;
    private oField: Input | null = null;
    private prodId: string | null = null;
    private mode: Mode = 'Create';

```

4. Typecast odata model object
```
var oDataModel = (this.getOwnerComponent() as UIComponent).getModel() as ODataModel;
```

5. adding data type casting for success data callback
```
        oDataModel.remove("/ProductSet('" + this.prodId + "')", {
            success:function(data: ODataV2Response<Product>){
                MessageToast.show("The product is now deleted");
                console.log(data.d.PRODUCT_ID);
                that.setMode("Create");
            }
        });
```

6. string data type casting
```
var supplierId = oEvent?.getParameter("selectedItem")?.getTitle() as string;
```

7. dropdown value type cast for callFunction
```
urlParameters:{
                    I_CATEGORY: (this.getView()?.byId("category") as Select).getSelectedKey() 
                },
```

8. Optional chaining for local model accessing data
```
    that.oLocalModel?.setProperty("/prodData", data);
```


### add.controller.ts
```
import BaseController from "ey/ap/acc/controller/BaseController"
import MessageBox from "sap/m/MessageBox"
import MessageToast from "sap/m/MessageToast"
import JSONModel from "sap/ui/model/json/JSONModel"
import Fragment from "sap/ui/core/Fragment"
import Select from "sap/m/Select"
import History from "sap/ui/core/routing/History";
import StandardListItem from "sap/m/StandardListItem"

import type SelectDialog from "sap/m/SelectDialog"
import type Input from "sap/m/Input"
import type { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import type { SelectDialog$ConfirmEvent } from "sap/m/SelectDialog";
import type Button from "sap/m/Button"
import type UIComponent from "sap/ui/core/UIComponent"
import type ODataModel from "sap/ui/model/odata/v2/ODataModel"
import type Image from "sap/m/Image"
import type { Input$SubmitEvent, Input$ValueHelpRequestEvent } from "sap/m/Input"
import type {
    isProductResponse, isSupplierResponse,
    Supplier, Product, ODataV2Response
} from '../types/anubhav';

type Mode = 'Create' | 'Update';

/**
 * @namespace ey.ap.acc.controller
 */
export default class AddController extends BaseController {
    private oLocalModel: JSONModel | null = null;
    private oSupplierPopup : SelectDialog | null = null;
    private oField: Input | null = null;
    private prodId: string | null = null;
    private mode: Mode = 'Create';

    onInit(): void{

        this.getRouter()?.getRoute("superman")?.attachMatched(this.herculis, this);

        this.oLocalModel = new JSONModel({
            "prodData": {
                            "PRODUCT_ID": "",
                            "TYPE_CODE": "PR",
                            "CATEGORY": "Notebooks",
                            "NAME": "",
                            "DESCRIPTION": "",
                            "SUPPLIER_ID": "0100000049",
                            "SUPPLIER_NAME": "Talpa",
                            "TAX_TARIF_CODE": "1 ",
                            "PRICE": "0.00",
                            "CURRENCY_CODE": "USD",
                            "DIM_UNIT": "CM",
                            "PRODUCT_PIC_URL": "/sap/public/bc/NWDEMO_MODEL/IMAGES/JN-2025.jpg"
                        }
        });
        (this.getView()?.byId("idDelete") as Button).setEnabled(false);
        this.getView()?.setModel(this.oLocalModel, "zkas");

    };

    //Route matched handler function which triggers
    //The route can change manually, browser back-forward button, when user select fruit, user reload ui.
    herculis(oEvent: Route$PatternMatchedEvent): void {
        debugger;
        
    };

    setMode(sMode: Mode): void{
        this.mode = sMode;
        if(this.mode === "Create"){
            (this.getView()?.byId("idSave") as Button).setText("Save");
            (this.getView()?.byId("idProd") as Input).setEnabled(true);
            (this.getView()?.byId("idDelete") as Button).setEnabled(false);
        }else{
            (this.getView()?.byId("idSave") as Button).setText("Update");
            (this.getView()?.byId("idProd") as Input).setEnabled(false);
            (this.getView()?.byId("idDelete") as Button).setEnabled(true);
        }
    };

    onDelete() : void{
        //step 2: call sap to check  if the product exist
        var oDataModel = (this.getOwnerComponent() as UIComponent).getModel() as ODataModel;

        //create a local variable to access controller object inside callback
        var that = this;

        //step 3: check if product exist in sap
        oDataModel.remove("/ProductSet('" + this.prodId + "')", {
            //YES, product exist
            success:function(data: ODataV2Response<Product>){
                MessageToast.show("The product is now deleted");
                console.log(data.d.PRODUCT_ID);
                that.setMode("Create");
            }
        });
    };

    onConfirm(oEvent: SelectDialog$ConfirmEvent): void{
        //step 1: get the value of selected supplier
        var supplierId = oEvent?.getParameter("selectedItem")?.getTitle() as string;
        var supplierName = oEvent?.getParameter("selectedItem")?.getDescription();

        //Step 2: set the id to the field
        this.oField?.setValue(supplierId);
        this.oLocalModel?.setProperty("/prodData/SUPPLIER_NAME",supplierName);
    };

    onF4Help = (oEvent: Input$ValueHelpRequestEvent): void =>{
                //take a snapshot of the field on which f4 was pressed
                this.oField = oEvent.getSource();
                //step 2: load our fragment using sapui5 api = load and return object in callback
                //like in abap during PBO - IF lo_alv IS NOT BOUND
                if(!this.oSupplierPopup){
                    Fragment.load({
                        name:"ey.ap.acc.fragments.popup",
                        type:"XML",
                        id:"supplier",
                        controller: this
                    })
                    //promise which fullfil if fragment object is created successfully
                    .then((oFragment) => {
                        //first run
                        this.oSupplierPopup = oFragment as SelectDialog;
                        this.oSupplierPopup.setTitle("Choose one of the Suppliers");
                        //allow parasite to access human heart by Immune system
                        this.getView()?.addDependent(this.oSupplierPopup);
                        this.oSupplierPopup.setMultiSelect(false);
                        this.oSupplierPopup.bindAggregation("items",{
                            path: '/SupplierSet',
                            template: new StandardListItem({
                                icon: 'sap-icon://supplier',
                                title: '{BP_ID}',
                                description: '{COMPANY_NAME}'
                            })
                        });
                        this.oSupplierPopup.open("");
                    });
                }else{
                    this.oSupplierPopup.open("");
                }
                
    };
        
        
    onLoadExp = (): void => {
            //step 2: call sap to check  if the product exist
            var oDataModel = (this.getOwnerComponent() as UIComponent).getModel() as ODataModel;
            var x = new Select();
            var that = this;
            //step 3: check if product exist in sap
            oDataModel.callFunction("/GetMostExpensiveProduct", {
                urlParameters:{
                    I_CATEGORY: (this.getView()?.byId("category") as Select).getSelectedKey() 
                },
                //YES, product exist
                success:function(data: ODataV2Response<Product>){
                    that.oLocalModel?.setProperty("/prodData", data);
                    that.setMode("Update");
                }
            });
    };

    onSubmit = (oEvent: Input$SubmitEvent) : void => {
            
            var that = this;
            //step 1: read the product id which was entered by user
            this.prodId = oEvent.getParameter("value") as string;

            //step 2: call sap to check  if the product exist
            var oDataModel = (this.getOwnerComponent() as UIComponent).getModel() as ODataModel;

            //create a local variable to access controller object inside callback
            var that = this;

            //step 3: check if product exist in sap
            oDataModel.read("/ProductSet('" + this.prodId + "')", {
                //YES, product exist
                success:function(data: ODataV2Response<Product>){
                    that.oLocalModel?.setProperty("/prodData", data);
                    that.setMode("Update");
                }
            });

            (this.getView()?.byId("idphoto") as Image).setSrc("/sap/opu/odata/sap/ZODATA_JUN_SRV/ProductImgSet('" + this.prodId + "')/$value");

    };

    onBack() : void {

        //get history instance
        var oHistory = History.getInstance();
        //get previous hash
        var sPreviousHash = oHistory.getPreviousHash();
        if(sPreviousHash !== undefined){
            //navigate back
            window.history.go(-1);
        }else{
            //navigate to default route
            this.getRouter().navTo("RouteView1", {}, true);
        }

    };

    onSave = (): void => {
            //Step 1: prepare and precheck payload (validation)
            var payload = this.oLocalModel?.getProperty("/prodData");
            if(!payload.PRODUCT_ID || !payload.NAME || !payload.DESCRIPTION || !payload.PRICE){
                MessageBox.error("Bro, give me correct data");
                return;
            }

            //Step 2: pre-enhancement
            //payload.CURRENCY_CODE = "USD";

            //step 3: get the odata model object
            var oDataModel = (this.getOwnerComponent() as UIComponent).getModel() as ODataModel;


            if(this.mode === "Update"){
                
                //step 4: trigger the POST call
                oDataModel.update("/ProductSet('"+ this.prodId +"')",payload, {
                    success: function(){
                        MessageToast.show("Walaah! you updated it 😂");
                    },
                    error: function(){
                        MessageBox.error("OOps!! something wrong in data save🤔");
                    }
                });

            }else{
                //step 4: trigger the POST call
                oDataModel.create("/ProductSet",payload, {
                    success: function(){
                        MessageToast.show("Walaah! you made it bro 😂");
                    },
                    error: function(){
                        MessageBox.error("OOps!! something wrong in data save🤔");
                    }
                });
            }
            

    };

    onClear = () => {
            this.setMode("Create");
            this.oLocalModel?.setProperty("/prodData",{
                                "PRODUCT_ID": "",
                                "TYPE_CODE": "PR",
                                "CATEGORY": "Notebooks",
                                "NAME": "",
                                "DESCRIPTION": "",
                                "SUPPLIER_ID": "0100000049",
                                "SUPPLIER_NAME": "Talpa",
                                "TAX_TARIF_CODE": "1 ",
                                "PRICE": "0.00",
                                "CURRENCY_CODE": "USD",
                                "DIM_UNIT": "CM",
                                "PRODUCT_PIC_URL": "/sap/public/bc/NWDEMO_MODEL/IMAGES/JN-2025.jpg"
                            });
    };
}



```