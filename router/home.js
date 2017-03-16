var express = require('express');

var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('home');
});


router.get('/ledToggle', function(req, res, next){
    gpio.setup(15, gpio.DIR_OUT, write);
    var ledOn = false;
    var input = req.query.button;

    if(input == "on"){
        ledOn = true;
    }else{
        ledOn = false;
    }
    function write() {
        gpio.write(15, ledOn, function (err) {
            if (err) throw err;
        });
    }
});


module.exports = router;