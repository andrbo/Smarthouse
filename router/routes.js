module.exports = function (app, passport) {


    var generator = require('generate-password');
    var nodemailer = require('nodemailer');
    var User = require('../models/User');
    var validator = require('validator');
    var flash = require('connect-flash');
    var bcrypt = require('bcryptjs');




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
        };
    });

    app.get('/about', function (req, res) {
        if (req.isAuthenticated()) {
            res.render("about", {
                login: true,
                loginUsername: req.user.email
            });
        } else {
            res.render("about", {login: false});
        };
    });

    app.get('/security', function (req, res) {
        if (req.isAuthenticated()) {
            res.render("security", {
                login: true,
                loginUsername: req.user.email
            });
        } else {
            res.render("security", {login: false});
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
        failureRedirect: '/about',
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
};
