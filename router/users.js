/**
 * Created by Mikael on 08.02.2017.
 */
var express = require('express');
var router = express.Router();
var dbModel = require('../models/user');
var flash = require('connect-flash');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var session = require('express-session');
var passport = require ('passport');
var localStrategy = require('passport-local');


router.use(expressValidator());
router.use(bodyParser.urlencoded({extended: true}));
router.use(flash());

router.use(session({
    maxAge: 60000,
    secret: 'secret',
    saveUninitialized: true,
    resave: true
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
        //res.redirect('/register');

    }else{
        dbModel.createUser(password, email, firstname, surname);
        req.flash('success_msg', 'Du er nå registrert');
        res.redirect('/users/register');
    }
});


router.post('/login', function(req, res){
    var loginUsername = req.body.email;
    var loginPassword = req.body.password;



    console.log(loginUsername, loginPassword);
    dbUname = dbModel.getUser(loginUsername);
    res.render('home', {
        login:true,
        loginUsername: loginUsername
    });
});

module.exports = router;