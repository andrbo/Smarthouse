var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
var should = chai.should;
var assert = chai.assert;
chai.use(chaiHttp);
var server = require("../app");
var calendar = require('../models/calendar.js');

describe('shopping list', function () {

    beforeEach(function (done) {
        calendar.addEvent("mail@mail.com", "title", "description", "start", "end", "participant", function (err, res) {
            done();
        });
    });

    afterEach(function (done) {
        calendar.getId("mail@mail.com", function (err, res) {
            calendar.deleteEvent(res[0].id, function (err, res) {
                done();
            });
        })
    });


    it('should get all events by user', function (done) {
        calendar.getUserEvents("mail@mail.com", function(err, res){
            res[0].title.should.equal('title');
            done();
        })
    });

    it('should update a specific event', function (done) {
        calendar.getId("mail@mail.com", function (err, res) {
            calendar.updateEvent("titleUpdate", "descUpdate", "startUpdate", "endUpdate", "participantUpdate", res[0].id, function (err, res) {
                calendar.getUserEvents("mail@mail.com", function(err, res){
                    res[0].title.should.equal('titleUpdate');
                    res[0].description.should.equal('descUpdate');
                    res[0].start.should.equal('startUpdate');
                    res[0].end.should.equal('endUpdate');
                    res[0].participants.should.equal('participantUpdate');
                    done();
                });
            });
        })
    });

    it('should get all participants from event', function (done) {
        calendar.getId("mail@mail.com", function (err, res) {
            calendar.getParticipants(res[0].id,function(err, res){
                res[0].participants.should.equal('participant');
                done();
            })
        })
    });
});