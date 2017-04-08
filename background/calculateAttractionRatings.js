/**
 * Created by pablom on 01/04/17.
 */

var ratingCalculator = require('./attractionRatingCalculator.js');
var config = require('./../config/config');
var mongoose = require('mongoose');

function handleError(error){
    console.error("ATTRACTION_RATING_CALCULATION was interrupted due to: " + error);
    console.timeEnd('ATTRACTION_RATING_CALCULATION');
    process.exit(1);
}

function performCalculation (){

    console.time('ATTRACTION_RATING_CALCULATION');

    var options = {
        server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
        replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } }
    };

    mongoose.Promise = require('q').Promise;
    mongoose.connect(config.MONGODB_URI, options,function(error){

        if (error){
            return handleError(error);
        }else{

            ratingCalculator.updateAttractionRatings()
                .then(function(results){
                    console.log("Ending rating calculation. " + results.length +" attraction(s) processed");
                    console.timeEnd('ATTRACTION_RATING_CALCULATION');
                    process.exit();

                }).fail(handleError);
        }
    });

    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
}

performCalculation();
