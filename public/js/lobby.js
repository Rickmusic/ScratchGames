/* global Scratch */
Scratch.locations.lobby = function() {};

(function() {
  let socket = Scratch.sockets.lobby; /* Links to app/socket/lobby.js */
  let global = Scratch.sockets.base; /* Links to app/socket/base.js */
  Scratch.locations.lobby.init = function() {
    socket.emit('lobbyLand', null);

    $('#startBtn').on('click', function() {
      if (Scratch.me.role === 'player') {
        socket.emit('playerReady', null);
        $('#startBtn').prop('disabled', true);
      } else if (Scratch.me.role === 'host') {
        socket.emit('start game', {});
      }
    });
    $('#Players').on('click', 'button', function() {
      if ($(this).hasClass('switch-role') && Scratch.me.role === 'host')
        return socket.emit(
          'player -> spec',
          $(this)
            .closest('div.row')
            .data('uid')
        );
      if ($(this).hasClass('switch-role')) return socket.emit('player -> spec', null);
      if ($(this).hasClass('leave-lobby')) return Scratch.lobby.leave();
      if ($(this).hasClass('kick-member'))
        return socket.emit(
          'kick member',
          $(this)
            .closest('div.row')
            .data('uid')
        );
    });

    $('#Spectators').on('click', 'button', function() {
      if ($(this).hasClass('switch-role') && Scratch.me.role === 'host')
        return socket.emit(
          'spec -> player',
          $(this)
            .closest('div.row')
            .data('uid')
        );
      if ($(this).hasClass('switch-role')) return socket.emit('spec -> player', null);
      if ($(this).hasClass('leave-lobby')) return Scratch.lobby.leave();
      if ($(this).hasClass('kick-member'))
        return socket.emit(
          'kick member',
          $(this)
            .closest('div.row')
            .data('uid')
        );
    });

    if (Scratch.me.role !== 'host') {
      $('#editLobby :input').prop('disabled', true);
      $('#startBtn').html('Ready Up');
      $('#abandon').prop('disabled', true);
    } else {
      $('#startBtn').prop('disabled', true);
    }
  };

  socket.on('lobbyLand', function(everything) {
    let gameType = everything.game; // String //
    let gameSettings = everything.gamesettings; // Object //
    let access = everything.type; // String private or public //
    let lobbyName = everything.name; // String //
    let joincode = everything.joincode; // Int //
    let members = everything.users; // List of objects with name(String), role(String), id(String), ready(Bool) //
    //let maxPlayers = everything.maxPlayers; // in progress
    //let maxSpec = everything.maxSpectators; // in progress

    Scratch.locations.lobby.loadTop(gameType, lobbyName, joincode, access);
    for (let mem of members) {
      Scratch.locations.lobby.member(mem);
    }

    Scratch.locations.lobby
      .loadGameSettings(gameType)
      .then(() => hookGameSettings(gameSettings))
      .catch(err => console.log(err));
    Scratch.locations.lobby.loadDangerZone();
  });

  socket.on('member', function(mem) {
    Scratch.locations.lobby.member(mem);
  });

  // Loads the top bar information ///
  Scratch.locations.lobby.loadTop = function(gameType, lobbyName, joincode, access) {
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
  Scratch.locations.lobby.loadGameSettings = function(gameType) {
    return new Promise((fulfill, reject) => {
      $('#gameSettings').load('gamesettings/' + gameType + '.html', function(
        response,
        status,
        xhr
      ) {
        if (status === 'error') return reject(xhr.statusText);
        fulfill();
      });
    });
  };

  function hookGameSettings(gameSettings) {
    if (Scratch.me.role !== 'host') {
      $('#gameSet :input').prop('disabled', true);
    }

    $('#gameSet').change(function() {
      socket.emit(
        'settings change',
        $(this)
          .closest('form')
          .serializeJSON()
      );
    });

    socket.on('settings change', changes => $('form#gameSet').updateForm(changes));
    $('form#gameSet').updateForm(gameSettings);
  }

  socket.on('playerLeft', function(uid) {
    $('#Players div.row, #Spectators div.row')
      .filter(function() {
        return $(this).data('uid') === uid;
      })
      .remove();
  });

  socket.on('playerReady', function(uid) {
    $('#Players div.row')
      .filter(function() {
        return $(this).data('uid') === uid;
      })
      .find('span')
      .attr('class', 'glyphicon glyphicon-ok');
  });
  socket.on('lobbyReady', function() {
    if (Scratch.me.role === 'host') {
      $('#startBtn').prop('disabled', false);
    } else {
      //Do nothing
    }
  });
  socket.on('lobbyUnready', function() {
    if (Scratch.me.role === 'host') {
      $('#startBtn').prop('disabled', true);
    } else {
      //Do nothing
    }
  });
  //Adds single member to player lists
  Scratch.locations.lobby.member = function(mem) {
    $('#Players div.row, #Spectators div.row')
      .filter(function() {
        return $(this).data('uid') === mem.id;
      })
      .remove();
    let $newRow = $('<div class="row" />');
    let $newCol = $('<div class="col center">' + mem.name + '</div>');
    $newRow.append($newCol);

    // If adding myself //
    if (Scratch.me.id === mem.id) {
      Scratch.me.role = mem.role;
      // Adding Buttons to become player or spec //
      let $newBtn;
      if (mem.role === 'player') {
        $newBtn = $(
          '<button type="button" class="btn btn-success switch-role">Become Spectator</button>'
        );
      } else {
        $newBtn = $(
          '<button type="button" class="btn btn-success switch-role">Become Player</button>'
        );
      }
      if (mem.role != 'host') {
        $newCol = $('<div class="col center">' + '</div>');
        $newCol.append($newBtn);
        $newRow.append($newCol);
      }
      // Adding leave lobby Button //
      if (mem.role != 'host') {
        $newBtn = $(
          '<button type="button" class="btn btn-danger leave-lobby">Leave Lobby</button>'
        );
        $newCol = $('<div class="col center">' + '</div>');
        $newCol.append($newBtn);
        $newRow.append($newCol);
      }
    } else {
      if (Scratch.me.role === 'host') {
        // Adding kick Button //
        let $newBtn = $(
          '<button type="button" class="btn btn-danger kick-member">Kick From Lobby</button>'
        );
        $newCol = $('<div class="col center">' + '</div>');
        $newCol.append($newBtn);
        // Adding swap button //
        $newRow.append($newCol);
        $newBtn = $(
          '<button type="button" class="btn btn-warning switch-role">Switch Role</button>'
        );
        $newCol = $('<div class="col center">' + '</div>');
        $newCol.append($newBtn);
        $newRow.append($newCol);
      }
    }
    let $newSpan;
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
    if (mem.role != 'spectator') {
      $newCol.append($newSpan);
      $newRow.append($newCol);
    }
    if (mem.role === 'spectator') {
      $newRow.data('uid', mem.id);
      $('#Spectators').append($newRow);
    } else {
      $newRow.data('uid', mem.id);
      $('#Players').append($newRow);
    }
    if (Scratch.me.role === 'spectator') {
      $('#startBtn').hide();
    } else {
      $('#startBtn').show();
    }
  };

  // Loading Danger Zone Settings //
  Scratch.locations.lobby.loadDangerZone = function() {
    $('#abandon').on('click', () => socket.emit('leave lobby', null));

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
      $('#editLobby select[name="numPlayers"] option:disabled').prop('selected', true);
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
