/* global Scratch */
(function() {
  Scratch.locations.leaderboards = function() {};

  let global = Scratch.sockets.base; /* Links to app/socket/base.js  TEMP*/
  let socket = io('/leaderboards'); // Connects to leaderboard socket. //

  Scratch.locations.leaderboards.init = function() {
    // Server handles on connect //
    global.emit('game types', {});
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
        '<div class="tab-pane fade" role="tabpanel" aria-labelledby="profile-tab"> </div>'
      );
      $newCol.prop('id', data.GameTypes[i].id);
      $newCol.attr('aria-labelledby', data.GameTypes[i].id + '-tab');
      if (i === 0) {
        $newCol.addClass('show');
        $newCol.addClass('active');
      }
      // Adding data to div //
      let $allcontent = $('<div class = "pre-scrollable"> </div>');
      let $table = $('<table> </table>');
      $table.append(
        $('<thead>' + '<tr>' + '<th>Name</th>' + '<th>Score</th>' + '</tr>' + '</thead>')
      );
      $allcontent.append($table);
      $newCol.append($allcontent);
      $('#myTabContent').append($newCol);
    }
  });
  socket.on('everything', function(data) {
    console.log(data);
  });
})();
