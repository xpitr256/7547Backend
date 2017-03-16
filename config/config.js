/**
 * Created by pablom on 16/03/17.
 */

var config = {
    MONGODB_URI : process.env.MONGODB_URI ? process.env.MONGODB_URI : "mongodb://localhost/test"
};

module.exports = config;