var express = require('express');
var gpio = require('rpi-gpio');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended: true}));

var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('home');
});


router.get('/ledToggle', function(res, req, next){
    console.log(req);
    gpio.setup(15, gpio.DIR_OUT, write);

    console.log("Før if");

    var ledOn = false;
    var input = req.body.button;
    console.log(req);

    if(input == "on"){

        console.log("Inne i if-on");

        ledOn = true;
    }else{
        console.log("Inne i if-off");
        ledOn = false;
    }

    console.log("Setter opp pin");

    function write() {

        console.log("kjører write");

        gpio.write(15, ledOn, function (err) {
            if (err) throw err;
            console.log('led turned off');
        });
    }
});


module.exports = router;