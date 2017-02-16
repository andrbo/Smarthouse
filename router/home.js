var express = require('express');
var gpio = require('rpi-gpio');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('home');
});



gpio.setup(15, gpio.DIR_OUT, write);

var on = false;
function write() {
    gpio.write(15, on, function (err) {
        if (err) throw err;
        console.log('led turned off');
    });
}


router.get('/ledOn', function(req,res,next){
    on = true;
});

router.get('/ledOff', function(req,res,next){
    on = false;
});


module.exports = router