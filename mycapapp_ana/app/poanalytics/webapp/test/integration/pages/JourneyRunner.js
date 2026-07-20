sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"po/ana/poanalytics/test/integration/pages/PurchaseAnalyticsList",
	"po/ana/poanalytics/test/integration/pages/PurchaseAnalyticsObjectPage"
], function (JourneyRunner, PurchaseAnalyticsList, PurchaseAnalyticsObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('po/ana/poanalytics') + '/test/flp.html#app-preview',
        pages: {
			onThePurchaseAnalyticsList: PurchaseAnalyticsList,
			onThePurchaseAnalyticsObjectPage: PurchaseAnalyticsObjectPage
        },
        async: true
    });

    return runner;
});

