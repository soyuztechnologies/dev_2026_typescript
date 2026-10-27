namespace anubhav.helpdesk;

using { cuid, managed, sap.common.CodeList } from '@sap/cds/common';
using { Attachments } from '@anubhav-cap-js/attachments';

entity Incidents : cuid, managed {
  title       : String(100) @mandatory;
  description : String(1000);
  priority    : Association to Priorities default 'M';
  // single attachment (Composition of one): one signed PDF, replaceable
  @title: 'Signed Approval'
  approval    : Composition of one Attachments;
  // all kinds of files - limits from cds.requires["anubhav-attachments"] in package.json
  attachments : Composition of many Attachments;
  // only images, max. 2 MB each, max. 3 screenshots - see annotations below
  @title: 'Screenshots'
  @Validation.MaxItems: 3
  screenshots : Composition of many Attachments;
}

annotate Incidents.screenshots with {
  content @Core.AcceptableMediaTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'] @Validation.Maximum: '2MB';
}

annotate Incidents.approval with {
  content @Core.AcceptableMediaTypes: ['application/pdf'];
}

entity Priorities : CodeList {
  key code : String(1);
}
