/* global Scratch, io */
$(function() {
  let global = Scratch.sockets.base; /* Links to app/socket/base.js */
  let socket = io('/chat'); /* Links to app/socket/chat.js */

  socket.emit('hello', {});

  /* Chat Input Forms */

  $('.chat-input').submit(function(e) {
    e.preventDefault();
    let data = $(this)
      .closest('form')
      .serializeJSON();
    switch ($(this)
      .closest('div[id]')
      .attr('id')) {
      case 'global-chat':
        socket.emit('global message', data);
        break;
      case 'lobby-chat':
        socket.emit('lobby message', data);
        break;
      default:
        console.log(
          'Unknown Chat Container: ' +
            $(this)
              .closest('div[id]')
              .attr('id')
        );
    }
    this.reset();
  });

  /* Handling reciept of chat message */

  let buildDisplayedMessage = function(msg) {
    return $('<li>')
      .data('from-id', msg.from.id)
      .html([
        $('<span>')
          .addClass('name')
          .text(msg.from.name)[0],
      ])
      .append(msg.content);
  };

  socket.on('global message', function(msg) {
    $('#global-chat ul').append(buildDisplayedMessage(msg));
    $('#GlobalChatWindow').scrollTop($('#GlobalChatWindow')[0].scrollHeight);
  });

  socket.on('lobby player message', function(msg) {
    $('#lobby-chat ul').append(buildDisplayedMessage(msg));
    $('#LobbyChatWindow').scrollTop($('#LobbyChatWindow')[0].scrollHeight);
  });

  socket.on('lobby spectator message', function(msg) {
    $('#lobby-chat ul').append(buildDisplayedMessage(msg));
    $('#LobbyChatWindow').scrollTop($('#LobbyChatWindow')[0].scrollHeight);
  });

  /* Join / Leave Lobby (Recieved on Global Socket) */

  global.on('join lobby', function(data) {
    // Echo to Chat Socket
    socket.emit('join lobby', data);
  });

  global.on('leave lobby', function(data) {
    // Echo to Chat Socket
    socket.emit('leave lobby', data);
  });

  /* 
   * Online User Lists 
   */
  let userListAdd = function(user, $ul) {
    // If user not already in list, add them
    if (
      $ul.find('li').filter(function() {
        return $(this).data('uid') === user.id;
      }).length === 0
    ) {
      $ul.append(
        $('<li>')
          .addClass(function() {
            if (user.role) return user.role;
          })
          .data('uid', user.id)
          .data('uname', user.name)
          .data('urole', user.role)
          .text(user.name)
      );
      $ul
        .find('li')
        .sort(function(a, b) {
          return $(b).data('uname') < $(a).data('uname') ? 1 : -1;
        })
        .appendTo($ul);
    }
  };

  let userListRemove = function(user, $ul) {
    $ul
      .find('li')
      .filter(function() {
        return $(this).data('uid') === user.id;
      })
      .remove();
  };

  socket.on('hello', function(data) {
    // Clear and rebuild Online User list
    $('#global-players ul li').remove();
    $('#lobby-players ul li').remove();
    userListAdd(data.you, $('#global-players ul'));
    for (let user of data.onlineUsers) {
      userListAdd(user, $('#global-players ul'));
    }
    if (data.lobby) {
      for (let user of data.lobby.users) {
        userListAdd(user, $('#lobby-players ul'));
      }
    }
  });

  socket.on('lobby users', function(data) {
    for (let user of data.users) {
      userListAdd(user, $('#lobby-players ul'));
    }
  });

  socket.on('user online', function(user) {
    userListAdd(user, $('#global-players ul'));
  });

  socket.on('user offline', function(user) {
    userListRemove(user, $('#global-players ul'));
  });

  socket.on('user join lobby', function(user) {
    userListAdd(user, $('#lobby-players ul'));
  });

  socket.on('user leave lobby', function(user) {
    userListRemove(user, $('#lobby-players ul'));
  });
});
