sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'anubhav.ui.managepo',
            componentId: 'PurchaseItemsSetObjectPage',
            contextPath: '/PurchaseOrderSet/Items'
        },
        CustomPageDefinitions
    );
});