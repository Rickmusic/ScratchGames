'use strict';

let winston = require('winston');
let path = require('path');

// Configure default logger
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
  level: 'silly', // Every possible log level
  colorize: true,
});

// Special log for Uncaught Exceptions
winston.loggers.add('exception', {
  console: {
    level: 'silly',
    colorize: true,
    handleExceptions: true,
    humanReadableUnhandledException: true,
  },
  file: {
    level: 'silly',
    timestamp: true,
    handleExceptions: true,
    humanReadableUnhandledException: true,
    json: false,
    filename: path.join(__dirname, 'exception.log'),
    maxsize: 1000000, // 1 MB
    maxFiles: 5,
    tailable: true, // rotate so non-suffix is newest
  },
});

// Handel Morgan Console printing
winston.loggers.add('morgan', {
  console: {
    level: 'info',
    colorize: true,
    label: 'access',
  },
});

// Seperate Logger for Database/Sequelize
winston.loggers.add('sequelize', {
  console: {
    level: 'info',
    colorize: true,
    label: 'sequelize',
  },
  file: {
    level: 'verbose',
    timestamp: true,
    json: false,
    filename: path.join(__dirname, 'database.log'),
    maxsize: 1000000, // 1 MB
    maxFiles: 5,
    tailable: true, // rotate so non-suffix is newest
  },
});

module.exports = winston;
