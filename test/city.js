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

        it('it should GET description field in english when accept-language header is send with "en" ',function(done){

            var city = new City({
                name:"Roma",
                description: {es:"capital del imperio romano", en:"Capital of Roman Empire"},
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

                chai.request(server)
                    .get('/city')
                     .set('accept-language', 'en-US,en;q=0.8,he;q=0.6,ru;q=0.4')
                    .end(function(err, res) {
                        res.should.have.status(200);
                        res.body.should.be.a('array');
                        res.body.length.should.be.eql(1);
                        res.body[0].description.should.be.eql('Capital of Roman Empire');
                        done();
                    });

            });


        });

        it('it should GET name field in all languages when NO accept-language header is send',function(done){

            var city = new City({
                name:"Roma",
                description: {es:"capital del imperio romano", en:"Capital of Roman Empire"},
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

                chai.request(server)
                    .get('/city')
                    .end(function(err, res) {
                        res.should.have.status(200);
                        res.body.should.be.a('array');
                        res.body.length.should.be.eql(1);
                        res.body[0].description.should.be.a('object');
                        done();
                    });

            });


        });


    });

    describe('/GET city?name=san', function() {
        it('it should GET all the cities started with San like San Bernardo and San Miguel del Monte', function(done){

            var sanBernardoCity = new City({
                name: "San Bernardo",
                description: "description",
                imagesURL: ["wwww.example.com"],
                location: {
                    lng:55.5,
                    lat:42.3
                }
            });

            var sanMiguelDelMonteCity = new City({
                name: "San Miguel del Monte",
                description: "description",
                imagesURL: ["wwww.example.com"],
                location: {
                    lng:55.5,
                    lat:42.3
                }
            });

            var buenosAiresCity = new City({
                name: "Buenos Aires",
                description: "description",
                imagesURL: ["wwww.example.com"],
                location: {
                    lng:55.5,
                    lat:42.3
                }
            });

            sanBernardoCity.save(function(err, sanBernardoCity) {
                sanMiguelDelMonteCity.save(function(err,sanMiguelDelMonteCity){
                    buenosAiresCity.save(function(err,buenosAiresCity){

                        chai.request(server)
                            .get('/city?name=san')
                            .end(function(err, res) {
                                res.should.have.status(200);
                                res.body.should.be.a('array');
                                res.body.length.should.be.eql(2);
                                done();
                            });

                    });
                });
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
                imagesURL: ["http://imageserver.com/test.png"]
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
                imagesURL: ["wwww.example.com"],
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
                res.body.city.imagesURL.should.be.a('array');
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
                imagesURL: ["wwww.example.com"],
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
                    res.body.should.have.property('imagesURL');
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
                description: {es:"La Londres de SudAmerica", en: "The Paris of south America"},
                imagesURL: ["wwww.example.com"],
                location: {
                    lng:55.5,
                    lat:42.3
                }
            });

            city.save(function(err, city){
                chai.request(server)
                .put('/city/' + city.id)
                .send({ name: "Buenos Aires",
                        description: {es:"La Paris de SudAmerica", en: "The Paris of south America"},
                        imagesURL: ["wwww.example.com"],
                        location: {
                            lng:55.5,
                            lat:42.3
                        }})
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('City updated!');
                    res.body.city.description.should.have.property('es').eql("La Paris de SudAmerica");
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
                imagesURL: ["wwww.example.com"],
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
