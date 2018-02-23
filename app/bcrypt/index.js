'use strict';

let bcrypt = require('bcrypt-nodejs');

function bcryptCompare(plaintext, hashed, callback) {
  if (callback) {
    bcryptCompare(plaintext, hashed)
      .then(isMatch => callback(null, isMatch))
      .catch(err => callback(err));
    return;
  }

  return new Promise((fulfill, reject) => {
    bcrypt.compare(plaintext, hashed, function(err, isMatch) {
      if (err) return reject(err);
      return fulfill(isMatch);
    });
  });
}

function bcryptHash(plaintext, callback) {
  if (callback) {
    bcryptHash(plaintext)
      .then(hashed => callback(null, hashed))
      .catch(err => callback(err));
    return;
  }

  return new Promise((fulfill, reject) => {
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(plaintext, salt, null, function(err, hashed) {
        if (err) return reject(err);
        return fulfill(hashed);
      });
    });
  });
}

module.exports = {
  compare: bcryptCompare,
  hash: bcryptHash,
};
