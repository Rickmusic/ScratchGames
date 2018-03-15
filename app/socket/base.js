'use strict';

let db = require('../db');
let dblogger = require('winston').loggers.get('db');
let { Lobby } = db.models;

const GameTypes = [
  { id: 'uno', display: 'UNO', maxPlayer: 4, minPlayer: 2 },
  { id: 'other', display: 'Other Game', maxPlayer: 3, minPlayer: 2 },
];

let init = function(io) {
  io.on('connection', function(socket) {
    /* Within socket.on scope:
     * User Information: socket.request.user
     * Session Information: socket.request.session
     */

    socket.on('game types', function(data) {
      socket.emit('game types', { GameTypes });
    });

    socket.on('create lobby', function(data) {
      // TODO Verify Settings and send feedback
      let gametype; /* Value must mach DB Enum */
      switch (data.gametype) {
        case 'uno': gametype = 'UNO'; break;
        case 'other': gametype = 'SomeGame'; break;
        default: break;
      }
      if (!gametype) // Hit default case
        return socket.emit('create lobby', { success: false, message: 'Unkown Game Type ' + data.gametype });
      Lobby.create({
        name: data.lobbyname,
        type: (data.public === 'private') ? 'private': 'public',
        game: gametype,
        maxPlayers: data.numPlayers,
        maxSpectators: data.numSpec,
        hostId: socket.request.user.id,
      })
        .then(lobby => {
          lobby.addPlayer(socket.request.user)
            .then(() => {
              socket.emit('join lobby', {});
              socket.emit('navigate', { loc: 'lobby' });
            })
            .catch(err => dblogger.error('At Add Player to Lobby: ' + err));
        })
        .catch(err => dblogger.error('At Lobby Create: ' + err));
    });
  });
};

module.exports = init;
