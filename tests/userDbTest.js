var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
var should = chai.should();
chai.use(chaiHttp);
var server = require("../app");
var User = require('../models/User.js');

describe('users', function () {

    beforeEach(function(done){
        User.createUser("test@hotmail.com", "password", "test", "tester", "testTown", "1234", "testCity", "testCountry", function (err, res) {
            done();
        });
    });

    afterEach(function(done){
        User.deleteUser("test@hotmail.com", function(err, res){
            done();
        });
    });



    /*it('should list firstname of all users except email parameter on /getAllUsers GET', function (done) {
        chai.request(server).get('/getAllUsers').send({email:"kus@hotmail.com"}).end(function (err, res) {
            res.should.have.status(200);
            res.should.be.json;
            res.body[0].should.have.property('firstname');
            done();
        });
    });*/

    it('should set new password using forgot password', function (done) {
        User.forgotPassword("newPassword","test@hotmail.com", function (err, res) {
            User.getUser("test@hotmail.com", function(err, res){
                res[0].password.should.equal("newPassword");
                done();
            });
        });
    });

    it('should list everything of specific user on email', function (done) {
        User.getUser("test@hotmail.com", function (err, res) {
            res[0].should.have.property('email');
            res[0].should.have.property('password');
            res[0].should.have.property('firstname');
            res[0].should.have.property('surname');
            res[0].should.have.property('address');
            res[0].should.have.property('postalCode');
            res[0].should.have.property('city');
            res[0].should.have.property('country');
            done();
        });
    });

    it('should list all emails in users', function (done) {
        User.getAllEmails(function (err, res) {
            for(var i = 0; i < res.length; i++){
                res[i].should.have.property('email');
            }
            done();
        });
    });

    it('should list firstname of all users except for email input', function (done) {
        User.getAllUsers("test@hotmail.com", function (err, res) {
            for(var i = 0; i < res.length; i++){
                res[i].should.have.property('firstname');
            }
            done();
        });
    });

    it('should return password of a specific user', function (done) {
        User.getPassword("test@hotmail.com", function (err, res) {
            res[0].password.should.equal("password");
            done();
        });
    });
});