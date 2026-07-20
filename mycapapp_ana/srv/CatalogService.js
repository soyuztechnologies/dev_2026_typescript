const cds = require('@sap/cds')

module.exports = class CatalogService extends cds.ApplicationService { init() {

  const { EmployeeSet, ProductSet, BusinessPartnerSet, AddressSet, PurchaseOrderSet, PurchaseItemsSet } = cds.entities('CatalogService')

  this.before (['CREATE', 'UPDATE'], EmployeeSet, async (req) => {
    console.log('Before CREATE/UPDATE EmployeeSet', req.data)

    //get the employee salary info
    let salaryAmount = parseFloat(req.data.salaryAmount);
    if(salaryAmount > 1000000){
      //Contaminate the incoming request, so CAPM will know that something gone wrong in your GREEN box
      req.error(500, "Hey Amigo!! Check the salary, none of employee get a million");
    }

  })
  this.after ('READ', EmployeeSet, async (employeeSet, req) => {
    console.log('After READ EmployeeSet', employeeSet)
  })
  this.before (['CREATE', 'UPDATE'], ProductSet, async (req) => {
    console.log('Before CREATE/UPDATE ProductSet', req.data)
  })
  this.after ('READ', ProductSet, async (productSet, req) => {
    console.log('After READ ProductSet', productSet)
  })
  this.before (['CREATE', 'UPDATE'], BusinessPartnerSet, async (req) => {
    console.log('Before CREATE/UPDATE BusinessPartnerSet', req.data)
  })
  this.after ('READ', BusinessPartnerSet, async (businessPartnerSet, req) => {
    console.log('After READ BusinessPartnerSet', businessPartnerSet)
  })
  this.before (['CREATE', 'UPDATE'], AddressSet, async (req) => {
    console.log('Before CREATE/UPDATE AddressSet', req.data)
  })
  this.after ('READ', AddressSet, async (addressSet, req) => {
    console.log('After READ AddressSet', addressSet)
  })
  this.before (['CREATE', 'UPDATE'], PurchaseOrderSet, async (req) => {
    console.log('Before CREATE/UPDATE PurchaseOrderSet', req.data)
  })
  this.after ('READ', PurchaseOrderSet, async (purchaseOrderSet, req) => {
    console.log('After READ PurchaseOrderSet', purchaseOrderSet)
    for (let index = 0; index < purchaseOrderSet.length; index++) {
      const element = purchaseOrderSet[index];
      if(!element.NOTE){
        element.NOTE = 'Not Found'
      }      
    }
  })
  this.before (['CREATE', 'UPDATE'], PurchaseItemsSet, async (req) => {
    console.log('Before CREATE/UPDATE PurchaseItemsSet', req.data)
  })
  this.after ('READ', PurchaseItemsSet, async (purchaseItemsSet, req) => {
    console.log('After READ PurchaseItemsSet', purchaseItemsSet)
  })


  ///Implementation for order defaults
  this.on('getDeafultValue', async (req,res) => {
    return {
      OVERALL_STATUS: 'N',
      LIFECYCLE_STATUS : 'N'
    }
  });

  //generic handler to support my function implementation - always returns data, GET
  this.on('getLargestOrder', async (req,res) => {
    try {

      const tx = cds.tx(req);

      //use CDS QL to make call to DB  - SELECT * UP TO 3 ROWS FROM POs ORDER BY GROSS_AMOUNT descending
      const reply = await tx.read(PurchaseOrderSet).orderBy({
        'GROSS_AMOUNT': 'desc'
      }).limit(3);

      return reply;

    } catch (error) {
      req.error(500, "Some error occurred : " + error.toString())
    }
  });

  //implementation of action - Create, Update data in server
  this.on('boost', async(req) => {
    //    debugger;
    try {
      
      //extract the primary key JSON - {NODE_KEY: 'key value'}
      const PRIMARYKEY = req.params[0];
      //start a transaction to db
      const tx = cds.tx(req);
      //CDS Query language to update your gross_amount by +20000
      await tx.update(PurchaseOrderSet).with({
        GROSS_AMOUNT  : { '+=' : 20000 },
        NOTE: 'Boosted!!'
      }).where(PRIMARYKEY);
      //read the record and send in out
      return await tx.read(PurchaseOrderSet).where(PRIMARYKEY);


    } catch (error) {
      
    }

  });

  return super.init()
}}
