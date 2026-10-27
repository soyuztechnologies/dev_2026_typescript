using { anubhav.helpdesk as db } from '../db/schema';

@path: 'helpdesk'
@requires: 'authenticated-user'
service HelpdeskService {
  @odata.draft.enabled
  entity Incidents  as projection on db.Incidents;
  @readonly
  entity Priorities as projection on db.Priorities;
}
