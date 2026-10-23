using { sales } from '../db/schema';

service AnalyticsService {
  @readonly @Aggregation.ApplySupported: {
    Transformations: ['aggregate', 'groupby', 'filter', 'orderby', 'top', 'skip', 'search'],
    GroupableProperties: [region, country, year, month, channel, product_ID],
    AggregatableProperties: [{Property: amount}, {Property: quantity}]
  }
  entity Sales as projection on sales.Sales;
  @readonly entity Products as projection on sales.Products;
}
