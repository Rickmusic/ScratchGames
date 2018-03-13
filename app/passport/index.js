'use strict';

let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let FacebookStrategy = require('passport-facebook').Strategy;
let GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
let RememberMeStrategy = require('passport-remember-me-extended').Strategy;

let config = require('../config');
let logger = require('winston').loggers.get('auth');
let db = require('../db');
let { Auth, Token, User } = db.models;
let { UserAuth } = db.associations;

let serializeUser = function(user, done) {
  done(null, user.id);
};

let deserializeUser = function(id, done) {
  User.findById(id)
    .then(user => done(null, user))
    .catch(err => done(err));
};

let local = new LocalStrategy(function(username, password, done) {
  process.nextTick(function() {
    logger.verbose('Login ' + username);
    logger.silly('user: ' + username + ' pwd: ' + password);
    Auth.findOne({ where: { username: username.toLowerCase() } })
      .then(auth => {
        if (!auth) {
          logger.warn('Login ' + username + ' Failed: User not found');
          return done(null, false, {
            message: 'Incorrect username or password.',
          });
        }

        auth
          .validatePassword(password)
          .then(isMatch => {
            if (!isMatch) {
              logger.warn('Login ' + username + ' Failed: Incorrect Password');
              return done(null, false, {
                message: 'Incorrect username or password.',
              });
            }

            logger.debug('Login ' + username + ': Correct Password');
            return deserializeUser(auth.userId, done);
          })
          .catch(err => done(err));
      })
      .catch(err => done(err));
  });
});

let localsignup = new LocalStrategy({ passReqToCallback: true }, function(
  req,
  username,
  password,
  done
) {
  process.nextTick(function() {
    logger.verbose('Signup User ' + username);
    logger.silly('user: ' + username + ' pwd: ' + password);
    let lookupUsername = Auth.findOne({
      where: { username: username.toLowerCase() },
    });
    let lookupEmail = Auth.findOne({ where: { email: req.body.email } });
    Promise.all([lookupUsername, lookupEmail])
      .then(promises => {
        let user = promises[0];
        let email = promises[1];
        if (user) {
          logger.warn(
            'Signup ' + username + ' Failed: Username already exists'
          );
          return done(null, false, { message: 'Username already exists.' });
        }
        if (email) {
          logger.warn('Signup ' + username + ' Failed: Email already exists');
          return done(null, false, { message: 'Email already exists.' });
        }

        logger.debug('Signup ' + username + ': Creating New User');

        User.create(
          {
            displayName: username,
            auth: { username: username.toLowerCase(), email: req.body.email },
          },
          { include: [UserAuth] }
        )
          .then(user => {
            user
              .updatePassword(password)
              .then(() => done(null, user))
              .catch(err => done(err));
          })
          .catch(err => done(err));
      })
      .catch(err => done(err));
  });
});

let rememberme = new RememberMeStrategy(
  function(token, done) {
    Token.consumeRememberMeToken(token, function(err, user) {
      if (err) return done(err);
      if (!user) return done(null, false);
      return done(null, user);
    });
  },
  function(user, done) {
    Token.createRememberMeToken(user, function(err, token) {
      if (err) return done(err);
      return done(null, token);
    });
  }
);

let facebook = new FacebookStrategy(
  {
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    callbackURL: config.facebook.callbackURL,
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
      logger.verbose('Facebook Auth ' + profile.displayName);
      Auth.findOne({ where: { facebookId: profile.id } })
        .then(auth => {
          if (auth) {
            logger.debug(
              'Facebook Auth ' + profile.displayName + ': User Found'
            );
            return deserializeUser(auth.userId, done);
          }
          logger.debug(
            'Facebook Auth ' + profile.displayName + ': Creating New User'
          );

          User.create(
            {
              displayName: profile.displayName,
              status: 'active',
              auth: {
                facebookId: profile.id,
                facebookToken: accessToken,
                facebookName: profile.displayName,
              },
            },
            { include: [UserAuth] }
          )
            .then(user => done(null, user))
            .catch(err => done(err));
        })
        .catch(err => done(err));
    });
  }
);

let google = new GoogleStrategy(
  {
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL,
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
      logger.verbose('Google Auth ' + profile.displayName);
      Auth.findOne({ where: { googleId: profile.id } })
        .then(auth => {
          if (auth) {
            logger.debug('Google Auth ' + profile.displayName + ': User Found');
            return deserializeUser(auth.userId, done);
          }
          logger.debug(
            'Google Auth ' + profile.displayName + ': Creating New User'
          );

          User.create(
            {
              displayName: profile.displayName,
              status: 'active',
              auth: {
                googleId: profile.id,
                googleToken: accessToken,
                googleName: profile.displayName,
              },
            },
            { include: [UserAuth] }
          )
            .then(user => done(null, user))
            .catch(err => done(err));
        })
        .catch(err => done(err));
    });
  }
);

let init = function() {
  logger.debug('Passport Initalize');
  passport.serializeUser(serializeUser);
  passport.deserializeUser(deserializeUser);

  passport.use(local);
  passport.use('local-signup', localsignup);

  passport.use(rememberme);

  passport.use(facebook);

  passport.use(google);

  logger.debug('Passport Initalize: Compleate');

  return passport;
};

let autosaveMiddleware = function(req, res, next) {
  function afterResponse() {
    res.removeListener('finish', afterResponse);
    res.removeListener('close', afterResponse);
    if (req.user && req.user.changed()) req.user.save();
  }
  res.on('finish', afterResponse);
  res.on('close', afterResponse);
  next();
};

module.exports = {
  passport: init(),
  passportAutosave: autosaveMiddleware,
};
