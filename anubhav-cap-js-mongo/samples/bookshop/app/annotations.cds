using {CatalogService} from '../srv/cat-service';
using {AdminService} from '../srv/admin-service';

// Fiori Elements UI - open http://localhost:4004 and click "Fiori preview" next to Books

annotate AdminService.Books with @(UI: {
  HeaderInfo     : {
    TypeName      : 'Book',
    TypeNamePlural: 'Books',
    Title         : {Value: title},
    Description   : {Value: author.name}
  },
  SelectionFields: [
    ID,
    author_ID,
    genre_ID,
    price
  ],
  LineItem       : [
    {Value: ID},
    {Value: title},
    {
      Value: author.name,
      Label: 'Author'
    },
    {
      Value: genre.name,
      Label: 'Genre'
    },
    {Value: stock},
    {Value: price},
    {Value: currency_code}
  ],
  Facets         : [
    {
      $Type : 'UI.ReferenceFacet',
      Label : 'General',
      Target: '@UI.FieldGroup#General'
    },
    {
      $Type : 'UI.ReferenceFacet',
      Label : 'Details',
      Target: '@UI.FieldGroup#Details'
    }
  ],
  FieldGroup #General: {Data: [
    {Value: title},
    {Value: author_ID},
    {Value: genre_ID},
    {Value: descr}
  ]},
  FieldGroup #Details: {Data: [
    {Value: stock},
    {Value: price},
    {Value: currency_code},
    {Value: isbn}
  ]}
}) {
  author @Common: {
    Text           : author.name,
    TextArrangement: #TextOnly,
    ValueList      : {
      CollectionPath: 'Authors',
      Parameters    : [
        {
          $Type            : 'Common.ValueListParameterInOut',
          LocalDataProperty: author_ID,
          ValueListProperty: 'ID'
        },
        {
          $Type            : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'name'
        }
      ]
    }
  };
  genre  @Common: {
    Text           : genre.name,
    TextArrangement: #TextOnly
  };
}

annotate AdminService.Authors with @(UI: {
  HeaderInfo     : {
    TypeName      : 'Author',
    TypeNamePlural: 'Authors',
    Title         : {Value: name}
  },
  SelectionFields: [name],
  LineItem       : [
    {Value: ID},
    {Value: name},
    {Value: dateOfBirth},
    {Value: placeOfBirth}
  ],
  Facets         : [
    {
      $Type : 'UI.ReferenceFacet',
      Label : 'Author',
      Target: '@UI.FieldGroup#Author'
    },
    {
      $Type : 'UI.ReferenceFacet',
      Label : 'Books',
      Target: 'books/@UI.LineItem'
    }
  ],
  FieldGroup #Author: {Data: [
    {Value: name},
    {Value: dateOfBirth},
    {Value: dateOfDeath},
    {Value: placeOfBirth},
    {Value: address_city}
  ]}
});

annotate CatalogService.Books with @(UI: {
  SelectionFields: [author, price],
  LineItem       : [
    {Value: title},
    {Value: author},
    {Value: stock},
    {Value: price},
    {Value: currency_code}
  ]
});
