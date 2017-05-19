/**
 * Created by pablom on 19/05/17.
 */


var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = require('q').Promise;

var AppVisitStatisticSchema = new Schema(
    {
        androidId : {type: String, required: true},
        userId : {type: String},
        socialNetwork: { type: String,
            uppercase: true,
            enum: ['FACEBOOK','TWITTER']
        },
        date: { type: Date, default: Date.now }
    },
    {
        versionKey: false
    }
);


//Exports the AppVisitStatisticSchema for use elsewhere.
module.exports = mongoose.model('appVisitStatisticSchema', AppVisitStatisticSchema);