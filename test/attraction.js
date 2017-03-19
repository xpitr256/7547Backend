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

chai.use(chaiHttp);