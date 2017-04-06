/**
 * Created by root on 06/04/17.
 */
process.env.NODE_ENV = 'test';
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../bin/www');
var should = chai.should();

chai.use(chaiHttp);

describe('404 Error',function(){

    describe('/GET invalid route',function(){

        it('It should return a 404 error web page',function(done){

            chai.request(server)
                .get('/invalid')
                .end(function(err,res){
                    res.should.have.status(404);
                    done();
                });
        });
    });
});