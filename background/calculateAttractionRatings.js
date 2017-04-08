/**
 * Created by pablom on 01/04/17.
 */

var ratingCalculator = require('./attractionRatingCalculator.js');

function performCalculation (){

    console.time('ATTRACTION_RATING_CALCULATION');

    console.log("Starting rating calculation");

    ratingCalculator.updateAttractionRatings()
        .then(function(results){
            console.log("Ending rating calculation");

            console.log(results);
            console.timeEnd('ATTRACTION_RATING_CALCULATION');
            process.exit();

        }).fail(function(error){

        console.log("Ending rating calculation with ERRORS");

        console.error("ATTRACTION_RATING_CALCULATION was interrupted due to: " + error);
            console.timeEnd('ATTRACTION_RATING_CALCULATION');
            process.exit(1);
        });
}

performCalculation();
