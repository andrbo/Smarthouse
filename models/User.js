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
                if(err) return done (err);
            });
        })
    })
};



exports.getUser = function(username, password) {
    values = [username, password];
    db.query('SELECT * FROM users WHERE username = ? AND password = ?', values, function (err, rows) {
        if (err) return done(err);
        console.log(rows);
    })
}

exports.getPassword = function(password){
    var values =[password];
    db.query('SELECT username FROM users WHERE username = ? ', values, function(err, results){
        if(err) return done(err);
    });
}

