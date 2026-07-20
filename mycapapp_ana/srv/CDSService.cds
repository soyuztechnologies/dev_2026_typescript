//consume reference of my DB tables
using { anubhav.cds as spiderman } from '../db/CDSViews';

service CDSService @(path:'CDSService') {

    ///SELECT * FROM view
    entity ProductSet as projection on spiderman.CDSViews.ProductView{
        *,
        //never be persisted in db
        virtual soldCount: Int16
    };
    entity ItemsSet as projection on spiderman.CDSViews.ItemView;

}