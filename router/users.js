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

/* Registerview */
router.get('/register', function(req, res, next) {
    res.render('register');
});

/* Registrer ny bruker*/
router.post('/register', function (req, res) {

    var firstname = req.body.firstname;
    var surname = req.body.surname;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    req.checkBody('firstname', "fornavn").notEmpty();
    req.checkBody('surname', 'he').notEmpty();
    req.checkBody('email', 'he').notEmpty();
    req.checkBody('email', 'he').isEmail();
    req.checkBody('username', 'he').notEmpty();
    req.checkBody('password', 'he').notEmpty();
    req.checkBody('password2', 'he').equals(password);

    var errors = req.validationErrors();

    if(errors){
        console.log(errors);
        res.render('/home', {
            errors: errors
        });
    }else{
        dbModel.createUser(username, password, email, firstname, surname);
    req.flash('success_msg', 'Du er nå registrert');
    res.redirect('/users/register');
    }
});


/*Login*/
router.get('/login', function (req, res, next) {
    res.render('login');
});

router.post('/login', function(req, res){
    var username = req.body.username;
    var pword = req.body.password;

    console.log(username, pword);
    dbUname = dbModel.getUser(username);
});

module.exports = router;