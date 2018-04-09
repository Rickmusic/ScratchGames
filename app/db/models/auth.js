'use strict';

let bcrypt = require('../../bcrypt');

let init = (sequelize, DataTypes) => {
  let Auth = sequelize.define(
    'auth',
    {
      username: {
        type: DataTypes.STRING,
        unique: true,
      },
      password: { type: DataTypes.STRING },
      email: {
        type: DataTypes.STRING,
        unique: true,
        validate: { isEmail: true },
      },
      facebookId: {
        type: DataTypes.STRING,
        unique: true,
      },
      facebookToken: { type: DataTypes.STRING },
      facebookName: { type: DataTypes.STRING },
      googleId: {
        type: DataTypes.STRING,
        unique: true,
      },
      googleToken: { type: DataTypes.STRING },
      googleName: { type: DataTypes.STRING },
    },
    { tableName: 'authorization' }
  );

  Auth.prototype.validatePassword = function(password, callback) {
    if (callback) {
      this.validatePassword(password)
        .then(isMatch => callback(null, isMatch))
        .catch(err => callback(err));
      return;
    }

    return new Promise((fulfill, reject) => {
      bcrypt
        .compare(password, this.password)
        .then(isMatch => fulfill(isMatch))
        .catch(err => reject(err));
    });
  };

  Auth.prototype.updatePassword = function(password, callback) {
    let auth = this;
    if (callback) {
      this.updatePassword(password)
        .then(() => callback(null))
        .catch(err => callback(err));
      return;
    }

    return new Promise((fulfill, reject) => {
      bcrypt
        .hash(password)
        .then(hash => {
          auth
            .update({ password: hash })
            .then(() => fulfill())
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  };

  Auth.prototype.storeFacebookToken = function(token, callback) {
    let auth = this;
    if (callback) {
      this.storeFacebookToken(token)
        .then(() => callback(null))
        .catch(err => callback(err));
      return;
    }

    return new Promise((fulfill, reject) => {
      bcrypt
        .hash(token)
        .then(hash => {
          auth
            .update({ facebookToken: hash })
            .then(() => fulfill())
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  };

  Auth.prototype.storeGoogleToken = function(token, callback) {
    let auth = this;
    if (callback) {
      this.storeGoogleToken(token)
        .then(() => callback(null))
        .catch(err => callback(err));
      return;
    }

    return new Promise((fulfill, reject) => {
      bcrypt
        .hash(token)
        .then(hash => {
          auth
            .update({ googleToken: hash })
            .then(() => fulfill())
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  };

  return Auth;
};

module.exports = init;
