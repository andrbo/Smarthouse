var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
var should = chai.should();
chai.use(chaiHttp);
var server = require("../app");
var User = require('../models/User.js');
var Calendar = require('../models/calendar.js');
var Shop = require('../models/shop.js');
var Units = require('../models/units.js');

describe('tests', function () {

    beforeEach(function (done) {
        User.createUser("test@hotmail.com", "password", "test", "tester", "testTown", "1234", "testCity", "testCountry", function (err, res) {
            Calendar.addEvent("test@hotmail.com", "title", "description", "2017-05-05 13:00", "2017-05-06 13:00", "participant", function (err, res) {
                Shop.addProduct("description", function (err, res) {
                    Units.addUnit("description", "test", function (err, res) {
                        done();
                    })
                })
            });
        });
    });

    afterEach(function (done) {
        var eventId = 0;
        var productId = 0;
        var unitId = 0;

        Calendar.getId("test@hotmail.com", function (err, res) {
            eventId = res[0].id;
            Shop.getId("description", function (err, res) {
                productId = res[0].id;
                Units.getId("description", function (err, res) {
                    unitId = res[0].id;
                    Calendar.deleteEvent(eventId, function (err, res) {
                        Shop.removeProduct(productId, function (err, res) {
                            Units.deleteDevice(unitId, function (err, res) {
                                User.deleteUser("test@hotmail.com", function (err, res) {
                                    done();
                                })
                            })
                        })
                    })
                })
            })
        });
    });

    it('should update a user', function (done) {
        chai.request(server).put('/users').send({
            emailTest: "test@hotmail.com",
            firstname: "firstnameUpdate",
            surname: "surnameUpdate",
            address: "addressUpdate",
            postalCode: "postalCodeUpdate",
            city: "cityUpdate",
            email: "test@hotmail.com"
        }).end(function (err, res) {
            res.should.have.status(200);
            User.getUser("test@hotmail.com", function (err, res) {
                res[0].firstname.should.equal("firstnameUpdate");
                done();
            });
        });
    });

    it('should get all events from a user', function (done) {
        chai.request(server).get("/getUserEvents").send({
            email: "test@hotmail.com"
        }).end(function (err, res) {
            res.should.have.status(200);
            res.body[0].should.have.property("id");
            res.body[0].should.have.property("email");
            res.body[0].should.have.property("title");
            res.body[0].should.have.property("description");
            res.body[0].should.have.property("start");
            res.body[0].should.have.property("end");
            res.body[0].should.have.property("participants");
            res.body[0].email.should.equal("test@hotmail.com");
            res.body[0].title.should.equal("title");
            done();
        })
    });

    it("should get all events", function (done) {
        chai.request(server).get("/events").end(function (err, res) {
            res.should.have.status(200);
            res.body[0].should.have.property("title");
            res.body[0].should.have.property("description");
            res.body[0].should.have.property("start");
            res.body[0].should.have.property("end");
            res.body[0].should.have.property("participants");
            done();
        })
    });

    it("should get all events from a user", function (done) {
        chai.request(server).get("/getUserEvents").send({
            email: "test@hotmail.com"
        }).end(function (err, res) {
            res.should.have.status(200);
            res.body[0].should.have.property("title");
            res.body[0].should.have.property("description");
            res.body[0].should.have.property("start");
            res.body[0].should.have.property("end");
            res.body[0].should.have.property("participants");
            done();
        })
    });

    
    it("should toggle the alarm", function(done){
        chai.request(server).post("/alarm").send({
            alarm: "true"
        }).end(function (err, res) {
            res.should.have.status(200);
            res.body.affectedRows.should.equal(1)
            done();
        })
    });

    it("should get the alarm state", function(done){
        chai.request(server).get("/alarm").end(function (err, res) {
            res.should.have.status(200);
            res.body[0].should.have.property("value");
            done();
        })
    });

    it("should add a new unit", function(done){
        chai.request(server).post("/units").send({
            description: "description",
            groupname: "group"
        }).end(function (err, res) {
            res.should.have.status(200);
            Units.getUnits(function (err, result) {
                result[0].should.have.property("description")
                done();
            })
        })
    });


    it("should update a unit", function (done) {
        Units.getId("description", function(err, res){
            console.log("ID: " + res[0].id);
            chai.request(server).put("/units/" + res[0].id).send({
                description: "description",
                groupid: "Stue",
                luxstate: 1,
                luxtresh: 300
            }).end(function (err, res) {
                res.should.have.status(200);
                res.body.affectedRows.should.equal(1)
                done();
            })
        })
    });

    it("should add a new group", function(done){
        chai.request(server).post("/groups").send({
            name: "newGroup"
        }).end(function (err, res) {
            res.should.have.status(200);
            Units.listGroup(function (err, result) {
                result[1].groupname.should.equal("newGroup")
                console.log(JSON.stringify(result));
                Units.deleteGroup("newGroup", function (err, res) {
                    done();
                })
            });
        })
    })
});