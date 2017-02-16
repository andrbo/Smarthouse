var express = require('express');
var gpio = require('rpi-gpio');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser);

var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('home');
});


router.get('/ledOn', function(res, req, next){

    var ledOn = false;
    if(req.body.buttonOn){
        ledOn = true;
    }else{
        ledOn = false;
    }


    gpio.setup(15, gpio.DIR_OUT, write);
    function write() {
        gpio.write(15, ledOn, function (err) {
            if (err) throw err;
            console.log('led turned off');
        });
    }
});

/*router.get('/ledOff', function(){
    function write() {
        gpio.write(15, false, function (err) {
            if (err) throw err;
            console.log('led turned off');
        });
    }
});
*/

module.exports = router;