## Adding filter for dependent data

View2.controller.js

```
herculis: function(oEvent){
		...................
                //Step 3: bind element with view
                this.getView().bindElement(sPath,{
                    $expand: {
                        'operation' : {
                            $filter : 'status eq \'OPEN\''
                        }
                    }
                });
		......................

},	
```


## Lamda operators - any / all

##Get me the operations only if all the components using quantity ge 1.5
https://sample-maintenance-srv-i760021.cfapps.eu12.hana.ondemand.com/odata/v4/maintenance-order/Operation?$expand=component&$filter=component/all(c:c/quantity%20ge%201.5)


##Get me the operations only if any the components using quantity lt 1.5
https://sample-maintenance-srv-i760021.cfapps.eu12.hana.ondemand.com/odata/v4/maintenance-order/Operation?$expand=component&$filter=component/any(c:c/quantity%20lt%201.5)


Exercises:
1. create icon tab filter
2. add table in content aggregation
3. update table binding at runtime on tab click
```
oTableBinding.filter([
                            new Filter({
                                path: "component",
                                operator: FilterOperator.Any,
                                variable: "c",
                                condition : new Filter("c/quantity", FilterOperator.LT, 1.5)
                            })
                        ]);
```
4. adding count to the tabs (do not add target type first let the error come)
```
<IconTabFilter key="all" text="All" icon="sap-icon://list" count="{/Operation/$count}">
                </IconTabFilter>
                <IconTabFilter key="cheaper" text="Cheaper Machine Components" icon="sap-icon://machine" 
                count="{path : '/Operation/$count?$filter=component/any(c:c/quantity%20lt%201.5)',
                targetType: 'any'}">
                </IconTabFilter>
                <IconTabFilter key="expensive" text="Expensive Components" icon="sap-icon://money-bills" 
                count="{path : '/Operation/$count?$filter=component/all(c:c/quantity%20gt%202)',
                targetType: 'any'}">
                </IconTabFilter>
```

MachineComponents.view.xml
```
<mvc:View xmlns="sap.m" xmlns:mvc="sap.ui.core.mvc" xmlns:f="sap.ui.layout.form"
             xmlns:core="sap.ui.core"
             controllerName="ey.ap.acc.controller.MachineComponents">

    <Page title="Machine Components" showNavButton="true" navButtonPress="onBack">
        <!-- <Button text="Back" icon="sap-icon://arrow-left" press="onBack"></Button> -->

        <!-- Icontab bar with 2 tabs -->
        <IconTabBar select="onTabSelect">
            <items>
                <IconTabFilter key="all" text="All" icon="sap-icon://list" count="{/Operation/$count}">
                </IconTabFilter>
                <IconTabFilter key="cheaper" text="Cheaper Machine Components" icon="sap-icon://machine" 
                count="{path : '/Operation/$count?$filter=component/any(c:c/quantity%20lt%201.5)',
                targetType: 'any'}">
                </IconTabFilter>
                <IconTabFilter key="expensive" text="Expensive Components" icon="sap-icon://money-bills" 
                count="{path : '/Operation/$count?$filter=component/all(c:c/quantity%20gt%202)',
                targetType: 'any'}">
                </IconTabFilter>
            </items>
            <content>
                 <Table id="idMachineComponentsTable" growing="true" growingThreshold="10" items="{
                    path: '/Operation',
                    parameters: {
                        $count: true
                    }
                 }" inset="false">
                        <columns>
                            <Column>
                                <Text text="ID - Code"/>
                            </Column>
                            <Column>
                                <Text text="Description"/>
                            </Column>
                            <Column>
                                <Text text="Status"/>
                            </Column>
                            <Column>
                                <Text text="Duration"/>
                            </Column>
                        </columns>
                        <items>
                            <ColumnListItem>
                                <cells>
                                    <Text text="{ID} {code}"/>
                                    <Text text="{description}"/>
                                    <Text text="{status}"/>
                                    <Text text="{durationTime} {durationUnit}"/>
                                </cells>
                            </ColumnListItem>
                        </items>
                    </Table>
            
            </content>
        
        </IconTabBar>


    </Page>

</mvc:View>
```

MachineComponents.controller.js
```
sap.ui.define(
    //while we add dependencies, use module name
    [
        "ey/ap/acc/controller/BaseController",
        "sap/m/MessageBox",
        "sap/m/MessageToast",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator"
    ], 
    function(BaseController, MessageBox, MessageToast, Filter, FilterOperator){
        return BaseController.extend("ey.ap.acc.controller.MachineComponents",{
            onInit: function(){

                this.getRouter().getRoute("superman").attachMatched(this.herculis, this);

            },
            onTabSelect: function(oEvent){
                var key = oEvent.getParameter("selectedKey");
                var oTableBinding = this.getView().byId("idMachineComponentsTable").getBinding("items");
                switch (key) {
                    case "all":
                        oTableBinding.filter([]);
                        break;
                    case "cheaper":
                        oTableBinding.filter([
                            new Filter({
                                path: "component",
                                operator: FilterOperator.Any,
                                variable: "c",
                                condition : new Filter("c/quantity", FilterOperator.LT, 1.5)
                            })
                        ]);
                        
                        break;
                    case "expensive":
                         oTableBinding.filter([
                            new Filter({
                                path: "component",
                                operator: FilterOperator.All,
                                variable: "c",
                                condition : new Filter("c/quantity", FilterOperator.GT, 1.5)
                            })
                        ]);
                        break;
                    default:
                        break;
                }
            },
            //Route matched handler function which triggers
            //The route can change manually, browser back-forward button, when user select fruit, user reload ui.
            herculis: function(oEvent){
                // debugger;
                //here this - will never point to your controller class object
                // so in order to use this as a object of controller we have to pass while calling it - attachMatched(this.herculis, this);
                
                //step 1: extract the index of selected fruit
                var sIndex = oEvent.getParameter("arguments").zkas;
                //step 2: rebuild the element path
                var sPath = "/" + sIndex;
                //Step 3: bind element with view
                this.getView().bindElement(sPath,{
                    $expand: {
                        'operation' : {
                            $filter : 'status eq \'OPEN\''
                        }
                    }
                });


            },
            onBack: function(){

                //step 1: get the parent control
                var oAppCon = this.getView().getParent();
                //step 2: container have the power to navigate to 2nd child
                oAppCon.to("idView1");

            },
            onSave: function(){
                MessageBox.confirm("Would you like to Save?",{
                    onClose: function(status){
                        debugger;
                        if(status === "OK"){
                            MessageToast.show("Your data was saved!");
                        }else{
                            MessageBox.error("Oops~ something is fishy");
                        }
                    }
                });
            },
            onClear: function(){

            }

        });
    }
);
```

