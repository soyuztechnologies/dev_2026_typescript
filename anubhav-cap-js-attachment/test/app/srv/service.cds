using { test } from '../db/schema';

service TestService {
  @odata.draft.enabled
  entity Incidents as projection on test.Incidents;
  entity Documents as projection on test.Documents;
}

annotate TestService.Incidents with @UI.Facets: [
  { $Type: 'UI.ReferenceFacet', Label: 'General', Target: '@UI.FieldGroup#General' }
] @UI.FieldGroup #General: { Data: [{ Value: title }] };
