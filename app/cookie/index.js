'use strict';

let cookieParser = require('cookie-parser');

let config = require('../config');

module.exports = cookieParser(config.session.secret);
