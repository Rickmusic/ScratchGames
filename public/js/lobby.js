/* global Scratch */
Scratch.lobby = function() {};

(function() {
  let socket = Scratch.sockets.lobby; /* Links to app/socket/lobby.js */
  let global = Scratch.sockets.base; /* Links to app/socket/base.js */
  Scratch.lobby.init = function() {
    socket.emit('lobbyLand', null);
  };

  socket.on('lobbyLand', function(everything) {
    let gameType = everything.game; // String //
    let access = everything.type; // String private or public //
    let lobbyName = everything.name; // String //
    let joincode = everything.joincode; // Int //
    let members = everything.users; // List of objects with name(String), role(String), id(String), ready(Bool) //
    //let maxPlayers = everything.maxPlayers; // in progress
    //let maxSpec = everything.maxSpectators; // in progress

    Scratch.lobby.loadTop(gameType, lobbyName, joincode, access);
    for (let mem of members) {
      Scratch.lobby.member(mem);
    }

    Scratch.lobby
      .loadGameSettings(gameType)
      .then(() => hookGameSettings())
      .catch(err => console.log(err));
    Scratch.lobby.loadDangerZone();
  });

  socket.on('member', function(mem) {
    Scratch.lobby.member(mem);
  });

  // Loads the top bar information ///
  Scratch.lobby.loadTop = function(gameType, lobbyName, joincode, access) {
    $('#access')
      .children()
      .append(' ' + access);
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
    return new Promise((fulfill, reject) => {
      $('#gameSettings').load('gamesettings/' + gameType + '.html', function(response, status, xhr) {
        if (status === 'error') return reject(xhr.statusText);
        fulfill();
      });
    });
  };

  function hookGameSettings() {
    if (Scratch.me.role !== 'host') {
      $('#gameSet :input').prop('disabled', true);
      $('#editLobby :input').prop('disabled', true);
      $('#startBtn').html('Ready Up');
    } else {
      $('#startBtn').prop('disabled', true);
    }
  };

  //Adds single member to player lists
  Scratch.lobby.member = function(mem) {
    if (Scratch.me.id === members.id) Scratch.me.role = members.role;
    $newRow = $('<div class="row" />');
    $newCol = $('<div class="col center">' + mem.name + '</div>');
    $newRow.append($newCol);
    if (mem.role === 'host') {
      $newSpan = $('<span class="glyphicon glyphicon-tower">' + '</span>');
      $newCol = $('<div class="col center"></div>');
    } else if (mem.role === 'player' && mem.ready === false) {
      $newSpan = $('<span class="glyphicon glyphicon-remove">' + '</span>');
      $newCol = $('<div class="col center"></div>');
    } else if (mem.role === 'player' && mem.ready === true) {
      $newSpan = $('<span class="glyphicon glyphicon-ok">' + '</span>');
      $newCol = $('<div class="col center"></div>');
    }
    $newCol.append($newSpan);
    $newRow.append($newCol);
    $('#Players').append($newRow);
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
    global.emit('game types', {});

    global.on('game types', function(data) {
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
