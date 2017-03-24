/**
 * Created by root on 15/03/17.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = require('q').Promise;
require('./attraction');
var attraction = mongoose.model('attraction');

//city schema definition
var CitySchema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: false },
        imageURL: { type: String, required: false },
        currency :{
            name : String,
            symbol: String
        },
        state: { type: String },
        country: { type: String },
        location: {
            lng: Number,
            lat: Number
        },
        attractions : [{type: Schema.Types.ObjectId, ref: "attraction"}]
    },
    {
        versionKey: false
    }
);


//Exports the CitySchema for use elsewhere.
module.exports = mongoose.model('city', CitySchema);