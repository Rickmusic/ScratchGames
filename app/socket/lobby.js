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
    });

    socket.on('leave lobby', function(data) {
      socket.leave(data.lobby);
    });

    socket.on('start game', function(settings) {
      socket.request.user.getLobby()
        .then(lobby => {
          // TODO store settings into lobby
          if (!nsps.exists(lobby.game))
            games[lobby.game].init(nsps.create(lobby.game));
          // TODO only pass game-specific settings to create
          games[lobby.game].create(settings, lobby.id, lobby.hostId);
          io.to(lobby.id).emit('navigate', { 
            loc: 'game', 
            args: [
              lobby.game,
              nsps.get(lobby.game).name,
            ],
          });
        })
        .catch(err => dblogger.error('At Player Get Lobby' + err));
    });

  });
};

module.exports = init;
