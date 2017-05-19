/*
Routes is used to render views if the user is authenticated. File also contains CRUD operations to DB.
 */

module.exports = function (app, passport) {

    var generator = require('generate-password');
    var nodemailer = require('nodemailer');
    var User = require('../models/User');
    var flash = require('connect-flash');
    var db = require('../middlewares/db');
    var bcrypt = require('bcryptjs');
    var calModal = require('../models/calendar');
    var shopModal = require('../models/shop');
    var unitModel = require('../models/units');
    var alarmModal = require('../models/alarm');

    app.get('/', function (req, res) {
        res.render('home');
    });

    //If authenticated by passport render home.
    app.get('/home', function (req, res) {
        if (req.isAuthenticated()) {
            res.render("home", {
                login: true,
                loginUsername: req.user.email,
                loginFirstname: req.user.firstname
            });
        } else {
            res.render("home");
        }
    });

    //If authenticated by passport render calendar.
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

    //If authenticated by passport render security.
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

    //If authenticated by passport render units.
    app.get('/units', function (req, res) {
        if (req.isAuthenticated()) {
            res.render("units", {
                login: true,
                loginUsername: req.user.email
            });
        } else {
            req.flash("error_msg", res.__('Login-Required'));
            res.redirect("home");
        }
    });

    //Process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/home',
        failureRedirect: '/home',
        failureFlash: true
    }));

    //Process the register form
    app.post('/register', passport.authenticate('local-signup', {
        successRedirect: '/home',
        failureRedirect: '/home',
        failureFlash: true
    }));

    //Logout. Destroy session.
    app.get('/logout', function (req, res) {
        req.logout();
        req.flash("success_msg", res.__('Logout-Success'));
        res.redirect('/');
    });

    //Forgot password. Send new to mail.
    app.post('/forgot', function (req, res) {
        var email = req.body.forgotEmail;

        var randomPassword = generator.generate({
            length: 10,
            numbers: true
        });

        function forgotPassword(password, email) {
            User.forgotPassword(password, email, function (err) {
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


        //Send mail with new password
        function sendMail(email, password) {
            var smtpTransport = nodemailer.createTransport({
                service: "Gmail",  //Automatically sets host, port and connection security settings
                auth: {
                    user: "Smarthus2017@gmail.com",
                    pass: "basf2DDX"
                }
            });
            smtpTransport.sendMail({
                from: "<Smarthus2017@gmail.com>", //Sender address. Must be the same as authenticated user if using Gmail.
                to: email, // receiver
                subject: "New password", //TODO: Fiks internasjonalisering
                text: "Hei! Ditt nye passord er: " + password + "\n\n" + "Med vennlig hilsen Smarthus-teamet"// body
            }, function (error) {  //callback
                if (error) {

                } else {
                    res.redirect('/home');
                }
                smtpTransport.close(); //Shut down the connection, no more messages.
            });
        }

    });

    //If authenticated by passport render profile.
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

    //Update user password.
    app.post('/updateUserPassword', function (req, res) {
        var email = req.user.email;
        //var email = req.body.email; //For test usage only
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

    //Get all users
    app.get("/users", function (req, res) {
        var email = req.user.email;
        //var email = req.body.email; //For testing purposes

        function getAllUsers(callback) {
            User.getAllUsers(email, function (err, result) {
                callback(err, result);
                res.send(result);
            })
        }

        getAllUsers(function () {
        });
    });

    //Update user profile
    app.put("/users", function (req, res) {
        var email = req.user.email;
        //var email = req.body.emailTest; //For test purposes only
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
        }

        updateProfile(function (err, res) {
        });
    });


    //CALENDAR BEGINS HERE
    app.get("/getUserEvents", function (req, res) {
        var email = req.user.email;
        //var email = req.body.email; //For test purposes only

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

    //Get all participants for given event.
    app.get("/participants/:id", function (req, res) {
        var id = req.params.id;
        function getParticipants(callback) {
            calModal.getParticipants(id, function (err, result) {
                if (callback) {
                    res.send(result);
                    callback(err, result);
                }
            })
        }

        getParticipants(function (err, result) {
        });
    });

    //Get all events.
    app.get("/events", function (req, res) {
        function getAllEvents(callback) {
            calModal.getAllEvents(function (err, result) {
                if (callback) {
                    res.send(result);
                    callback(err, result);
                }
            })
        }

        getAllEvents(function (err, result) {
        });
    });

    //Add new event
    app.post("/events", function (req, res) {
        var email = req.user.email;
        var title = req.body.title;
        var description = req.body.description;
        var start = req.body.start;
        var end = req.body.end;
        var participants = req.body.participants;

        function addEvent(callback) {
            calModal.addEvent(email, title, description, start, end, participants, function (err, result) {
                if (callback) {
                    callback(err, result);
                }
            })
        }

        addEvent(function (err, res) {
        });
    });

    //Delete event by id.
    app.delete("/events/:id", function (req, res) {
        var id = req.params.id;

        function deleteEvent(callback) {
            calModal.deleteEvent(id, function (err, result) {
                callback(err, result);
            })
        }

        deleteEvent(function (err, res) {
        })
    });

    //Update event by id.
    app.put("/events/:id", function (req, res) {
        var id = req.params.id;
        var start = req.body.start;
        var end = req.body.end;
        var title = req.body.title;
        var description = req.body.description;
        var participants = req.body.participants;

        function updateEvent(callback) {
            calModal.updateEvent(title, description, start, end, participants, id, function (err, result) {
                callback(err, result);
            });
        }

        updateEvent(function (err, res) {
        });
    });

    //Update date if event is dragged.
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

    //SHOPPING LIST BEGINS HERE
    //Get shopping list
    app.get("/shoppingList", function (req, res) {
        function getShoppingList(callback) {
            shopModal.getShoppingList(function (err, result) {
                if (callback) {
                    res.send(result);
                    callback(err, result);
                }
            })
        }

        getShoppingList(function (err, result) {
        });
    });

    //Remove product by id.
    app.delete("/shoppingList/:id", function (req, res) {
        var id = req.params.id;
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

    //Add a new product to the shopping list.
    app.post("/shoppingList", function (req, res) {
        var description = req.body.description;

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


    //ALARM BEGINS HERE

    //Toggle alarm on/off
    app.post('/alarm', function (req, res) {
        var activated = req.body.alarm;

        function toggleAlarm(id, callback) {
            if (activated == "true") {
                alarmModal.activateAlarm(id, function (err, result) {
                    if (callback) {
                        res.send(result);
                        callback(err, result);
                    }
                })
            } else {
                alarmModal.deActivateAlarm(id, function (err, result) {
                    if (callback) {
                        res.send(result);
                        callback(err, result);
                    }
                })
            }
        }

        toggleAlarm(1, function (err, result) {
        })
    });

    //Get the alarm state.
    app.get("/alarm", function (req, res) {
        function getState(id, callback) {
            alarmModal.getAlarmState(id, function (err, result) {
                if (callback) {
                    res.send(result);
                    callback(err, result);
                }
            })
        }

        getState(1, function (err, result) {
        });
    });

    //Check alarm pw
    app.post('/alarmPw', function (req, res) {
        var input = req.body.pw;

        function getPassword(id, callback) {
            alarmModal.getAlarm(id, function (err, result) {
                if (callback) {
                    var pwFromdb = result[0].password;
                    crypt(input, pwFromdb, function (err, result) {
                        if (result === true) {
                            res.send(true);
                        } else {
                            res.send(false);
                        }
                    });
                }
            });
        }

        getPassword(1, function (err, result) {
        });
    });

    //Update alarm password.
    app.put('/alarm', function (req, res) {
        var oldPassword = req.body.oldPassword;
        var newPassword = req.body.newPassword;

        function validatePassword(id, callback) {
            alarmModal.getAlarmPassword(id, function (err, pwFromDb) {
                if (callback) {
                    crypt(oldPassword, pwFromDb[0].password, function (err, result) { //Comparing oldPassword to current password with hashing.
                        if (result === true) {
                            hashPassword(newPassword, function (err, newPass) {
                                if (err) {
                                    return err
                                } else {
                                    alarmModal.updateAlarmPassword(newPass, id, function (err, result) {
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

        validatePassword(1, function (err, result) {
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


    //UNITS BEGINS HERE
    //Get all units
    app.get('/unitsData', function (req, res) {
        function getUnits(callback) {
            unitModel.getUnits(function (err, result) {
                if (callback) {
                    callback(err, result);
                    res.send(result);
                }

            });
        }

        getUnits(function (err, res) {

        });
    });


    //Add new unit
    app.post('/units', function (req, res) {
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

    //Delete a unit
    app.delete("/units/:unitno", function (req, res) {
        var id = req.params.unitno;

        console.log("ID: " + id);
        function deleteDevice(callback) {
            unitModel.deleteDevice(id, function (err, result) {
                if (callback) {
                    res.send(result);
                    callback(err, result);
                }
            });
        }

        deleteDevice(function (err, res) {
        });
    });

    //Update a unit
    app.put("/units/:unitno", function (req, res) {
        function changeDevice(callback) {
            var id = req.params.unitno;
            var description = req.body.description;
            var groupid = req.body.groupid;
            var luxstate = req.body.luxstate;
            var luxtresh = req.body.luxtresh;
            unitModel.changeDevice(id, description, groupid, luxstate, luxtresh, function (err, result) {
                if (callback) {
                    res.send(result);
                    callback(err, result);
                }
            });
        }

        changeDevice(function (err, res) {
        });
    });

    //Turn unit on/off
    app.post("/toggleUnit/:id", function (req, res) {
        function toggleUnit(callback) {
            console.log("ID ********** " + req.params.id);
            var id = req.params.id;
            var state = req.body.state;
            unitModel.toggleUnit(state, id, function (err, result) {
                if (callback) {
                    callback(err, result);
                    res.send({id: id});
                }
            })
        }

        toggleUnit(function (err, res) {

        });
    });

    //Delete group from unit
    app.post("/deleteGroupUnit", function (req, res) {
        function removeGroupFromUnit(callback) {
            var id = req.body.groupId;
            unitModel.removeGroupFromUnit(id, function (err, result) {
                if (callback) {
                    res.send(result);
                    callback(err, result);
                }
            });
        }
        removeGroupFromUnit(function (err, result) {
        });
    });

    //Get units belonging to group.
    app.get('/getUnitsOfGroup', function (req, res) {
        var groupId = req.body.groupId;
        console.log("GROUPID CONTROLLER: " + groupId)

        function getUnitsOfGroup(callback) {
            unitModel.getUnitsOfGroup(groupId, function (err, result) {
                if (callback) {
                    console.log("**************" +JSON.stringify(result));
                    callback(err, result);
                    res.send(result);
                }
            });
        }

        getUnitsOfGroup(function (err, res) {

        });
    });

    //Add new group
    app.post('/groups', function (req, res) {
        function addGroup(callback) {
            var groupName = req.body.name;
            unitModel.createGroup(groupName, function (err, result) {
                if (callback) {
                    if (err) {
                        res.send({addError: 1})
                    }
                    callback(err, result);
                    res.send(result);
                }
            })
        }

        addGroup(function (err, res) {
        });
    });


    //Get all groups.
    app.get("/groups", function (req, res) {
        function getGroups(callback) {
            unitModel.listGroup(function (err, result) {
                if (callback) {
                    callback(err, result);
                    res.send(result);
                }
            })
        }

        getGroups(function (err, res) {
        });
    });

    //Turn group on/off
    app.put("/groups/:id", function (req, res) {
        function toggleGroup(callback) {
            var groupId = req.params.id;
            var newGroupState = req.body.state;
            unitModel.toggleGroup(groupId, newGroupState, function (err, result) {
                if (callback) {
                    callback(err, result);
                    res.send(result);
                }
            });
        }

        toggleGroup(function (err, res) {
        });
    });

    //Delete group
    app.delete("/groups/:id", function (req, res) {
        function deleteGroup(callback) {
            var groupId = req.params.id;

            unitModel.deleteGroup(groupId, function (err, result) {
                if (callback) {
                    res.send(result);
                    callback(err, result);
                }
            });
        }

        deleteGroup(function (err, result) {
        });
    });
};
