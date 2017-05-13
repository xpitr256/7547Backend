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

                        if ( cityAttraction.id == tourAttraction.id){
                            toursIBelongTo.push(tour);
                        }

                    });
                });

                cityAttraction._doc.toursIBelongTo = toursIBelongTo;
            });
        }
    }
};