const cds = require('@sap/cds')

/**
 * Analytical CQL runs unchanged on MongoDB: the plugin translates groupBy, having, orderBy,
 * limit/offset and aggregate functions into a MongoDB aggregation pipeline
 * ($match -> $lookup -> $group -> $match -> $sort -> $skip -> $limit).
 */
module.exports = class AnalyticsService extends cds.ApplicationService {
  init() {
    const { Books, Sales } = cds.entities('anubhav.bookshop')

    this.on('stockByGenre', () =>
      SELECT.from(Books)
        .columns(
          'genre.name as genre', // group by a to-one path -> $lookup
          'count(*) as books',
          'sum(stock) as stock',
          'avg(price) as avgPrice',
          'sum(price * stock) as stockValue'
        )
        .groupBy('genre.name')
        .orderBy('stockValue desc')
    )

    this.on('topAuthors', req => {
      const { minBooks = 1, top = 10, skip = 0 } = req.data
      return SELECT.from(Books)
        .columns('author.name as author', 'count(*) as books', 'sum(stock) as stock')
        .groupBy('author.name')
        .having('count(*) >=', minBooks)
        .orderBy('stock desc', 'author.name')
        .limit(top, skip)
    })

    // sources of the charts in app/analyticapp
    this.on('salesByRegion', () =>
      SELECT.from(Sales)
        .columns('region', 'sum(quantity) as quantity', 'sum(amount) as amount')
        .groupBy('region')
        .orderBy('amount desc')
    )

    this.on('salesByDay', () =>
      SELECT.from(Sales)
        .columns('date', 'sum(quantity) as quantity', 'sum(amount) as amount')
        .groupBy('date')
        .orderBy('date')
    )

    this.on('salesByBook', () =>
      SELECT.from(Sales)
        .columns('book.title as book', 'sum(quantity) as quantity', 'sum(amount) as amount')
        .groupBy('book.title')
        .orderBy('amount desc')
    )

    this.on('stockByBook', () => SELECT.from(Books).columns('title as book', 'stock').orderBy('stock desc'))

    return super.init()
  }
}
