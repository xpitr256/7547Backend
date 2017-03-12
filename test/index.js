/**
 * Created by root on 12/03/17.
 */

process.env.NODE_ENV = 'test';
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../bin/www');
var should = chai.should();

chai.use(chaiHttp);

describe('WELCOME',function(){

    describe('/GET index screen',function(){

        it('It should return a welcome web page',function(done){

            chai.request(server)
                .get('/')
                .end(function(err,res){
                    res.should.have.status(200);
                    res.should.have.property('type').equal('text/html');
                    done();
                });
        });
    });
});
