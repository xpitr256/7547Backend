/**
 * Created by root on 15/03/17.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = require('q').Promise;

//city schema definition
var CitySchema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: false },
        imageURL: { type: String, required: false },
        location: {
            lng: Number,
            lat: Number
        }
    },
    {
        versionKey: false
    }
);


//Exports the CitySchema for use elsewhere.
module.exports = mongoose.model('city', CitySchema);