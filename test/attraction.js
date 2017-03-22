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
        imageURL: "http://imageserver.com/test.png",
        price: 0,
        type: 'FAMILY',
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

        beforeEach(function(done){ //Before each test we empty the database
            City.remove({}, function(err){
                Attraction.remove({},function (err){
                    done();
                });
            });
        });

        it('it should not POST an attraction without cityId', function (done) {

            chai.request(server)
                .post('/attraction')
                .send(attraction)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('cityId');
                    res.body.errors.cityId.should.have.property('kind').eql('required');
                    done();
                });
        });

        it('it should not POST an attraction if cityId is not an array', function (done) {

            attraction.cityId = 'just_a_string_no_array';
            chai.request(server)
                .post('/attraction')
                .send(attraction)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('cityId');
                    res.body.errors.cityId.should.have.property('kind').eql('must be an array');
                    done();
                });
        });


        it('it should not POST an attraction with invalid cityId', function (done) {

            //non-existing city id
            var invalidCityId = '11cedbd1e1ba1111110b1c11';
            attraction.cityId = [invalidCityId];

            chai.request(server)
                .post('/attraction')
                .send(attraction)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('cityId');
                    res.body.errors.cityId.should.have.property('kind').eql('invalid city id: '+invalidCityId);
                    done();
                });
        });

        it('it should POST an attraction for a valid cityId', function (done) {

            var city = new City({
                name: "Buenos Aires",
                description: "La Paris de SudAmerica",
                imageURL: "wwww.example.com",
                location: {
                    lng:55.5,
                    lat:42.3
                }
            });


            city.save(function(err, city) {

                if (err){
                    done(new Error(err));
                }

                attraction.cityId = [city.id];


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
                        res.body.attraction.should.have.property('imageURL');
                        res.body.attraction.should.have.property('location');
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

});
