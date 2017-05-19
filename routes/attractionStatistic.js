/**
 * Created by pablom on 18/05/17.
 */

var AttractionStatistic = require('../model/attractionStatistic');
var invalidSocialNetwork = require('./utils/socialNetwork.js').invalidSocialNetwork;

/*
 * POST /attractionStatistic to save a new attractionStatistic.
 */
function postAttractionStatistic(req, res) {

    if (req.body.androidId === undefined){

        return res.send({
            errors:{
                androidId:{
                    kind : 'required'
                }
            }
        });

    }else if(req.body.attraction == undefined){

        return res.send({
            errors:{
                attraction:{
                    kind : 'required'
                }
            }
        });

    }else if (invalidSocialNetwork(req)) {

        return res.send({
            errors:{
                socialNetwork:{
                    kind : 'invalid'
                }
            }
        });

    }else{


        //Creates a new attractionStatistic
        var newAttractionStatistic = new AttractionStatistic(req.body);

        //Save it into the DB.
        newAttractionStatistic.save(function(err,attractionStatistic) {
            if(err) {
                return res.send(err);
            }else {
                res.json({message: "AttractionStatistic successfully added!", attractionStatistic:attractionStatistic});
            }
        });
    }
}

//export all the functions
module.exports = {
    postAttractionStatistic: postAttractionStatistic
};