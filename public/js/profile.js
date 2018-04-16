/* global Scratch */
Scratch.locations.profile = function() {};

(function() {
  let socket = Scratch.sockets.base; /* Links to app/socket/base.js */

  Scratch.locations.profile.init = function() {
    $('#displayName').submit(function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      let data = $(this)
        .closest('form')
        .serializeJSON();
      socket.emit('displayName', data);
      $('#serverMessage').text('Server verifying');
    });
    $('#email').submit(function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      let data = $(this)
        .closest('form')
        .serializeJSON();
      socket.emit('email', data);
      $('#serverMessage').text('Server verifying');
    });
    $('#password').submit(function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      let data = $(this)
        .closest('form')
        .serializeJSON();
      socket.emit('password', data);
      $('#serverMessage').text('Server verifying');
    });
  };

  socket.on('return', function(data) {
    $('#serverMessage').empty();
    if (data.success === true) {
      $('#password').trigger('reset');
      $('#displayName').trigger('reset');
      $('#email').trigger('reset');
      $('#serveMessage').text('Success');
    } else {
      $('#serverMessage').text('Something went wrong: ' + data.message);
    }
  });
})();
