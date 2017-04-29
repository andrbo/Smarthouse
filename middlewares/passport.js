var mysql = require('mysql');
var LocalStrategy = require('passport-local').Strategy;
var db = require('../middlewares/db');
var User = require('../models/User');
var bcrypt = require('bcryptjs');


module.exports = function (passport) {
    console.log("Bruker passport.js");

    //Used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.email, user.firstname);
    });

    //Used to deserialize the user
    passport.deserializeUser(function (email, done) {
        db.query("SELECT * FROM users WHERE email = ?", [email], function (err, rows) {
            done(err, rows[0]);
        });
    });


    passport.use('local-signup', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, email, password, done) {

            User.getUser(email, function (err, result) {
                console.log(result);
                if (err)
                    done(err);
                if (result.length) { //Check if email already exist.
                    done(null, false, req.flash('error_msg', req.__("Email-Exist")));
                } else {

                    var newUser = new Object();

                    var firstname = req.body.firstname;
                    var surname = req.body.surname;
                    var password = req.body.password;
                    var email = req.body.email;
                    var address = req.body.address;
                    var postalCode = req.body.postalCode;
                    var city = req.body.city;
                    var country = req.body.country;

                    //Hashing password.
                    bcrypt.genSalt(10, function (err, salt) {
                        bcrypt.hash(password, salt, function (err, hash) {
                            password = hash;
                            console.log("Ferdig hash: " + password);
                            if (err) {
                                console.log(err)
                            }
                            else { //Creating new user.
                                User.createUser(password, email, firstname, surname, address, postalCode, city, country, function(err, result){
                                    newUser = User.getUser(email, function(err, result){
                                        var string = JSON.stringify(result);
                                        var parse = JSON.parse(string);
                                        done(null, parse[0]); //Have to return JSON data to serialize.
                                    })

                                });
                            };
                        });
                    });
                };
            });
        }
    ));


    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, email, password, done) {//Callback with email and password from our form

            User.getUser(email, function (err, userFromDb) {
                if(err){
                    done(err);
                }else if(userFromDb.length){ //Check if user not NULL.
                    var pwordfromDB = userFromDb[0].password;

                    crypt(password, pwordfromDB, function (err, result) {
                        if (result === false) {
                           done(null, false);
                        } else {
                            console.log(userFromDb[0]);
                            done(null, userFromDb[0]);
                        }
                    });
                }else{
                    done(null, false, req.flash('error_msg', req.__("Mail finnes ikke")));
                }
            });
        }
    ));
    
    function crypt(pw, pwFromDb, callback) {
        bcrypt.compare(pw, pwFromDb, function (err, result) { //Returns true if pw is ok.
            if (callback) {
                callback(err, result);
            }
        })
    };
};