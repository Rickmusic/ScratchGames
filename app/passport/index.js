'use strict';

let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let FacebookStrategy = require('passport-facebook').Strategy;
let GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

let config = require('../config');
let db = require('../db');
let Auth = db.models.auth;
let User = db.models.user;
let UserAuth = db.associations.userauth;

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
    Auth.findOne({ where: { username: username.toLowerCase() } })
      .then(auth => {
        if (!auth) {
          return done(null, false, {
            message: 'Incorrect username or password.',
          });
        }

        auth
          .validatePassword(password)
          .then(isMatch => {
            if (!isMatch) {
              return done(null, false, {
                message: 'Incorrect username or password.',
              });
            }

            return deserializeUser(auth.userId, done);
          })
          .catch(err => done(err));
      })
      .catch(err => done(err));
  });
});

let localsignup = new LocalStrategy(function(username, password, done) {
  process.nextTick(function() {
    Auth.findOne({ where: { username: username.toLowerCase() } })
      .then(user => {
        if (user)
          return done(null, false, { message: 'Username already exists.' });

        User.create(
          {
            displayName: username,
            auth: { username: username.toLowerCase() },
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

let facebook = new FacebookStrategy(
  {
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    callbackURL: config.facebook.callbackURL,
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
      Auth.findOne({ where: { facebookId: profile.id } })
        .then(auth => {
          if (auth) return deserializeUser(auth.userId, done);

          User.create(
            {
              displayName: profile.displayName,
              auth: {
                facebookId: profile.id,
                facebookToken: accessToken,
                facebookName: profile.displayName,
                state: 'active',
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
      Auth.findOne({ where: { googleId: profile.id } })
        .then(auth => {
          if (auth) return deserializeUser(auth.userId, done);

          User.create(
            {
              displayName: profile.displayName,
              auth: {
                googleId: profile.id,
                googleToken: accessToken,
                googleName: profile.displayName,
                state: 'active',
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
  passport.serializeUser(serializeUser);
  passport.deserializeUser(deserializeUser);

  passport.use(local);
  passport.use('local-signup', localsignup);

  passport.use(facebook);

  passport.use(google);

  return passport;
};

module.exports = init();
