/**
 * Created by Mikael on 15.02.2017.
 */
var bcrypt = require('bcryptjs');
var db = require('../db');

exports.createUser = function (username, password, email, name) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, function (err, hash) {
            password=hash;
            var values = [username, password, email, name];
            db.query('INSERT INTO users (username, password, email, name) VALUES (?, ?, ?, ?)', values, function (err, results) {
                if(err) throw err;
            });
        })
    })
};
