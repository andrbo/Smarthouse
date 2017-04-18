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
        };
    })
};

exports.forgotPassword=function(password, email, callback){
    var values = [password, email];
console.log("values " + values);
    var sql = 'UPDATE users SET password = ? WHERE email = ?';
    db.query(sql,values, function (err, res) {
        if(callback){
            callback(err, res);
            console.log("ERR " + err);
        };
    })
};

//TODO: opprett en exist-funksjon.