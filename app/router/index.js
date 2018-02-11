'use strict';

let express = require('express');
let router = express.Router();

let path = require('path');

let passport = require('../passport');

router.get ('/', function (req, res) {
    if (req.isAuthenticated()) {
        res.redirect('/home.html');
    } else {
        res.redirect('/login.html');
    }
});

router.get ('/login', function (req, res) {
    res.redirect('/login.html');
});

router.get ('/profile', function (req, res) {
    if (req.isAuthenticated()) {
        res.redirect('/profile.html');
    } else {
        res.redirect('/');
    }
});

router.post ('/login', function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
		if (err) { return next(err); }
		if (!user) { 
			return res.send({
				success: false,
				message: info.message ? info.message : 'Authentication Failed'
			}); 
		}
		req.logIn(user, function(err) {
			if (err) { return next(err); }
			return res.send({
				success: true,
				redirect: '/node/'
			});
		});
	})(req, res, next);
});

router.get('/logout', function (req, res){
    req.logout();
    res.redirect('/');
});

router.get ('/user', function (req, res) {
    res.send({
       displayname: req.user.displayName
    });  
});

router.get ('/info', function (req, res) {
    res.send({
        username: req.user.username,
        userid: req.user.id,
        displayname: req.user.displayName,
        emails: req.user.emails
    });
});

module.exports = router;
