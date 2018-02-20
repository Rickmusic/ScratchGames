'use strict';

let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;

let db = require('../db');

let init = function() {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    db.users.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use(
    new LocalStrategy(function(username, password, done) {
      db.users.findByUsername({ username: new RegExp(username, 'i') }, function(
        err,
        user
      ) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, {
            message: 'Incorrect username or password.',
          });
        }

        user.validatePassword(password, function(err, isMatch) {
          if (err) {
            return done(err);
          }
          if (!isMatch) {
            return done(null, false, {
              message: 'Incorrect username or password.',
            });
          }
          return done(null, user);
        });
      });
    })
  );

  return passport;
};

module.exports = init();
