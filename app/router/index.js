'use strict';

let express = require('express');
let router = express.Router();

let path = require('path');

let passport = require('../passport');

let rootdir = { root: path.join(__dirname, '../../') };

// Redirects if not logged in
let isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    //res.redirect('/login?redirect=' + req.originalUrl);
    res.sendStatus(401);
  }
};

let isAuthenticatedDNE = function(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.sendStatus(404);
  }
};

/*router.get ('/', function (req, res) {
    if (req.isAuthenticated()) {
        res.redirect('/home.html');
    } else {
        res.redirect('/login.html');
    }
});*/

router.get('/login', function(req, res) {
  if (req.query.redirect) {
    req.session.return_to = req.query.redirect;
  }
  res.sendFile(path.join('public/html/login.html'), rootdir);
  //res.redirect('/login.html?redirect=' + req.query.redirect);
});

router.get('/home', isAuthenticated, function(req, res) {
  res.sendFile(path.join('public/html/home.html'), rootdir);
});

router.get('/profile', isAuthenticated, function(req, res) {
  res.sendFile(path.join('public/html/profile.html'), rootdir);
});

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
  })
);

router.post('/login/ajax', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.send({
        success: false,
        message: info.message ? info.message : 'Authentication Failed',
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      let redirect = req.session.return_to ? req.session.return_to : '/home';
      delete req.session.return_to;
      return res.send({
        success: true,
        redirect: redirect,
      });
    });
  })(req, res, next);
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/user', isAuthenticatedDNE, function(req, res) {
  res.send({
    displayname: req.user.displayName,
  });
});

router.get('/info', isAuthenticatedDNE, function(req, res) {
  res.send({
    username: req.user.username,
    userid: req.user.id,
    displayname: req.user.displayName,
    emails: req.user.emails,
  });
});

module.exports = router;
