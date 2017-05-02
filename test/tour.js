/**
 * Created by root on 02/05/17.
 */
process.env.NODE_ENV = 'test';
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../bin/www');
var should = chai.should();

var mongoose = require("mongoose");
var City = require('../model/city');

chai.use(chaiHttp);

describe('TOUR',function(){

    this.timeout(0);

    beforeEach(function(done){ //Before each test we empty the database
        City.remove({}, function(err){
            if (err) {
                done(new Error(err));
            }else{
                done();
            }
        });
    });

    it('it should PUT tour field filled with attractions in a specific order',function(done){

        var city = new City({
            name:"Buenos Aires",
            description: {es:"capital del imperio criollo", en:"Capital of Roman Empire"},
            imagesURL: ["wwww.example.com"],
            location: {
                lng:55.5,
                lat:42.3
            }
        });


        city.save(function(err, city) {

            if (err) {
                done(new Error(err));
            }

            var firstAttraction = {
                name: "Cabildo",
                description: "Buenos Aires icon monument",
                imagesURL: ["http://imageserver.com/test.png"],
                price: 0,
                type: 'FAMILY',
                audioURL: 'www.audio.com',
                openTime: '00:00',
                closeTime: '00:00',
                cities: [city.id],
                location: {
                    lng:55.5,
                    lat:42.3
                }
            };

            chai.request(server)
                .post('/attraction')
                .send(firstAttraction)
                .end(function (err, firstAttractionResponse) {

                    if (err) {
                        done(new Error(err));
                    }

                    var secondAttraction = {
                        name: "Catedral",
                        description: "Buenos Aires catedral",
                        imagesURL: ["http://imageserver.com/test.png"],
                        price: 0,
                        type: 'FAMILY',
                        audioURL: 'www.audio.com',
                        openTime: '00:00',
                        closeTime: '00:00',
                        cities: [city.id],
                        location: {
                            lng:55.5,
                            lat:42.3
                        }
                    };

                    chai.request(server)
                        .post('/attraction')
                        .send(secondAttraction)
                        .end(function (err, secondAttractionResponse) {

                            if (err) {
                                done(new Error(err));
                            }

                            var thirdAttraction = {
                                name: "Casa Rosada",
                                description: "casa de gobierno nacional",
                                imagesURL: ["http://imageserver.com/test.png"],
                                price: 0,
                                type: 'FAMILY',
                                audioURL: 'www.audio.com',
                                openTime: '00:00',
                                closeTime: '00:00',
                                cities: [city.id],
                                location: {
                                    lng:55.5,
                                    lat:42.3
                                }
                            };

                            chai.request(server)
                                .post('/attraction')
                                .send(thirdAttraction)
                                .end(function (err, thirdAttractionResponse) {

                                    if (err) {
                                        done(new Error(err));
                                    }

                                    city.tours = [
                                        {
                                            name: "Buenos Aires Colonial",
                                            description: {
                                                es: "Ver a Buenos aires desde la época de las colonias ",
                                                en: "See Buenos Aires city from colonial time",
                                                pt: "Guardar Buenos Aires a colonial tempo"
                                            },
                                            attractions: [
                                                firstAttractionResponse.body.attraction._id,
                                                secondAttractionResponse.body.attraction._id,
                                                thirdAttractionResponse.body.attraction._id
                                            ]
                                        }
                                    ];

                                    chai.request(server)
                                        .put('/city/' + city.id)
                                        .send(city)
                                        .end(function(err, res) {

                                            res.should.have.status(200);
                                            res.body.should.be.a('object');
                                            res.body.should.have.property('message').eql('City updated!');
                                            res.body.city.tours.should.be.a('array');
                                            res.body.city.tours.length.should.be.eql(1);
                                            res.body.city.tours[0].attractions.should.be.a('array');
                                            res.body.city.tours[0].attractions.length.should.be.eql(3);

                                            res.body.city.tours[0].attractions.forEach(function(attractionId,index){

                                                var currentAttractionId = '';

                                                if (index == 0){
                                                    currentAttractionId = firstAttractionResponse.body.attraction._id;
                                                }

                                                if (index == 1){
                                                    currentAttractionId = secondAttractionResponse.body.attraction._id;
                                                }

                                                if (index == 2){
                                                    currentAttractionId = thirdAttractionResponse.body.attraction._id;
                                                }

                                                attractionId.should.be.eql(currentAttractionId);

                                            });

                                            done();
                                        });
                                });
                        });
                });
        });
    });

});