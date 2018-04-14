/* global Scratch io*/
Scratch.locations.lobbylist = function() {};

(function() {
  let global = Scratch.sockets.base; /* Links to app/socket/base.js */
  let socket = io('/lobbylist');

  Scratch.locations.lobbylist.init = function() {
    Scratch.locations.lobbylist.addlobby('Pizza');
    $('#All').click(function() {
      $('#addLob')
        .children()
        .show();
    });
    $('#GoFish').click(function() {
      $('#addLob')
        .children()
        .hide();
      $('#addLob')
        .children()
        .filter(function() {
          return $(this).data('gameType') === 'Go Fish';
        })
        .show();
    });
    $('#UNO').click(function() {
      $('#addLob')
        .children()
        .hide();
      $('#addLob')
        .children()
        .filter(function() {
          return $(this).data('gameType') === 'UNO';
        })
        .show();
    });

    $('#createbtn').click(function() {
      // TODO Replace callback with local error handling callback function
      Scratch.nav.goTo('createlobby', Scratch.nav.callback);
    });
  };

  Scratch.locations.lobbylist.create = function() {};

  Scratch.locations.lobbylist.create.init = function() {
    $('#createLobby').submit(function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      let data = $(this)
        .closest('form')
        .serializeJSON();
      // TODO Form valid and filled out ? //
      global.emit('create lobby', data);
      // TODO We should wait for server to create the lobby in case validation failed,
      //      or some other feedback needs to be given.
      this.reset(); // Clear form input (or maybe we shouldn't incase there is an error)
      // Currently server calls nav upon success. Can be changed if we want to manage UI here.
    });

    $('#createLobby select[name="gametype"]').change(function() {
      $('#numPlay').prop('disabled', false);
      $('#createLobby select[name="numPlayers"] option:disabled').prop('selected', true);
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

    global.on('game types', function(data) {
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
    global.emit('game types', {});
  };

  socket.on('lobbyList', function(lobbies) {
    for (let lob of lobbies) {
      Scratch.locations.lobbylist.addlobby(lob);
    }
  });

  socket.on('removeLobby', function(lid){
    Scratch.locations.lobbylist.killLobby(lid);
  });

  Scratch.locations.lobbylist.addlobby = function(lob) {
    let $newRow = $('<tr> </tr>');
    // Adding Lobby Name //
    let $newCol = $('<td> </td>');
    $newCol.append('name');
    $newRow.append($newCol);
    // Adding Lobby Game Type //
    $newCol = $('<td> </td>');
    $newCol.append('Game Type');
    $newRow.append($newCol);
    // Adding player counts //
    $newCol = $('<td> </td>');
    $newCol.append('currentNumber / Lobby Cap');
    $newRow.append($newCol);
    // Adding number of Spectators //
    $newCol = $('<td> </td>');
    $newCol.append('Spec Number');
    $newRow.append($newCol);
    // Adding Private Public Setting //
    $newCol = $('<td> </td>');
    let $newSpan = $('<span class="glyphicon glyphicon-lock">' + '</span>');
    $newCol.append($newSpan);
    $newRow.append($newCol);
    // Adding join Spec Button //
    $newCol = $('<td> </td>');
    let $newBtn = $('<button type="button" class="btn btn-success btn-lg">Join</button>');
    $newCol.append($newBtn);
    $newRow.append($newCol);
    // Adding Data //
    $newRow.data('gameType', 'Go Fish');
    $newRow.data('lid', 'someId');

    // Adding everything to table //
    $newRow.append($newCol);

    $('#addLob').append($newRow);
  };

  Scratch.locations.lobbylist.killLobby = function(lobId) {
    $('#addLob')
      .children()
      .filter(function() {
        return $(this).data('lid') === lobId;
      })
      .remove();
  };
})();
