using CatalogService as service from '../../srv/cat-service';

annotate service.Books with @(
    
    UI.SelectionFields:[
        ID,
        title
    ],
    UI.LineItem: [
        {
            $Type : 'UI.DataField',
            Value : ID,
        },
        {
            $Type : 'UI.DataField',
            Value : title,
        }
    ]

);