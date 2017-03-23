/**
 * Created by Mikael on 08.02.2017.
 */
var express = require('express');
var router = express.Router();
var dbModel = require('../models/User');
var session = require('../session');
var redis = require('redis');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var bcrypt = require('bcryptjs');


router.use(expressValidator());
router.use(bodyParser.urlencoded({extended: true}));


router.use(function(req, res, next){
    res.locals.success_msg = session.flash('success_msg');
    res.locals.error_msg = session.flash ('error_msg');
    res.locals.error = session.flash('error');
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
        session.flash('errors', errors);
        res.redirect('/register');

    }else{
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, function (err, hash) {
                password=hash;
                if(err){ console.log(err)}
                else {
                    dbModel.createUser(password, email, firstname, surname);
                    session.flash('success_msg', 'Du er nå registrert');
                    res.redirect('http://localhost:3000/home#');
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
                    session.email = loginUsername;
                    console.log(session.email);
                    res.redirect('http://localhost:3000/home');
                } else {
                    console.log("Res === false: " + loginPassword, pwordfromDB);
                    console.log("res: " + result)
                    console.log('Pass ikke ok!')
                    res.redirect('http://localhost:3000/home');
                }
            })
        })
    }
    validateUser();
});

router.get('/logout', function (req, res) {
    //TODO: Lag heller en destroy-metode, tror ikke dette er veldig sikkert.
    session.email = null;
    res.redirect('http://localhost:3000/home');
});

/*function checkAuth(req, res, next) {
    if(!session.email){
        console.log("bruker ikke logget inn");
        res.render('home', {
            error_msg: 'Ikke tilgang',
            login: false
        })
    }else{
        next();
    }
};

router.get('/secret', function (req, res) {

    res.redirect('http://localhost:3000/home');

    console.log("GODKJENT");
});
*/

module.exports = router;
