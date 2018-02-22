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
      firstName: {
        type: DataTypes.STRING,
      },
      lastName: {
        type: DataTypes.STRING,
      },
      displayName: {
        type: DataTypes.STRING,
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
      this.validatepassword(password)
        .then(ismatch => {
          callback(null, ismatch);
        })
        .catch(err => {
          callback(err);
        });
      return;
    }

    return new Promise((fulfill, reject) => {
      user
        .getAuth()
        .then(auth => {
          auth
            .validatePassword(password)
            .then(ismatch => {
              fulfill(ismatch);
            })
            .catch(err => {
              reject(err);
            });
        })
        .catch(err => {
          reject(err);
        });
    });
  };

  User.prototype.updatePassword = function(password, callback) {
    let user = this;
    if (callback) {
      this.updatePassword(password)
        .then(() => {
          callback(null);
        })
        .catch(err => {
          callback(err);
        });
      return;
    }

    return new Promise((fulfill, reject) => {
      user
        .getAuth()
        .then(auth => {
          auth
            .updatePassword(password)
            .then(() => {
              fulfill();
            })
            .catch(err => {
              reject(err);
            });
        })
        .catch(err => {
          reject(err);
        });
    });
  };

  return User;
};

module.exports = init;
