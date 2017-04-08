
var Q = require('q');
var Attraction = require('../model/attraction');

function updateAttractionRatingFor(attraction){

    var deferred = Q.defer();

    var newRating = 0;

    console.log("Attraction review ?");

    if (attraction.reviews  && attraction.reviews.length > 0){

        console.log("YES: " + attraction.reviews.length);

        var totalRatings = 0;

        attraction.reviews.forEach(function(review){
            totalRatings += review.rating;
        });

        newRating = totalRatings / attraction.reviews.length;
    }

    attraction.rating = newRating;

    attraction.save(function(err,attraction){

        console.log("error saving: " + err);

       if (err) return deferred.reject(err);

        deferred.resolve(attraction);
    });

    return deferred.promise;
}


module.exports = {

    updateAttractionRatings : function (){

        var deferred = Q.defer();

        var query = Attraction.find();

        console.log(" updateAttractionRatings ");


        query.exec(function(err, attractions){

            if(err) return deferred.reject(err);

            var promises = [];

            console.log(attractions.length + " found !!");

            attractions.forEach(function(attraction){
                promises.push(updateAttractionRatingFor(attraction));
            });

            Q.all(promises)
                .then(function(results){
                    deferred.resolve(results);
                })
                .fail(function(error){
                    deferred.reject(error);
                });
        });

        return deferred.promise;
    }

};
