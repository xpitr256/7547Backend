/**
 * Created by pablom on 18/05/17.
 */

var AttractionStatistic = require('../model/attractionStatistic');
var invalidSocialNetwork = require('./utils/socialNetwork.js').invalidSocialNetwork;
var mongoose = require('mongoose');
var Attraction = mongoose.model('attraction');
/*
 * POST /attractionStatistic to save a new attractionStatistic.
 */
function postAttractionStatistic(req, res) {

    if (req.body.androidId === undefined){

        return res.send({
            errors:{
                androidId:{
                    kind : 'required'
                }
            }
        });

    }else if(req.body.attraction == undefined){

        return res.send({
            errors:{
                attraction:{
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


        //Creates a new attractionStatistic
        var newAttractionStatistic = new AttractionStatistic(req.body);

        //Save it into the DB.
        newAttractionStatistic.save(function(err,attractionStatistic) {
            if(err) {
                return res.send(err);
            }else {
                res.json({message: "AttractionStatistic successfully added!", attractionStatistic:attractionStatistic});
            }
        });
    }
}


function getTop10Attractions(req,res){

    AttractionStatistic.aggregate(
        [
            // Grouping pipeline
            { "$group": {
                "_id": '$attraction',
                "attractionCount": { "$sum": 1 }
            }},
            // Sorting pipeline
            { "$sort": { "attractionCount": -1 } },
            // Optionally limit results
            { "$limit": 10 }
        ],
        function(err,result) {

            if (!err){

                Attraction.populate(result,{path: "_id"},function(err, results){

                    if (err){
                        res.json(err);

                    }else {

                        var topAttractionsVisited = [];

                        results.forEach(function(statisticResult){
                            var attractionVisited = {
                                attractionName: statisticResult._id.name,
                                visits: statisticResult.attractionCount
                            };

                            topAttractionsVisited.push(attractionVisited);
                        });

                        res.json(topAttractionsVisited);
                    }
                });
            }else{
                res.json(err);
            }
        }
    );
}

//export all the functions
module.exports = {
    postAttractionStatistic: postAttractionStatistic,
    getTop10Attractions: getTop10Attractions
};