'use strict';

let db = require('../db');
let dblogger = require('winston').loggers.get('db');
let { Message, User } = db.models;

let init = function(io) {
  io.on('connection', function(socket) {
    socket.on('hello', function(data) {
      socket.join(socket.request.user.id);
      let response = {};
      response.you = {
        name: socket.request.user.displayName,
        id: socket.request.user.id,
      };
      let onlineUsersPromise = User.findAll({
        attributes: ['id', ['displayName', 'name']],
        where: { status: 'online' },
      });
      let lobbyUsersPromise = Promise.resolve(null);
      if (socket.request.user.lobbyId)
        lobbyUsersPromise = User.findAll({
          attributes: ['id', ['displayName', 'name'], 'role'],
          where: { status: 'online', lobbyId: socket.request.user.lobbyId },
        });
      Promise.all([onlineUsersPromise, lobbyUsersPromise])
        .then(promises => {
          let onlineUsers = promises[0];
          let lobbyUsers = promises[1];
          response.onlineUsers = onlineUsers;
          if (lobbyUsers) {
            response.lobby = {};
            response.lobby.users = lobbyUsers;
          }
          socket.emit('hello', response);
        })
        .catch(err => dblogger.error('At Get Online Users: ' + err));
    });

    let buildMessage = function(data, to) {
      let message = {
        content: data.message,
        from: {
          id: socket.request.user.id,
          name: socket.request.user.displayName,
        },
      };
      if (to) message.to = { id: to.id, name: to.displayName };
      return message;
    };

    socket.on('global message', function(data) {
      Message.create({
        transport: 'global',
        message: data.message,
        senderId: socket.request.user.id,
      }).catch(err => dblogger.error('At Create Global Message: ' + err));
      io.emit('global message', buildMessage(data));
    });

    socket.on('lobby message', function(data) {
      if (socket.request.user.lobbyId === null) return;
      Message.create({
        transport: 'lobby',
        message: data.message,
        senderId: socket.request.user.id,
        senderRole: socket.request.user.role,
        lobbyId: socket.request.user.lobbyId,
      }).catch(err => dblogger.error('At Create Lobby Message: ' + err));
      if (socket.request.user.role === 'player' || socket.request.user.role === 'host') {
        io
          .to(socket.request.user.lobbyId + 'player')
          .to(socket.request.user.lobbyId + 'spectator')
          .emit('lobby player message', buildMessage(data));
      } else {
        io
          .to(socket.request.user.lobbyId + 'spectator')
          .emit('lobby spectator message', buildMessage(data));
      }
    });

    socket.on('private message', function(data) {
      User.findById(data.to)
        .then(to => {
          Message.create({
            transport: 'private',
            message: data.message,
            senderId: socket.request.user.id,
            recipientId: to.id,
          }).catch(err => dblogger.error('At Create Private Message: ' + err));
          io.to(to.id).emit('private message', buildMessage(data, to));
          socket.emit('private message', buildMessage(data, to));
        })
        .catch(err => dblogger.error('At Private Message Lookup User: ' + err));
    });

    socket.on('join lobby', function(data) {
      socket.request.user.lobbyId = data.lobby;
      if (data.role === 'player' || data.role === 'host')
        socket.join(socket.request.user.lobbyId + 'player');
      else socket.join(socket.request.user.lobbyId + 'spectator');
      User.findAll({
        attributes: ['id', ['displayName', 'name'], 'role'],
        where: { status: 'online', lobbyId: data.lobby },
      })
        .then(users => socket.emit('lobby users', { users }))
        .catch(err => dblogger.error('At Get Lobby Users: ' + err));
    });

    socket.on('leave lobby', function(data) {
      socket.leave(data.lobby + 'player');
      socket.leave(data.lobby + 'spectator');
      socket.request.user.lobbyId = null;
    });
  });
};

module.exports = init;
