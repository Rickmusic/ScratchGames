'use strict';

let express = require('express');
let router = express.Router();

let path = require('path');

let auth = require('./auth');

let rootdir = { root: path.join(__dirname, '../../') };

// Redirects if not logged in
let isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/login?redirect=' + encodeURIComponent(req.originalUrl));
  }
};

/*let isAuthenticatedAPI = function(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.sendStatus(401);
  }
};*/

let isAuthenticatedDNE = function(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.sendStatus(404);
  }
};

// Handeled by Nginx
/*router.get ('/', function (req, res) {
    if (req.isAuthenticated()) {
        res.redirect('/home.html');
    } else {
        res.redirect('/login.html');
    }
});*/

router.get('/home', isAuthenticated, function(req, res) {
  res.sendFile(path.join('public/html/home.html'), rootdir);
});

router.get('/profile', isAuthenticated, function(req, res) {
  res.sendFile(path.join('public/html/profile.html'), rootdir);
});

router.get('/user', isAuthenticatedDNE, function(req, res) {
  res.send({ displayname: req.user.displayName });
});

router.get('/info', isAuthenticatedDNE, function(req, res) {
  res.send({
    userid: req.user.id,
    displayname: req.user.displayName,
    status: req.user.status,
  });
});

router.use('/', auth);

module.exports = router;
