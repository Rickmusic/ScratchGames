'use strict';

let nodemailer = require('nodemailer');
let logger = require('winston').loggers.get('auth');

let config = require('../config');

let transport = nodemailer.createTransport({
  service: config.mailer.service,
  auth: { user: config.mailer.username, pass: config.mailer.password },
});

let sendVerification = function(useremail, username, token, callback) {
  transport.sendMail(
    {
      from: '"Scratch Games" <' + config.mailer.address + '>',
      to: useremail,
      subject: 'Please verify your email address',
      text: 'Auth: http://localhost/verify?token=' + token,
      html:
        '<p>Auth: <a href="http://localhost/verify?token=' +
        token +
        '">Click Here</a></p>',
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
};

module.exports = {
  transport,
  sendVerification: sendVerification,
};
