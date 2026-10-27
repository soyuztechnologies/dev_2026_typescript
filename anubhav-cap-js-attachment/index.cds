// Use in your CDS model:
//   using { Attachments } from '@anubhav-cap-js/attachments';
//   entity Incidents : cuid { ... attachments : Composition of many Attachments; }
using { anubhav.attachments as a } from './db/index.cds';

aspect Attachments : a.Attachments {}
