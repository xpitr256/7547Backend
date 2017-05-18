/**
 * Created by root on 18/05/17.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = require('q').Promise;

var AttractionStatisticSchema = new Schema(
    {
        androidId : {type: String, required: true},
        userId : {type: String},
        socialNetwork: { type: String,
            uppercase: true,
            enum: ['FACEBOOK','TWITTER']
        },
        date: { type: Date, default: Date.now },
        attraction : {type: Schema.Types.ObjectId, ref: "attraction",required: true}
    },
    {
        versionKey: false
    }
);


//Exports the AttractionStatisticSchema for use elsewhere.
module.exports = mongoose.model('attractionStatistic', AttractionStatisticSchema);