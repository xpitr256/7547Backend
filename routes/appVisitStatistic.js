/**
 * Created by pablom on 19/05/17.
 */

var AppVisitStatistic = require('../model/appVisitStatistic');
var invalidSocialNetwork = require('./utils/socialNetwork.js').invalidSocialNetwork;

/*
 * POST /appVisitStatistic to save a new appVisitStatistic.
 */
function postAppVisitStatistic(req, res) {

    if (req.body.androidId === undefined){

        return res.send({
            errors:{
                androidId:{
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


        //Creates a new appVisitStatistic
        var newAppVisitStatistic = new AppVisitStatistic(req.body);

        //Save it into the DB.
        newAppVisitStatistic.save(function(err,appVisitStatistic) {
            if(err) {
                return res.send(err);
            }else {
                res.json({message: "AppVisitStatistic successfully added!", appVisitStatistic:appVisitStatistic});
            }
        });
    }
}

//export all the functions
module.exports = {
    postAppVisitStatistic: postAppVisitStatistic
};