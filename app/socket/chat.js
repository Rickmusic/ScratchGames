'use strict';

let db = require('../db');
let dblogger = require('winston').loggers.get('db');
let { Message, User } = db.models;

let init = function(io) {
  io.on('connection', function(socket) {
    socket.on('hello', function() {
      socket.request.user.update({ status: 'online' })
        .then(() => {})
        .catch(err => dblogger.error('Socket - Chat - Hello - Update: ' + err));
      socket.emit('user online', { id: socket.request.user.id, name: socket.request.user.displayName });
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
        .catch(err => dblogger.error('Socket - Chat - Hello - Find Users: ' + err));
    });

    socket.on('disconnect', function() {
      socket.request.user.update({ status: 'offline' })
        .then(() => {})
        .catch(err => dblogger.error('Socket - Chat - Hello - Update: ' + err))
      socket.emit('user offline', { id: socket.request.user.id });
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
      }).catch(err =>
        dblogger.error('Socket - Chat - Global Message - Create Message: ' + err)
      );
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
      }).catch(err =>
        dblogger.error('Socket - Chat - Lobby Message - Create Message: ' + err)
      );
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
          }).catch(err =>
            dblogger.error('Socket - Chat - Private Message - Create Message: ' + err)
          );
          io.to(to.id).emit('private message', buildMessage(data, to));
          socket.emit('private message', buildMessage(data, to));
        })
        .catch(err =>
          dblogger.error('Socket - Chat - Private Message - Lookup User: ' + err)
        );
    });

    socket.on('join lobby', function(data) {
      socket.request.user.lobbyId = data.lobby;
      if (data.role === 'player' || data.role === 'host')
        socket.join(socket.request.user.lobbyId + 'player');
      else socket.join(socket.request.user.lobbyId + 'spectator');
      socket.broadcast
        .to(socket.request.user.lobbyId + 'player')
        .to(socket.request.user.lobbyId + 'spectator')
        .emit('user join lobby', {
          id: socket.request.user.id,
          name: socket.request.user.displayName,
          role: data.role,
        });
      User.findAll({
        attributes: ['id', ['displayName', 'name'], 'role'],
        where: { status: 'online', lobbyId: data.lobby },
      })
        .then(users => socket.emit('lobby users', { users }))
        .catch(err => dblogger.error('Socket - Chat - Join Lobby - Find Users: ' + err));
    });

    socket.on('update role', function(role) {
      socket.leave(socket.request.user.lobbyId + 'player');
      socket.leave(socket.request.user.lobbyId + 'spectator');
      if (role === 'player' || role === 'host')
        socket.join(socket.request.user.lobbyId + 'player');
      else socket.join(socket.request.user.lobbyId + 'spectator');
      socket.broadcast
        .to(socket.request.user.lobbyId + 'player')
        .to(socket.request.user.lobbyId + 'spectator')
        .emit('user join lobby', {
          id: socket.request.user.id,
          name: socket.request.user.displayName,
          role: role,
        });
    });

    socket.on('leave lobby', function() {
      socket.leave(socket.request.user.lobbyId + 'player');
      socket.leave(socket.request.user.lobbyId + 'spectator');
      socket.broadcast
        .to(socket.request.user.lobbyId + 'player')
        .to(socket.request.user.lobbyId + 'spectator')
        .emit('user leave lobby', { id: socket.request.user.id });
    });
  });
};

module.exports = init;
