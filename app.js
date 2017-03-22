var express = require('express');
//var gpio = require('rpi-gpio');
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
//var fs = require('fs');

//var v4l2camera = require("v4l2camera");

// Serial communication with Arduino
/*var serialport = require('serialport');// include the library
var SerialPort = serialport; // make a local instance of it
var arduinoPort = '/dev/ttyACM0';
*/

// Webcam used for live video, connected to usb port on raspberry pi
/*var webcam = new v4l2camera.Camera("/dev/video0");
webcam.start();*/


//Uses the db.js file
var db = require('./db');
var app = express();

// call socket.io to the app
app.io = require('socket.io')();


app.get('/', function (req, res) {
    res.render('home');
});

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
app.use('/users/register', users);
app.use('/users/logout', users);


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


//INTERNATIONALIZATION STARTS HERE. CURRENTLY NORWEGIAN AND ENGLISH.
i18n.configure({
    locales: ['no', 'en'],
    fallbacks: {'no': 'en'},
    cookie: 'locale',
    defaultLocale: 'no',
    directoryPermissions: '755',
    directory: __dirname + "/locales",
    autoReload: false,
    updateFiles: false, //Do not set this to true. It will replace the .json files.
    syncFiles: true,
    queryParameter: 'lang'
});

// register hbs helpers in res.locals' context which provides this.locale
hbs.handlebars.registerHelper('__', function () {
    return i18n.__.apply(this, arguments);
});
hbs.handlebars.registerHelper('__n', function () {
    return i18n.__n.apply(this, arguments);
});
//INTERNATIONALIZATION ENDS HERE.

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

//Connect flash
app.use(flash());

//Global vars
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
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

// Setting up serial communication port with Arduino
/*var arduinoSerial = new SerialPort(arduinoPort, {
    // look for return and newline at the end of each data packet:
    parser: serialport.parsers.readline("\r\n")
});*/

// Functions used for the video streaming // Will be moved to security.js when socket.io is implemented
/*function stopStreaming() {
    if (Object.keys(sockets).length == 0) {
        app.set('watchingFile', false);
        if (proc) proc.kill();
        fs.unwatchFile('./stream/image_stream.jpg');
        webcam.stop();
    }
}
function startWebcamStream(io) {
    if (app.get('watchingFile')) {
        io.sockets.emit('streamCam', 'image_stream.jpg?_t=' + (Math.random() * 100000));
        return;
    }
    Capture();
    app.set('watchingFile', true);
   console.log('Start watching......');
}
// Capture function 200 means 30fps
function Capture(){
   setInterval(function(){
      webcam.capture(function (success) {
           var frame = webcam.frameRaw();
            app.io.emit('streamCam', "data:image/png;base64," + Buffer(frame).toString('base64'));
        });
   }, 50);
}

// start listen with socket.io Muligens flyttes til .js for aktuelle views?

var sockets = {}; // Variable used to define if videostream should bi stopped


app.io.on('connection', function (socket) {
   console.log('a user connected');
   sockets[socket.id] = socket;
   console.log("Total clients connected : ", Object.keys(sockets).length);


   socket.on('disconnect', function () {
       delete sockets[socket.id];

        // no more sockets, kill the stream
      if (Object.keys(sockets).length == 0) {
          app.set('watchingFile', false);
          fs.unwatchFile('./stream/image_stream.jpg');
      }
    });
    // Serving sensor readings from Arduino as a JSON object
    arduinoSerial.on('data', function (data) {
        var serialData = JSON.parse(data);
        console.log(data);
       // send a serial event to the web client with the data:
        socket.emit('serialEvent', serialData);
    });

      socket.on('new message', function (msg) {
        console.log('new message: ' + msg);
        app.io.emit('chat message', msg);
    });

    socket.on('streamCam', function() {
       startWebcamStream(app.io);
    });
});*/

module.exports = app;
