'use strict';

let db = require('../db');
let dblogger = require('winston').loggers.get('db');
let { User } = db.models;

let init = function(io) {
  io.on('connection', function(socket) {
    socket.emit('everything', {
      Uno: [
        {
          id: '1234',
          name: 'Test Jill',
          score: 4321,
        },
      ],
      GoFish: [
        {
          id: '2345',
          name: 'Test Jack',
          score: 5432,
        },
      ],
    });
  });
};

module.exports = init;
