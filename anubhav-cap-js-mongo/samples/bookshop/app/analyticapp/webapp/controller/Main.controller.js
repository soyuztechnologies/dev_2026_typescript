sap.ui.define(
  [
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/format/DateFormat',
    'sap/viz/ui5/controls/Popover',
    'sap/m/MessageBox'
  ],
  (Controller, JSONModel, DateFormat, Popover, MessageBox) => {
    'use strict'

    const CHARTS = ['regionChart', 'stockChart', 'dayChart', 'bookChart']
    const dayFormat = DateFormat.getDateInstance({ pattern: 'MMM d', UTC: true })

    return Controller.extend('anubhav.analyticapp.controller.Main', {
      onInit() {
        this.getView().setModel(new JSONModel({ regions: [], stock: [], days: [], books: [], totals: {} }), 'charts')
        for (const id of CHARTS) {
          const chart = this.byId(id)
          chart.setVizProperties({
            title: { visible: false },
            legend: { visible: id === 'regionChart' || id === 'bookChart' },
            plotArea: {
              dataLabel: { visible: id !== 'dayChart', type: id === 'regionChart' ? 'percentage' : 'value' },
              marker: { visible: true }
            }
          })
          new Popover().connect(chart.getVizUid()) // tooltips with the values of a selected data point
        }
        this.load()
      },

      onRefresh() {
        this.load()
      },

      /** Calls an unbound function of the AnalyticsService, e.g. /analytics/salesByRegion() */
      async call(fn) {
        const result = await this.getOwnerComponent().getModel().bindContext(`/${fn}()`).requestObject()
        return result.value
      },

      async load() {
        const view = this.getView()
        view.setBusy(true)
        try {
          const [regions, stock, days, books] = await Promise.all(
            ['salesByRegion', 'stockByBook', 'salesByDay', 'salesByBook'].map(fn => this.call(fn))
          )
          const totals = regions.reduce((t, r) => ({ amount: t.amount + r.amount, quantity: t.quantity + r.quantity }), { amount: 0, quantity: 0 })
          view.getModel('charts').setData({
            regions,
            stock,
            days: days.map(d => ({ ...d, day: dayFormat.format(new Date(d.date)) })),
            books,
            totals: { ...totals, currency: 'EUR' }
          })
        } catch (e) {
          MessageBox.error(view.getModel('i18n').getResourceBundle().getText('loadError', [e.message]))
        } finally {
          view.setBusy(false)
        }
      }
    })
  }
)
