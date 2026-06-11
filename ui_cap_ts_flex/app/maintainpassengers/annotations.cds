using TravelService as service from '../../srv/travel-service';

annotate service.Passenger with @(
  UI.SelectionFields: [ 
    City,
    FirstName,
    LastName,
    CountryCode,
    City,
    CustomerID

 ],
  
  UI: {
    LineItem: [
        {
            $Type : 'UI.DataField',
            Value : CustomerID,
        },
        {
            $Type : 'UI.DataField',
            Value : FirstName,
        },
        {
            $Type : 'UI.DataField',
            Value : LastName,
        },
        {
            $Type : 'UI.DataField',
            Value : City,
        },
        {
            $Type : 'UI.DataField',
            Value : CountryCode,
        }   
    ]
  }
);