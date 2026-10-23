const cds = require('@sap/cds')

module.exports = class CatalogService extends cds.ApplicationService {
  init() {
    const { Books } = cds.entities('anubhav.bookshop')

    // Reduce stock of ordered books - plain CQL, executed as one atomic MongoDB update
    this.on('submitOrder', async req => {
      const { book, quantity } = req.data
      if (quantity < 1) return req.error(400, 'quantity has to be 1 or more')
      const b = await SELECT.one.from(Books, book).columns('stock')
      if (!b) return req.error(404, `Book #${book} doesn't exist`)
      const affected = await UPDATE(Books, book)
        .with({ stock: { '-=': quantity } })
        .where({ stock: { '>=': quantity } })
      if (!affected) return req.error(409, `${quantity} exceeds stock for book #${book}`)
      return SELECT.one.from(Books, book).columns('stock')
    })

    // Add some discount for overstocked books
    this.after('each', 'Books', book => {
      if (book.stock > 111) book.title += ` -- 11% discount!`
    })

    return super.init()
  }
}
