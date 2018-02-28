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
      firstName: { type: DataTypes.STRING },
      lastName: { type: DataTypes.STRING },
      displayName: { type: DataTypes.STRING },
      status: {
        type: DataTypes.ENUM,
        values: ['active', 'pending', 'limited', 'deleted'],
        allowNull: false,
        defaultValue: 'limited',
      },
    },
    {
      getterMethods: {
        fullName() {
          return this.firstname + ' ' + this.lastname;
        },
      },
      setterMethods: {},
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

  return User;
};

module.exports = init;
