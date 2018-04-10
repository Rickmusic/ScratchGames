'use strict';

let db = require('../db');
let dblogger = require('winston').loggers.get('db');
let { Lobby, User } = db.models;
let games = require('../games');
let nsps = require('./namespaceManager');

let buildMember = function(user) {
  return {
    id: user.id,
    name: user.displayName,
    role: user.role,
    ready: false,
  };
};

let lobbies = {};
/* Contains <lobbyid>: {<settings>} values with game specifice settings, player readyness, ect. */

let createLobby = function(lobbyId) {
  lobbies[lobbyId] = {};
  lobbies[lobbyId].gamesettings = {};
  lobbies[lobbyId].ready = {};
};

let lobbyAddPlayer = function(user) {
  if (!lobbies[user.lobbyId]) createLobby(user.lobbyId);
  lobbies[user.lobbyId].ready[user.id] = false;
};

let lobbyRemovePlayer = function(user) {
  delete lobbies[user.lobbyId].ready[user.id];
};

let setPlayerReady = function(user) {
  lobbies[user.lobbyId].ready[user.id] = true;
};

let init = function(global) {
  let io = global.of('/lobby');
  io.on('connection', function(socket) {
    socket.on('join lobby', function() {
      socket.join('user' + socket.request.user.id);
      socket.join(socket.request.user.lobbyId);
      if (socket.request.user.role === 'player') lobbyAddPlayer(socket.request.user);
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
          ret.gamesettings = lobbies[lobby.id].gamesettings;
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
            })
            .catch(err => dblogger.error('Lobbyland get lobby users: ' + err));
        })
        .catch(err => dblogger.error('Lobbyland get lobby: ' + err));
    });

    let changeRole = function(user, role) {
      switch (role) {
        case 'player':
          lobbyAddPlayer(user);
          break;
        case 'spectator':
          lobbyRemovePlayer(user);
          break;
      }
      user
        .update({ role })
        .then(() => io.to(socket.request.user.lobbyId).emit('member', buildMember(user)))
        .catch(err => dblogger.error('Lobby update user role ' + err));
    };

    socket.on('player -> spec', function(uid) {
      if (!uid) {
        return changeRole(socket.request.user, 'spectator');
      }
      User.findById(uid)
        .then(user => {
          if (!user) return dblogger.error('Lobby change to spectator user not found');
          changeRole(user, 'spectator');
        })
        .catch(err => dblogger.error('Lobby change to spectator ' + err));
    });

    socket.on('spec -> player', function(uid) {
      if (!uid) {
        return changeRole(socket.request.user, 'player');
      }
      User.findById(uid)
        .then(user => {
          if (!user) return dblogger.error('Lobby change to player user not fond');
          changeRole(user, 'player');
        })
        .catch(err => dblogger.error('Lobby change to player ' + err));
    });

    socket.on('settings change', function(change) {
      socket.broadcast.to(socket.request.user.lobbyId).emit('settings change', change);
      lobbies[socket.request.user.lobbyId].gamesettings = change;
    });

    socket.on('danger change', function(change) {
      socket.broadcast.to(socket.request.user.lobbyId).emit('danger change', change);
      lobbies[socket.request.user.lobbyId].dangersettings = change;
    });

    socket.on('playerReady', function() {
      setPlayerReady(socket.request.user);
      io.to(socket.request.user.lobbyId).emit('playerReady', socket.request.user.id);
      // When all players have readied, emit 'lobyReady' to host
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
            .catch(err => dblogger.error('At Lobby set inGame ' + err));
        })
        .catch(err => dblogger.error('At Player Get Lobby ' + err));
    });

    socket.on('leave lobby', function() {
      lobbyRemovePlayer(socket.request.user);
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
