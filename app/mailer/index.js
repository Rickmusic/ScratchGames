'use strict';

let nodemailer = require('nodemailer');
let logger = require('winston').loggers.get('auth');

let config = require('../config');
let db = require('../db');
let { Token } = db.models;

let transport = nodemailer.createTransport({
  service: config.mailer.service,
  auth: {
    type: 'OAuth2',
    user: config.mailer.username,
    clientId: config.mailer.clientID,
    clientSecret: config.mailer.clientSecret,
    accessToken: config.mailer.accessToken,
    refreshToken: config.mailer.refreshToken,
    expires: config.mailer.expiryDate,
  },
});

let sendVerification = function(req, callback) {
  let createToken = Token.createVerifyToken(req.user);
  let lookupAuth = req.user.getAuth();

  Promise.all([createToken, lookupAuth])
    .then(promises => {
      let token = promises[0];
      let auth = promises[1];
      let protocol = req.get('X-Forwarded-Proto')
        ? req.get('X-Forwarded-Proto')
        : req.protocol;
      let link = protocol + '://' + req.get('Host') + '/verify?token=' + token;

      transport.sendMail(
        {
          from: '"Scratch Games" <' + config.mailer.address + '>',
          to: auth.email,
          subject: 'Please verify your email address',
          text: 'Auth: ' + link,
          html: '<p>Auth: <a href="' + link + '">Click Here</a></p>',
        },
        (error, info) => {
          if (error) {
            logger.verbose('Verification Message Error: ' + error);
            return callback(error);
          }
          logger.verbose(
            'Verification Message %s sent: %s',
            info.messageId,
            info.response
          );
          return callback(null, info);
        }
      );
    })
    .catch(err => callback(err));
};

module.exports = {
  transport,
  sendVerification: sendVerification,
};
