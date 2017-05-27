/**
 * Created by pablom on 19/05/17.
 */

var AppVisitStatistic = require('../model/appVisitStatistic');
var invalidSocialNetwork = require('./utils/socialNetwork.js').invalidSocialNetwork;
var Q = require('q');
var countrynames = require('countrynames');


var monthToText = ["Enero", "Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function getColorBy(colorIndex){

    var colorCombo = ['#FF9900','#6599FF','#FFDE00','#097054','#993300','#00628B','#81A594','#990033'];

    if (colorIndex > (colorCombo.length-1)){
        var randomIndex = Math.floor(Math.random() * (colorCombo.length-1));
        return colorCombo[randomIndex];
    }

    return colorCombo[colorIndex];
}

function getSocialNetworkStatisticByCountry(data){
    var deferred = Q.defer();

    var colorIndex = data.colorIndex;
    var statistic =  data.statistic;

    AppVisitStatistic.aggregate(
        [
            { $match: {country: statistic._id.country, socialNetwork:{ $ne: null }}},
            {
                "$group": {
                    _id : { socialNetwork: "$socialNetwork" },
                    "count": { $sum: { $cond:[
                        { $and: [ {$gte: ["$date", data.fromDate]}, {$lte: ["$date", data.toDate]} ] }, 1, 0]
                    }}
                }
            },
            // Sorting pipeline
            {"$sort": {"_id.socialNetwork": -1}}
        ],
        function (err, result) {

            if (!err) {

                var socialNetworkStatistics =[];

                var total = 0;
                result.forEach(function(socialNetworkStatistic){
                    total = total + socialNetworkStatistic.count;
                });

                if (total > 0){
                    result.forEach(function(socialNetworkStatistic){

                        var socialNetwork = {
                            type: socialNetworkStatistic._id.socialNetwork,
                            percent: Number(((socialNetworkStatistic.count / total)*100).toFixed(2))
                        };

                        if ( socialNetworkStatistic.count > 0){
                            socialNetworkStatistics.push(socialNetwork);
                        }
                    });
                }

                var name = countrynames.getName(statistic._id.country);

                var countrySocialNetwork = {
                    country: name,
                    percent: statistic.count,
                    color: getColorBy(colorIndex),
                    subs: socialNetworkStatistics
                };

                deferred.resolve(countrySocialNetwork);

            }else{
                return deferred.reject(err);
            }
        });

    return deferred.promise;
}


function getAppVisitStatisticByCountryAndSocialNetwork(req,res){

    //var fromDate = new Date("2017/05/26");
    var fromDate = new Date(req.query.fromDate);
    var toDate = new Date(req.query.toDate);

    AppVisitStatistic.aggregate(
        [
            { $match: {country: { $ne: null } }},
            {
                "$group": {
                    _id : { country: "$country" },
                    "count": { $sum: { $cond:[
                        { $and: [ {$gte: ["$date", fromDate]}, {$lte: ["$date", toDate]} ] }, 1, 0]
                    }}
                }
            },
            // Sorting pipeline
            {"$sort": {"_id.country": -1}}
        ],
        function (err, result) {

            if (!err) {

                if (result.length > 0){

                    var totalCountryCount = 0;
                    result.forEach(function(appVisitStatistic){
                        totalCountryCount = totalCountryCount + appVisitStatistic.count;
                    });

                    if (totalCountryCount > 0){

                        var promises = [];

                        result.forEach(function(statistic,index){

                            var data = {
                                statistic: statistic,
                                colorIndex: index,
                                fromDate: fromDate,
                                toDate: toDate
                            };

                            promises.push(getSocialNetworkStatisticByCountry(data));
                        });

                        Q.all(promises)
                            .then(function(results){

                                var responses =[];

                                results.forEach(function(statistic){

                                    statistic.percent = (statistic.percent / totalCountryCount)*100;
                                    statistic.percent = Number(statistic.percent.toFixed(2));

                                    if (statistic.percent>0){
                                        responses.push(statistic);
                                    }
                                });

                                return res.json(responses);
                            })
                            .fail(function(error){
                                return res.send(error);
                            });
                    }else{
                        return res.json([]);
                    }
                }else{
                    return res.json([]);
                }
            }else{
                return res.send(err);
            }
        });
}


function getAppVisitStatistic(req,res) {

    //var fromDate = new Date("2017/05/26");
    var fromDate = new Date(req.query.fromDate);
    var toDate = new Date(req.query.toDate);

    AppVisitStatistic.aggregate(
        [
            // Grouping pipeline
            {
                "$group": {
                    _id : { month: { $month: "$date" }, year: { $year: "$date" } },
                    "count": { $sum: { $cond:[
                        { $and: [ {$gte: ["$date", fromDate]}, {$lte: ["$date", toDate]} ] }, 1, 0]
                    }}
                }
            },
            // Sorting pipeline
            {"$sort": {"_id.year":1, "_id.month":1}}
        ],
        function (err, result) {

            if (!err) {

                var usersPerMonth =[];

                result.forEach(function(statistic){

                    var userPerMonth = {
                        Month: monthToText[statistic._id.month-1] + " " + statistic._id.year,
                        visits: statistic.count
                    };

                    if ( userPerMonth.visits > 0){
                        usersPerMonth.push(userPerMonth);
                    }
                });

                return res.json(usersPerMonth);
            }else{
                return res.send(err);
            }
        });
}

/*
 * POST /appVisitStatistic to save a new appVisitStatistic.
 */
function postAppVisitStatistic(req, res) {

    if (req.body.androidId === undefined){

        return res.send({
            errors:{
                androidId:{
                    kind : 'required'
                }
            }
        });

    }else if (invalidSocialNetwork(req)) {

        return res.send({
            errors:{
                socialNetwork:{
                    kind : 'invalid'
                }
            }
        });

    }else{

        var tempDate = new Date();
        var todayAtMidNight = new Date (tempDate.getUTCFullYear(), tempDate.getUTCMonth(), tempDate.getUTCDate());

        //before creating we check that if there is already an entry for this user for today
        var query = AppVisitStatistic.find({
            androidId: req.body.androidId,
            date: {$gte : todayAtMidNight }
        });

        query.exec(function(err, appVisitStatistics) {

            if (err) return res.send(err);

            if (appVisitStatistics.length == 0){
                //Creates a new appVisitStatistic
                var newAppVisitStatistic = new AppVisitStatistic(req.body);

                //Save it into the DB.
                newAppVisitStatistic.save(function(err,appVisitStatistic) {
                    if(err) {
                        return res.send(err);
                    }else {
                        res.json({message: "AppVisitStatistic successfully added!", appVisitStatistic:appVisitStatistic});
                    }
                });
            }else{
                //Updates the appVisitStatistic if it has more information
                if (appVisitStatistics[0].userId === undefined && req.body.userId !== undefined){

                    appVisitStatistics[0].userId = req.body.userId;
                    appVisitStatistics[0].socialNetwork = req.body.socialNetwork;

                    appVisitStatistics[0].save(function (err, updatedAppStatistic) {
                        if (err){
                            return res.send(err);
                        }
                        res.json({message: "AppVisitStatistic successfully added!", appVisitStatistic:updatedAppStatistic});
                    });

                }else{
                    //avoid duplication information we return the already saved appVisitStatistic for this user for today
                    res.json({message: "AppVisitStatistic successfully added!", appVisitStatistic:appVisitStatistics[0]});
                }
            }
        });
    }
}

//export all the functions
module.exports = {
    getAppVisitStatisticByCountryAndSocialNetwork: getAppVisitStatisticByCountryAndSocialNetwork,
    getAppVisitStatistic: getAppVisitStatistic,
    postAppVisitStatistic: postAppVisitStatistic
};