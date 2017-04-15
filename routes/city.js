/**
 * Created by root on 15/03/17.
 */

var mongoose = require('mongoose');
var City = require('../model/city');
var attraction = mongoose.model('attraction');
var language = require('./utils/langague.js');

/*
 * GET /city route to retrieve all the cities.
 */
function getCities(req, res) {

    var requestedLanguage = language.getLanguage(req);

    var searchFilters = {};

    if ( req.query.name !== undefined ){
        searchFilters.name= {$regex: req.query.name, $options: 'i'};
    }

    //Query the DB and if no errors, send all the cities
    var query = City.find(searchFilters).sort( { name: 1 } );

    query.exec(function(err, cities){

        if(err) return res.send(err);

        attraction.populate(cities, {path: "attractions"},function(err, cities){

            if (requestedLanguage){
                cities.forEach(function(city){
                   language.filterCityLanguage(city,requestedLanguage);
                });
            }

            res.json(cities);
        });

    });
}

/*
 * POST /city to save a new city.
 */
function postCity(req, res) {
    //Creates a new city
    var newCity = new City(req.body);
    //Save it into the DB.
    newCity.save(function(err,city) {
        if(err) {
            res.send(err);
        }
        else { //If no errors, send it back to the client
            res.json({message: "City successfully added!", city:city});
        }
    });
}

/*
 * GET /city/:id route to retrieve a city given its id.
 */
function getCity(req, res) {

    var requestedLanguage = language.getLanguage(req);

    City.findById(req.params.id, function(err, city) {
        if(err) res.send(err);

        //If no errors, send it back to the client
        if (requestedLanguage){
            language.filterCityLanguage(city,requestedLanguage);
        }

        res.json(city);
    });
}

/*
 * DELETE /city/:id to delete a city given its id.
 */
function deleteCity(req, res) {
    City.remove({_id : req.params.id},function (err, result){
        res.json({ message: "City successfully deleted!",result:result});
});
}

/*
 * PUT /city/:id to update a city given its id
 */
function updateCity(req, res) {
    City.findById({_id: req.params.id}, function(err, city) {
        if(err) res.send(err);

        Object.assign(city, req.body).save(function(err, city){
            if(err) res.send(err);
            res.json({ message: 'City updated!',city:city});
        });
    });
}

//export all the functions
module.exports = {
    getCities: getCities,
    postCity: postCity,
    getCity:getCity,
    deleteCity:deleteCity,
    updateCity:updateCity
};