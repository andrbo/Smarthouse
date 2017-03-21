/**
 * Created by Mikael on 15.02.2017.
 */
var bcrypt = require('bcryptjs');
var db = require('../db');


exports.createUser = function (password, email, firstname, surname) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, function (err, hash) {
            password = hash;
            var values = [password, email, firstname, surname];
            db.query('INSERT INTO users (username, password, email, name) VALUES (?, ?, ?, ?)', values, function (err, results) {
                if (err) throw err
                return results;
            });
        })
    })
};
/*
 exports.createUser = function (password, email, firstname, surname, session_id) {
 var values = [password, email, firstname, surname, session_id];

 db.query('INSERT INTO users (password, email, firstname, surname, session_id) VALUES (?, ?, ?, ?, "")', values, function (err, results) {
 if (err) return done(err);
 });
 };
 */

exports.getUser = function (email, password, callback) {
    var values = [email, password];
    var sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(sql, values, function (err, results) {
        if (callback) {
            callback(err, results);
        }
        ;
    });
};


exports.getEmail = function (userId) {
    var values = [userId];
    db.query('SELECT email FROM users WHERE userId = ? ', values, function (err, results) {
        if (err) return done(err);
    });
};


exports.getPassword = function (userId) {
    var values = [userId];
    db.query('SELECT password FROM users WHERE userId = ? ', values, function (err, results) {
        if (err) return done(err);
    });
};

exports.setSessionId = function (newSessionId, userId) {
    db.query('UPDATE users SET session_id = ? WHERE id = ?', newSessionId, userId, function (err, results) {
        if (err) return done(err);
    });
};

//TODO: opprett en exist-funksjon.