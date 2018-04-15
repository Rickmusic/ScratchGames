/* global Scratch io*/
Scratch.locations.lobbylist = function() {};

(function() {
  let global = Scratch.sockets.base; /* Links to app/socket/base.js */
  let socket = io('/lobbylist');

  Scratch.locations.lobbylist.init = function() {
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
          return $(this).data('gameType') === 'GoFish';
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
          return $(this).data('gameType') === 'Uno';
        })
        .show();
    });
    $('#addLob').on('click', 'button', function() {
      if ($(this).hasClass('joinPlay')) {
        global.emit(
          'join as player',
          $(this)
            .closest('tr.lob')
            .data('lid')
        );
      } else if ($(this).hasClass('joinSpec')) {
        global.emit(
          'join as spectator',
          $(this)
            .closest('tr.lob')
            .data('lid')
        );
      }
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

  socket.on('update', function(lob) {
    Scratch.locations.lobbylist.addlobby(lob);
  });

  socket.on('lobbylist', function(lobbies) {
    for (let lob of lobbies) {
      Scratch.locations.lobbylist.addlobby(lob);
    }
  });

  socket.on('removeLobby', function(lid) {
    Scratch.locations.lobbylist.killLobby(lid);
  });

  Scratch.locations.lobbylist.addlobby = function(lob) {
    // If the lobby is already there. Kill it before adding it //
    $('#addLob')
      .children()
      .filter(function() {
        return $(this).data('lid') === lob.id;
      })
      .remove();

    let $newSpan;
    let $newBtn;
    let $newRow = $('<tr class="lob"> </tr>');
    // Adding Lobby Name //
    let $newCol = $('<td> </td>');
    $newCol.append(lob.name);
    $newRow.append($newCol);
    // Adding Lobby Game Type //
    $newCol = $('<td> </td>');
    $newCol.append(lob.gameType);
    $newRow.append($newCol);
    // Adding player counts //
    $newCol = $('<td> </td>');
    $newCol.append(lob.currentPlayers + '/' + lob.lobbyCap);
    $newRow.append($newCol);
    // Adding number of Spectators //
    $newCol = $('<td> </td>');
    $newCol.append(lob.spectators);
    $newRow.append($newCol);
    // Adding Private Public logic //
    if (lob.access === 'private') {
      // Locking players //
      $newCol = $('<td> </td>');
      $newSpan = $('<span class="glyphicon glyphicon-lock">' + '</span>');
      $newCol.append($newSpan);
      $newRow.append($newCol);
      // Locking Spectators //
      $newCol = $('<td> </td>');
      $newSpan = $('<span class="glyphicon glyphicon-lock">' + '</span>');
      $newCol.append($newSpan);
      $newRow.append($newCol);
    } else {
      if (lob.currentPlayers === lob.lobbyCap) {
        // Locking players because no more room //
        $newCol = $('<td> </td>');
        $newSpan = $('<span class="glyphicon glyphicon-lock">' + '</span>');
        $newCol.append($newSpan);
        $newRow.append($newCol);
      } else {
        // Add join players //
        $newCol = $('<td> </td>');
        $newBtn = $(
          '<button type="button" class="btn btn-success btn-lg joinPlay">Join</button>'
        );
        $newCol.append($newBtn);
        $newRow.append($newCol);
      }
      // Adding join Spectators //
      $newCol = $('<td> </td>');
      $newBtn = $(
        '<button type="button" class="btn btn-success btn-lg joinSpec">Join</button>'
      );
      $newCol.append($newBtn);
      $newRow.append($newCol);
    }
    // Adding Data //
    $newRow.data('gameType', lob.gameType);
    $newRow.data('lid', lob.id);

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
