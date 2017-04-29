module.exports = function (app, passport) {

    var generator = require('generate-password');
    var nodemailer = require('nodemailer');
    var User = require('../models/User');
    var validator = require('validator');
    var flash = require('connect-flash');
    var db = require('../middlewares/db');
    var bcrypt = require('bcryptjs');
    var calModal = require('../models/calendar');
    var shopModal = require('../models/shop');
    var unitModel = require('../models/units');

    app.get('/', function (req, res) {
        res.render('home');
    });

    app.get('/home', function (req, res) {
        if (req.isAuthenticated()) {
            res.render("home", {
                login: true,
                loginUsername: req.user.email,
                loginFirstname: req.user.firstname
            });
            console.log("EMAIL:" + req.user.email + " NAVN: " + req.user.firstname)
        } else {
            res.render("home");
        }
    });

    app.get('/userCalendar', function (req, res) {
        if (req.isAuthenticated()) {
            res.render("userCalendar", {
                login: true,
                loginUsername: req.user.email
            });
        } else {
            req.flash("error_msg", res.__('Login-Required'));
            res.redirect("home");
        }
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
        }
    });

    app.get('/lights', function (req, res) {
        if (req.isAuthenticated()) {
            res.render("lights", {
                login: true,
                loginUsername: req.user.email
            });
        } else {
            req.flash("error_msg", res.__('Login-Required'));
            res.redirect("home");
        }
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
        req.logout();
        req.flash("success_msg", res.__('Logout-Success'));
        res.redirect('/');
    });

    app.post('/forgot', function (req, res) {
        var email = req.body.forgotEmail;

        var randomPassword = generator.generate({
            length: 10,
            numbers: true
        });

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
            if (err) {
                return err
            } else {
                forgotPassword(res, email);
                return res
            }
        });


        function sendMail(email, password) {
            var smtpTransport = nodemailer.createTransport({
                service: "Gmail",  //Automatically sets host, port and connection security settings
                auth: {
                    user: "Smarthus2017@gmail.com",
                    pass: "Smarthus"
                }
            });
            smtpTransport.sendMail({
                from: "<Smarthus2017@gmail.com>", //Sender address. Must be the same as authenticated user if using Gmail.
                to: email, // receiver
                subject: "New password", //TODO: Fiks internasjonalisering
                text: "Hei! Ditt nye passord er: " + password + "\n\n" + "Med vennlig hilsen Smarthus-teamet"// body
            }, function (error, response) {  //callback
                if (error) {
                    console.log(error);
                } else {
                    console.log("Message sent: " + response.message);
                    res.redirect('/home');
                }
                smtpTransport.close(); //Shut down the connection, no more messages.
            });
        }

    });

    app.get('/profile', function (req, res) {
        if (req.isAuthenticated()) {
            function getUserInfo(callback) {
                User.getUser(req.user.email, function (err, result) {
                    if (callback) {
                        res.render("profile", {
                            login: true,
                            loginUsername: req.user.email,
                            userData: JSON.stringify(result)
                        });
                        callback(err, result);
                    }
                })
            }

            getUserInfo(function (err, result) {
            })
        } else {
            req.flash("error_msg", res.__('Login-Required'));
            res.redirect("home");
        }
    });

    app.post('/updatePassword', function (req, res) {
        var email = req.user.email;
        var oldPassword = req.body.oldPassword;
        var newPassword = req.body.newPassword;

        function validatePassword(callback) {
            User.getPassword(email, function (err, pwFromDb) {
                if (callback) {
                    crypt(oldPassword, pwFromDb[0].password, function (err, result) { //Comparing oldPassword to current password with hashing.
                        if (result === true) {
                            hashPassword(newPassword, function (err, newPass) {
                                if (err) {
                                    return err
                                } else {
                                    User.updatePassword(newPass, email, function (err, result) {
                                        if (callback) {
                                            res.send(result);
                                        }
                                    });
                                }
                            });
                        } else {
                            res.send(null);
                        }
                    });
                }
            })
        }

        validatePassword(function (err, result) {
        });
    });

    app.post("/updateProfile", function (req, res) {
        console.log("UPDATE PROFILE ROUTER GETS CALLED.");
        var email = req.user.email;
        var firstname = req.body.firstname;
        var surname = req.body.surname;
        var address = req.body.address;
        var postalCode = req.body.postalCode;
        var city = req.body.city;
        var newEmail = req.body.email;

        function updateProfile(callback) {
            User.updateProfile(firstname, surname, address, postalCode, city, newEmail, newEmail, email, function (err, result) {
                callback(err, result);
                res.send(result);
            });

            //Deserialize user if email is changed.
            if (newEmail != email) {
                passport.deserializeUser(function (error, done) {
                    db.query("SELECT * FROM users WHERE email = ?", [newEmail], function (err, rows) {
                        done(err, rows[0]);
                    });
                });
            }
        };
        updateProfile(function (err, res) {
        });
    });


    //CALENDAR BEGINS HERE
    app.get("/getUserEvents", function (req, res) {
        var email = req.user.email;
        console.log("EMAIL: " + email);
        function getEvents(callback) {
            calModal.getUserEvents(email, function (err, result) {
                if (callback) {
                    res.send(result);
                    callback(err, result);
                }
            })
        }

        getEvents(function (err, result) {
        });
    });

    app.get("/getAllEvents", function (req, res) {
        function getAllEvents(callback) {
            calModal.getAllEvents(function (err, result) {
                if (callback) {
                    res.send(result);
                    callback(err, result);
                }
            })
        }

        getAllEvents(function (err, result) {});
    });

    app.post("/addEvent", function (req, res) {
        var email = req.user.email;
        var title = req.body.title;
        var description = req.body.description;
        var start = req.body.start;
        var end = req.body.end;
        var participants = req.body.participants;

        function addEvent(callback) {
            calModal.addEvent(email, title, description, start, end, function (err, result) {
                if (callback) {
                    callback(err, result);
                }
            })
        }

        addEvent(function (err, res) {
        });
    });

    app.post("/deleteEvent", function (req, res) {
        var id = req.body.id;

        function deleteEvent(callback) {
            calModal.deleteEvent(id, function (err, result) {
                callback(err, result);
            })
        }

        deleteEvent(function (err, res) {
        })
    });

    app.post("/updateEvent", function (req, res) {
        var id = req.body.id;
        var start = req.body.start;
        var end = req.body.end;
        var title = req.body.title;
        var description = req.body.description;

        function updateEvent(callback) {
            calModal.updateEvent(title, description, start, end, id, function (err, result) {
                callback(err, result);
            });
        }

        updateEvent(function (err, res) {
        });
    });

    app.post("/updateDate", function (req, res) {
        var id = req.body.id;
        var start = req.body.start;
        var end = req.body.end;

        function updateDate(callback) {
            calModal.updateDate(start, end, id, function (err, result) {
                callback(err, result);
            });
        }

        updateDate(function (err, res) {
        });
    });

    app.get("/getShoppingList", function (req, res) {
        function getShoppingList(callback) {
            shopModal.getShoppingList(function (err, result) {
                if (callback) {
                    console.log("RESULT: " + result);
                    console.log("ERR: " + err);
                    res.send(result);
                    callback(err, result);
                }
            })
        }

        getShoppingList(function (err, result) {
        });
    });

    app.post("/removeProduct", function (req, res) {
        var id = req.body.id;
        console.log("ID: " + id);
        function removeProduct(callback) {
            shopModal.removeProduct(id, function (err, result) {
                if (callback) {
                    res.send(result);
                    callback(err, result);
                }
            })
        }

        removeProduct(function (err, result) {
        });
    });

    app.post("/addProduct", function (req, res) {
        var description = req.body.description;
        console.log("DESC: " + description);
        function addProduct(callback) {
            shopModal.addProduct(description, function (err, result) {
                if (callback) {
                    res.send(result);
                    callback(err, result);
                }
            })
        }

        addProduct(function (err, result) {
        });
    });

    // alarm
    app.post('/alarmToggle', function (req, res) {
        var activated = req.body.alarm;
        console.log('ROUTES ACTIVATED STATE' + activated);
        function toggleAlarm(id, callback) {
            if (activated == "true") {
                db.query('UPDATE sensors SET value=1 WHERE id=?', id, function (err, result) {
                    if (callback) {
                        callback(err, result);
                    }

                });
            } else {
                db.query('UPDATE sensors SET value=0 WHERE id=?', id, function (err, result) {
                    if (callback) {
                        callback(err, result);
                    }

                });
            }
        }
        toggleAlarm(1, function (err, result) {})
    });

    app.post("/alarmState", function (req, res) {
        function getState(id, callback) {
            db.query("SELECT * FROM sensors WHERE id = ?", id, function (err, result) {
                if (callback) {
                    callback(err, result);
                    res.send(result);
                }
            });
        }
        getState(1, function (err, result) {});
    });

    app.post('/alarmPw', function (req, res) {
        var input = req.body.pw;
        console.log('PWINPUT: ' + input);
        function getPassword(id, callback) {
            db.query("SELECT * FROM alarm WHERE id = ?", id, function (err, result) {
                if (callback) {
                    var pwFromdb = result[0].alarmpw;
                    console.log('parse' + pwFromdb);
                    crypt(input, pwFromdb, function (err, result) {
                        if (result === true) {
                            console.log('PW rett');
                            res.send(true);
                        } else {
                            console.log("PW feil");
                            res.send(false);
                        }
                    });
                }
            });
        }

        getPassword(1, function (err, result) {
        });
    });

    function hashPassword(password, callback) {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, function (err, hash) {
                password = hash;
                callback(err, password);

            });
        });
    }

    function crypt(pw, pwFromDb, callback) {
        bcrypt.compare(pw, pwFromDb, function (err, result) { //Returns true if pw is ok.
            if (callback) {
                callback(err, result);
            }
        })
    }


    //Units
    app.get('/getUnits', function (req, res) {
        function getUnits(callback) {
            unitModel.getUnits(function (err, result) {
                if (callback) {
                    res.send(result);
                    callback(err, result);
                }

            });
        }

        getUnits(function (err, res) {

        });
    });

    app.post('/addUnit', function (req, res) {
        var description = req.body.description.trim();
        var groupid = req.body.groupname.trim();

        function addUnit(callback) {
            unitModel.addUnit(description, groupid, function (err, result) {
                if (callback) {
                    res.send(result);
                    callback(err, result);
                }

            });
        }

        addUnit(function (err, res) {

        });
    });


    app.post('/addGroup', function (req, res) {

        function addGroup(callback) {
            var groupName = req.body.name;
            unitModel.createGroup(groupName, function (err, result) {
                if (callback) {
                    callback(err, result);
                    res.send(result);
                }
            })
        }

        addGroup(function (err, res) {
        });
    });


    app.post("/getGroups", function (req, res) {
        function getGroups(callback) {
            unitModel.listGroup(function (err, result) {
                if (callback) {
                    res.send(result);
                    callback(err, result);
                }
            })
        }

        getGroups(function (err, res) {
        });
    });

    app.post("/toggleUnit", function (req, res){
        console.log('Kaller routes');
        function toggleUnit (callback){
            var id = req.body.unitId;
            var state = req.body.state;
            console.log('inne i toggleUnit med verdier' + "newstate: "+state + "id: "+id);
            unitModel.toggleUnit(state, id, function (err, result){
                if(callback){
                    res.send(result);
                    callback(err, result);
                }
            })
        }
        toggleUnit(function(err, res){

        });
    });
};
