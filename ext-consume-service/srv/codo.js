import cds from '@sap/cds'

export default class CatalogService extends cds.ApplicationService {
  async init() {
    const spiderman = await cds.connect.to('sap.capire.flights.FlightsService')

    this.on('READ', ['Flights', 'Supplements'], req => spiderman.run(req.query))

    return super.init()
  }
}
