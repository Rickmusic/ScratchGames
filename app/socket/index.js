'use strict';

let socketsession = require('./socketsession');

let events = function(io) {
  require('./base')(io);
  require('./chat')(io.of('/chat'));
  require('./lobby')(io.of('/lobby'));
  require('./lobbylist')(io.of('/lobbylist'));
  require('./leaderboard')(io.of('/leaderboard'));
};

let init = function(app) {
  let http = require('http').Server(app);
  let io = require('socket.io')(http);

  // Use Express Session and Passport Sessions
  //   Express available in events as socket.request.session
  //   Passport available in events as socket.request.user
  io.use(socketsession);

  require('./namespaceManager').init(io);

  events(io);

  return http;
};

module.exports = init;
