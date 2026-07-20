//Implementation file - js with same name
//DPC_EXT class you write in ABAP for Service implementation
const cds = require('@sap/cds')

module.exports = class MyService extends cds.ApplicationService { init() {

  this.on ('anubhav', async (req) => {
    console.log('On anubhav', req.data)
    let myName = req.data.name;

    return `Welcome to CAP Server, Hello ${myName}!! How are you today 🤔`
  })

  //calling parent class constructor here
  return super.init()
}}
