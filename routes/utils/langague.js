/**
 * Created by root on 12/04/17.
 */

var parser = require('accept-language-parser');

module.exports = {

    getLanguage: function(req){

        var language = undefined;

        var languages = parser.parse(req.headers['accept-language']);

        if (languages.length > 0){
            language =  languages[0].code;
        }

        return language;
    },

    filterCityLanguage : function(obj, language) {

        if (obj.description[language] !== undefined){
            obj.description = obj.description[language];
        }

        if (obj.tours !== undefined){
            obj.tours.forEach(function(tour){
                if (tour.description !== undefined && tour.description[language] !== undefined){
                    tour.description = tour.description[language];
                }
            });
        }

        return obj;
    },

    filterAttractionLanguage: function(obj,language){

        if (obj.description[language] !== undefined){
            obj.description = obj.description[language];
        }

        if (obj.audioURL[language] !== undefined){
            obj.audioURL = obj.audioURL[language];
        }

        if (obj.pointOfInterests && obj.pointOfInterests.length > 0){

            obj.pointOfInterests.forEach(function(pointOfInterest){

                if (pointOfInterest.description[language] !== undefined){
                    pointOfInterest.description = pointOfInterest.description[language];
                }

                if (pointOfInterest.audioURL[language] !== undefined){
                    pointOfInterest.audioURL = pointOfInterest.audioURL[language];
                }
            });
        }

        return obj;
    }
};