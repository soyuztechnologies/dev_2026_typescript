//using { API_BUSINESS_PARTNER as S4 } from '@capire/s4';
using { sap.capire.flights.FlightsService as external } from '@capire/xflights-data';

/**
 * Consumption view declaring the subset of fields we actually want to use
 * from the external Flights entity, with associations like airline, origin,
 * destination flattened (aka denormalized).
 */
@federated entity Flights as projection on external.Flights {
  ID, date, departure, arrival, free_seats, modifiedAt,
  price, currency,
  airline.icon     as icon @UI.IsImageURL,
  airline.name     as airline,
  origin.name      as origin,
  destination.name as destination,
}

/**
 * Consumption view declaring the subset of fields we actually want to use
 * from the external Supplements entity.
 */
@federated entity Supplements as projection on external.Supplements {
  ID, type, descr, price, currency, modifiedAt
}

// @federated entity Customers as projection on S4.A_BusinessPartner {

//   BusinessPartner as ID,
//   PersonFullName  as Name,
//   // FirstName       as FirstName,
//   // LastName        as LastName,
//   LastChangeDate  as modifiedAt,
//   LastChangeTime  as modifiedAtTime,

//   // Not supported by resolveView yet - commented out for now
//   // IsMale ? 'Mr. ' : IsFemale ? 'Ms. ' : '' as Salutation,
//   // PersonFullName ? PersonFullName : FirstName || ' ' || LastName  as Name,
//   // LastChangeDate || 'T' || LastChangeTime || 'Z' as modifiedAt,

//   // Not supported by OData, and not used in XTravels so far...
//   // to_BusinessPartnerAddress[1:].{
//   //   StreetName                                            as Street,
//   //   POBoxPostalCode                                       as PostalCode,
//   //   CityName                                              as City,
//   //   Country                                               as Country,
//   // },

// } where BusinessPartnerCategory == '1'; // '1' = Person