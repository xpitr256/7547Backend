/**
 * Created by pablom on 08/04/17.
 */

var mongoose = require('mongoose');
var Attraction = require('../model/attraction');
var Q = require('q');

function postReview(req,res) {
    if (req.body.attractionId === undefined) {
        return res.send({
            errors:{
                attractionId:{
                    kind : 'required'
                }
            }
        });
    }else{
        Attraction.findById(req.body.attractionId, function(err, attraction) {

            if(err){
                return res.send({errors : err });
            }

            if (attraction == null){
                return res.send({
                    errors:{
                        attractionId:{
                            kind : 'invalid attraction id: '+req.body.attractionId
                        }
                    }
                });
            }else{
                attraction.reviews.push(req.body.review);
                attraction.save(function(err,savedAttraction){
                    if (err){
                        return res.send({errors: err});
                    }else{
                        return res.json({message: "Review successfully added!", attraction:savedAttraction});
                    }
                });
            }
        });
    }
}
//export all the functions
module.exports = {
    postReview: postReview
};