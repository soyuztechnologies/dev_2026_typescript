namespace sap.capire.bookshop;

using {
  Currency,
  cuid,
  managed,
  sap.common.CodeList
} from '@sap/cds/common';

entity Books : managed {
  key ID       : Integer;
      title    : localized String(111) @mandatory;
      descr    : localized String(1111);
      author   : Association to Authors @mandatory;
      genre    : Association to Genres;
      stock    : Integer;
      price    : Decimal(9, 2);
      currency : Currency;
      image    : LargeBinary @Core.MediaType: 'image/png';
      isbn     : String(20);
      value    : Decimal = price * stock;
}

annotate Books with @assert.unique: {isbn: [isbn]};

entity Authors : managed {
  key ID           : Integer;
      name         : String(111) @mandatory;
      dateOfBirth  : Date;
      dateOfDeath  : Date;
      placeOfBirth : String;
      address      : Address;
      books        : Association to many Books
                       on books.author = $self;
}

type Address {
  street : String;
  city   : String;
}

entity Genres : CodeList {
  key ID       : Integer;
      parent   : Association to Genres;
      children : Composition of many Genres
                   on children.parent = $self;
}

entity Orders : cuid, managed {
  OrderNo  : String(22) @title: 'Order Number';
  buyer    : String;
  currency : Currency;
  items    : Composition of many {
               key pos      : Integer;
                   book     : Association to Books;
                   quantity : Integer;
                   amount   : Decimal(9, 2);
             };
  notes    : Composition of many Notes
               on notes.order = $self;
}

entity Notes : cuid {
  order : Association to Orders;
  text  : String;
}
