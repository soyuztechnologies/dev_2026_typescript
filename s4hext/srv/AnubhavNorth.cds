using {NorthWind as external} from './external/NorthWind.csn';

service AnubhavNorth @(path:'AnubhavNorth') {

    @readonly
    entity Products as projection on external.Products {
        key ID, Name, Description, ReleaseDate, DiscontinuedDate, Rating, Price
    };

}
