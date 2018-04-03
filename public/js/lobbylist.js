/* global Scratch */
Scratch.lobbylist = function() {};

(function() {
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
      e.stopImmediatePropagation();
      let data = $(this)
        .closest('form')
        .serializeJSON();
      // TODO Form valid and filled out ? //
      socket.emit('create lobby', data);
      // TODO We should wait for server to create the lobby in case validation failed,
      //      or some other feedback needs to be given.
      this.reset(); // Clear form input (or maybe we shouldn't incase there is an error)
      // Currently server calls nav upon success. Can be changed if we want to manage UI here.
    });

    $('#createLobby select[name="gametype"]').change(function() {
      $('#numPlay').prop('disabled', false);
      $('#createLobby select[name="numPlayers"] option:disabled').prop(
        'selected',
        true
      );
      $('#createLobby select[name="numPlayers"] option:enabled').remove();
      let $opt = $(this).find('option:selected');
      for (let i = $opt.data('minPlay'); i <= $opt.data('maxPlay'); i++) {
        $('#createLobby select[name="numPlayers"]').append(
          $('<option>')
            .val(i)
            .text(i)
        );
      }
    });

    socket.on('game types', function(data) {
      $('#createLobby select[name="gametype"]')
        .empty()
        .append('<option value="" disabled selected>Select</option>');
      for (let i = 0; i < data.GameTypes.length; i++) {
        let gametype = data.GameTypes[i];
        $('#createLobby select[name="gametype"]').append(
          $('<option>')
            .val(gametype.id)
            .data('minPlay', gametype.minPlayer)
            .data('maxPlay', gametype.maxPlayer)
            .text(gametype.display)
        );
      }
    });

    /* Ask for game types from server */
    socket.emit('game types', {});
  };
})();
