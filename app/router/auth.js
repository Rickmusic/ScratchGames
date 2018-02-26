'use strict';

let express = require('express');
let router = express.Router();

let path = require('path');

let passport = require('../passport');
let mailer = require('../mailer');
let logger = require('winston').loggers.get('auth');
let db = require('../db/');
let Token = db.models.token;

let rootdir = { root: path.join(__dirname, '../../') };

router.get('/login', function(req, res) {
  if (req.isAuthenticated()) return res.redirect('/home');

  if (req.query.redirect) req.session.return_to = req.query.redirect;
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
      return res.json({
        success: false,
        message: info.message ? info.message : 'Authentication Failed',
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      logger.info('Login ' + req.user.displayName + ': Success');
      let redirect = req.session.return_to ? req.session.return_to : '/home';
      delete req.session.return_to;
      return res.json({
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

    mailer.sendVerification(req, function(err) {
      if (err)
        return logger.warn(
          'Signup ' +
            req.user.displayName +
            ' - Failed to Send Verification Email'
        );
      return logger.info(
        'Signup ' + req.user.displayName + ' - Verification Email Sent'
      );
    });
  }
);

router.post('/signup/ajax', function(req, res, next) {
  passport.authenticate('local-signup', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.json({
        success: false,
        message: info.message ? info.message : 'Signup Failed',
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      mailer.sendVerification(req, function(err) {
        if (err)
          return logger.warn(
            'Signup ' +
              req.user.displayName +
              ' - Failed to Send Verification Email'
          );
        return logger.info(
          'Signup ' + req.user.displayName + ' - Verification Email Sent'
        );
      });
      return res.json({
        success: true,
        redirect: '/home',
      });
    });
  })(req, res, next);
});

router.get('/verify', function(req, res) {
  if (!req.query.token) {
    logger.warn('Verify called without a token');
    return res.sendStatus(400);
  }
  process.nextTick(function() {
    Token.findOne({ where: { token: req.query.token } })
      .then(token => {
        if (!token || token.type !== 'verify') {
          logger.warn('Verify Token not found');
          return res.sendStatus(400);
        }
        if (token.hasExpired()) {
          logger.warn('Verify Token has expired');
          return res.send('Token has expired.');
        }
        token
          .getUser()
          .then(user => {
            if (!user) {
              logger.error('Verify user not found');
              return res.sendStatus(400);
            }
            user
              .update({ status: 'active' })
              .then(() => res.redirect('/login'))
              .catch(err => logger.error('Verify Update User Status: ' + err));
          })
          .catch(err => logger.error('Verify Get User Error: ' + err));
      })
      .catch(err => logger.error('Verify Get Token Error: ' + err));
  });
});

router.get('/auth/facebook', passport.authenticate('facebook'));

router.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    logger.info('Facebook Auth ' + req.user.displayName + ': Success');
    res.redirect('/home');
  }
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
    logger.info('Google Auth ' + req.user.displayName + ': Success');
    res.redirect('/home');
  }
);

router.get('/logout', function(req, res) {
  logger.verbose('Logout ' + req.user.displayName);
  req.logout();
  res.redirect('/');
});

module.exports = router;
