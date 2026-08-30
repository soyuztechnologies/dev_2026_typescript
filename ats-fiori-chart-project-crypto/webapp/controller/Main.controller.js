sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (
    Controller,
    JSONModel,
    MessageToast
) {
    "use strict";

    return Controller.extend("project1.controller.Main", {

        TOKEN_ADDRESS: "4cQ9BeG6bdpkQcYGadqc1n6nCWgMuoHZenVH1xXepump",

        // GeckoTerminal network
        NETWORK: "solana",

        onInit: function () {

            var oModel = new JSONModel({
                symbol: "ATS",
                name: "Anubhav Trainings",

                price: "Loading...",
                change24h: "Loading...",
                changeState: "None",

                marketCap: "Loading...",
                volume24h: "Loading...",

                contract: this.TOKEN_ADDRESS,
                network: "Solana",

                lastUpdated: "Loading...",

                chartData: [],

                loading: true,
                error: false
            });

            this.getView().setModel(oModel);

            this._sSelectedRange = "24H";
            this._aFullChartData = [];

            // Load immediately
            this.loadTokenData();

            // Refresh price every 30 seconds
            this._refreshTimer = setInterval(
                this.loadTokenData.bind(this),
                30000
            );
        },


        // ============================================================
        // LOAD TOKEN DATA
        // ============================================================

        loadTokenData: function () {

            var sUrl =
                "https://api.geckoterminal.com/api/v2" +
                "/networks/" +
                this.NETWORK +
                "/tokens/" +
                this.TOKEN_ADDRESS;

            console.log("Calling token API:");
            console.log(sUrl);

            fetch(sUrl, {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            })
                .then(function (oResponse) {

                    console.log(
                        "Token API status:",
                        oResponse.status
                    );

                    if (!oResponse.ok) {

                        throw new Error(
                            "HTTP " +
                            oResponse.status +
                            " - " +
                            oResponse.statusText
                        );
                    }

                    return oResponse.json();
                })

                .then(function (oData) {

                    console.log(
                        "TOKEN RESPONSE:",
                        oData
                    );

                    if (
                        !oData ||
                        !oData.data ||
                        !oData.data.attributes
                    ) {
                        throw new Error(
                            "Invalid token response"
                        );
                    }

                    var oAttributes =
                        oData.data.attributes;

                    var oModel =
                        this.getView().getModel();


                    // ------------------------------------------------
                    // PRICE
                    // ------------------------------------------------

                    var fPrice =
                        parseFloat(
                            oAttributes.price_usd || 0
                        );


                    // ------------------------------------------------
                    // MARKET CAP
                    // ------------------------------------------------

                    var fMarketCap =
                        parseFloat(
                            oAttributes.market_cap_usd || 0
                        );


                    // ------------------------------------------------
                    // VOLUME
                    // ------------------------------------------------

                    var fVolume =
                        parseFloat(
                            oAttributes.volume_usd &&
                            oAttributes.volume_usd.h24
                                ? oAttributes.volume_usd.h24
                                : 0
                        );


                    // ------------------------------------------------
                    // 24H CHANGE
                    // ------------------------------------------------

                    var fChange =
                        parseFloat(
                            oAttributes
                                .price_change_percentage
                                ?.h24 || 0
                        );


                    // ------------------------------------------------
                    // UPDATE MODEL
                    // ------------------------------------------------

                    oModel.setProperty(
                        "/price",
                        this.formatPrice(fPrice)
                    );

                    oModel.setProperty(
                        "/marketCap",
                        this.formatNumber(fMarketCap)
                    );

                    oModel.setProperty(
                        "/volume24h",
                        this.formatNumber(fVolume)
                    );

                    oModel.setProperty(
                        "/change24h",
                        fChange.toFixed(2)
                    );

                    oModel.setProperty(
                        "/changeState",
                        fChange >= 0
                            ? "Success"
                            : "Error"
                    );

                    oModel.setProperty(
                        "/lastUpdated",
                        new Date().toLocaleString()
                    );

                    oModel.setProperty(
                        "/loading",
                        false
                    );

                    oModel.setProperty(
                        "/error",
                        false
                    );


                    // ------------------------------------------------
                    // LOAD CHART
                    // ------------------------------------------------

                    this.loadChartData();

                }.bind(this))

                .catch(function (oError) {

                    console.error(
                        "TOKEN API ERROR:",
                        oError
                    );

                    this.getView()
                        .getModel()
                        .setProperty(
                            "/loading",
                            false
                        );

                    this.getView()
                        .getModel()
                        .setProperty(
                            "/error",
                            true
                        );

                    MessageToast.show(
                        "Unable to load ATS price"
                    );

                }.bind(this));
        },


        // ============================================================
        // LOAD OHLCV CHART
        // ============================================================

        loadChartData: function () {

            var sUrl =
                "https://api.geckoterminal.com/api/v2" +
                "/networks/" +
                this.NETWORK +
                "/tokens/" +
                this.TOKEN_ADDRESS +
                "/ohlcv";

            /*
             * GeckoTerminal token endpoint gives us
             * the token's most relevant pool data.
             *
             * For the chart we first find the top pool,
             * then request its OHLCV.
             */

            var sPoolUrl =
                "https://api.geckoterminal.com/api/v2" +
                "/networks/" +
                this.NETWORK +
                "/tokens/" +
                this.TOKEN_ADDRESS +
                "/pools";

            console.log(
                "Finding ATS pools:",
                sPoolUrl
            );


            fetch(sPoolUrl, {

                method: "GET",

                headers: {
                    "Accept": "application/json"
                }

            })

                .then(function (oResponse) {

                    if (!oResponse.ok) {

                        throw new Error(
                            "Pool API HTTP " +
                            oResponse.status
                        );

                    }

                    return oResponse.json();

                })

                .then(function (oData) {

                    console.log(
                        "POOL RESPONSE:",
                        oData
                    );


                    if (
                        !oData ||
                        !oData.data ||
                        !oData.data.length
                    ) {

                        throw new Error(
                            "No pools found for ATS"
                        );

                    }


                    /*
                     * First pool is normally the
                     * highest-ranked pool.
                     */

                    var oPool =
                        oData.data[0];


                    var sPoolId =
                        oPool.id;


                    /*
                     * Pool ID is normally:
                     *
                     * solana_POOL_ADDRESS
                     *
                     * We need only the address.
                     */

                    var sPoolAddress =
                        sPoolId.split("_")[1];


                    console.log(
                        "ATS Pool:",
                        sPoolAddress
                    );


                    /*
                     * The token endpoint does not return
                     * price_change_percentage, and market_cap_usd
                     * is normally null (no circulating supply data).
                     * The pool endpoint has both, with fdv_usd as
                     * a fallback for market cap.
                     */

                    var oPoolAttributes =
                        oPool.attributes || {};

                    var fChange =
                        parseFloat(
                            (
                                oPoolAttributes.price_change_percentage &&
                                oPoolAttributes.price_change_percentage.h24
                            ) || 0
                        );

                    var fMarketCap =
                        parseFloat(
                            oPoolAttributes.market_cap_usd ||
                            oPoolAttributes.fdv_usd ||
                            0
                        );

                    var oModel =
                        this.getView().getModel();

                    oModel.setProperty(
                        "/change24h",
                        fChange.toFixed(2)
                    );

                    oModel.setProperty(
                        "/changeState",
                        fChange >= 0
                            ? "Success"
                            : "Error"
                    );

                    oModel.setProperty(
                        "/marketCap",
                        this.formatNumber(fMarketCap)
                    );


                    return this.loadPoolOHLCV(
                        sPoolAddress
                    );

                }.bind(this))

                .then(function (oChartData) {

                    this._aFullChartData = oChartData;

                    console.log(
                        "CHART DATA:",
                        oChartData
                    );

                    this._applyTimeRange(this._sSelectedRange);

                }.bind(this))

                .catch(function (oError) {

                    console.error(
                        "CHART ERROR:",
                        oError
                    );

                }.bind(this));
        },


        // ============================================================
        // POOL OHLCV
        // ============================================================

        loadPoolOHLCV: function (sPoolAddress) {

            var sUrl =
                "https://api.geckoterminal.com/api/v2" +
                "/networks/" +
                this.NETWORK +
                "/pools/" +
                sPoolAddress +
                "/ohlcv/minute" +
                "?aggregate=5" +
                "&limit=300" +
                "&currency=usd";

            console.log(
                "OHLCV URL:",
                sUrl
            );


            return fetch(sUrl, {

                method: "GET",

                headers: {
                    "Accept": "application/json"
                }

            })

                .then(function (oResponse) {

                    console.log(
                        "OHLCV status:",
                        oResponse.status
                    );


                    if (!oResponse.ok) {

                        throw new Error(
                            "OHLCV HTTP " +
                            oResponse.status
                        );

                    }

                    return oResponse.json();

                })

                .then(function (oData) {

                    console.log(
                        "OHLCV RESPONSE:",
                        oData
                    );


                    var aOHLCV =
                        oData.data &&
                        oData.data.attributes &&
                        oData.data.attributes.ohlcv_list
                            ? oData.data.attributes.ohlcv_list
                            : [];


                    var aChartData = [];


                    aOHLCV.forEach(function (aRow) {

                        if (
                            !aRow ||
                            aRow.length < 5
                        ) {
                            return;
                        }


                        var iTimestamp =
                            parseInt(aRow[0], 10);


                        var fClose =
                            parseFloat(aRow[4]);


                        if (
                            isNaN(iTimestamp) ||
                            isNaN(fClose)
                        ) {
                            return;
                        }


                        var oDate =
                            new Date(
                                iTimestamp * 1000
                            );


                        aChartData.push({

                            time:
                                oDate.toLocaleTimeString(
                                    [],
                                    {
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    }
                                ),

                            price: fClose

                        });

                    });


                    /*
                     * API normally returns newest first.
                     */

                    aChartData.reverse();


                    return aChartData;

                });

        },


        // ============================================================
        // TIME RANGE SELECTION
        // ============================================================

        onTimeRangePress: function (oEvent) {

            var oButton =
                oEvent.getSource();

            var sRange =
                oButton.getText();

            this._sSelectedRange = sRange;


            // Toggle active styling across the sibling buttons

            var aButtons =
                oButton.getParent().getContent();

            aButtons.forEach(function (oControl) {

                if (
                    oControl.hasStyleClass &&
                    oControl.hasStyleClass("atsTimeBtn")
                ) {

                    oControl.removeStyleClass("atsTimeBtnActive");

                }

            });

            oButton.addStyleClass("atsTimeBtnActive");


            this._applyTimeRange(sRange);

        },


        // ============================================================
        // APPLY TIME RANGE TO CHART DATA
        // ============================================================

        _applyTimeRange: function (sRange) {

            var mMinutesByRange = {
                "1H": 60,
                "6H": 360,
                "24H": 1440
            };

            var iMinutes =
                mMinutesByRange[sRange] || 1440;

            // Data is aggregated in 5-minute candles

            var iCandles =
                Math.ceil(iMinutes / 5);

            var aSliced =
                (this._aFullChartData || [])
                    .slice(-iCandles);

            this.getView()
                .getModel()
                .setProperty(
                    "/chartData",
                    aSliced
                );

            this.configureChart();

        },


        // ============================================================
        // CHART CONFIGURATION
        // ============================================================

        configureChart: function () {

            var oChart =
                this.byId("priceChart");


            if (!oChart) {
                return;
            }


            // ------------------------------------------------
            // DYNAMIC Y-AXIS SCALE
            //
            // The default axis starts at 0, which flattens
            // small price moves for a token trading at
            // fractions of a cent. Scale to the visible
            // data range instead.
            // ------------------------------------------------

            var aChartData =
                this.getView()
                    .getModel()
                    .getProperty("/chartData") || [];

            var aPrices =
                aChartData
                    .map(function (oPoint) {
                        return oPoint.price;
                    })
                    .filter(function (fValue) {
                        return (
                            typeof fValue === "number" &&
                            !isNaN(fValue)
                        );
                    });

            var fAxisMin = 0;
            var fAxisMax = 1;

            if (aPrices.length) {

                var fMin =
                    Math.min.apply(null, aPrices);

                var fMax =
                    Math.max.apply(null, aPrices);

                var fRange =
                    fMax - fMin;

                var fPadding =
                    fRange > 0
                        ? fRange * 0.15
                        : (fMax * 0.05 || 0.0000001);

                fAxisMin =
                    Math.max(0, fMin - fPadding);

                fAxisMax =
                    fMax + fPadding;

            }


            oChart.setVizProperties({

                plotArea: {

                    dataLabel: {
                        visible: false
                    },

                    window: {
                        start: "firstDataPoint",
                        end: "lastDataPoint"
                    },

                    colorPalette: ["#00ffc8"],

                    /*
                     * The documented valueAxis.min/max properties
                     * are ignored by VizFrame for line charts. The
                     * actual (undocumented but functional) path is
                     * plotArea.primaryScale.
                     */

                    primaryScale: {
                        fixedRange: true,
                        minValue: fAxisMin,
                        maxValue: fAxisMax
                    }

                },

                categoryAxis: {

                    title: {
                        visible: false
                    },

                    label: {
                        visible: true
                    }

                },

                valueAxis: {

                    title: {
                        visible: true,
                        text: "ATS Price (USD)"
                    },

                    label: {
                        visible: true,
                        formatString: "0.000000"
                    }

                },

                legend: {
                    visible: false
                },

                title: {
                    visible: false
                },

                interaction: {
                    noninteractiveMode: false
                },

                dataPoint: {
                    tooltip: {
                        formatString: "0.000000"
                    }
                },

                background: {
                    color: "transparent"
                }

            });

        },


        // ============================================================
        // REFRESH
        // ============================================================

        onRefresh: function () {

            MessageToast.show(
                "Refreshing ATS..."
            );

            this.loadTokenData();

        },


        // ============================================================
        // PUMP.FUN
        // ============================================================

        onOpenPump: function () {

            window.open(
                "https://pump.fun/coin/" +
                this.TOKEN_ADDRESS,
                "_blank"
            );

        },


        // ============================================================
        // COPY CONTRACT
        // ============================================================

        onCopyContract: function () {

            var sContract =
                this.TOKEN_ADDRESS;


            if (
                navigator.clipboard &&
                navigator.clipboard.writeText
            ) {

                navigator.clipboard
                    .writeText(sContract)
                    .then(function () {

                        MessageToast.show(
                            "Contract copied"
                        );

                    });

            }

        },


        // ============================================================
        // PRICE FORMAT
        // ============================================================

        formatPrice: function (fPrice) {

            if (
                !fPrice ||
                isNaN(fPrice)
            ) {

                return "0.000000";

            }

            return fPrice.toFixed(6);

        },


        // ============================================================
        // NUMBER FORMAT
        // ============================================================

        formatNumber: function (fNumber) {

            if (
                !fNumber ||
                isNaN(fNumber)
            ) {

                return "$0";

            }


            if (fNumber >= 1000000000) {

                return "$" +
                    (
                        fNumber / 1000000000
                    ).toFixed(2) +
                    "B";

            }


            if (fNumber >= 1000000) {

                return "$" +
                    (
                        fNumber / 1000000
                    ).toFixed(2) +
                    "M";

            }


            if (fNumber >= 1000) {

                return "$" +
                    (
                        fNumber / 1000
                    ).toFixed(2) +
                    "K";

            }


            return "$" +
                fNumber.toFixed(2);

        },


        // ============================================================
        // CLEANUP
        // ============================================================

        onExit: function () {

            if (this._refreshTimer) {

                clearInterval(
                    this._refreshTimer
                );

                this._refreshTimer = null;

            }

        }

    });

});