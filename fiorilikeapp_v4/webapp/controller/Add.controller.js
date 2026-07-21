sap.ui.define(
    //while we add dependencies, use module name
    [
        "ey/ap/acc/controller/BaseController",
        "sap/m/MessageBox",
        "sap/m/MessageToast",
        "sap/ui/model/json/JSONModel",
        "sap/ui/core/Fragment"
    ], 
    function(BaseController, MessageBox, MessageToast, JSONModel, Fragment){
        return BaseController.extend("ey.ap.acc.controller.Add",{
            onInit: function(){

                this.getRouter().getRoute("superman").attachMatched(this.herculis, this);

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
                this.getView().byId("idDelete").setEnabled(false);
                this.getView().setModel(this.oLocalModel, "zkas");

            },

            prodId: null,
            mode: 'Create',

            setMode: function(sMode){
                this.mode = sMode;
                if(this.mode === "Create"){
                    this.getView().byId("idSave").setText("Save");
                    this.getView().byId("idProd").setEnabled(true);
                    this.getView().byId("idDelete").setEnabled(false);
                }else{
                    this.getView().byId("idSave").setText("Update");
                    this.getView().byId("idProd").setEnabled(false);
                    this.getView().byId("idDelete").setEnabled(true);
                }
            },
            onDelete: function(){
                //step 2: call sap to check  if the product exist
                var oDataModel = this.getOwnerComponent().getModel();

                //create a local variable to access controller object inside callback
                var that = this;

                //step 3: check if product exist in sap
                oDataModel.remove("/ProductSet('" + this.prodId + "')", {
                    //YES, product exist
                    success:function(data){
                        MessageToast.show("The product is now deleted");
                        that.setMode("Create");
                    }
                });
            },

            onConfirm: function(oEvent){
                //step 1: get the value of selected supplier
                var supplierId = oEvent.getParameter("selectedItem").getTitle();
                var supplierName = oEvent.getParameter("selectedItem").getDescription();

                //Step 2: set the id to the field
                this.oField.setValue(supplierId);
                this.oLocalModel.setProperty("/prodData/SUPPLIER_NAME",supplierName);
            },
            //step 1: create a object for fragment
            oSupplierPopup : null,
            oField: null,
            onF4Help: function(oEvent){
                //take a snapshot of the field on which f4 was pressed
                this.oField = oEvent.getSource();
                //in the callback we can access our cotroller object using that
                var that = this;
                //step 2: load our fragment using sapui5 api = load and return object in callback
                //like in abap during PBO - IF lo_alv IS NOT BOUND
                if(!that.oSupplierPopup){
                    Fragment.load({
                        fragmentName:"ey.ap.acc.fragments.popup",
                        type:"XML",
                        id:"supplier",
                        controller: that
                    })
                    //promise which fullfil if fragment object is created successfully
                    .then(function(oFragment){
                        //first run
                        that.oSupplierPopup = oFragment;
                        that.oSupplierPopup.setTitle("Choose one of the Suppliers");
                        //allow parasite to access human heart by Immune system
                        that.getView().addDependent(that.oSupplierPopup);
                        that.oSupplierPopup.setMultiSelect(false);
                        that.oSupplierPopup.bindAggregation("items",{
                            path: '/SupplierSet',
                            template: new sap.m.StandardListItem({
                                icon: 'sap-icon://supplier',
                                title: '{BP_ID}',
                                description: '{COMPANY_NAME}'
                            })
                        });
                        that.oSupplierPopup.open();
                    });
                }else{
                    that.oSupplierPopup.open();
                }
                
            },
            onLoadExp: function(){
                //step 2: call sap to check  if the product exist
                var oDataModel = this.getOwnerComponent().getModel();

                //create a local variable to access controller object inside callback
                var that = this;

                //step 3: check if product exist in sap
                oDataModel.callFunction("/GetMostExpensiveProduct", {
                    urlParameters:{
                        I_CATEGORY: this.getView().byId("category").getSelectedKey()
                    },
                    //YES, product exist
                    success:function(data){
                        that.oLocalModel.setProperty("/prodData", data);
                        that.setMode("Update");
                    }
                });
            },
            onSubmit: function(oEvent){
                
                //step 1: read the product id which was entered by user
                this.prodId = oEvent.getParameter("value");

                //step 2: call sap to check  if the product exist
                var oDataModel = this.getOwnerComponent().getModel();

                //create a local variable to access controller object inside callback
                var that = this;

                //step 3: check if product exist in sap
                oDataModel.read("/ProductSet('" + this.prodId + "')", {
                    //YES, product exist
                    success:function(data){
                        that.oLocalModel.setProperty("/prodData", data);
                        that.setMode("Update");
                    }
                });

                this.getView().byId("idphoto").setSrc("/sap/opu/odata/sap/ZODATA_JUN_SRV/ProductImgSet('" + this.prodId + "')/$value");

            },
            //Route matched handler function which triggers
            //The route can change manually, browser back-forward button, when user select fruit, user reload ui.
            herculis: function(oEvent){
                debugger;
                
            },
            onBack: function(){

                //step 1: get the parent control
                var oAppCon = this.getView().getParent();
                //step 2: container have the power to navigate to 2nd child
                oAppCon.to("idView1");

            },
            onSave: function(){
                //Step 1: prepare and precheck payload (validation)
                var payload = this.oLocalModel.getProperty("/prodData");
                if(!payload.PRODUCT_ID || !payload.NAME || !payload.DESCRIPTION || !payload.PRICE){
                    MessageBox.error("Bro, give me correct data");
                    return;
                }

                //Step 2: pre-enhancement
                //payload.CURRENCY_CODE = "USD";

                //step 3: get the odata model object
                var oDataModel = this.getOwnerComponent().getModel();


                if(this.mode === "Update"){
                    
                    //step 4: trigger the POST call
                    oDataModel.update("/ProductSet('"+ this.prodId +"')",payload, {
                        success: function(){
                            MessageToast.show("Walaah! you updated it 😂");
                        },
                        error: function(oError){
                            MessageBox.error("OOps!! something wrong in data save🤔");
                        }
                    });

                }else{
                    //step 4: trigger the POST call
                    oDataModel.create("/ProductSet",payload, {
                        success: function(){
                            MessageToast.show("Walaah! you made it bro 😂");
                        },
                        error: function(oError){
                            MessageBox.error("OOps!! something wrong in data save🤔");
                        }
                    });
                }
                

            },
            onClear: function(){
                this.setMode("Create");
                this.oLocalModel.setProperty("/prodData",{
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
            }

        });
    }
);