/**
 * Created by Mikael on 15.02.2017.
 */
var db = require('../middlewares/db');


exports.createUser = function (password, email, firstname, surname, address, postalCode, city, country, callback) {
    var values = [password, email, firstname, surname, address, postalCode, city, country];
    db.query('INSERT INTO users (password, email, firstname, surname, address, postalCode, city, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', values, function (err, results) {
        if (callback){
            callback(err, results);
        }
    });
};

exports.getUser = function(email, callback){
    var sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, email, function(err, res){
        if(callback){
            callback(err, res);
        }
    })
};

exports.getAllEmails = function (callback) {
    var sql = 'SELECT email FROM users';
    db.query(sql, function(err, res){
        if(callback){
            callback(err, res);
        }
    })
};

exports.getAllUsers = function(email, callback){
    var sql = 'SELECT firstname FROM users WHERE NOT email = ?';
    db.query(sql, email, function(err, res){
        if(callback){
            callback(err, res);
        }
    })
};

exports.forgotPassword=function(password, email, callback){
    var values = [password, email];
    var sql = 'UPDATE users SET password = ? WHERE email = ?';
    db.query(sql,values, function (err, res) {
        if(callback){
            callback(err, res);
        };
    })
};

exports.getPassword=function(email, callback){
    var sql = 'SELECT password FROM users WHERE email = ?';
    db.query(sql, email, function (err, res) {
        if(callback){
            callback(err, res);
        };
    })
};

exports.updatePassword=function(newPassword, email, callback){
    var values = [newPassword, email];
    var sql = 'UPDATE users SET password = ? WHERE email = ?';
    db.query(sql,values, function (err, res) {
        if(callback){
            callback(err, res);
        };
    })
};

exports.updateProfile = function (firstname, surname, address, postalCode, city, email, email2, currentMail, callback) {
    var values = [firstname, surname, address, postalCode, city, email, email2, currentMail];
    //var sql = 'UPDATE users SET firstname = ?, surname = ?, address = ?, postalCode = ?, city = ?, email = ? WHERE email = ?';

    var sql = 'UPDATE users JOIN events ON users.email = events.email ' +
        'SET users.firstname = ?, users.surname = ?, users.address = ?, users.postalCode = ?, users.city = ?, users.email = ?, events.email = ? ' +
        'WHERE users.email = ?';

    db.query(sql, values, function (err, result) {
        if (callback) {
            callback(err, result);
        };
    });
};

