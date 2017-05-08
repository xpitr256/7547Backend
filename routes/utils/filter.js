/**
 * Created by root on 08/05/17.
 */


module.exports = {

    addToursItsBelongToInAttraction: function (city) {

        if (city.attractions && city.tours.length > 0){

            city.attractions.forEach(function(cityAttraction){

                var toursIBelongTo = [];

                city.tours.forEach(function(tour){

                    tour.attractions.forEach(function(tourAttraction){

                        if ( cityAttraction._id == tourAttraction._id){
                            toursIBelongTo.push(tour);
                        }

                    });
                });

                cityAttraction.toursIBelongTo = toursIBelongTo;
            });
        }
    }
};