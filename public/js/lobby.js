/* global Scratch */
Scratch.lobby = function() {};

(function() {
  let socket = Scratch.sockets.base; /* Links to app/socket/base.js */

  Scratch.lobby.init = function() {
    let promise;
    promise = new Promise(function (resolve, reject) {
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
      let role = 'player';
      //Top bar information //
      $('#gameType')
        .children()
        .append(' ' + gameType);
      $('#lobbyName')
        .children()
        .append(' ' + lobbyName);
      $('#joincode')
        .children()
        .append(' ' + joincode);

      // Load game specific settings //
      switch (gameType) {
        case 'Go Fish':
          $('#gameSettings').load('snippets/goFishSettings.html');
          break;
        case 'UNO':
          $('#gameSettings').append('snippets/unoSetting.html');
          break;
      }
      // Load member lists //
      //TODO //
      /*Load Danger Zone settings */
      // Hook submit change //
      $('#editLobby').submit(function (e) {
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
        }
        else {
          // Do nothing //
        }


        /* Ask for game types from server */
        socket.emit('game types', {});
        socket.on('game types', function (data) {
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
      });
      /* Ask for game types from server */
      socket.emit('game types', {});

      socket.on('game types', function (data) {
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
      $('#editLobby select[name="gametype"]').change(function () {
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
      setTimeout(() => resolve(role), 100);
      //resolve();
    });

    promise.then(
      function(role) {

        if(role != 'host'){
          $('#gameSet :input').prop('disabled', true);
          $('#editLobby :input').prop('disabled', true);
          $('#startBtn').html('Ready Up');
        }else{
          $('#startBtn').prop('disabled', true);
        }
      },
      function(error) {
        console.log(error);
        // TODO Handle Error //
      }
    );
  };
})();
