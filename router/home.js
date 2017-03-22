var express = require('express');

var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
var router = express.Router();

var session = require('express-session');
var redis = require('redis');
var redisStore = require('connect-redis')(session);
var client = redis.createClient();


client.on('connect', function(){
    console.log("connected to redis from users.js");
});

router.use(session({
    cookie: {maxAge: 600000},
    secret: 'secret',
    // create new redis store.
    store: new redisStore({ host: 'localhost', port: 6379, client: client, ttl :  260}),
    saveUninitialized: false,
    resave: false
}));



/* GET home page. */
router.get('/', function(req, res, next) {
    if(!req.session.email){
        res.render('home', {
            login: false
        });
    }else{
        res.render('home', {
            login: true
        });
    }
});



module.exports = router;