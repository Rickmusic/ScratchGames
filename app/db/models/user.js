'use strict';

let init = (sequelize, DataTypes) => {
  let User = sequelize.define(
    'user',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      displayName: { type: DataTypes.STRING },
      status: {
        type: DataTypes.ENUM,
        values: ['online', 'offline'],
        allowNull: false,
        defaultValue: 'online',
      },
      role: {
        type: DataTypes.ENUM,
        values: ['host', 'player', 'spectator'],
      },
      accountStatus: {
        type: DataTypes.ENUM,
        values: ['active', 'pending', 'limited', 'deleted'],
        allowNull: false,
        defaultValue: 'limited',
      },
    },
    {
      tableName: 'users',
    }
  );

  User.prototype.validatePassword = function(password, callback) {
    let user = this;
    if (callback) {
      this.validatePassword(password)
        .then(isMatch => callback(null, isMatch))
        .catch(err => callback(err));
      return;
    }

    return new Promise((fulfill, reject) => {
      user
        .getAuth()
        .then(auth => {
          auth
            .validatePassword(password)
            .then(isMatch => fulfill(isMatch))
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  };

  User.prototype.updatePassword = function(password, callback) {
    let user = this;
    if (callback) {
      this.updatePassword(password)
        .then(() => callback(null))
        .catch(err => callback(err));
      return;
    }

    return new Promise((fulfill, reject) => {
      user
        .getAuth()
        .then(auth => {
          auth
            .updatePassword(password)
            .then(() => fulfill())
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  };

  User.prototype.storeFacebookToken = function(token, callback) {
    let user = this;
    if (callback) {
      this.storeFacebookToken(token)
        .then(() => callback(null))
        .catch(err => callback(err));
      return;
    }

    return new Promise((fulfill, reject) => {
      user
        .getAuth()
        .then(auth => {
          auth
            .storeFacebookToken(token)
            .then(() => fulfill())
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  };

  User.prototype.storeGoogleToken = function(token, callback) {
    let user = this;
    if (callback) {
      this.storeGoogleToken(token)
        .then(() => callback(null))
        .catch(err => callback(err));
      return;
    }

    return new Promise((fulfill, reject) => {
      user
        .getAuth()
        .then(auth => {
          auth
            .storeGoogleToken(token)
            .then(() => fulfill())
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  };

  return User;
};

module.exports = init;
