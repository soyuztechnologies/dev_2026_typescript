using {anubhav.bookshop as my} from '../db/schema';

/** Public catalog for browsing books and ordering */
service CatalogService @(path: '/browse') {

  @readonly
  entity ListOfBooks as projection on Books excluding { descr };

  @readonly
  entity Books       as
    projection on my.Books {
      *,
      author.name as author // path expression -> resolved with $lookup in MongoDB
    }
    excluding {
      createdBy,
      modifiedBy
    };

  @requires: 'authenticated-user'
  action submitOrder(book : Books:ID, quantity : Integer) returns {
    stock : Integer
  };
}
