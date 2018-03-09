'use strict';

let session = require('express-session');

let config = require('../config');

let init = function() {
  return session({
    secret: config.session.secret,
    resave: false, // don't automatically write to session store
    saveUninitialized: false, // don't save new sessions
    cookie: {
      path: '/', // base URL path that will trigger client to send cookie
      httpOnly: true, // hide cookie from client-side JavaScript
      secure: false, // send cookie on non-secure connections
      maxAge: false, // non-persistent (persistent login handeled by passport)
    },
  });
};

module.exports = init();
