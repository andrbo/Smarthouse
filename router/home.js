var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));
var session = require('../session');


/* GET home page. */
router.get('/', function(req, res, next) {
    if(!session.email){
        res.render('home', {
            login: false
        });
    }else{
        res.render('home', {
            login: true,
            loginUsername: session.email
        });
    }
});

module.exports = router;