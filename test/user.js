process.env.NODE_ENV = 'test';
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../bin/www');
var should = chai.should();

chai.use(chaiHttp);

describe('USER',function(){

    describe('/GET user',function(){

        it('It should return Jorge Usuario',function(done){

            chai.request(server)
                .get('/user')
                .end(function(err,res){
                    res.should.have.status(200);
                    res.body.should.have.property('name').equal('Jorge Usuario');
                    res.body.should.have.property('age').equal('35');
                    res.body.should.have.property('mail').equal('jorge.usuario@mail.com');
                    done();
                });
        });
    });
});
