var express = require('express');
var gpio = require('rpi-gpio');
var router = express.Router();


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
});


module.exports = router