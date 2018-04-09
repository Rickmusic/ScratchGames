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


let init = function(global) {
  let io = global.of('/lobby');
  io.on('connection', function(socket) {
    socket.on('join lobby', function(data) {
      socket.join(data.lobby);
      socket.broadcast.to(data.lobby).emit('member', buildMember(socket.request.user));
    });

    socket.on('leave lobby', function(data) {
      if (!data) return socket.emit('leave lobby', { lobby: socket.request.user.lobbyId });
      socket.leave(data.lobby);
      if (socket.request.user.role === 'host')
        io
          .to(socket.request.user.lobbyId)
          .emit('leave lobby', { lobby: socket.request.user.lobbyId });
      socket.request.user.update({ role: null, lobbyId: null });
      socket.emit('navigate', { loc: 'lobbylist' });
    });

    socket.on('kick-member', function(uid) {
      // TODO kick member
    });

    socket.on('start game', function(settings) {
      socket.request.user
        .getLobby()
        .then(lobby => {
          // TODO store settings into lobby
          if (!nsps.exists(lobby.game))
            games[lobby.game].init(nsps.create(lobby.game));
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

    let reloadLocation = function() {
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
          if (Object.keys(socket.rooms).length === 1) {
            // If socket not in lobby room
            socket.emit('join lobby', {
              lobby: lobby.id,
              role: socket.request.user.role,
            });
          }
          if (!lobby.inGame) {
            // Check if lobby is playing a game
            return socket.emit('navigate', {
              loc: 'lobby',
              redirect: true,
            });
          }
          socket.emit('navigate', {
            loc: 'game',
            args: [lobby.game, nsps.get(lobby.game).name],
            redirect: true,
          });
        })
        .catch(err => dblogger.error('At Player Get Lobby ' + err));
    };
    socket.on('lobby reload', reloadLocation);
    socket.on('game reload', reloadLocation);

    socket.on('lobbyLand', function(data) {
      socket.request.user
        .getLobby()
        .then(lobby => {
          let ret = {};
          ret.game = lobby.game;
          ret.type = lobby.type;
          ret.name = lobby.name;
          ret.joincode = lobby.joincode;
          ret.maxPlayers = lobby.maxPlayers;
          ret.maxSpectators = lobby.maxSpectators;
          lobby.getUsers()
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
      user.update({ role })
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
      console.log('Settings change:\n' + JSON.stringify(change));
    });

    socket.on('danger change', function(change) {
      socket.broadcast.to(socket.request.user.lobbyId).emit('danger change', change);
      console.log('Danger change:\n' + JSON.stringify(change));
    });
  });
};

module.exports = init;
