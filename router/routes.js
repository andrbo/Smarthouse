module.exports = function (app, passport) {

    var db = require('../db');

    var bcrypt = require('bcryptjs');

    var calModal = require('../models/calendar');



    app.get('/', function (req, res) {
        res.render('home');
    });

    app.get('/home', function (req, res) {
        if (req.isAuthenticated()) {
            res.render("home", {
                login: true,
                loginUsername: req.user.email
            });
        } else {
            res.render("home", {login: false});
        }
        ;
    });

    app.get('/about', function (req, res) {
        if (req.isAuthenticated()) {
            res.render("about", {
                login: true,
                loginUsername: req.user.email
            });
        } else {
            res.render("about", {login: false});
        }
        ;
    });

    app.get('/security', function (req, res) {
        if (req.isAuthenticated()) {
            res.render("security", {
                login: true,
                loginUsername: req.user.email
            });
        } else {
            res.render("security", {login: false});
        }
        ;
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/home',
        failureRedirect: '/home',
        failureFlash: true
    }));

    app.post('/register', passport.authenticate('local-signup', {
        successRedirect: '/home',
        failureRedirect: '/about',
        failureFlash: true
    }));

    app.get('/logout', function (req, res) {
        console.log("Logger ut");
        req.logout();
        res.redirect('/');
    });

    //CALENDAR BEGINS HERE
    app.get("/getEvents", function(req, res){
        var email = req.user.email;
        console.log("EMAIL: " + email);
        function getEvents(callback){
            calModal.getEvents(email, function(err, result){
                if(callback){
                    callback(err, result);
                    res.send(result);
                }
            })
        }
        getEvents(function(err, result){
        });
    });

    app.post("/addEvent", function(req, res){
        var email = req.user.email;
        var title = req.body.title;
        var description = req.body.description;
        var start = req.body.start;
        var end = req.body.end;

        function addEvent(callback){
            calModal.addEvent(email, title,description, start, end, function(err, result){
                if(callback){
                    var string = JSON.stringify(result);
                    var parse = JSON.parse(string);

                    callback(err, result);
                    res.send(parse);
                    console.log("ID FRA DB" + parse.insertId);
                }
            })
        }
        addEvent(function(err,res){});
    });

    app.post("/deleteEvent", function(req, res){
    });

    // alarm
    app.post('/alarmToggle', function (req, res) {
        var activated = req.body.alarm;
        console.log('test' + activated);
        function toggleAlarm(id, callback) {
            if (activated == "on") {
                console.log('skal skrive 1 til db');
                db.query('UPDATE sensors SET value=1 WHERE id=?', id, function (err, result) {
                    if (callback) {
                        console.log(err);
                        callback(err, result);
                    }
                    ;
                });
            } else {
                console.log("KJØRER ELSE.");
                db.query('UPDATE sensors SET value=0 WHERE id=?', id, function (err, result) {
                    if (callback) {
                        callback(err, result);
                    }
                    ;
                });
            }
        }

        toggleAlarm(1, function (err, result) {
        })
    });

    app.post("/alarmState", function (req, res) {
        function getState(id, callback) {
            db.query("SELECT * FROM sensors WHERE id = ?", id, function (err, result) {
                if (callback) {
                    console.log("ERROR ALARM STATE: " + err);
                    var string = JSON.stringify(result);
                    var parse = JSON.parse(string);
                    callback(err, result);
                    res.send(parse);
                }
            });
        };
        getState(1, function (err, result) {
        });
    });

    app.post('/alarmPw', function (req, res) {
        var input = req.body.pw;
        console.log('PWINPUT: ' + input);
        function getPassword(id, callback) {
            db.query("SELECT * FROM alarm WHERE id = ?", id, function (err, result) {
                if (callback) {
                    console.log("ERROR ALARM PW: " + err);
                    var string = JSON.stringify(result);
                    var parse = JSON.parse(string);
                    var pwFromdb = parse[0].alarmpw;
                    console.log('parse' + pwFromdb);
                    crypt(input, pwFromdb, function (err, result) {
                        if (result === true) {
                            console.log('PW rett');
                            res.send('ok');
                        } else {
                            console.log("PW feil");
                            res.send('error');
                        }
                    });
                }
                ;
            });
        };
        getPassword(1, function (err, result) {
        });
    });


    function crypt(pw, pwFromDb, callback) {
        bcrypt.compare(pw, pwFromDb, function (err, result) { //Returns true if pw is ok.
            if (callback) {
                callback(err, result);
            }
        })
    };
};
