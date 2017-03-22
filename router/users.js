/**
 * Created by Mikael on 08.02.2017.
 */
var express = require('express');
var router = express.Router();
var dbModel = require('../models/User');
var flash = require('connect-flash');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var session = require('express-session');
var passport = require ('passport');
var localStrategy = require('passport-local');
var bcrypt = require('bcryptjs');


router.use(expressValidator());
router.use(bodyParser.urlencoded({extended: true}));
router.use(flash());

router.use(session({
    maxAge: 60000,
    secret: 'secret',
    saveUninitialized: false,
    resave: false
}));



router.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash ('error_msg');
    res.locals.error = req.flash('error');
    next();
});

router.use(passport.initialize());
router.use(passport.session());

/* Registrer ny bruker*/
router.post('/register', function (req, res) {

    var firstname = req.body.firstname;
    var surname = req.body.surname;
    var email = req.body.email;
    var password = req.body.password;
    var password2 = req.body.password2;

    req.checkBody('firstname', "fornavn").notEmpty();
    req.checkBody('surname', 'he').notEmpty();
    req.checkBody('email', 'he').notEmpty();
    req.checkBody('email', 'he').isEmail();
    req.checkBody('password', 'he').notEmpty();
    req.checkBody('password2', 'he').equals(password);

    var errors = req.validationErrors();



    if(errors){
        console.log(errors);
        req.flash('errors', errors);
        res.redirect('/register');

    }else{
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, function (err, hash) {
                password=hash;
                if(err){ console.log(err)}
                else {
                    dbModel.createUser(password, email, firstname, surname);
                    req.flash('success_msg', 'Du er nå registrert');
                    res.redirect('/users/register');
                }
            })
        });
    }
});


router.post('/login', function (req, res) {
    var loginUsername = req.body.email;
    var loginPassword = req.body.password;


    function validatePassword() {
        dbModel.getPassword(loginUsername, function (err, passwordFromDb) {
            var string = JSON.stringify(passwordFromDb);
            var parse = JSON.parse(string);
            var pwordfromDB = parse[0].password;
            bcrypt.compare(loginPassword, pwordfromDB, function (err, res) {
                if (err) {
                    console.log(err)
                } else if (res === true) {
                    console.log(loginPassword, pwordfromDB);
                    console.log('Pass ok!')
                    res.render('home', {
                        login: true,
                        loginUsername: loginUsername
                    });
                } else {
                    console.log("Res === false: " + loginPassword, pwordfromDB);
                    console.log("res: " + res)
                    console.log('Pass ikke ok!')
                    res.render('login');

                }
            })
        })
    }

    validatePassword();
});

module.exports = router;