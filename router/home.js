var express = require('express');

var gpio = require('rpi-gpio');

var bodyParser = require('body-parser');

var router = express.Router();

var app = express();
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

var dbModel = require('../models/home');


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('home');
});


router.get('/ledOn', function(req,res,next){
    gpio.setup(15, gpio.DIR_OUT, write);

    function write() {
        gpio.write(15, true, function (err) {
            if (err) throw err;
            console.log('led turned on');
        });
    }
});

router.get('/ledOff', function(req,res,next){
    gpio.setup(15, gpio.DIR_OUT, write);

    function write() {
        gpio.write(15, false, function (err) {
            if (err) throw err;
            console.log('led turned off');
        });
    }

    res.send(write());
});


module.exports = router