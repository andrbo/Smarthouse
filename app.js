var express = require('express');
var gpio = require('rpi-gpio');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var i18n = require('i18n');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var mysql = require('mysql');

//Uses the db.js file
var db = require('./db');


var app = express();

//New pages goes here
var home = require('./router/home');
var about = require('./router/about');
var products = require('./router/products');
var security = require('./router/security');
var users = require('./router/users');

app.use('/home', home);
app.use('/about', about);
app.use('/products', products);
app.use('/security', security);
app.use('/users', users);


app.use('/home/ledToggle', home);


// CONFIGURE HANDLEBARS
var hbs = exphbs.create({
    defaultLayout: 'main',
    extname: '.hbs',

    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/',
});


// Views folder and engine
app.set('views', __dirname + '/views/');
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine);


// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//INTERNATIONALIZATION STARTS HERE. CURRENTLY NORWEGIAN AND ENGLISH.
i18n.configure({
    locales: ['no', 'en'],
    fallbacks:{'no': 'en'},
    cookie: 'locale',
    defaultLocale: 'no',
    directoryPermissions: '755',
    directory: __dirname + "/locales",
    autoReload: false,
    updateFiles: false, //Do not set this to true. It will replace the .json files.
    syncFiles: true,
    queryParameter: 'lang',
});

// register hbs helpers in res.locals' context which provides this.locale
hbs.handlebars.registerHelper('__', function () {
    return i18n.__.apply(this, arguments);
});
hbs.handlebars.registerHelper('__n', function () {
    return i18n.__n.apply(this, arguments);
});
//INTERNATIONALIZATION ENDS HERE.


// ******** LOG IN ********

//LOGINGREIER EXPRESS SESSIONS
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

//Passport init
app.use(passport.initialize());
app.use(passport.session());

//Express Validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value){
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }
        return{
            param: formParam,
            msg : msg,
            value : value
        };
    }
}));

//Connect flash
app.use(flash());

//Global vars
app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash ('error_msg');
    res.locals.error = req.flash('error');
    next();
});
// ******** END LOG IN ********



// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// Test temperature reading using socket.io
// Needed node package modules
var io = require('socket.io').listen(3001);
var ds = require('ds18b20');

var interval = 3000; // Tiden (i ms) mellom hver spørring for avlesning av sensor


//when a client connects
io.sockets.on('connection', function (socket) {

    var sensorId = [];
    //fetch array containing each ds18b20 sensor's ID
    ds18b20.sensors(function (err, id) {
        sensorId = id;
        socket.emit('sensors', id); //send sensor ID's to clients
    });
    //initiate interval timer
    setInterval(function () {
        //loop through each sensor id
        sensorId.forEach(function (id) {

            ds18b20.temperature(id, function (err, value) {

                //send temperature reading out to connected clients
                socket.emit('temps', {'id': id, 'value': value});

            });
        });

    }, interval);
});

module.exports = app;