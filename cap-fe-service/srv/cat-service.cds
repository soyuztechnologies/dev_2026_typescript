@odata service CatalogService @(path:'CatalogService') {
  entity Books { 
    key ID:Integer; title:String; author:String;
  }
} 
