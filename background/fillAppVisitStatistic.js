/**
 * Created by pablom on 27/05/17.
 */
var AppVisitStatistic = require('../model/appVisitStatistic');
var config = require('./../config/config');
var mongoose = require('mongoose');
var testData = require('./data/appVisitStatisticTestData.js');


function handleError(error){
    console.error("FILL_APP_VISIT_STATISTIC was interrupted due to: " + error);
    console.timeEnd('FILL_APP_VISIT_STATISTIC');
    process.exit(1);
}

function performFilling (){

    console.time('FILL_APP_VISIT_STATISTIC');

    var options = {
        server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
        replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } }
    };

    mongoose.Promise = require('q').Promise;
    mongoose.connect(config.MONGODB_URI, options,function(error){

        if (error){
            return handleError(error);
        }else{

            AppVisitStatistic.insertMany(testData, function(err,docs){

                if (err){
                    return handleError(err);
                }else{
                    console.log("Ending filling app visit statistic. " + docs.length + " doc were successfully added.");
                    console.timeEnd('FILL_APP_VISIT_STATISTIC');
                    process.exit();
                }
            });
        }
    });

    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
}

performFilling();