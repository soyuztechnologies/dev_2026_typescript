using {anubhav.bookshop as my} from '../db/schema';

/** Maintenance service for Fiori Elements apps - with drafts */
service AdminService @(path: '/admin', requires: 'admin') {
  @odata.draft.enabled
  entity Books   as projection on my.Books;

  @odata.draft.enabled
  entity Authors as projection on my.Authors;

  entity Genres  as projection on my.Genres;

  @odata.draft.enabled
  entity Orders  as projection on my.Orders;
}
