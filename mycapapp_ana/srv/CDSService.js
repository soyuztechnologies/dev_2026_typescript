const cds = require('@sap/cds')

module.exports = class CDSService extends cds.ApplicationService { init() {

  const { ProductSet, ItemsSet } = cds.entities('CDSService')

  this.before (['CREATE', 'UPDATE'], ProductSet, async (req) => {
    console.log('Before CREATE/UPDATE ProductSet', req.data)
  })
  this.after ('READ', ProductSet, async (productSet, req) => {
    
    //Step 1: get all the unique product ids
    let ids = productSet.map(sanjeev => sanjeev.ProductId);

    //CDS query language to go to items data and aggregate the count
    //SELECT Productid, COUNT(ProductId) as anubhav FROM ItemSet WHERE ProductId IN [IDS...] GROUP BY ProductId
    const orderCount = await SELECT.from(ItemsSet)
                                   .columns('ProductId', {func : 'count', as: 'anubhav'})
                                   .where({'ProductId': {in : ids}})
                                   .groupBy('ProductId');


    for (let index = 0; index < productSet.length; index++) {
      const element = productSet[index];
      const foundRecord = orderCount.find(pc => pc.ProductId === element.ProductId);
      element.soldCount = foundRecord ? foundRecord.anubhav : 0;
    }

  })
  this.before (['CREATE', 'UPDATE'], ItemsSet, async (req) => {
    console.log('Before CREATE/UPDATE ItemsSet', req.data)
  })
  this.after ('READ', ItemsSet, async (itemsSet, req) => {
    console.log('After READ ItemsSet', itemsSet)
  })


  return super.init()
}}
