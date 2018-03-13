'use strict';

let db = require('../db');
let dblogger = require('winston').loggers.get('db');
let { Message, User } = db.models;

let init = function(io) {
  let chatio = io.of('/chat');
  chatio.on('connection', function(socket) {
    //socket.request.user.socket = socket.id;

    //socket.on('disconnect', function () {
    //  socket.request.user.socket = null;
    //});

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
        fromId: socket.request.user.id,
      })
        .catch((err) => dblogger.error('At Create Global Message: ' + err));
      chatio.emit('global message', buildMessage(data));
    });

    socket.on('lobby message', function(data) {
      if (socket.request.user.lobbyId === null) return;
      Message.create({
        transport: 'lobby',
        message: data.message,
        fromId: socket.request.user.id,
        fromRole: socket.request.user.role,
        lobbyId: socket.request.user.lobbyId,
      })
        .catch((err) => dblogger.error('At Create Lobby Message: ' + err));
      if (socket.request.user.role === 'player') {
        chatio.to(socket.request.user.lobbyId + 'player').emit('lobby player message', buildMessage(data));
        chatio.to(socket.request.user.lobbyId + 'spectator').emit('lobby player message', buildMessage(data));
      }
      else {
        chatio.to(socket.request.user.lobbyId + 'spectator').emit('lobby spectator message', buildMessage(data));
      }
    });

    socket.on('private message', function(data) {
      User.findById(data.to)
        .then((to) => {
          Message.create({
            transport: 'private',
            message: data.message,
            fromId: socket.request.user.id,
            ToId: to.id,
          })
            .catch((err) => dblogger.error('At Create Private Message: ' + err));
          chatio.to(to.socket).emit('private message', buildMessage(data, to));
          socket.emit('private message', buildMessage(data, to));
        })
        .catch((err) => dblogger.error('At Private Message Lookup User: ' + err));
    });
  });
};

module.exports = init;
