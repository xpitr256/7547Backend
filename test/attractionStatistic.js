/**
 * Created by root on 18/05/17.
 */

process.env.NODE_ENV = 'test';
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../bin/www');
var should = chai.should();

var mongoose = require("mongoose");
var Attraction = require('../model/attraction');
var AttractionStatistic = require('../model/attractionStatistic');

chai.use(chaiHttp);

describe('ATTRACTION STATISTIC',function() {

    this.timeout(0);

    beforeEach(function(done){ //Before each test we empty the database
        AttractionStatistic.remove({}, function(err){
            done();
        });
    });


    /*
     * Test the /POST route
     */
    describe('/POST attractionStatistic', function() {

        it('it should not POST an attractionStatistic without androidId', function (done) {

            var incompleteAttractionStatistic = {
                userId: 'userId',
                socialNetwork: 'FACEBOOK',
                attraction: '11cedbd1e1ba1111110b1c11'
            };

            chai.request(server)
                .post('/attractionStatistic')
                .send(incompleteAttractionStatistic)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('androidId');
                    res.body.errors.androidId.should.have.property('kind').eql('required');
                    done();
                });
        });

        it('it should not POST an attractionStatistic without attraction', function (done) {

            var incompleteAttractionStatistic = {
                androidId: 'androidID',
                userId: 'userId',
                socialNetwork: 'FACEBOOK'
            };

            chai.request(server)
                .post('/attractionStatistic')
                .send(incompleteAttractionStatistic)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('attraction');
                    res.body.errors.attraction.should.have.property('kind').eql('required');
                    done();
                });
        });

        it('it should not POST an attractionStatistic with invalid socialNetwork (not FACEBOOK or TWITTER)', function (done) {

            var incompleteAttractionStatistic = {
                androidId: 'androidID',
                userId: 'userId',
                socialNetwork: 'INSTAGRAM',
                attraction: '11cedbd1e1ba1111110b1c11'
            };

            chai.request(server)
                .post('/attractionStatistic')
                .send(incompleteAttractionStatistic)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('socialNetwork');
                    res.body.errors.socialNetwork.should.have.property('kind').eql('invalid');
                    done();
                });
        });


        it('it should POST an attractionStatistic', function (done) {

            var completeAttractionStatistic = {
                androidId: 'androidID',
                userId: 'userId',
                socialNetwork: 'FACEBOOK',
                attraction: '11cedbd1e1ba1111110b1c11'
            };

            chai.request(server)
                .post('/attractionStatistic')
                .send(completeAttractionStatistic)
                .end(function (err, res) {

                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('AttractionStatistic successfully added!');
                    res.body.attractionStatistic.should.have.property('androidId');
                    res.body.attractionStatistic.should.have.property('attraction');
                    res.body.attractionStatistic.should.have.property('userId');
                    res.body.attractionStatistic.should.have.property('socialNetwork');
                    res.body.attractionStatistic.should.have.property('date');
                    done();
                });
        });
    });
});