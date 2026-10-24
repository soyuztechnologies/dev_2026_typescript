namespace anubhav.bookshop;

using {
  Currency,
  cuid,
  managed,
  sap.common.CodeList
} from '@sap/cds/common';

/**
 * Plain CDS entities - nothing MongoDB specific is needed.
 * Each entity becomes one MongoDB collection, e.g. anubhav_bookshop_Books.
 */
entity Books : managed {
  key ID       : Integer;
      title    : localized String(111) @mandatory;
      descr    : localized String(1111);
      author   : Association to Authors @mandatory;
      genre    : Association to Genres;
      stock    : Integer;
      price    : Decimal(9, 2);
      currency : Currency;
      isbn     : String(20);
      image    : LargeBinary @Core.MediaType: 'image/png';
      value    : Decimal = price * stock; // calculated element
}

annotate Books with @assert.unique: {isbn: [isbn]};

entity Authors : managed {
  key ID           : Integer;
      name         : String(111) @mandatory;
      dateOfBirth  : Date;
      dateOfDeath  : Date;
      placeOfBirth : String;
      address      : {
        street : String;
        city   : String;
      };
      books        : Association to many Books
                       on books.author = $self;
}

entity Genres : CodeList {
  key ID       : Integer;
      parent   : Association to Genres;
      children : Composition of many Genres
                   on children.parent = $self;
}

entity Orders : cuid, managed {
  OrderNo  : String(22) @title: 'Order Number';
  buyer    : String @cds.on.insert: $user;
  currency : Currency;
  total    : Decimal(11, 2) @readonly;
  items    : Composition of many OrderItems
               on items.parent = $self;
}

entity OrderItems : cuid {
  parent   : Association to Orders;
  book     : Association to Books;
  quantity : Integer;
  amount   : Decimal(11, 2);
}

/** Book sales per region and day (amounts in the sales currency) - source of the analytics app */
entity Sales {
  key ID       : Integer;
      date     : Date;
      region   : String(40);
      book     : Association to Books;
      quantity : Integer;
      amount   : Decimal(11, 2);
      currency : Currency;
}
