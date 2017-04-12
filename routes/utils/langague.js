/**
 * Created by root on 12/04/17.
 */

var parser = require('accept-language-parser');


function getLanguage(req){

    var language = 'en';

    var languages = parser.parse(req.headers['accept-language']);

    if (languages.length > 0){
        language =  languages[0].code;
    }

    return language;
}

module.exports = getLanguage;