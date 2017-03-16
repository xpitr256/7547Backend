process.env.NODE_ENV = 'test';
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../bin/www');
var should = chai.should();

var mongoose = require("mongoose");
var City = require('../model/city');

chai.use(chaiHttp);

describe('CITY',function(){

    this.timeout(0);

    beforeEach(function(done){ //Before each test we empty the database
        City.remove({}, function(err){
            done();
        });
    });

    describe('/GET city', function() {
        it('it should GET all the cities', function(done){
        chai.request(server)
            .get('/city')
            .end(function(err, res) {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.eql(0);
                done();
            });
        });
    });

    /*
     * Test the /POST route
     */
    describe('/POST city', function() {

        it('it should not POST a city without name field', function (done) {
            var city = {
                description: "The city description ",
                imageURL: "http://imageserver.com/test.png"
            };

            chai.request(server)
                .post('/city')
                .send(city)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('name');
                    res.body.errors.name.should.have.property('kind').eql('required');
                    done();
                });
        });

        it('it should POST a city ', function(done){
            var city = {
                name: "Buenos Aires",
                description: "La Parîs de SudAmêrica",
                imageURL: "wwww.example.com",
                location: {
                    lng:55.5,
                    lat:42.3
                }
            };
            chai.request(server)
            .post('/city')
            .send(city)
            .end(function(err, res) {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('City successfully added!');
                res.body.city.should.have.property('name');
                res.body.city.should.have.property('description');
                res.body.city.should.have.property('imageURL');
                res.body.city.should.have.property('location');
                done();
            });
        });
    });


    /*
     * Test the /GET/:id route
     */
    describe('/GET/:id city', function() {
        it('it should GET a city by the given id', function(done){

            var city = new City({
                name: "Buenos Aires",
                description: "La Parîs de SudAmêrica",
                imageURL: "wwww.example.com",
                location: {
                    lng:55.5,
                    lat:42.3
                }
            });

            city.save(function(err, city) {
                chai.request(server)
                .get('/city/' + city.id)
                .send(city)
                .end(function(err, res){
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('name');
                    res.body.should.have.property('description');
                    res.body.should.have.property('imageURL');
                    res.body.should.have.property('location');
                    res.body.should.have.property('_id').eql(city.id);
                    done();
                });
            });
        });
    });


    /*
     * Test the /PUT/:id route
     */
    describe('/PUT/:id city', function() {
        it('it should UPDATE a city given the id', function(done) {

            var city = new City({
                name: "Buenos Aires",
                description: "La Parîs de SudAmêrica",
                imageURL: "wwww.example.com",
                location: {
                    lng:55.5,
                    lat:42.3
                }
            });

            city.save(function(err, city){
                chai.request(server)
                .put('/city/' + city.id)
                .send({ name: "Ciudad Autônoma de Buenos Aires",
                        description: "La Parîs de SudAmêrica",
                        imageURL: "wwww.example.com",
                        location: {
                            lng:55.5,
                            lat:42.3
                        }})
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('City updated!');
                    res.body.city.should.have.property('name').eql("Ciudad Autônoma de Buenos Aires");
                    done();
                });
            });
        });
    });

    describe('/DELETE/:id city',function () {
        it('it should DELETE a city given the id',function (done){

            var city = new City({
                name: "Buenos Aires",
                description: "La Parîs de SudAmêrica",
                imageURL: "wwww.example.com",
                location: {
                    lng:55.5,
                    lat:42.3
                }
            });

            city.save(function(err, city){
                chai.request(server)
                .delete('/city/' + city.id)
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('City successfully deleted!');
                    res.body.result.should.have.property('ok').eql(1);
                    res.body.result.should.have.property('n').eql(1);
                    done();
                });
            });
        });
    });


});
