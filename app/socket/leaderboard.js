'use strict';

let manager = require('../leaderboard');

let init = function(io) {
  manager.setLeaderboardSocket(io);
  io.on('connection', function(socket) {
    manager
      .getLeaderboards()
      .then(leaderboard => socket.emit('everything', leaderboard))
      .catch(err => console.log('Socket - Leaderboard - On Connect: ' + err));
  });
};

module.exports = init;
