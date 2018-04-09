'use strict';

let db = require('../db');
let dblogger = require('winston').loggers.get('db');
let { Lobby } = db.models;

const GameTypes = [
  { id: 'uno', display: 'UNO', maxPlayer: 4, minPlayer: 2 },
  { id: 'gofish', display: 'Go Fish', maxPlayer: 3, minPlayer: 2 },
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

    socket.on('whoami', function(data) {
      socket.emit('whoami', {
        id: socket.request.user.id,
        name: socket.request.user.displayName,
      });
    });

    socket.on('create lobby', function(form) {
      // TODO Verify Settings and send feedback
      let gametype; /* Value must mach DB Enum */
      switch (form.gametype) {
        case 'uno':
          gametype = 'UNO';
          break;
        case 'gofish':
          gametype = 'GoFish';
          break;
        default:
          break;
      }
      if (!gametype)
        // Hit default case
        return socket.emit('create lobby', {
          success: false,
          message: 'Unkown Game Type ' + form.gametype,
        });
      Lobby.create({
        name: form.lobbyname,
        type: form.public === 'private' ? 'private' : 'public',
        game: gametype,
        maxPlayers: form.numPlayers,
        maxSpectators: form.numSpec,
        hostId: socket.request.user.id,
      })
        .then(lobby => {
          lobby
            .addPlayer(socket.request.user)
            .then(() => {
              socket.emit('join lobby', { lobby: lobby.id, role: 'host' });
              socket.emit('navigate', { loc: 'lobby' });
            })
            .catch(err => dblogger.error('At Add Player to Lobby: ' + err));
        })
        .catch(err => dblogger.error('At Lobby Create: ' + err));
    });

    socket.on('join via code', function(form) {
      Lobby.findOne({ where: { joincode: parseInt(form.joincode) } })
        .then(lobby => {
          if (!lobby)
            return socket.emit('join via code', {
              success: false,
              message: 'Lobby Not Found',
            });
          switch (form.joinrole) {
            case 'player':
              lobby
                .addPlayer(socket.request.user)
                .then(() => {
                  socket.emit('join lobby', { lobby: lobby.id, role: 'player' });
                  socket.emit('navigate', { loc: 'lobby' });
                })
                .catch(err => dblogger.error('At Add Player to Lobby: ' + err));
              break;
            case 'spec':
              lobby
                .addSpectator(socket.request.user)
                .then(() => {
                  socket.emit('join lobby', { lobby: lobby.id, role: 'spectator' });
                  socket.emit('navigate', { loc: 'lobby' });
                })
                .catch(err => dblogger.error('At Add Spectator to Lobby: ' + err));
              break;
            default:
              break;
          }
        })
        .catch(err => dblogger.error('At Lobby Find By Code: ' + err));
    });

    /* Pass on join/leave initiated by other namespaces
     * As everything hooks into the global join/leave emit */
    socket.on('join lobby', function(info) {
      socket.emit('join lobby', info);
    });
    socket.on('leave lobby', function(info) {
      socket.emit('leave lobby', info);
    });
  });
};

module.exports = init;
