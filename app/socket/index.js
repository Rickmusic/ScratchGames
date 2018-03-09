'use strict';

let session = require('../session');
let passport = require('../passport');

let events = function(io) {

  io.on('connection', function(socket){
    socket.on('chat message', function(msg){
      io.emit('chat message', msg);
    });
  });
};

let init = function(app) {
  let http = require('http').Server(app);
  let io = require('socket.io')(http);

  // Use Express Session and Passport Sessions
  //   Express available in events as socket.request.session
  //   Passport available in events as socket.request.user
  io.use(function(socket, next) {
    session(socket.request, socket.request.res, next);
  });
  io.use(function(socket, next) {
    passport.initialize()(socket.request, socket.request.res, next);
  });
  io.use(function(socket, next) {
    passport.session()(socket.request, socket.request.res, next);
  });

  events (io);

  return http;
};

module.exports = init;
