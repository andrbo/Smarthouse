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
var bcrypt = require('bcryptjs');
var redis = require('redis');
var redisStore = require('connect-redis')(session);
var client = redis.createClient();


client.on('connect', function(){
    console.log("connected to redis from users.js");
});

router.use(session({
    cookie: {maxAge: 600000},
    secret: 'secret',
    // create new redis store.
    store: new redisStore({ host: 'localhost', port: 6379, client: client, ttl :  260}),
    saveUninitialized: false,
    resave: false
}));


router.use(expressValidator());
router.use(bodyParser.urlencoded({extended: true}));
router.use(flash());


router.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash ('error_msg');
    res.locals.error = req.flash('error');
    next();
});


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


    function validateUser() {
        dbModel.getPassword(loginUsername, function (err, passwordFromDb) {
            var string = JSON.stringify(passwordFromDb);
            var parse = JSON.parse(string);
            var pwordfromDB = parse[0].password;
            bcrypt.compare(loginPassword, pwordfromDB, function (err, result) {
                if (err) {
                    console.log(err)
                } else if (result === true) {
                    console.log(loginPassword, pwordfromDB);
                    console.log('Pass ok!');
                    req.session.email = loginUsername;
                    console.log(req.session.email);
                    res.redirect('secret');
                } else {
                    console.log("Res === false: " + loginPassword, pwordfromDB);
                    console.log("res: " + result)
                    console.log('Pass ikke ok!')
                    res.redirect('secret');

                }
            })
        })
    }
    validateUser();
});

router.get('/logout', function (req, res) {
    req.session.destroy();
    res.render('home', {
        login: false
    });
});

function checkAuth(req, res, next) {
    if(!req.session.email){
        console.log("bruker ikke logget inn");
        res.render('home', {
            error_msg: 'Ikke tilgang',
            login: false
        })
    }else{
        next();
    }
};

router.get('/secret', checkAuth, function (req, res) {

    res.render('home', {
        login: true
    });
    console.log("GODKJENT");
});


module.exports = router;