using {sap.capire.bookshop as my} from '../db/schema';

service CatalogService @(path: '/browse', impl: 'srv/cat-service.js') {

  /** For displaying lists of Books */
  @readonly
  entity ListOfBooks as projection on Books excluding { descr };

  /** For display in details pages */
  @readonly
  entity Books       as
    projection on my.Books {
      *,
      author.name as author
    }
    excluding {
      createdBy,
      modifiedBy
    };

  @readonly
  @cds.redirection.target: false
  entity InStock     as projection on my.Books {
    ID, title as name, stock, price, author as writer
  } where stock > 100;

  @requires: 'authenticated-user'
  action submitOrder(book : Books:ID, quantity : Integer) returns {
    stock : Integer
  };
}

service AdminService @(path: '/admin') {
  @odata.draft.enabled
  entity Books   as projection on my.Books;

  entity Authors as projection on my.Authors;
  entity Genres  as projection on my.Genres;
}

service OrdersService @(path: '/orders') {
  @odata.draft.enabled
  entity Orders as projection on my.Orders;
  entity Notes as projection on my.Notes;
}

service RestrictedService @(path: '/restricted') {
  @restrict: [{ grant: 'READ', where: 'address_city = $user.city' }]
  entity Authors as projection on my.Authors;
}
