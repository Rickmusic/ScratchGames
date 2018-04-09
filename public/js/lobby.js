/* global Scratch */
Scratch.lobby = function() {};

(function() {
  let socket = Scratch.sockets.lobby; /* Links to app/socket/lobby.js */
  let global = Scratch.sockets.base; /* Links to app/socket/base.js */
  Scratch.lobby.init = function() {
    socket.emit('lobbyLand', null);

    $('#Players btn.leave-lobby, #Spectators btn.leave-lobby').click(function() {
      // TODO player member lobby
    });
    $('#Players btn.kick-member, #Spectators btn.kick-member').click(function() {
      // TODO host kicks member from lobby
    });

    $('#Players btn.switch-role').click(function() {
      socket.emit('player -> spec', null);
    });
    $('#Spectators btn.switch-role').click(function() {
      socket.emit('spec -> player', null);
    });

    $('#Players btn.switch-role-host').click(function() {
      socket.emit('player -> spec', $(this).closest('div.row').data('uid'));
    });
    $('#Spectators btn.switch-role-host').click(function() {
      socket.emit('spec -> player', $(this).closest('div.row').data('uid'));
    });
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

    $('#gameSet').change(function() {
      socket.emit('settings change', $(this).closest('form').serializeJSON());
    });

    socket.on('settings change', function(change) {
      // TODO what comes in the change obj
      // TODO what extra checks/changes occur when changing game settings for non-host
    });
  };

  //Adds single member to player lists
  Scratch.lobby.member = function(mem) {
    if (Scratch.me.id === mem.id) Scratch.me.role = mem.role;
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

    $('#editLobby').change(function() {
      socket.emit('danger change', $(this).closest('form').serializeJSON());
    });

    socket.on('danger change', function(change) {
      // TODO what comes in the change obj
      // TODO what extra checks/changes occur when changing danger settings for non-host
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
