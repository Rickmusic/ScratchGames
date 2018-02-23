'use strict';

let morgan = require('morgan');
let path = require('path');
let fs = require('fs');

let winston = require('./winston').loggers.get('morgan');
let winstonStream = {
  write: function(message, encoding) {
    winston.debug(encoding);
    winston.warn(message);
  },
};

let accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {
  flags: 'a',
});

module.exports = {
  file: morgan('combined', { stream: accessLogStream }),
  console: morgan('dev', {
    skip: function(req, res) {
      return res.statusCode < 400;
    },
    stream: winstonStream,
  }),
};
