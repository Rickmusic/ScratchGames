'use strict';

let express = require('express');
let router = express.Router();

let path = require('path');

let passport = require('../passport');

let rootdir = { root: path.join(__dirname, '../../') };

router.get('/login', function(req, res) {
  if (req.query.redirect) {
    req.session.return_to = req.query.redirect;
  }
  res.sendFile(path.join('public/html/login.html'), rootdir);
  //res.redirect('/login.html?redirect=' + req.query.redirect);
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

router.get('/auth/facebook', passport.authenticate('facebook'));

router.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/home',
    failureRedirect: '/login',
  })
);

router.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/plus.login'],
  })
);

router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/home');
  }
);

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
