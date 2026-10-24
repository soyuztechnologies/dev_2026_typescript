sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'anubhav/afctl/anubhavui/test/integration/FirstJourney',
		'anubhav/afctl/anubhavui/test/integration/pages/BooksList',
		'anubhav/afctl/anubhavui/test/integration/pages/BooksObjectPage'
    ],
    function(JourneyRunner, opaJourney, BooksList, BooksObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('anubhav/afctl/anubhavui') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheBooksList: BooksList,
					onTheBooksObjectPage: BooksObjectPage
                }
            },
            opaJourney.run
        );
    }
);