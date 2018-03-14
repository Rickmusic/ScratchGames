/* global Scratch, io */
$(function() {
  let socket = io('/chat'); /* Links to app/socket/chat.js */

  socket.emit('hello', {});

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

  // Handling reciept of chat message //

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
  });

  socket.on('lobby message', function(msg) {
    $('#lobby-chat ul').append(buildDisplayedMessage(msg));
  });
});
