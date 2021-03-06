'use strict';

let db = require('../db');
let dblogger = require('winston').loggers.get('db');
let { Lobby } = db.models;
let nsps = require('./namespaceManager');
let lobbymanager = require('../lobby');

const GameTypes = [
  { id: 'uno', display: 'UNO', maxPlayer: 4, minPlayer: 2 },
  { id: 'gofish', display: 'Go Fish', maxPlayer: 4, minPlayer: 2 },
];

let init = function(io) {
  io.on('connection', function(socket) {
    /* Within socket.on scope:
     * User Information: socket.request.user
     * Session Information: socket.request.session
     */

    socket.on('whoami', function() {
      socket.emit('whoami', {
        id: socket.request.user.id,
        name: socket.request.user.displayName,
      });
    });

    socket.on('game types', function() {
      socket.emit('game types', { GameTypes });
    });

    /* Lobby Function */

    socket.on('create lobby', function(form) {
      // TODO Verify Settings and send feedback
      let gametype; /* Value must mach DB Enum */
      switch (form.gametype) {
        case 'uno':
          gametype = 'Uno';
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
              lobbymanager.createLobby(lobby);
              socket.emit('join lobby', { lobby: lobby.id, role: 'host' });
              socket.emit('navigate', { loc: 'lobby' });
            })
            .catch(err =>
              dblogger.error('Socket - Base - Create Lobby - Add Player to Lobby: ' + err)
            );
        })
        .catch(err =>
          dblogger.error('Socket - Base - Create Lobby - Create Lobby: ' + err)
        );
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
                .catch(err =>
                  dblogger.error('Socket - Base - Joincode - Add Player to Lobby: ' + err)
                );
              break;
            case 'spec':
              lobby
                .addSpectator(socket.request.user)
                .then(() => {
                  socket.emit('join lobby', { lobby: lobby.id, role: 'spectator' });
                  socket.emit('navigate', { loc: 'lobby' });
                })
                .catch(err =>
                  dblogger.error(
                    'Socket - Base - Joincode - Add Spectator to Lobby: ' + err
                  )
                );
              break;
            default:
              break;
          }
        })
        .catch(err => dblogger.error('Socket - Base - Joincode - Find Lobby: ' + err));
    });

    socket.on('join as player', function(lobbyId) {
      Lobby.findById(lobbyId)
        .then(lobby => {
          if (!lobby)
            return socket.emit('', { success: false, message: 'Lobby Not Found' });
          lobby
            .addPlayer(socket.request.user)
            .then(() => {
              socket.emit('join lobby', { lobby: lobby.id, role: 'player' });
              socket.emit('navigate', { loc: 'lobby' });
            })
            .catch(err =>
              dblogger.error('SockBase - Join Player - Add to Lobby: ' + err)
            );
        })
        .catch(err => dblogger.error('Socket - Base - Join Player - Find Lobby: ' + err));
    });

    socket.on('join as spectator', function(lobbyId) {
      Lobby.findById(lobbyId)
        .then(lobby => {
          if (!lobby)
            return socket.emit('', { success: false, message: 'Lobby Not Found' });
          lobby
            .addSpectator(socket.request.user)
            .then(() => {
              socket.emit('join lobby', { lobby: lobby.id, role: 'spectator' });
              socket.emit('navigate', { loc: 'lobby' });
            })
            .catch(err =>
              dblogger.error('Socket - Base - Join Spectator - Add to Lobby: ' + err)
            );
        })
        .catch(err =>
          dblogger.error('Socket - Base - Join Spectator - Find Lobby: ' + err)
        );
    });

    let lobbyreload = function() {
      socket.request.user
        .getLobby()
        .then(lobby => {
          if (!lobby) {
            // Check if lobby exists
            return socket.emit('navigate', {
              loc: 'lobbylist',
              redirect: true,
            });
          }
          socket.emit('join lobby', { lobby: lobby.id, role: socket.request.user.role });
          if (!lobby.inGame) {
            // If lobby is not playing a game
            return socket.emit('navigate', {
              loc: 'lobby',
              redirect: true,
            });
          }
          // Otherwise lobby is in game
          socket.emit('navigate', {
            loc: 'game',
            args: [lobby.game, nsps.get(lobby.game).name],
            redirect: true,
          });
        })
        .catch(err => dblogger.error('Socket - Base - Lobby Reload - Get Lobby: ' + err));
    };
    socket.on('lobby reload', lobbyreload);
    socket.on('game reload', lobbyreload);

    /* Profile Functions */

    socket.on('displayName', function(form) {
      socket.request.user.update({ displayName: form.displayName })
        .then(() => socket.emit('return', { success: true }))
        .catch(err => dblogger.error('Socket - Base - Display Name: ' + err));
    });

    socket.on('email', function(form) {
      socket.emit('return', { success: true });
      // TODO form.newEmail, form.oldEmail 
    });

    socket.on('password', function(form) {
      socket.request.user.getAuth()
        .then(auth => {
          auth.validatePassword(form.oldPassword)
            .then(isMatch => {
              if (!isMatch) return socket.emit('return', { success: false, message: 'Incorrect Password' });
              auth.updatePassword(form.newPassword)
                .then(() => {
                  socket.emit('return', { success: true });
                })
                .catch(err => dblogger.error('Socket - Base - Password - Update: ' + err));
            })
            .catch(err => dblogger.error('Socket - Base - Password - Validate: ' + err));
        })
        .catch(err => dblogger.error('Socket - Base - Password - Get Auth: ' + err));
    });
  });
};

module.exports = init;
