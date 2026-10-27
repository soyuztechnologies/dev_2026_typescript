// @anubhav-cap-js/attachments - by www.anubhavtrainings.com
//
// The file content is stored in MongoDB GridFS, the metadata in the collection of the
// attachments entity. `content` is never persisted in the entity itself - the plugin
// streams it from and to GridFS; `url` holds the GridFS file id.

using {
  cuid,
  managed
} from '@sap/cds/common';

context anubhav.attachments {

  aspect MediaData @(_anubhav_attachments) {
    content  : LargeBinary                                @title: '{i18n>Attachment}'  @Core.MediaType: mimeType  @Core.ContentDisposition.Filename: filename;
    // derived from the file name by the plugin - clients can't set it
    mimeType : String(255)                                @title: '{i18n>MediaType}'  @Core.IsMediaType  @Core.Computed;
    // set on create or upload only - changes via PATCH are ignored by the plugin
    filename : String(255)                                @title: '{i18n>FileName}';
    size     : Integer64                                  @title: '{i18n>FileSize}'    @Core.Computed  @readonly;
    url      : String(64)                                 @UI.Hidden                   @Core.Computed  @readonly;
  }

  aspect Attachments : cuid, managed, MediaData {
    note : String(1000) @title: '{i18n>Note}'  @UI.MultiLineText;
  }

  // -- Fiori Elements ---------------------------------------------------------------

  annotate Attachments with @UI.MediaResource: {Stream: content}
                           @Common.SideEffects #content: {
                             SourceProperties: [content],
                             TargetProperties: ['filename', 'mimeType', 'size']
                           }
                           @Capabilities.UpdateRestrictions.NonUpdatableProperties: [content]
                           @Capabilities.SortRestrictions.NonSortableProperties: [content]
                           @UI: {
    HeaderInfo: {
      TypeName      : '{i18n>Attachment}',
      TypeNamePlural: '{i18n>Attachments}',
      Title         : {Value: filename},
      Description   : {Value: mimeType}
    },
    LineItem  : [
      {Value: content,   @HTML5.CssDefaults: {width: '15em'}},
      {Value: mimeType,  @HTML5.CssDefaults: {width: '12em'}},
      {Value: size,      @HTML5.CssDefaults: {width: '8em'}},
      {Value: createdAt, @HTML5.CssDefaults: {width: '12em'}},
      {Value: createdBy, @HTML5.CssDefaults: {width: '12em'}},
      {Value: note}
    ],
    Facets    : [{
      $Type : 'UI.ReferenceFacet',
      ID    : 'AttachmentDetails',
      Label : '{i18n>Attachment}',
      Target: '@UI.FieldGroup#AttachmentDetails'
    }],
    // single attachment (Composition of one Attachments): file with upload / download / remove
    FieldGroup #SingleAttachment : {Data: [
      {Value: content},
      {Value: mimeType},
      {Value: size},
      {Value: note}
    ]},
    FieldGroup #AttachmentDetails: {Data: [
      {Value: content},
      {Value: mimeType},
      {Value: size},
      {Value: note},
      {Value: createdAt},
      {Value: createdBy}
    ]}
  };
}
