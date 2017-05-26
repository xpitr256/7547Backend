/**
 * Created by pablom on 19/05/17.
 */

process.env.NODE_ENV = 'test';
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../bin/www');
var should = chai.should();
var Q = require('q');
var mongoose = require("mongoose");
var AppVisitStatistic = require('../model/appVisitStatistic');

chai.use(chaiHttp);

function getYesterdaysDate() {
    var date = new Date();
    date.setDate(date.getDate()-1);
    var month = (date.getMonth()+1);
    var day = date.getDate();
    return date.getFullYear() + '/'+ (month < 10 ? '0' : '') + month + '/' + (day < 10 ? '0' : '') + day;
}

function getTomorrowsDate() {
    var date = new Date();
    date.setDate(date.getDate()+1);
    var month = (date.getMonth()+1);
    var day = date.getDate();
    return date.getFullYear() + '/'+ (month < 10 ? '0' : '') + month + '/' + (day < 10 ? '0' : '') + day;
}

describe('APPLICATION VISIT STATISTIC',function() {

    this.timeout(0);

    beforeEach(function(done){ //Before each test we empty the database
        AppVisitStatistic.remove({}, function(err){
            done();
        });
    });

    describe('/GET appVisitStatistic', function() {

        it('it should GET 1 global user for 2 appVisitStatistic of the same day for the same user', function (done) {

            var completeStatistic1 = new AppVisitStatistic({
                androidId: 'androidID',
                date: new Date()
            });

            var completeStatistic2 = new AppVisitStatistic({
                androidId: 'androidID',
                userId: 'userId',
                socialNetwork: 'FACEBOOK',
                date: new Date()
            });

            chai.request(server)
                .post('/appVisitStatistic')
                .send(completeStatistic1)
                .end(function (err, res) {

                    if (err) {
                        done(new Error(err));
                    }

                    chai.request(server)
                        .post('/appVisitStatistic')
                        .send(completeStatistic2)
                        .end(function (err, res) {

                            if (err) {
                                done(new Error(err));
                            }

                            chai.request(server)
                                .get('/appVisitStatistic?fromDate='+getYesterdaysDate()+'&toDate='+getTomorrowsDate())
                                .end(function(err, res) {

                                    res.should.have.status(200);
                                    res.body.should.be.a('array');
                                    res.body.length.should.be.eql(1);
                                    res.body[0].should.have.property('Month');
                                    res.body[0].should.have.property('visits');
                                    res.body[0].visits.should.be.eql(1);
                                    done();
                                });
                        });
                });
        });
    });

    /*
     * Test the /POST route
     */
    describe('/POST appVisitStatistic', function() {

        it('it should not POST an appVisitStatistic without androidId', function (done) {

            var incompleteStatistic = {
                userId: 'userId',
                socialNetwork: 'FACEBOOK'
            };

            chai.request(server)
                .post('/appVisitStatistic')
                .send(incompleteStatistic)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('androidId');
                    res.body.errors.androidId.should.have.property('kind').eql('required');
                    done();
                });
        });


        it('it should not POST an appVisitStatistic with invalid socialNetwork (not FACEBOOK or TWITTER)', function (done) {

            var invalidStatistic = {
                androidId: 'androidID',
                userId: 'userId',
                socialNetwork: 'INSTAGRAM'
            };

            chai.request(server)
                .post('/appVisitStatistic')
                .send(invalidStatistic)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('socialNetwork');
                    res.body.errors.socialNetwork.should.have.property('kind').eql('invalid');
                    done();
                });
        });


        it('it should POST an appVisitStatistic', function (done) {

            var completeStatistic = {
                androidId: 'androidID',
                userId: 'userId',
                socialNetwork: 'FACEBOOK',
                country: 'AR'
            };

            chai.request(server)
                .post('/appVisitStatistic')
                .send(completeStatistic)
                .end(function (err, res) {

                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('AppVisitStatistic successfully added!');
                    res.body.appVisitStatistic.should.have.property('androidId');
                    res.body.appVisitStatistic.should.have.property('userId');
                    res.body.appVisitStatistic.should.have.property('country');
                    res.body.appVisitStatistic.should.have.property('socialNetwork');
                    res.body.appVisitStatistic.should.have.property('date');
                    done();
                });
        });
    });
});