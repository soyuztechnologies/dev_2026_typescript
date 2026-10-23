using {anubhav.bookshop as my} from '../db/schema';

/**
 * Analytics on MongoDB:
 *  - OData $apply (groupby, aggregate, filter, orderby, top, skip) on the Books entity
 *  - custom functions implemented with CQL groupBy / having / orderBy / limit
 */
service AnalyticsService @(path: '/analytics') {

  @readonly
  @Aggregation.ApplySupported: {
    Transformations       : [
      'aggregate',
      'groupby',
      'filter',
      'orderby',
      'top',
      'skip'
    ],
    GroupableProperties   : [
      author_ID,
      genre_ID,
      currency_code
    ],
    AggregatableProperties: [
      {Property: stock},
      {Property: price}
    ]
  }
  entity Books as projection on my.Books excluding { image };

  type StockByGenre {
    genre      : String;
    books      : Integer;
    stock      : Integer;
    avgPrice   : Decimal;
    stockValue : Decimal;
  }

  type AuthorRanking {
    author : String;
    books  : Integer;
    stock  : Integer;
  }

  /** Stock and average price per genre, ordered by stock value */
  function stockByGenre()                     returns array of StockByGenre;

  /** Authors with at least `minBooks` books, ranked by stock - with paging */
  function topAuthors(minBooks : Integer, top : Integer, skip : Integer) returns array of AuthorRanking;
}
