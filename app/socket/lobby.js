'use strict';

let db = require('../db');
let dblogger = require('winston').loggers.get('db');
let { User } = db.models;
let manager = require('../lobby');

let buildMember = function(user) {
  return {
    id: user.id,
    name: user.displayName,
    role: user.role,
    ready: manager.getPlayerReady(user),
  };
};

let init = function(io) {
  manager.setLobbySocket(io);
  io.on('connection', function(socket) {
    socket.on('join lobby', function() {
      socket.join('user' + socket.request.user.id);
      socket.join(socket.request.user.lobbyId);
      manager.addMember(socket.request.user);
    });

    socket.on('lobbyLand', function() {
      socket.broadcast
        .to(socket.request.user.lobbyId)
        .emit('member', buildMember(socket.request.user));
      socket.request.user
        .getLobby()
        .then(lobby => {
          let ret = {};
          ret.game = lobby.game;
          ret.gamesettings = manager.getGameSettings(socket.request.user.lobbyId);
          ret.type = lobby.type;
          ret.name = lobby.name;
          ret.joincode = lobby.joincode;
          ret.maxPlayers = lobby.maxPlayers;
          ret.maxSpectators = lobby.maxSpectators;
          lobby
            .getUsers()
            .then(users => {
              ret.users = [];
              for (let user of users) {
                ret.users.push(buildMember(user));
              }
              socket.emit('lobbyLand', ret);
              if (
                socket.request.user.role === 'host' &&
                manager.checkLobbyReady(socket.request.user.lobbyId)
              )
                socket.emit('lobbyReady', {});
            })
            .catch(err =>
              dblogger.error('Socket - Lobby - LobbyLand - Get Lobby Users: ' + err)
            );
        })
        .catch(err => dblogger.error('Socket - Lobby - LobbyLand - Get Lobby: ' + err));
    });

    let changeRole = function(user, role) {
      user
        .update({ role })
        .then(() => {
          manager.updateMember(user);
          io.to(socket.request.user.lobbyId).emit('member', buildMember(user));
        })
        .catch(err =>
          dblogger.error('Socket - Lobby - Change Role - Update User: ' + err)
        );
    };

    socket.on('player -> spec', function(uid) {
      if (!uid) {
        return changeRole(socket.request.user, 'spectator');
      }
      User.findById(uid)
        .then(user => {
          if (!user)
            return dblogger.error('Socket - Lobby - Play->Spec - User Not Found');
          changeRole(user, 'spectator');
        })
        .catch(err =>
          dblogger.error('Socket - Lobby - Play->Spec - Lookup User: ' + err)
        );
    });

    socket.on('spec -> player', function(uid) {
      if (!uid) {
        return changeRole(socket.request.user, 'player');
      }
      User.findById(uid)
        .then(user => {
          if (!user)
            return dblogger.error('Socket - Lobby - Spec->Play - User Not Found');
          changeRole(user, 'player');
        })
        .catch(err =>
          dblogger.error('Socket - Lobby - Spec->Play - Lookup User: ' + err)
        );
    });

    socket.on('settings change', function(change) {
      socket.broadcast.to(socket.request.user.lobbyId).emit('settings change', change);
      manager.updateGameSettings(socket.request.user.lobbyId, change);
    });

    socket.on('playerReady', function() {
      manager.setPlayerReady(socket.request.user, true);
    });

    socket.on('start game', function(settings) {
      manager.startGame(socket.request.user, settings);
    });

    socket.on('leave lobby', function() {
      socket.broadcast
        .to(socket.request.user.lobbyId)
        .emit('playerLeft', socket.request.user.id);
      manager.removeMember(socket.request.user);
      socket.emit('navigate', { loc: 'lobbylist' });
      socket.disconnect(); // Manually remove client from the lobby namespace.
    });

    socket.on('kick member', function(uid) {
      socket.to('user' + uid).emit('leave lobby', {});
    });
  });
};

module.exports = init;
