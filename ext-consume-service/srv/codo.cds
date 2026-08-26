using { sap.capire.flights.FlightsService as spiderman } from '@capire/xflights-data';

service CatalogService @(path:'CatalogService'){
    @federated entity Flights as projection on spiderman.Flights{
        ID,
        date,
        departure,
        arrival,
        free_seats,
        modifiedAt,
        airline.icon as icon @UI.IsImageURL,
        airline.name as airlineName,
        origin.name  as startAirport,
        destination.name as destAirport
    }

    @federated entity Supplements as projection on spiderman.Supplements{
        ID, type, descr, price, currency, modifiedAt
    }
}