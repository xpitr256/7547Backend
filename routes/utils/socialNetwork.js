/**
 * Created by root on 19/05/17.
 */


module.exports = {

    invalidSocialNetwork: function (req){

        if (req.body.socialNetwork === undefined ){
            return false;
        }

        var socialNetworks = ['FACEBOOK','TWITTER'];

        var invalid = true;

        socialNetworks.forEach(function(socialNetwork){

            if (socialNetwork == req.body.socialNetwork.toUpperCase()){
                invalid = false;
            }

        });

        return invalid;
    }
};