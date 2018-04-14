'use strict';

let db = require('../db');
let dblogger = require('winston').loggers.get('db');
let { Lobby, User } = db.models;
let lobbymanager = require('../lobby');
let games = require('../games');
let nsps = require('./namespaceManager');

let buildMember = function(user) {
  return {
    id: user.id,
    name: user.displayName,
    role: user.role,
    ready: lobbymanager.getPlayerReady(user),
  };
};

let init = function(io) {
  lobbymanager.init(io);
  io.on('connection', function(socket) {
    socket.on('join lobby', function() {
      socket.join('user' + socket.request.user.id);
      socket.join(socket.request.user.lobbyId);
      if (socket.request.user.role === 'player')
        lobbymanager.lobbyAddPlayer(socket.request.user);
    });

    socket.on('lobbyLand', function(data) {
      socket.broadcast
        .to(socket.request.user.lobbyId)
        .emit('member', buildMember(socket.request.user));
      socket.request.user
        .getLobby()
        .then(lobby => {
          let ret = {};
          ret.game = lobby.game;
          ret.gamesettings = lobbymanager.getGameSettings(socket.request.user.lobbyId);
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
                lobbymanager.checkLobbyReady(socket.request.user.lobbyId)
              )
                socket.emit('lobbyReady', {});
            })
            .catch(err => dblogger.error('SockLob - LobbyLand - Get Lobby Users: ' + err));
        })
        .catch(err => dblogger.error('SockLob - LobbyLand - Get Lobby: ' + err));
    });

    let changeRole = function(user, role) {
      switch (role) {
        case 'player':
          lobbymanager.lobbyAddPlayer(user);
          break;
        case 'spectator':
          lobbymanager.lobbyRemovePlayer(user);
          break;
      }
      user
        .update({ role })
        .then(() => io.to(socket.request.user.lobbyId).emit('member', buildMember(user)))
        .catch(err => dblogger.error('SockLob - Change Role - Update User: ' + err));
    };

    socket.on('player -> spec', function(uid) {
      if (!uid) {
        return changeRole(socket.request.user, 'spectator');
      }
      User.findById(uid)
        .then(user => {
          if (!user) return dblogger.error('SockLob - Play->Spec - User Not Found');
          changeRole(user, 'spectator');
        })
        .catch(err => dblogger.error('SockLob - Play->Spec - Lookup User: ' + err));
    });

    socket.on('spec -> player', function(uid) {
      if (!uid) {
        return changeRole(socket.request.user, 'player');
      }
      User.findById(uid)
        .then(user => {
          if (!user) return dblogger.error('SockLob - Spec->Play - User Not Found');
          changeRole(user, 'player');
        })
        .catch(err => dblogger.error('SockLob - Spec->Play - Lookup User: ' + err));
    });

    socket.on('settings change', function(change) {
      socket.broadcast.to(socket.request.user.lobbyId).emit('settings change', change);
      lobbymanager.updateGameSettings(socket.request.user.lobbyId, change);
    });

    socket.on('playerReady', function() {
      lobbymanager.setPlayerReady(socket.request.user);
      io.to(socket.request.user.lobbyId).emit('playerReady', socket.request.user.id);
      if (lobbymanager.checkLobbyReady(socket.request.user.lobbyId))
        io.to(socket.request.user.lobbyId).emit('lobbyReady', {});
    });

    socket.on('start game', function(settings) {
      socket.request.user
        .getLobby()
        .then(lobby => {
          // TODO store settings into lobby
          if (!nsps.exists(lobby.game)) games[lobby.game].init(nsps.create(lobby.game));
          // TODO only pass game-specific settings to create
          games[lobby.game].create(settings, lobby.id, lobby.hostId);
          io.to(lobby.id).emit('navigate', {
            loc: 'game',
            args: [lobby.game, nsps.get(lobby.game).name],
          });
          lobby
            .update({ inGame: true })
            .then(() => {})
            .catch(err => dblogger.error('SockLob - Start Game - Update Lobby: ' + err));
        })
        .catch(err => dblogger.error('SockLob - Start Game - Get Lobby: ' + err));
    });

    socket.on('leave lobby', function() {
      lobbymanager.lobbyRemovePlayer(socket.request.user);
      if (socket.request.user.role === 'host')
        io.to(socket.request.user.lobbyId).emit('leave lobby', {});
      socket.request.user.update({ role: null, lobbyId: null });
      socket.emit('navigate', { loc: 'lobbylist' });
      socket.disconnect(); // Manually remove client from the lobby namespace.
    });

    socket.on('kick-member', function(uid) {
      socket.to('user' + uid).emit('leave lobby', {});
    });
  });
};

module.exports = init;
