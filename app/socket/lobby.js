'use strict';

let db = require('../db');
let dblogger = require('winston').loggers.get('db');
let { Lobby } = db.models;
let games = require('../games');
let nsps = require('./namespaceManager');

let init = function(global) {
  let io = global.of('/lobby');
  io.on('connection', function(socket) {
    socket.on('join lobby', function(data) {
      socket.join(data.lobby);
      socket.broadcast.to(data.lobby).emit('member', {
        id: socket.request.user.id,
        name: socket.request.user.displayName,
        role: socket.request.user.role,
        ready: false,
      });
    });

    socket.on('leave lobby', function(data) {
      socket.leave(data.lobby);
      if (socket.request.user.role === 'host')
        io
          .to(socket.request.user.lobbyId)
          .emit('leave lobby', { lobby: socket.request.user.lobbyId });
      socket.request.user.update({ role: null, lobbyId: null });
      socket.emit('navigate', { loc: 'lobbylist' });
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
                ret.users.push({
                  id: user.id,
                  name: user.displayName,
                  role: user.role,
                  ready: false,
                });
              }
              socket.emit('lobbyLand', ret);
            })
            .catch(err => dblogger.error('Lobbyland get lobby users: ' + err));
        })
        .catch(err => dblogger.error('Lobbyland get lobby: ' + err));
    });

    socket.on('member change', function(change) {
      // change.member, change.role
    });

    socket.on('settings change', function(change) {
      // game specific setting something
    });

    socket.on('danger change', function(change) {
      // Update DB lobby info
    });
  });
};

module.exports = init;
