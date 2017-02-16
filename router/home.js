var express = require('express');
var gpio = require('rpi-gpio');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('home');
});

gpio.setup(15, gpio.DIR_OUT, write);

function write(){
    led();
}

router.get('/ledOn', function(){
    function led() {
        gpio.write(15, true, function (err) {
            if (err) throw err;
            console.log('led turned on');
        });
    }
});

router.get('/ledOff', function(){
    function led() {
        gpio.write(15, false, function (err) {
            if (err) throw err;
            console.log('led turned off');
        });
    }
});


module.exports = router;