sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'anubhav/ui/maintainpassengers/test/integration/FirstJourney',
		'anubhav/ui/maintainpassengers/test/integration/pages/PassengerMain'
    ],
    function(JourneyRunner, opaJourney, PassengerMain) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('anubhav/ui/maintainpassengers') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onThePassengerMain: PassengerMain
                }
            },
            opaJourney.run
        );
    }
);