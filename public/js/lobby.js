/* global Scratch */
Scratch.lobby = function() {};

(function() {
  let socket = Scratch.sockets.base; /* Links to app/socket/base.js */

  Scratch.lobby.init = function() {
    let promise;
    promise = new Promise(function(resolve, reject) {
      // We also run this after a game has terminated // Can choose to start another game etc//
      // Organized top left down right loading...//
      // Assume there is a call to server here to get //
      // Lobby name
      // Gametype
      // Joincode
      // If Im host, player or spec //
      // What username I am //

      // TEMP VALUES TO WORK WITH //
      let gameType = 'Go Fish';
      let lobbyName = 'Pizza';
      let joincode = '75843';
      let members = []; // Everybody who is in the lobby including ones self? including state if ready etc.
      let role = 'host';

      Scratch.lobby.loadTop(gameType, lobbyName, joincode);
      //TODO load member lists //
      Scratch.lobby.loadGameSettings(gameType);
      Scratch.lobby.loadDangerZone();
      //Scratch.base.addChat("lobby");
      /* Promise set on timeout which according to the limited tests Iv'e done runs post DOM manipulation to
      add event handlers to the newly added item in the DOM. There's a better way to force this into a sync method but for now it's working
       */
      setTimeout(() => resolve(role), 100);
    });
    promise.then(
      function(role) {
        // Do post load DOM handling here //
        if (role != 'host') {
          $('#gameSet :input').prop('disabled', true);
          $('#editLobby :input').prop('disabled', true);
          $('#startBtn').html('Ready Up');
        } else {
          $('#startBtn').prop('disabled', true);
        }
      },
      function(error) {
        console.log(error);
        // TODO Handle Error //
      }
    );
  };
  // Loads the top bar information ///
  Scratch.lobby.loadTop = function(gameType, lobbyName, joincode) {
    $('#gameType')
      .children()
      .append(' ' + gameType);
    $('#lobbyName')
      .children()
      .append(' ' + lobbyName);
    $('#joincode')
      .children()
      .append(' ' + joincode);
  };
  // Loads Game specific Settings HTML //
  Scratch.lobby.loadGameSettings = function(gameType) {
    switch (gameType) {
      case 'Go Fish':
        $('#gameSettings').load('snippets/goFishSettings.html');
        break;
      case 'UNO':
        $('#gameSettings').append('snippets/unoSetting.html');
        break;
    }
  };
  // Loading Danger Zone Settings //
  Scratch.lobby.loadDangerZone = function() {
    $('#editLobby').submit(function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (
        confirm(
          'These changes will un-ready players and could potentially kick players from the lobby. Do you wish to continue?'
        )
      ) {
        let data = $(this)
          .closest('form')
          .serializeJSON();
        // TODO Form valid and filled out ? //
        socket.emit('edit lobby', data);
        // TODO We should wait for server to create the lobby in case validation failed,
        //      or some other feedback needs to be given.
        this.reset(); // Clear form input (or maybe we shouldn't incase there is an error)
        // Currently server calls nav upon success. Can be changed if we want to manage UI here.
      } else {
        // Do nothing //
      }
    });
    socket.emit('game types', {});

    socket.on('game types', function(data) {
      $('#editLobby select[name="gametype"]')
        .empty()
        .append('<option value="" disabled selected>Select</option>');
      for (let i = 0; i < data.GameTypes.length; i++) {
        let gametype = data.GameTypes[i];
        $('#editLobby select[name="gametype"]').append(
          $('<option>')
            .val(gametype.id)
            .data('minPlay', gametype.minPlayer)
            .data('maxPlay', gametype.maxPlayer)
            .text(gametype.display)
        );
      }
    });
    $('#editLobby select[name="gametype"]').change(function() {
      $('#numPlay').prop('disabled', false);
      $('#confirm').prop('disabled', false);
      $('#editLobby select[name="numPlayers"] option:disabled').prop(
        'selected',
        true
      );
      $('#editLobby select[name="numPlayers"] option:enabled').remove();
      let $opt = $(this).find('option:selected');
      for (let i = $opt.data('minPlay'); i <= $opt.data('maxPlay'); i++) {
        $('#editLobby select[name="numPlayers"]').append(
          $('<option>')
            .val(i)
            .text(i)
        );
      }
    });
  };
})();
