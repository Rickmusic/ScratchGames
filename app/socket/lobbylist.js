'use strict';

let manager = require('../lobby');

let init = function(io) {
  manager.setLobbylistSocket(io);
  io.on('connection', function(socket) {
    manager.getAllLobbies()
      .then(list => socket.emit('lobbylist', list))
      .catch(err => console.log('SockLobList - On Connect: ' + err));
  });
};

module.exports = init;

