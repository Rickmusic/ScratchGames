'use strict';

let express = require('express');
let router = express.Router();

let path = require('path');

let { passport } = require('../passport');
let mailer = require('../mailer');
let logger = require('winston').loggers.get('auth');
let db = require('../db/');
let { Token } = db.models;

let rootdir = { root: path.join(__dirname, '../../') };

let createRememberMeToken = function(req, res, next) {
  if (!req.body.remember_me) return next();
  logger.info('Creating Remember Me for ' + req.user.displayName);
  Token.createRememberMeToken(req.user, function(err, token) {
    if (err) return next(err);
    res.cookie('remember_me', token, {
      path: '/',
      httpOnly: true,
      secure: false,
      maxAge: 604800000, // 7 days in milliseconds
    });
    next();
  });
};

let redirectAfterLogin = function(req, res) {
  let redirectURI = req.session.return_to
    ? decodeURIComponent(req.session.return_to)
    : '/home';
  delete req.session.return_to;
  if (req.xhr)
    return res.json({
      success: true,
      redirect: redirectURI,
    });
  return res.redirect(redirectURI);
};

router.get('/login', function(req, res) {
  if (req.isAuthenticated()) return res.redirect('/home');

  if (req.query.redirect) req.session.return_to = encodeURIComponent(req.query.redirect);
  res.sendFile(path.join('public/html/login.html'), rootdir);
});

router.post(
  '/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  createRememberMeToken,
  redirectAfterLogin
);

router.post(
  '/login/ajax',
  function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) return next(err);
      if (!user) {
        return res.json({
          success: false,
          message: info.message ? info.message : 'Authentication Failed',
        });
      }
      req.logIn(user, function(err) {
        if (err) return next(err);
        logger.info('Login ' + req.user.displayName + ': Success');
        next();
      });
    })(req, res, next);
  },
  createRememberMeToken,
  redirectAfterLogin
);

router.post(
  '/signup',
  passport.authenticate('local-signup', { failureRedirect: '/login' }),
  function(req, res, next) {
    mailer.sendVerification(req, function(err) {
      if (err) {
        logger.warn(
          'Signup ' + req.user.displayName + ' - Failed to Send Verification Email'
        );
        return next(err);
      }
      logger.info('Signup ' + req.user.displayName + ' - Verification Email Sent');
      return next();
    });
  },
  redirectAfterLogin
);

router.post(
  '/signup/ajax',
  function(req, res, next) {
    passport.authenticate('local-signup', function(err, user, info) {
      if (err) return next(err);
      if (!user) {
        return res.json({
          success: false,
          message: info.message ? info.message : 'Signup Failed',
        });
      }
      req.logIn(user, function(err) {
        if (err) return next(err);
        mailer.sendVerification(req, function(err) {
          if (err) {
            logger.warn(
              'Signup ' + req.user.displayName + ' - Failed to Send Verification Email'
            );
            return next(err);
          }
          logger.info('Signup ' + req.user.displayName + ' - Verification Email Sent');
          return next();
        });
      });
    })(req, res, next);
  },
  redirectAfterLogin
);

router.get('/verify', function(req, res, next) {
  if (!req.query.token) {
    logger.warn('Verify called without a token');
    return res.sendStatus(400);
  }
  process.nextTick(function() {
    Token.findOne({ where: { token: req.query.token, type: 'verify' } })
      .then(token => {
        if (!token) {
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
              .update({ accountStatus: 'active' })
              .then(() => res.redirect('/login'))
              .catch(err => next(err));
          })
          .catch(err => next(err));
      })
      .catch(err => next(err));
  });
});

router.get('/auth/facebook', passport.authenticate('facebook'));

router.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res, next) {
    logger.info('Facebook Auth ' + req.user.displayName + ': Success');
    next();
  },
  redirectAfterLogin
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
  function(req, res, next) {
    logger.info('Google Auth ' + req.user.displayName + ': Success');
    next();
  },
  redirectAfterLogin
);

router.get('/logout', function(req, res) {
  logger.verbose('Logout ' + req.user.displayName);
  res.clearCookie('remember_me');
  req.logout();
  res.redirect('/');
});

// Redirects if not logged in
let isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/login?redirect=' + encodeURIComponent(req.originalUrl));
  }
};

// Response Status Forbidden if not logged in
let isAuthenticatedAPI = function(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.sendStatus(403);
  }
};

// Responce Status Not Found if not logged in
let isAuthenticatedDNE = function(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.sendStatus(404);
  }
};

module.exports = {
  router,
  isAuthenticated,
  isAuthenticatedAPI,
  isAuthenticatedDNE,
};
