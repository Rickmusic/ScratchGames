/* global Scratch */
(function() {
  Scratch.lobbylist = function() {};

  let socket = Scratch.sockets.base; /* Links to app/socket/base.js */

  Scratch.lobbylist.init = function() {
    $('#createbtn').click(function() {
      // TODO Replace callback with local error handling callback function
      Scratch.nav.goTo('createlobby', Scratch.nav.callback);
    });
 };

  Scratch.lobbylist.create = function() {};

  Scratch.lobbylist.create.init = function() {
    $('#createLobby').submit(function(e) {
      e.preventDefault();
      let data = $(this)
        .closest('form')
        .serializeJSON();
      // TODO Form valid and filled out ? //
      socket.emit('create lobby', data);
      this.reset(); // Clear form input
      $('#modal').hide();
      // TODO Instead of loading lobby here, we should wait for server to create the lobby
      //      in case validation failed, or some other feedback needs to be given.
      //      Then, upon server saying all's good, we can join the lobby..
      // TODO Replace callback with local error handling callback function
      Scratch.nav.goTo('lobby', Scratch.nav.callback);
    });
  };
})();
