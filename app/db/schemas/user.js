'use strict';

let bcrypt = require('bcrypt-nodejs');

let init = (sequelize, DataTypes) => {
  let User = sequelize.define(
    'user',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
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
      googleId: {
        type: DataTypes.STRING,
      },
      facebookId: {
        type: DataTypes.STRING,
      },
      state: {
        type: DataTypes.ENUM,
        values: ['active', 'pending', 'deleted'],
        allowNull: false,
        defaultValue: 'pending',
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

  User.prototype.updatePassword = function(password, callback) {
    let user = this;
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
          user
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

  User.sync({ force: true }) // Create table if it doesn't exist
    .then(() => {
      User.create({ username: 'jack', displayName: 'Jack' })
        .then(user => {
          user
            .updatePassword('secret')
            .then(() => {
              console.log('Jack Updated');
            })
            .catch(err => {
              console.log('Jack Error ' + err);
            });
        })
        .catch(err => {
          console.log('MySQL Error (@User create jack):' + err);
        });
      User.create({ username: 'jill', displayName: 'Jill' })
        .then(user => {
          user.updatePassword('birthday');
        })
        .catch(err => {
          console.log('MySQL Error (@User create jill):' + err);
        });
    })
    .catch(err => {
      console.log('MySQL Error (@User.sync): ' + err);
    });

  return User;
};

module.exports = init;
