var express = require('express');
var router = express.Router();
var session = require('express-session');
var redis = require('redis');
var redisStore = require('connect-redis')(session);
var client = redis.createClient();
var flash = require('connect-flash');

exports.flash = function () {
    router.use(flash());
};


client.on('connect', function(){
    console.log("connected to redis from session.js");
});

router.use(session({
    cookie: {maxAge: 600000},
    secret: 'secret',
    // create new redis store.
    store: new redisStore({ host: 'localhost', port: 6379, client: client, ttl :  260}),
    saveUninitialized: false,
    resave: false
}));