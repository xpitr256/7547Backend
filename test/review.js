/**
 * Created by pablom on 08/04/17.
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



describe('REVIEW',function() {

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

    var reviewExample = {
        userName : 'First User Name Review',
        userId: '11cedbd1e1ba1111110b1c11',
        userAvatarUrl: 'www.avatar.com',
        comments: 'It is a fantastic attraction',
        rating: 4
    };

    var city = new City({
        name: "Buenos Aires",
        description: "La Paris de SudAmerica",
        imagesURL: ["wwww.example.com"],
        location: {
            lng:55.5,
            lat:42.3
        }
    });

    describe('POST /review',function(){

        it('it should NOT POST a review without an attractionId',function(done){

            chai.request(server)
                .post('/review')
                .send({
                    review: reviewExample
                })
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('attractionId');
                    res.body.errors.attractionId.should.have.property('kind').eql('required');
                    done();
                });

        });

        it('it should NOT POST a review without a valid attractionId',function(done){

            //non-existing attractionId
            var invalidAttractionId = '11cedbd1e1ba1111110b1c11';

            chai.request(server)
                .post('/review')
                .send({
                    attractionId: invalidAttractionId,
                    review: reviewExample
                })
                .end(function (err, res) {

                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('attractionId');
                    res.body.errors.attractionId.should.have.property('kind').eql('invalid attraction id: '+invalidAttractionId);
                    done();
                });
        });


        it('it should add  a review to a valid attraction',function(done){

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

                        chai.request(server)
                            .post('/review')
                            .send({
                                attractionId: attractionId,
                                review: reviewExample
                            })
                            .end(function(err,res){

                                if(err){
                                    done(new Error(err));
                                }

                                res.should.have.status(200);
                                res.body.should.be.a('object');
                                res.body.should.have.property('message').eql('Review successfully added!');
                                res.body.attraction.reviews.should.be.a('array');
                                res.body.attraction.reviews.length.should.be.eql(1);

                                done();
                            });
                    });
            });
        });



    });
});