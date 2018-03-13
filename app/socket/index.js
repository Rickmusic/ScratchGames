'use strict';

let socketsession = require('./socketsession');

let events = function(io) {
  require('./chat')(io);
};

let init = function(app) {
  let http = require('http').Server(app);
  let io = require('socket.io')(http);

  // Use Express Session and Passport Sessions
  //   Express available in events as socket.request.session
  //   Passport available in events as socket.request.user
  io.use(socketsession);

  events(io);

  return http;
};

module.exports = init;

