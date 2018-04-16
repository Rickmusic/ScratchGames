/* global Scratch io*/
Scratch.locations.lobbylist = function() {};

(function() {
  let global = Scratch.sockets.base; /* Links to app/socket/base.js */
  let socket = io('/lobbylist');

  Scratch.locations.lobbylist.init = function() {
    $('#AllList').click(function() {
      $('#addLob')
        .children()
        .show();
    });
    $('#GoFishList').click(function() {
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
    $('#UNOList').click(function() {
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
    $('#message').empty();
    $('#createLobby').trigger('reset');
    $('#createLobby').submit(function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      let data = $(this)
        .closest('form')
        .serializeJSON();
      // TODO Form valid and filled out ? //
      global.emit('create lobby', data);
      $('#message').empty();
      $('#message').text('Server Thinking');
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

  socket.on('updateCounts', function(lob) {
    Scratch.locations.lobbylist.updateMemberCounts(lob);
  });

  socket.on('updateConfig', function(lob) {
    Scratch.locations.lobbylist.updateLobbyConfig(lob);
  });

  socket.on('lobbylist', function(lobbies) {
    for (let lob of lobbies) {
      Scratch.locations.lobbylist.addlobby(lob);
    }
  });

  socket.on('removeLobby', function(lid) {
    Scratch.locations.lobbylist.killLobby(lid);
  });

  global.on('createLobby', function(message) {
    $('#message').empty();
    $('#message').text('Something went wrong ' + message);
  });
  Scratch.locations.lobbylist.addlobby = function(lob) {
    // If the lobby is already there. Kill it before adding it //
    $('#addLob')
      .children()
      .filter(function() {
        return $(this).data('lid') === lob.id;
      })
      .remove();

    let $newRow = $('<tr class="lob">');
    // Adding Lobby Name //
    $newRow.append($('<td>').append(lob.name));
    // Adding Lobby Game Type //
    $newRow.append($('<td>').html($('<span class="lob-game">').text(lob.gameType)));
    // Adding player counts //
    $newRow.append(
      $('<td>').html([
        $('<span class="lob-players">').text(lob.currentPlayers),
        '/',
        $('<span class="lob-cap">').text(lob.lobbyCap),
      ])
    );
    // Adding number of Spectators //
    $newRow.append(
      $('<td>').html($('<span class="lob-spectators">').text(lob.spectators))
    );
    // Adding Private Public logic //
    if (lob.access === 'private') {
      // Locking players //
      $newRow.append($('<td>').html($('<span class="glyphicon glyphicon-lock">')));
      // Locking Spectators //
      $newRow.append($('<td>').html($('<span class="glyphicon glyphicon-lock">')));
    } else {
      let $joinPlayer = $('<td class="lob-join-player">');
      if (lob.currentPlayers >= lob.lobbyCap) {
        // Locking players because no more room //
        $joinPlayer.html($('<span class="glyphicon glyphicon-lock">'));
      } else {
        // Add join players //
        $joinPlayer.html(
          $('<button type="button" class="btn btn-success btn-lg joinPlay">Join</button>')
        );
      }
      $newRow.append($joinPlayer);
      // Adding join Spectators //
      $newRow.append(
        $('<td>').html(
          $('<button type="button" class="btn btn-success btn-lg joinSpec">Join</button>')
        )
      );
    }
    // Adding Data //
    $newRow.data('gameType', lob.gameType);
    $newRow.data('lid', lob.id);

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

  Scratch.locations.lobbylist.updateMemberCounts = function(lob) {
    let $lob = $('#addLob')
      .children()
      .filter(function() {
        return $(this).data('lid') === lob.id;
      });
    $lob.find('span.lob-players').text(lob.players);
    $lob.find('span.lob-spectators').text(lob.spectators);
  };

  Scratch.locations.lobbylist.updateLobbyConfig = function(lob) {
    let $lob = $('#addLob')
      .children()
      .filter(function() {
        return $(this).data('lid') === lob.id;
      });
    $lob.find('span.lob-game').text(lob.game);
    $lob.find('span.lob-cap').text(lob.playerCap);
  };
})();
