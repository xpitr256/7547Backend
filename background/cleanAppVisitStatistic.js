/**
 * Created by pablom on 27/05/17.
 */

var AppVisitStatistic = require('../model/appVisitStatistic');
var config = require('./../config/config');
var mongoose = require('mongoose');

function handleError(error){
    console.error("CLEAN_APP_VISIT_STATISTIC was interrupted due to: " + error);
    console.timeEnd('CLEAN_APP_VISIT_STATISTIC');
    process.exit(1);
}

function performCleaning (){

    console.time('CLEAN_APP_VISIT_STATISTIC');

    var options = {
        server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
        replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } }
    };

    mongoose.Promise = require('q').Promise;
    mongoose.connect(config.MONGODB_URI, options,function(error){

        if (error){
            return handleError(error);
        }else{

            AppVisitStatistic.remove({}, function(err){

                if (err){
                    return handleError(err);
                }else{
                    console.log("Ending cleaning app visit statistic.");
                    console.timeEnd('CLEAN_APP_VISIT_STATISTIC');
                    process.exit();
                }
            });
        }
    });

    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
}

performCleaning();