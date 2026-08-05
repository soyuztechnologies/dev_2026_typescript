using { ZSD_ATS_FIFA_0001 as service } from './external/ZSD_ATS_FIFA_0001';

service CatalogService @(path: 'CatalogService'){
    entity TeamsSet as projection on service.Teams;
}