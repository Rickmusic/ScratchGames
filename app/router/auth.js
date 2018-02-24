'use strict';

let express = require('express');
let router = express.Router();

let path = require('path');

let passport = require('../passport');
let mailer = require('../mailer');
let logger = require('winston');

let rootdir = { root: path.join(__dirname, '../../') };

router.get('/login', function(req, res) {
  if (req.query.redirect) {
    req.session.return_to = req.query.redirect;
  }
  res.sendFile(path.join('public/html/login.html'), rootdir);
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

router.post(
  '/signup',
  passport.authenticate('local-signup', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/home');

    /*rand = Math.floor(Math.random() * 100 + 54);
    host = req.get('host');
    link = 'http://' + req.get('host') + '/verify?id=' + rand;*/
    mailer.sendVerification(
      req.body.email,
      req.user.displayName,
      '1234',
      function(err) {
        console.log(err);
      }
    );
  }
);

/*router.get('/verify', function(req, res) {
  console.log(req.protocol + ':/' + req.get('host'));
  if (req.protocol + '://' + req.get('host') == 'http://' + host) {
    console.log('Domain is matched. Information is from Authentic email');
    if (req.query.id == rand) {
      console.log('email is verified');
      res.end('<h1>Email ' + mailOptions.to + ' is been Successfully verified');
    } else {
      console.log('email is not verified');
      res.end('<h1>Bad Request</h1>');
    }
  }
 else {
    res.end('<h1>Request is from unknown source');
  }
});*/

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
