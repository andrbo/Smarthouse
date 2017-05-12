var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
var should = chai.should;
var assert = chai.assert;
chai.use(chaiHttp);
var server = require("../app");
var units = require('../models/units.js');

describe('units', function () {

    beforeEach(function (done) {
        units.addUnit('description', "stue2", function (err, res) {
            done();
        });
    });

    afterEach(function (done) {
        units.getId("description", function (err, res) {
            units.deleteDevice(res[0].id, function (err, res) {
                done();
            });
        })
    });


    it('should get all units', function (done) {
        units.getUnits(function (err, res) {
            for (var i = 0; i < res.length; i++) {
                res[i].should.have.property('id');
                res[i].should.have.property('description');
                res[i].should.have.property('state');
                res[i].should.have.property('controller');
                res[i].should.have.property('groupid');
                res[i].should.have.property('luxstate');
                res[i].should.have.property('luxvalue');
            }
            done();

        });
    });

    /*it('should update a specified unit', function (done) {
        var id = 0;
        units.getId("description", function (err, res) {
            id = res[0].id;
            units.changeDevice(res[0].id, "descUpdate", "Stue", 1, 100, function (err, res) {
                units.getUnit(id, function (err, res) {
                    res[0].description.should.equal("descUpdate");
                    res[0].groupid.should.equal("Stue");
                    res[0].luxstate.should.equal(1);
                    res[0].luxvalue.should.equal(100);
                    done();
                });
            });
        })
    });*/

    it('should remove group from unit', function (done) {
        var id = 0;
        units.getId("description", function (err, res) {
            id = res[0].id;
            units.removeGroupFromUnit(id, function (err, res) {
                units.getUnit(id, function (err, res) {
                    expect(res[0].groupid).to.be.null;
                    done();
                });
            });
        })
    });

    it('should toggle unit', function (done) {
        var id = 0;
        units.getId("description", function (err, res) {
            id = res[0].id;
            units.toggleUnit(1, id, function (err, res) {
                units.getUnit(id, function (err, res) {
                    res[0].state.should.equal(1);
                    done();
                });
            });
        })
    });

    it('should get all units of a group', function (done) {
        units.getUnitsOfGroup("stue2",function(err, res){
            for(var i = 0; i < res.length; i++){
                res[i].groupid.should.equal("stue2");
            }
            done();
        })
    });

    it('should toggle units of a group', function (done) {
        units.toggleGroup("stue2", 1, function(err, res){
            units.listGroup(function (err, res) {
                for(var i = 0; i < res.length; i++){
                    if(res[i].groupname == "stue2"){
                        res[i].groupstate.should.equal(1);
                    }
                }
                done();
            })
        })
    });
});