'use strict';

let bcrypt = require('bcrypt-nodejs');

let init = (sequelize, DataTypes) => {
  let Auth = sequelize.define(
    'auth',
    {
      username: {
        type: DataTypes.STRING,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
      },
      googleId: {
        type: DataTypes.STRING,
        unique: true,
      },
      facebookId: {
        type: DataTypes.STRING,
        unique: true,
      },
      state: {
        type: DataTypes.ENUM,
        values: ['active', 'pending', 'deleted'],
        allowNull: false,
        defaultValue: 'pending',
      },
    },
    {
      getterMethods: {},
      setterMethods: {},
      tableName: 'authorization',
    }
  );

  Auth.prototype.validatePassword = function(password, callback) {
    if (callback) {
      this.validatePassword(password)
        .then(isMatch => {
          callback(null, isMatch);
        })
        .catch(err => {
          callback(err);
        });
      return;
    }

    return new Promise((fulfill, reject) => {
      bcrypt.compare(password, this.password, function(err, isMatch) {
        if (err) return reject(err);
        return fulfill(isMatch);
      });
    });
  };

  Auth.prototype.updatePassword = function(password, callback) {
    let auth = this;
    if (callback) {
      this.updatePassword(password)
        .then(() => {
          callback();
        })
        .catch(err => {
          callback(err);
        });
      return;
    }

    return new Promise((fulfill, reject) => {
      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, null, function(err, hash) {
          if (err) return reject(err);
          auth
            .update({ password: hash })
            .then(() => {
              fulfill();
            })
            .catch(err => {
              reject(err);
            });
        });
      });
    });
  };

  return Auth;
};

module.exports = init;
