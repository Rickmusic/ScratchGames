'use strict';

let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let FacebookStrategy = require('passport-facebook').Strategy;
let GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

let config = require('../config');
let User = require('../db').schemas.user;

let local = new LocalStrategy(function(username, password, done) {
  process.nextTick(function() {
    User.findOne({
      where: {
        username: username.toLowerCase(),
      },
    })
      .then(user => {
        if (!user) {
          return done(null, false, {
            message: 'Incorrect username or password.',
          });
        }

        user
          .validatePassword(password)
          .then(isMatch => {
            if (!isMatch) {
              return done(null, false, {
                message: 'Incorrect username or password.',
              });
            }
            return done(null, user);
          })
          .catch(err => {
            return done(err);
          });
      })
      .catch(err => {
        return done(err);
      });
  });
});

let localsignup = new LocalStrategy(function(username, password, done) {
  process.nextTick(function() {
    User.findOne({
      where: {
        username: username.toLowerCase(),
      },
    })
      .then(user => {
        if (user) {
          return done(null, false, {
            message: 'Username already exists.',
          });
        }

        User.create({
          username: username,
        }).then(user => {
          user.updatePassword(password);
          return done(null, user);
        });
      })
      .catch(err => {
        return done(err);
      });
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
      User.findOrCreate({
        where: {
          facebookId: profile.id,
        },
        defaults: {
          state: 'active',
          displayName: profile.displayName,
        },
      })
        .spread((user, created) => {
          if (created) {
            console.log('Created user: ' + user);
          }
          done(null, user);
        })
        .catch(err => {
          return done(err);
        });
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
      User.findOrCreate({
        where: {
          googleId: profile.id,
        },
        defaults: {
          state: 'active',
          displayName: profile.displayName,
        },
      })
        .spread((user, created) => {
          if (created) {
            console.log('Created user: ' + user);
          }
          done(null, user);
        })
        .catch(err => {
          return done(err);
        });
    });
  }
);

let init = function() {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id)
      .then(user => {
        done(null, user);
      })
      .catch(err => {
        return done(err);
      });
  });

  passport.use(local);
  passport.use('local-signup', localsignup);

  passport.use(facebook);

  passport.use(google);

  return passport;
};

module.exports = init();
