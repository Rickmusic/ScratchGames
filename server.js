let express = require('express');
let app = express();
let port = process.env.PORT || 3000;

let flash = require('express-flash');
let session = require("express-session");
let bodyParser = require("body-parser");

let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let db = require('./app/db');

let path = require('path');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    db.users.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy(
    function(username, password, done) {
            db.users.findByUsername({ username: new RegExp(username, 'i') }, function(err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect username or password.' });
            }

            user.validatePassword(password, function(err, isMatch) {
                if (err) { return done(err); }
                if (!isMatch){
                    return done(null, false, { message: 'Incorrect username or password.' });
                }
                return done(null, user);
            });
        });
    }
));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: "keyboard cats", resave: false, saveUninitialized: false }));
//app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.get ('/', function (req, res) {
    if (req.isAuthenticated()) {
        res.sendFile(path.join(__dirname, 'public/home.html'));
    } else {
        res.sendFile(path.join(__dirname, 'public/index.html'));
    }
});

app.get ('/login', function (req, res) {
    res.render(path.join(__dirname, 'public/login.ejs'), { messages: req.flash('error') });
});

app.get ('/profile', function (req, res) {
    if (req.isAuthenticated()) {
        res.sendFile(path.join(__dirname, 'public/profile.html'));
    } else {
        res.redirect('/');
    }
});

app.post ('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true})
);

app.get('/logout', function (req, res){
    req.logout();
    res.redirect('/');
});

app.get ('/user', function (req, res) {
    res.send({
       displayname: req.user.displayName
    });  
});

app.get ('/info', function (req, res) {
    res.send({
        username: req.user.username,
        userid: req.user.id,
        displayname: req.user.displayName,
        emails: req.user.emails
    });
});

app.listen(port, function () {
    console.log('Server listening at port %d', port);
});

