/**
 * Created by pablom on 01/04/17.
 */

process.env.NODE_ENV = 'test';
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../bin/www');
var should = chai.should();

var mongoose = require("mongoose");
var Attraction = require('../model/attraction');
var City = require('../model/city');

chai.use(chaiHttp);

var ratingCalculator = require('../background/attractionRatingCalculator.js');



describe('ATTRACTION RATING CALCULATION',function() {

    this.timeout(0);


    beforeEach(function (done) { //Before each test we empty the database
        Attraction.remove({}, function (err) {
            done();
        });
    });

    var attraction = {
        name: "Obelisco",
        description: "Buenos Aires icon monument",
        imagesURL: ["http://imageserver.com/test.png"],
        price: 0,
        type: 'FAMILY',
        audioURL: 'www.audio.com',
        openTime: '00:00',
        closeTime: '00:00',
        location: {
            lng:55.5,
            lat:42.3
        }
    };

    it('it should UPDATE (PUT) and attraction with calculated rating',function(done){

        var firstReview = {
            userName : 'First User Name Review',
            userId: '11cedbd1e1ba1111110b1c11',
            userAvatarUrl: 'www.avatar.com',
            comments: 'It is a fantastic attraction',
            rating: 4
        };

        var secondReview ={
            userName : 'Second User Name Review',
            userId: '11cedbd1e1ba1111110b1c12',
            userAvatarUrl: 'www.avatar.com',
            comments: 'It is a regular attraction',
            rating: 2
        };

        attraction.reviews = [firstReview,secondReview];

        var city = new City({
            name: "Buenos Aires",
            description: "La Paris de SudAmerica",
            imagesURL: ["wwww.example.com"],
            location: {
                lng:55.5,
                lat:42.3
            }
        });

        var attractionId;

        city.save(function(err, city) {

            if (err) {
                done(new Error(err));
            }

            attraction.cities = [city.id];

            chai.request(server)
                .post('/attraction')
                .send(attraction)
                .end(function (err, res) {

                    if(err){
                        done(new Error(err));
                    }

                    attractionId = res.body.attraction._id;

                    ratingCalculator.updateAttractionRatings()
                        .then(function(){

                            Attraction.findById(attractionId, function(err, updatedAttraction) {

                                if (err){
                                    done(new Error(err));
                                }

                                updatedAttraction.should.have.property('rating').eql(3);

                                done();
                            });
                        });
                });
        });
    });

});