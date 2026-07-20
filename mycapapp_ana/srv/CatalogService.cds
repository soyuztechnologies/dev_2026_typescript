//consume reference of my DB tables
using { anubhav.db.master, anubhav.db.transaction } from '../db/datamodel';

service CatalogService @(path: 'CatalogService', requires: 'authenticated-user') {

    //Entity  - representation of an end point of data to perform CRUDQ tasks
    entity EmployeeSet @(restrict :[
                                {grant : ['READ'], to: 'Display',
                                    //row level security
                                    where :'bankName = $user.spiderman'},
                                {grant : ['WRITE', 'DELETE'], to: 'Edit'}
                              ]) 
                              as projection on master.employee;
    entity ProductSet as projection on master.product;
    entity BusinessPartnerSet as projection on master.businesspartner;
    entity AddressSet as projection on master.address;
    @readonly
    entity StatusCode as projection on master.StatusCode;
    //@Capabilities : { Deletable : false }
    entity PurchaseOrderSet 
    @(
                              restrict :[
                                {grant : ['READ'], to: 'Display'},
                                {grant : ['WRITE', 'DELETE'], to: 'Edit'}
                              ],
                              odata.draft.enabled: true,
                              Common.DefaultValuesFunction: 'getDeafultValue' ) as projection on transaction.purchaseorder{
        *,
        //CDS Expression language
        case OVERALL_STATUS
            when 'P' then 'Pending'
            when 'A' then 'Approved'
            when 'X' then 'Rejected'
            when 'D' then 'Delivered'
            else 'Unknown'
                end as OverallStatus: String(10),
        case OVERALL_STATUS
            when 'P' then 2
            when 'A' then 3
            when 'X' then 1
            when 'D' then 3
            else 0
                end as Spiderman: Integer
    }
    actions{
        ///Side effect - a trigger to my action leads to a change of a field value in data
        //this force framework to make a GET call after action is triggred to load data
        //_anubhav is  variable that will contain the updated data coming from BE
        @cds.odata.bindingparameter.name: '_anubhav'
        @Common.SideEffects :{
            TargetProperties: ['_anubhav/GROSS_AMOUNT','_anubhav/OVERALL_STATUS']
        }
        //the system will pass the PO primary key - NODE_KEY automatically to input 
        action boost() returns PurchaseOrderSet
    };
    entity PurchaseItemsSet as projection on transaction.poitems;

    //non instance bound because they are not connected to any entity
    function getLargestOrder() returns array of PurchaseOrderSet;
    function getDeafultValue() returns PurchaseOrderSet;

}