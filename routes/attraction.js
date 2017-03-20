/**
 * Created by pablom on 20/03/17.
 */

var mongoose = require('mongoose');
var Attraction = require('../model/attraction');
var City = require('../model/city');


/*
 * POST /attraction to save a new attraction.
 */
function postAttraction(req, res) {

    if (req.body.cityId === undefined){
        res.send({
            errors:{
                cityId:{
                    kind : 'required'
                }
            }
        });
    }else if(req.body.cityId !== undefined && req.body.cityId.constructor !== Array){
        res.send({
            errors:{
                cityId:{
                    kind : 'must be an array'
                }
            }
        });
    }else{

        var cities = [];

        req.body.cityId.forEach(function(id){
            City.findById(id, function(err, city) {

                if(err) res.send(err);

                if (city == null){
                    res.send({
                        errors:{
                            cityId:{
                                kind : 'invalid city id: '+id
                            }
                        }
                    });
                }else{
                    cities.push(city);
                }
            });
        });

        delete req.body.cityId;

        //Creates a new attraction
        var newAttraction = new Attraction(req.body);

        //Save it into the DB.
        newAttraction.save(function(err,attraction) {
            if(err) {
                res.send(err);
            }
            else {

                cities.forEach(function(city){
                    city.attractions.push(attraction._id);
                    city.save(function(err, city) {
                        if(err) {
                            res.send(err);
                        }
                    });
                });

                res.json({message: "Attraction successfully added!", attraction:attraction});
            }
        });
    }
}
//export all the functions
module.exports = {
    postAttraction: postAttraction
};