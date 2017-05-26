/**
 * Created by pablom on 19/05/17.
 */

var AppVisitStatistic = require('../model/appVisitStatistic');
var invalidSocialNetwork = require('./utils/socialNetwork.js').invalidSocialNetwork;

var monthToText = ["Enero", "Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

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
            {"$sort": {"year": 1, "month":1}}
        ],
        function (err, result) {

            if (!err) {

                var usersPerMonth =[];

                result.forEach(function(statistic){

                    var userPerMonth = {
                        Month: monthToText[statistic._id.month-1] + " " + statistic._id.year,
                        visits: statistic.count
                    };

                    usersPerMonth.push(userPerMonth);
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
    getAppVisitStatistic: getAppVisitStatistic,
    postAppVisitStatistic: postAppVisitStatistic
};