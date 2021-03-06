/**
 * Created by pablom on 20/03/17.
 */

var mongoose = require('mongoose');
var Attraction = require('../model/attraction');
var City = require('../model/city');
var cityModel = mongoose.model('city');
var Q = require('q');
var language = require('./utils/langague.js');
var order = require('./utils/order.js');


function validateInputCities(body){

    var errors;

    if (body.cities === undefined){

        errors = {
            cities:{
                kind : 'required'
            }
        }

    }else if(body.cities !== undefined && body.cities.constructor !== Array) {

        errors = {
            cities: {
                kind: 'must be an array'
            }
        }
    }

    return errors;
}


/*
 * POST /attraction to save a new attraction.
 */
function postAttraction(req, res) {

    if (req.body.cities === undefined){
        return res.send({
            errors:{
                cities:{
                    kind : 'required'
                }
            }
        });
    }else if(req.body.cities !== undefined && req.body.cities.constructor !== Array){
        return res.send({
            errors:{
                cities:{
                    kind : 'must be an array'
                }
            }
        });
    }else{

        var cities = [];
        var errors = [];

        req.body.cities.forEach(function(id){
            City.findById(id, function(err, city) {

                if(err){
                    errors.push(err);
                }

                if (city == null){
                    errors.push({
                        errors:{
                            cities:{
                                kind : 'invalid city id: '+id
                            }
                        }
                    });
                }else{
                    cities.push(city);
                }
            });
        });


        //Creates a new attraction
        var newAttraction = new Attraction(req.body);

        //Save it into the DB.
        newAttraction.save(function(err,attraction) {
            if(err) {
                errors.push(err);
            }
            else {

                cities.forEach(function(city){
                    city.attractions.push(attraction._id);
                    city.save(function(err, city) {
                        if(err) {
                            errors.push(err);
                        }
                    });
                });

                if (errors.length > 0 ){
                    return res.send(errors[0]);
                }else{
                    res.json({message: "Attraction successfully added!", attraction:attraction});
                }
            }
        });
    }
}


/*
 * GET /attraction/:id route to retrieve a attraction given its id.
 */
function getAttraction(req, res) {

    var requestedLanguage = language.getLanguage(req);

    Attraction.findById(req.params.id, function (err, attraction) {
        if (err) res.send(err);

        //If no errors, send it back to the client
        if (requestedLanguage) {
            language.filterAttractionLanguage(attraction, requestedLanguage);
        }

        order.orderReviewsByDate(attraction);


        cityModel.populate(attraction, {path: "cities"}, function (err, populatedAttraction) {

            var toursIBelongTo = [];

            if (populatedAttraction.cities[0].tours && populatedAttraction.cities[0].tours.length > 0) {

                populatedAttraction.cities[0].tours.forEach(function (tour) {
                    tour.attractions.forEach(function (tourAttraction) {
                        if (String(tourAttraction) === String(populatedAttraction._id)) {
                            toursIBelongTo.push(tour);
                        }
                    });
                });

                populatedAttraction._doc.toursIBelongTo = toursIBelongTo;

                Attraction.populate(populatedAttraction, {path: "toursIBelongTo.attractions"}, function (err, tourPopulatedAttraction) {

                    if (requestedLanguage) {
                        language.filterToursIBelongTo(tourPopulatedAttraction, requestedLanguage)
                        tourPopulatedAttraction._doc.toursIBelongTo.forEach(function(tour){
                            tour.attractions.forEach(function(attractionOfTheTour){
                                language.filterAttractionLanguage(attractionOfTheTour,requestedLanguage);
                            });
                        });
                    }

                    res.json(tourPopulatedAttraction);
                });
            } else {
                populatedAttraction._doc.toursIBelongTo = toursIBelongTo;

                if (requestedLanguage) {
                    language.filterToursIBelongTo(populatedAttraction, requestedLanguage)
                }

                res.json(populatedAttraction);
            }
        });
    });
}


/*
 * GET /attraction route to retrieve all attractions.
 */
function getAttractions(req, res) {


    var searchFilters = {};

    if ( req.query.name !== undefined ){
        searchFilters.name= {$regex: req.query.name, $options: 'i'};
    }

    //Query the DB and if no errors, send all the cities
    var query = Attraction.find(searchFilters).sort( { name: 1 } );

    query.exec(function(err, attractions){

        if(err) return res.send(err);

        cityModel.populate(attractions, {path: "cities"},function(err, attractions){

            attractions.forEach(function(attraction){
                order.orderReviewsByDate(attraction);
            });

            res.json(attractions);
        });

    });
}

/*
 * DELETE /attraction/:id to delete an attraction given its id.
 */
function deleteAttraction(req, res) {

    var query = City.find({attractions: req.params.id});

    var errors = [];

    query.exec(function(err, cities){

        if (err) errors.push(err);

        cities.forEach(function(city){

            var index = city.attractions.indexOf(req.params.id);
            if (index > -1) {
                city.attractions.splice(index, 1);
            }

            city.save(function(err,res){
                if (err) errors.push(err);
            })
        });

        if (errors.length > 0){
            return res.send(errors[0]);
        }else{
            Attraction.remove({_id : req.params.id},function (err, result){
                if  (err) return res.send(err);
                res.json({ message: "Attraction successfully deleted!",result:result});
            });
        }

    });


}


/*
 * PUT /attraction/:id to update an attraction given its id
 */
function updateAttraction(req, res) {

    var errors = validateInputCities(req.body);

    if (!errors) {
        var errors = [];
        var allNewCities = [];

        var promises = [];

        req.body.cities.forEach(function (id) {
            promises.push(City.findById(id).exec());
        });

        Q.all(promises)
            .then(function(results){

                allNewCities = results;

                Attraction.findById({_id: req.params.id}, function(err, attraction) {
                        if(err) res.send(err);

                        var previousCities = attraction.cities;


                        // Detect new cities that needs to be saved
                        var newCities =  allNewCities.filter(function(current){
                            return previousCities.filter(function(previousCityId){
                                    return previousCityId == current.id;
                                }).length == 0
                        });

                        // Detect removed ones to also remove this attraction from its array
                        var oldCitiesIds = previousCities.filter(function(previousCityId){
                            return allNewCities.filter(function(current){
                                    return previousCityId == current.id;
                                }).length == 0
                        });


                        Object.assign(attraction, req.body).save(function(err, attraction){
                            if(err) res.send(err);

                            var promises = [];

                            // GET add attraction id to new cities.
                            newCities.forEach(function(city){
                                city.attractions.push(attraction.id);
                                promises.push(city.save());
                            });


                            Q.all(promises)
                                .then(function(){

                                    var promises = [];

                                    oldCitiesIds.forEach(function(oldCityId){
                                        promises.push(City.findById(oldCityId).exec());
                                    });

                                    // GET oldCities and remove attraction id.
                                    Q.all(promises)
                                        .then(function(results){

                                            var promises =[];

                                            results.forEach(function(oldCity){
                                                var index = oldCity.attractions.indexOf(attraction.id);
                                                if (index > -1) {
                                                    oldCity.attractions.splice(index, 1);
                                                    promises.push(oldCity.save());
                                                }
                                            });


                                            Q.all(promises)
                                                .then(function(){
                                                    res.json({ message: 'Attraction updated!',attraction:attraction});
                                                })
                                                .catch(function(error){
                                                    console.error('error:', error);
                                                    res.send(error);
                                                });
                                        })
                                        .catch(function(error){
                                            console.error('error:', error);
                                            res.send(error);

                                        });
                                })
                                .catch(function(error){
                                    console.error('error:', error);
                                    res.send(error);

                                });
                        });
            })
            .catch(function(err){
                 console.error('error:', err);
                res.send(err);
            });
        });
    }else{
        res.send(errors);
    }
}


//export all the functions
module.exports = {
    getAttractions: getAttractions,
    getAttraction: getAttraction,
    postAttraction: postAttraction,
    deleteAttraction: deleteAttraction,
    updateAttraction: updateAttraction
};