'use strict';

let objectifySerializedArray = function(arr) {
  let returnObj = {};
  for (let i of arr) {
    returnObj[i.name] = i.value;
  }
  return returnObj;
};

let init = function(io) {
  let chatio = io.of('/chat');
  chatio.on('connection', function(socket) {
    socket.join('lobby');

    socket.on('global message', function(data) {
      data = objectifySerializedArray(data);
      let message = {
        content: data.message,
        timestamp: new Date(),
        from: {
          id: socket.request.user.id,
          name: socket.request.user.displayName,
        },
      };
      chatio.emit('global message', message);
    });

    socket.on('lobby message', function(data) {
      data = objectifySerializedArray(data);
      let message = {
        content: data.message,
        timestamp: new Date(),
        from: {
          id: socket.request.user.id,
          name: socket.request.user.displayName,
        },
      };
      chatio.to('lobby').emit('lobby message', message);
    });
  });
};

module.exports = init;
