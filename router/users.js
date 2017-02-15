/**
 * Created by Mikael on 08.02.2017.
 */
var express = require('express');
var router = express.Router();
var dbModel = require('../models/User');
var flash = require('connect-flash');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');

router.use(expressValidator());
router.use(bodyParser.urlencoded({extended: true}));
router.use(flash());



/* Registerview */
router.get('/register', function(req, res, next) {
    res.render('register');
});

/* Registrer ny bruker*/
router.post('/register', function (req, res) {

    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords needs to match').equals(password);

    var errors = req.validationErrors();

    if(errors){
        console.log(errors);
        res.render('register' ,{
            errors: errors
        });
    }else{
    console.log(name, email, username, password);
    dbModel.createUser(username, password, email, name), function (data) {
        res.redirect('/home');
        };
    //req.flash('success_msg', 'Du er nå registrert');
    }
});


/*Login*/
router.get('/login', function (req, res, next) {
    res.render('login');
});


module.exports = router;