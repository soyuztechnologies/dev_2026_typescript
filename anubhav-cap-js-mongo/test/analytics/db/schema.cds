namespace sales;

entity Products {
  key ID       : Integer;
      name     : String(50);
      category : String(20);
      price    : Decimal(9, 2);
}

entity Sales {
  key ID       : Integer;
      date     : Date;
      year     : Integer;
      month    : Integer;
      region   : String(10);
      country  : String(2);
      product  : Association to Products;
      quantity : Integer;
      amount   : Decimal(11, 2);
      discount : Double;
      channel  : String(10);
}
