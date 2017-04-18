module.exports = function (app, passport) {

    var generator = require('generate-password');
    var nodemailer = require('nodemailer');
    var User = require('../models/User');
    var validator = require('validator');
    var flash = require('connect-flash');
    var db = require('../middlewares/db');
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
            res.render("home");
        };
    });

    app.get('/about', function (req, res) {
        if (req.isAuthenticated()) {
            res.render("about", {
                login: true,
                loginUsername: req.user.email
            });
        } else {
            req.flash("error_msg", res.__('Login-Required'));
            res.redirect("home");
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
            req.flash("error_msg", res.__('Login-Required'));
            res.redirect("home");
        };
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/home',
        failureRedirect: '/home',
        failureFlash: true
    }));

    app.post('/register', passport.authenticate('local-signup', {
        successRedirect: '/home',
        failureRedirect: '/home',
        failureFlash: true
    }));

    app.get('/logout', function (req, res) {
        console.log("Logger ut");
        req.logout();
        res.redirect('/');
    });

    app.get('/forgot', function (req, res) {
        res.render('forgot');
    });

    app.post('/forgot', function (req, res) {

        var email = req.body.email;

        var val = validator.isEmail(email);

        var randomPassword = generator.generate({
            length: 10,
            numbers: true

        });

        function hashPassword(password, callback) {
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(password, salt, function (err, hash) {
                    password = hash;
                    callback(err, password);

                });
            });
        }

        function forgotPassword(password, email) {
            User.forgotPassword(password, email, function (err, result) {
                console.log(password);
                if (err)
                    return err;
                else {
                    sendMail(email, randomPassword);
                }
            })
        }

        hashPassword(randomPassword, function (err, res) {
            if(err){
                console.log("ERR;" + err);
                return err
            }else{
                forgotPassword(res, email);
                console.log("RES: " + res);
                return res
            };
        });


        function sendMail(email, password) {

            var smtpTransport = nodemailer.createTransport({
                service: "Gmail",  // sets automatically host, port and connection security settings
                auth: {
                    user: "Smarthus2017@gmail.com",
                    pass: "Smarthus"
                }
            });
            smtpTransport.sendMail({  //email options
                from: "<Smarthus2017@gmail.com>", // sender address.  Must be the same as authenticated user if using Gmail.
                to: email, // receiver
                subject: "Emailing with nodemailer", // subject
                text: "Hei! Ditt nye passord er " + password + "\n\n" + "Med vennlig hilsen Smarthus-teamet"// body
            }, function (error, response) {  //callback
                if (error) {
                    console.log(error);
                } else {
                    console.log("Message sent: " + response.message);
                    res.redirect('/home');
                }
                smtpTransport.close(); // shut down the connection pool, no more messages.  Comment this line out to continue sending emails.
            });
        }

    });

    app.get('/profile', function (req, res) {
        res.render('profile');
        /*if (req.isAuthenticated()) {
            res.render("profile", {
                login: true,
                loginUsername: req.user.email
            });
        } else {
            res.render("profile", {login: false});
        };*/
        var email = req.user.email;

        function getUser(epost, callback){
            User.getUser(epost, function (err, res) {
                var string = JSON.stringify(res);
                var parse = JSON.parse(string);
                var retur = parse[0];
                callback(err, retur);
            })
        }

        getUser(email, function(err, res){
            if(err){
                console.log("Err: " + err);
                return err
            }else{
                console.log("RES: " + res.firstname);
                console.log("RES: " + res.surname);
                console.log("RES: " + res.email);
                console.log("RES: " + res.address);
                console.log("RES: " + res.postalCode);
                console.log("RES: " + res.city);
                console.log("RES: " + res.country);
                console.log("RES: " + res.surname);
                return res;
            }
        });
    });

    app.post('/profile', function (req, res) {

    });
    //CALENDAR BEGINS HERE
    app.get("/getUserEvents", function(req, res){
        var email = req.user.email;
        console.log("EMAIL: " + email);
        function getEvents(callback){
            calModal.getUserEvents(email, function(err, result){
                if(callback){
                    res.send(result);
                    callback(err, result);
                }
            })
        }
        getEvents(function(err, result){
        });
    });

    app.get("/getAllEvents", function(req, res){
        function getAllEvents(callback){
            calModal.getAllEvents(function (err, result) {
                if(callback){
                    res.send(result);
                    callback(err, result);
                }
            })
        }
        getAllEvents(function(err, res){});
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
                    callback(err, result);
                }
            })
        }
        addEvent(function(err,res){});
    });

    app.post("/deleteEvent", function(req, res){
        var id = req.body.id;

        function deleteEvent(callback){
            calModal.deleteEvent(id, function(err, result){
                callback(err,result);
            })
        }
        deleteEvent(function (err,res) {})
    });

    app.post("/updateEvent", function(req, res){
        var id = req.body.id;
        var start = req.body.start;
        var end = req.body.end;
        var title = req.body.title;
        var description = req.body.description

        function updateEvent(callback){
            calModal.updateEvent(title, description, start, end, id, function(err, result){
                callback(err, result);
            });
        };
        updateEvent(function(err, res){});
    });

    app.post("/updateDate", function(req, res){
        var id = req.body.id;
        var start = req.body.start;
        var end = req.body.end;

        function updateDate(callback){
            calModal.updateDate(start, end, id, function(err, result){
                callback(err, result);
            });
        };
        updateDate(function(err, res){});
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
                    };
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
