sap.ui.define([
    "sap/ui/test/opaQunit",
    "./pages/JourneyRunner"
], function (opaTest, runner) {
    "use strict";

    function journey() {
        QUnit.module("First journey");

        opaTest("Start application", function (Given, When, Then) {
            Given.iStartMyApp();

            Then.onThePurchaseAnalyticsList.iSeeThisPage();
            Then.onThePurchaseAnalyticsList.onFilterBar().iCheckFilterField("{i18n>PO_ID}");
            Then.onThePurchaseAnalyticsList.onFilterBar().iCheckFilterField("{i18n>COMPANY_NAME}");
            Then.onThePurchaseAnalyticsList.onFilterBar().iCheckFilterField("{i18n>CURRENCY}");
            Then.onThePurchaseAnalyticsList.onFilterBar().iCheckFilterField("{i18n>DESCRIPTION}");
            Then.onThePurchaseAnalyticsList.onFilterBar().iCheckFilterField("{i18n>COUNTRY}");
            Then.onThePurchaseAnalyticsList.onTable().iCheckColumns(8, {"PurchaseOrderId":{"header":"{i18n>PO_ID}"},"ItemPosition":{"header":"{i18n>PO_ITEM_POS}"},"CompanyName":{"header":"{i18n>COMPANY_NAME}"},"GrossAmount":{"header":"{i18n>GROSS_AMOUNT}"},"CurrencyCode":{"header":"{i18n>CURRENCY}"},"Description":{"header":"{i18n>DESCRIPTION}"},"OverallStatus":{"header":"{i18n>OVERALL_STATUS}"},"Country":{"header":"{i18n>COUNTRY}"}});

        });


        opaTest("Navigate to ObjectPage", function (Given, When, Then) {
            // Note: this test will fail if the ListReport page doesn't show any data
            
            When.onThePurchaseAnalyticsList.onFilterBar().iExecuteSearch();
            
            Then.onThePurchaseAnalyticsList.onTable().iCheckRows();

            When.onThePurchaseAnalyticsList.onTable().iPressRow(0);
            Then.onThePurchaseAnalyticsObjectPage.iSeeThisPage();

        });

        opaTest("Teardown", function (Given, When, Then) { 
            // Cleanup
            Given.iTearDownMyApp();
        });
    }

    runner.run([journey]);
});