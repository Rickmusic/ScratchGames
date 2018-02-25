'use strict';

let moment = require('moment');
let crypto = require('crypto');

let init = (sequelize, DataTypes) => {
  let Token = sequelize.define(
    'token',
    {
      token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      type: {
        type: DataTypes.ENUM,
        values: ['verify', 'pwdreset'],
        defaultValue: 'verify',
        allowNull: false,
      },
      expires: {
        type: DataTypes.DATE,
        defaultValue: () =>
          moment()
            .utc()
            .add(2, 'hours')
            .format(),
      },
    },
    {
      getterMethods: {},
      setterMethods: {},
      tableName: 'tokens',
    }
  );

  Token.createVerifyToken = function(user, callback) {
    if (callback) {
      this.createVerifyToken(user)
        .then(token => callback(null, token))
        .catch(err => callback(err));
      return;
    }
    return new Promise((fulfill, reject) => {
      Token.create({
        token: crypto
          .randomBytes(180)
          .toString('base64') // Gives non url safe: char62: +  char63: /
          .replace(/\+/g, '-') // URL safe: use minus(-) and underscore(_)
          .replace(/\//g, '_')
          .replace(/=/g, ''), // Strip any = representing padding (aka unused bits)
        type: 'verify',
        userId: user.id, // userId field created by belongsTo() in ../index.js
      })
        .then(token => fulfill(token.token))
        .catch(err => reject(err));
    });
  };

  Token.createPasswordResetToken = function(user, callback) {
    if (callback) {
      this.createPasswordResetToken(user)
        .then(token => callback(null, token))
        .catch(err => callback(err));
      return;
    }
    return new Promise((fulfill, reject) => {
      Token.create({
        token: crypto
          .randomBytes(180)
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, ''),
        type: 'pwdreset',
        userId: user.id,
      })
        .then(token => fulfill(token.token))
        .catch(err => reject(err));
    });
  };

  return Token;
};

module.exports = init;
