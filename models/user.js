/**
 * Created by Mikael on 15.02.2017.
 */
var bcrypt = require('bcryptjs');
var db = require('../db');

/*exports.createUser = function (username, password, email, name) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, function (err, hash) {
            password=hash;
            var values = [username, password, email, name];
            db.query('INSERT INTO users (username, password, email, name) VALUES (?, ?, ?, ?)', values, function (err, results) {
                if(err) return done (err);
            });
        })
    })
};*/

exports.createUser = function (password, email, firstname, surname) {
    var values = [password, email, firstname, surname];
    if(exists(email)){
        console.log("Mail finnes fra før.");
    }
    db.query('INSERT INTO users (password, email, firstname, surname) VALUES (?, ?, ?, ?)', values, function (err, results) {
        if(err) return done (err);
    });
};


exports.getUser = function(email, password) {
    values = [email, password];
    db.query('SELECT * FROM users WHERE email = ? AND password = ?', values, function (err, rows) {
        if (err) return done(err);
        console.log(rows);
    })
}

exports.getPassword = function(password){
    var values =[password];
    db.query('SELECT email FROM users WHERE email = ? ', values, function(err, results){
        if(err) return done(err);
    });
}


//TODO: opprett en exist-funksjon.
/*var exists = function(email){
    db.query('SELECT * FROM users WHERE email = ?', email, function (err, rows) {
        if (err) return done(err);
        console.log(rows);
    })
}*/
