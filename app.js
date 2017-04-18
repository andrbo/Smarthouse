var express = require('express');
var app = express();
//var gpio = require('rpi-gpio');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var i18n = require('i18n');
var expressValidator = require('express-validator');
var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash');




//var fs = require('fs');

/*var fs = require('fs');



//var v4l2camera = require("v4l2camera");

// Serial communication with Arduino
//var serialport = require('serialport');// include the library
//var SerialPort = serialport; // make a local instance of it
//var arduinoPort = '/dev/ttyACM0';


// Webcam used for live video, connected to usb port on raspberry pi

//var webcam = new v4l2camera.Camera("/dev/video0");
//webcam.start();

var webcam = new v4l2camera.Camera("/dev/video0");
webcam.start();*/

//Uses the db.js file

require('./middlewares/db');
require('./middlewares/passport')(passport);

// call socket.io to the app
//app.io = require('socket.io')();
//app.io.alarmActivated = require('./middlewares/alarmActivated')(app.io);
//app.io.videoStream = require('./middlewares/videoStream')(app, app.io);



app.get('/', function (req, res) {
    res.redirect('home');
});


// CONFIGURE HANDLEBARS
var hbs = exphbs.create({
    defaultLayout: 'main',
    extname: '.hbs',

    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/'
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

app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


//Global vars
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});


//INTERNATIONALIZATION STARTS HERE. CURRENTLY NORWEGIAN AND ENGLISH.
i18n.configure({
    locales: ['no', 'en'],
    fallbacks: {'no': 'en'},
    cookie: 'locale',
    directoryPermissions: '755',
    directory: __dirname + "/locales",
    autoReload: false,
    updateFiles: false, //Do not set this to true. It will replace the .json files.
    syncFiles: true,
    queryParameter: 'lang'
});

app.use(i18n.init)

// register hbs helpers in res.locals' context which provides this.locale
hbs.handlebars.registerHelper('__', function () {
    return i18n.__.apply(this, arguments);
});
hbs.handlebars.registerHelper('__n', function () {
    return i18n.__n.apply(this, arguments);
});

//Router controller. Uses passport as authentication.
require('./router/routes')(app,passport);

//Express Validator
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));


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

module.exports = app;