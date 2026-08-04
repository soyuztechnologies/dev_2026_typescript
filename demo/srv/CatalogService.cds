using { ZSD_ATS_FIFA_0001 as service } from './external/ZSD_ATS_FIFA_0001';

service CatalogService @(path: 'CatalogService'){

    entity TeamsSet as projection on service.Teams;
}

annotate CatalogService.TeamsSet with @(
    Capabilities.InsertRestrictions.Insertable: true,
    Capabilities.UpdateRestrictions.Updatable: true,
    Capabilities.DeleteRestrictions.Deletable: true
);