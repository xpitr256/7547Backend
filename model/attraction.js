/**
 * Created by root on 19/03/17.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = require('q').Promise;

var AttractionSchema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, min: 0, default: 0 },
        avgDurationInMinutes : { type: Number, min: 0 },
        imageURL: { type: String },
        rating: { type: Number, min: 0, max: 5 },
        type: { type: String,
                uppercase: true,
                enum: ['FAMILY', 'KIDS','ADVENTURE']
        },
        openTime : {
            type: String,
            validate: {
                validator: function(v) {
                    return /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                },
                message: '{VALUE} is not a valid 24 hs format time HH:MM'
            }
        },
        closeTime : {
            type: String,
            validate: {
                validator: function(v) {
                    return /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                },
                message: '{VALUE} is not a valid 24 hs format time HH:MM'
            }
        },
        location: {
            lng: Number,
            lat: Number
        },
        cities : [{type: Schema.Types.ObjectId, ref: "city"}]
    },
    {
        versionKey: false
    }
);


//Exports the AttractionSchema for use elsewhere.
module.exports = mongoose.model('attraction', AttractionSchema);