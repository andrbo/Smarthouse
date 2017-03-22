/**
 * Created by Mikael on 15.02.2017.
 */
var db = require('../db');


exports.createUser = function (password, email, firstname, surname, callback) {
    console.log("PASSORD: " + password);
    var values = [password, email, firstname, surname];
    db.query('INSERT INTO users (password, email, firstname, surname) VALUES (?, ?, ?, ?)', values, function (err, results) {
        if (callback){
            callback(err, results);
        }
    });

};

exports.getPassword = function(email, callback){
    var sql = 'SELECT password FROM users WHERE email = ?';
    db.query(sql, email, function(err, res){
        if(callback){
            callback(err, res);
        };
    })
};

exports.setSessionId = function (newSessionId, userId) {
    db.query('UPDATE users SET session_id = ? WHERE id = ?', newSessionId, userId, function (err, results) {
        if (err) return done(err);
    });
}

//TODO: opprett en exist-funksjon.