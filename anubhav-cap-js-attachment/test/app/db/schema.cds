namespace test;

using { cuid, managed } from '@sap/cds/common';
using { Attachments } from '@anubhav-cap-js/attachments';

entity Incidents : cuid, managed {
  title       : String;
  attachments : Composition of many Attachments;
  @title: 'Photo'
  photo       : Composition of one Attachments;
  @title: 'Contracts'
  contracts   : Composition of many Attachments;
  items       : Composition of many {
                  key ID    : UUID;
                      name  : String;
                      files : Composition of many Attachments;
                }
}

entity Documents : cuid {
  title : String;
  @Validation.MaxItems: 2
  files : Composition of many Attachments;
}

annotate Documents.files with {
  content @Core.AcceptableMediaTypes: ['image/*', 'application/pdf'] @Validation.Maximum: '1KB';
}

annotate Documents.files with @Capabilities.UpdateRestrictions.NonUpdatableProperties: [];
