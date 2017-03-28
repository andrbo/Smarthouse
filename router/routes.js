module.exports = function (app, passport) {

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
};