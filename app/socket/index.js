'use strict';

let socketsession = require('./socketsession');

let events = function(io) {
  io.on('connection', function(socket) {
    socket.on('chat message', function(msg) {
        let message = handleMessage(msg);
        // We should store some of this information probably on the database //
        io.emit('chat message', message);
    });
  });
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

function handleMessage(msg) {
    let message = {
        content: msg.content,
        timestamp: new Date(),
        user: "SomeUser",
        location: msg.location,
    };
    return message;
}