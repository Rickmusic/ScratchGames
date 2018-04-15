/* global Scratch, io */
Scratch.chat = function() {};

$(function() {
  let socket = io('/chat'); /* Links to app/socket/chat.js */

  socket.emit('hello', {});

  /* Global Functions */

  Scratch.chat.joinLobby = function(lobby) {
    socket.emit('join lobby', lobby);
    let gList = document.getElementById('headingPlayersOne');
    let lList = document.getElementById('headingPlayersTwo');
    let gChat = document.getElementById('headingOne');
    let lChat = document.getElementById('headingTwo');
    gList.style.display = 'none';
    lList.style.display = 'block';
    gChat.style.display = 'none';
    lChat.style.display = 'block';
  };

  Scratch.chat.updateRole = function(role) {
    Scratch.me.role = role;
    socket.emit('update role', role);
  };

  Scratch.chat.leaveLobby = function() {
    socket.emit('leave lobby', {});
    let gList = document.getElementById('headingPlayersOne');
    let lList = document.getElementById('headingPlayersTwo');
    let gChat = document.getElementById('headingOne');
    let lChat = document.getElementById('headingTwo');
    gList.style.display = 'block';
    lList.style.display = 'none';
    gChat.style.display = 'block';
    lChat.style.display = 'none';
    $('#lobby-players ul li').remove(); // clear the lobby player list
  };

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

  /* 
   * Online User Lists 
   */
  let userListAdd = function(user, $ul) {
    $ul
      .find('li')
      .filter(function() {
        return $(this).data('uid') === user.id;
      })
      .remove();

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
    // Also used for updating role
    userListAdd(user, $('#lobby-players ul'));
  });

  socket.on('user leave lobby', function(user) {
    userListRemove(user, $('#lobby-players ul'));
  });
});
