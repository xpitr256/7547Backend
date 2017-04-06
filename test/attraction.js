/**
 * Created by root on 19/03/17.
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



describe('ATTRACTION',function() {

    this.timeout(0);


    beforeEach(function(done){ //Before each test we empty the database
        Attraction.remove({}, function(err){
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

    /*
     * Test the /POST route
     */
    describe('/POST attraction', function() {

        it('it should not POST an attraction without cities', function (done) {

            chai.request(server)
                .post('/attraction')
                .send(attraction)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('cities');
                    res.body.errors.cities.should.have.property('kind').eql('required');
                    done();
                });
        });

        it('it should not POST an attraction if cities is not an array', function (done) {

            attraction.cities = 'just_a_string_no_array';
            chai.request(server)
                .post('/attraction')
                .send(attraction)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('cities');
                    res.body.errors.cities.should.have.property('kind').eql('must be an array');
                    done();
                });
        });


        it('it should not POST an attraction with invalid cities', function (done) {

            //non-existing city id
            var invalidCityId = '11cedbd1e1ba1111110b1c11';
            attraction.cities = [invalidCityId];

            chai.request(server)
                .post('/attraction')
                .send(attraction)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('cities');
                    res.body.errors.cities.should.have.property('kind').eql('invalid city id: '+invalidCityId);
                    done();
                });
        });

        it('it should POST an attraction for a valid cities', function (done) {

            var city = new City({
                name: "Buenos Aires",
                description: "La Paris de SudAmerica",
                imagesURL: ["wwww.example.com"],
                location: {
                    lng:55.5,
                    lat:42.3
                }
            });


            city.save(function(err, city) {

                if (err){
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

                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('message').eql('Attraction successfully added!');
                        res.body.attraction.should.have.property('name');
                        res.body.attraction.should.have.property('description');
                        res.body.attraction.should.have.property('imagesURL');
                        res.body.attraction.should.have.property('location');
                        res.body.attraction.should.have.property('audioURL');
                        res.body.attraction.should.have.property('price').eql(0);

                        City.findById(city.id, function(err, savedCity) {
                            if (err){
                                done(new Error(err));
                            }
                            savedCity.attractions.should.have.length.to.be.above(0);
                            done();
                        });

                    });

            });




        });

        it('it should POST and attraction with Reviews',function(done){
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


            chai.request(server)
                .post('/attraction')
                .send(attraction)
                .end(function (err, res) {

                    if(err){
                        done(new Error(err));
                    }

                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Attraction successfully added!');
                    res.body.attraction.should.have.property('name');
                    res.body.attraction.should.have.property('description');
                    res.body.attraction.should.have.property('imagesURL');
                    res.body.attraction.should.have.property('location');
                    res.body.attraction.should.have.property('audioURL');
                    res.body.attraction.should.have.property('price').eql(0);
                    res.body.attraction.reviews.should.be.a('array');
                    res.body.attraction.reviews.length.should.be.eql(2);

                    done();

                });

        });

    });

    describe('/GET attraction', function() {
        it('it should GET all the attractions', function(done){
            chai.request(server)
                .get('/attraction')
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(0);
                    done();
                });
        });
    });

    describe('/DELETE/:id attraction',function () {

        var attractionId;

        var city = new City({
            name: "Buenos Aires",
            description: "La Parîs de SudAmêrica",
            imagesURL: ["wwww.example.com"],
            location: {
                lng: 55.5,
                lat: 42.3
            }
        });

        before(function(done) {

            city.save(function (err, city) {
                if (err){
                    done(new Error(err));
                }
                attraction.cities = [city.id];
                chai.request(server)
                    .post('/attraction')
                    .send(attraction)
                    .end(function (err, res) {
                        if (err) {
                            done(new Error(err));
                        }
                        attractionId = res.body.attraction._id;
                        done();
                    });
            });
        });

        it('it should DELETE an attraction given the id',function (done){

            chai.request(server)
                .delete('/attraction/' + attractionId)
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Attraction successfully deleted!');

                    City.findById(city.id, function(err, savedCity) {

                        if (err){
                            done(new Error(err));
                        }
                        savedCity.attractions.length.should.be.eql(0);

                        done();
                    });

                });


        });
    });


    /*
     * Test the /PUT/:id route
     */
    describe('/PUT/:id attraction', function() {


        var attractionId;
        var otherCityId;

        var city = new City({
            name: "Buenos Aires",
            description: "La Parîs de SudAmêrica",
            imagesURL: ["wwww.example.com"],
            location: {
                lng: 55.5,
                lat: 42.3
            }
        });

        var otherCity = new City({
            name: "La Plata",
            description: "La capital de la provincia de Buenos Aires",
            imagesURL: ["wwww.example.com"],
            location: {
                lng: 53.5,
                lat: 42.4
            }
        });

        beforeEach(function(done) {

            city.save(function (err, city) {
                if (err){
                    done(new Error(err));
                }
                attraction.cities = [city.id];
                chai.request(server)
                    .post('/attraction')
                    .send(attraction)
                    .end(function (err, res) {
                        if (err) {
                            done(new Error(err));
                        }
                        attractionId = res.body.attraction._id;

                        otherCity.save(function(err,otherCity){
                            if (err) {
                                done(new Error(err));
                            }

                            otherCityId = otherCity.id;
                            done();
                        });

                    });
            });
        });


        it('it should UPDATE an attraction given the id', function(done) {

                attraction.name = "Super Obelisco";
                attraction.cities = [otherCityId];

                chai.request(server)
                    .put('/attraction/' + attractionId)
                    .send(attraction)
                    .end(function(err, res) {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('message').eql('Attraction updated!');
                        res.body.attraction.should.have.property('name').eql("Super Obelisco");
                        res.body.attraction.should.have.property('audioURL');
                        res.body.attraction.cities.should.be.a('array');
                        res.body.attraction.cities.length.should.be.eql(1);
                        res.body.attraction.cities[0].should.be.eql(otherCityId);
                        done();
                    });

        });
    });

});
