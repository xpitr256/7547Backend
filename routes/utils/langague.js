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

        if (obj.name[language] !== undefined){
            obj.name = obj.name[language];
        }

        if (obj.description[language] !== undefined){
            obj.description = obj.description[language];
        }

        return obj;
    }
};