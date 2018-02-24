'use strict';

let init = function() {
  if (process.env.NODE_ENV === 'production') {
    return {
      db: {
        username: process.env.dbUsername,
        password: process.env.dbPassword,
        host: process.env.dbHost,
        port: process.env.dbPort,
        name: process.env.dbName,
      },
      mailer: {
        service: process.env.mailerService,
        address: process.env.mailerAddress,
        username: process.env.mailerUsername,
        password: process.env.mailerPassword,
      },
      session: { secret: process.env.sessionSecret },
      facebook: {
        clientID: process.env.facebookClientID,
        clientSecret: process.env.facebookClientSecret,
        callbackURL: '/auth/facebook/callback',
      },
      google: {
        clientID: process.env.googleClientID,
        clientSecret: process.env.googleClientSecret,
        callbackURL: '/auth/google/callback',
      },
    };
  }

  return require('./config.json');
};

module.exports = init();
