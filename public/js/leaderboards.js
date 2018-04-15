/* global Scratch */
(function() {
  Scratch.locations.leaderboards = function() {};

  let global = Scratch.sockets.base; /* Links to app/socket/base.js  TEMP*/
  //let socket = io('/leaderboards'); // Connects to leaderboard socket. //

  Scratch.locations.leaderboards.init = function() {
    // Asking for game types. //
    global.emit('game types', {});
    global.emit('leaderboards', {});
  };

  global.on('game types', function(data) {
    $('#myTabContent').empty();
    $('#myTab').empty();
    
    let $newRow;
    let $newCol;
    for (let i = 0; i < data.GameTypes.length; i++) {
      // Adding Nav Tab //
      $newRow = $('<li class="nav-item"> </li>');
      $newCol = $(
        '<a class="nav-link" data-toggle="tab" role="tab" aria-controls="home" aria-selected="true">' +
          data.GameTypes[i].display +
          '</a>'
      );
      $newCol.prop('id', data.GameTypes[i].id + '-tab');
      $newCol.attr('href', '#' + data.GameTypes[i].id);
      if (i === 0) {
        $newCol.addClass('active');
      }
      $newRow.append($newCol);
      $('#myTab').append($newRow);
      // Adding Content div //
      $newCol = $(
        '<div class="tab-pane fade" role="tabpanel" aria-labelledby="profile-tab">' +
          data.GameTypes[i].display +
          '</div>'
      );
      $newCol.prop('id', data.GameTypes[i].id);
      $newCol.attr('aria-labelledby', data.GameTypes[i].id + '-tab');
      if (i === 0) {
        $newCol.addClass('show');
        $newCol.addClass('active');
      }
      $('#myTabContent').append($newCol);
    }
  });
  global.on('leaderboards', function(data) {});
})();
