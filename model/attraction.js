/**
 * Created by root on 19/03/17.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = require('q').Promise;

var AttractionSchema = new Schema(
    {
        name: { type: String, required: true },
        description: Schema.Types.Mixed,
        price: { type: Number, min: 0, default: 0 },
        avgDurationInMinutes : { type: Number, min: 0 },
        imagesURL: [{ type: String }],
        audioURL: Schema.Types.Mixed,
        address: { type: String },
        rating: { type: Number, min: 0, max: 5 },
        type: { type: String,
                uppercase: true,
                enum: ['FAMILY', 'KIDS','ADVENTURE']
        },
        open24Hs: {type:Boolean, default: false},
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
        cities : [{type: Schema.Types.ObjectId, ref: "city"}],
        reviews:[
            {
                userName : {type: String},
                userId : {type: String},
                userAvatarUrl: {type: String},
                comments : {type: String},
                rating: {type: Number, min: 0 , max:5},
                approved : { type: Boolean, default: false},
                date: { type: Date, default: Date.now }
            }
        ],
        pointOfInterests: [{
            name: String,
            location: String,
            description: Schema.Types.Mixed,
            audioURL: Schema.Types.Mixed,
            imagesURL: [{ type: String }]
        }]
    },
    {
        versionKey: false
    }
);


//Exports the AttractionSchema for use elsewhere.
module.exports = mongoose.model('attraction', AttractionSchema);