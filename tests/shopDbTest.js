var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
var should = chai.should;
var assert = chai.assert;
chai.use(chaiHttp);
var server = require("../app");
var shop = require('../models/shop.js');

describe('shopping list', function () {

    beforeEach(function (done) {
        shop.addProduct('description', function (err, res) {
            done();
        });
    });

    afterEach(function (done) {
        shop.getId("description", function (err, res) {
            shop.removeProduct(res[0].id, function (err, res) {
                done();
            });
        })
    });


    it('should get shopping list', function (done) {
        shop.getShoppingList(function (err, res) {
            for (var i = 0; i < res.length; i++) {
                res[i].should.have.property('id');
                res[i].should.have.property('product');
            }
            done();

        });
    });
});