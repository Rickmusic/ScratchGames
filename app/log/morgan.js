'use strict';

let morgan = require('morgan');

let winston = require('./winston');

let fileLog = winston.loggers.get('morgan-file');
let fileStream = {
  write: function(message, encoding) {
    fileLog.debug(encoding);
    fileLog.verbose(message);
  },
};

let consoleLog = winston.loggers.get('morgan-console');
let consoleStream = {
  write: function(message, encoding) {
    consoleLog.debug(encoding);
    consoleLog.warn(message);
  },
};

module.exports = {
  file: morgan('combined', { stream: fileStream }),
  console: morgan('dev', {
    skip: function(req, res) {
      return res.statusCode < 400;
    },
    stream: consoleStream,
  }),
};
