(function() {
  Scratch.lobbylist = function() {};

  let socket = Scratch.sockets.base; /* Links to app/socket/base.js */

  Scratch.lobbylist.init = function() {
    // Determine game state and load. Currently only loading the not in a game state.
    //   Or maybe we just use a seperate page for that.
    $('#createLobby').submit(function(e) {
      e.preventDefault();
      let data = $(this)
        .closest('form')
        .serializeJSON();
      // TODO Form valid and filled out ? //
      socket.emit('create lobby', data);
      this.reset(); // Clear form input
      $('#createModal').css('display', 'none');
      // TODO Instead of loading lobby here, we should wait for server to create the lobby
      //      in case validation failed, or some other feedback needs to be given.
      //      Then, upon server saying all's good, we can join the lobby..
      // TODO Replace callback with local error handling callback function
      Scratch.navigate('lobby', Scratch.navigate.callback);
    });

    $('#createbtn').click(function() {
      $('#createModal').css('display', 'block');
    });
    $('.close').click(function() {
      $(this)
        .parents('.modal')
        .css('display', 'none');
    });
  };
})();
