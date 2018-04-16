/* global Scratch io*/
(function() {
  Scratch.locations.leaderboards = function() {};
  let socket = io('/leaderboard'); // Connects to leaderboard socket. //

  Scratch.locations.leaderboards.init = function() {
    // Server handles on connect //
  };

  socket.on('everything', function(data) {
    $('#myTabContent').empty();
    $('#myTab').empty();
    let $newRow;
    let $newCol;
    for (let game in data) {
      // Adding Nav Tab //
      $newRow = $('<li class="nav-item"> </li>');
      $newCol = $(
        '<a class="nav-link" data-toggle="tab" role="tab" aria-controls="home" aria-selected="true">' +
          game +
          '</a>'
      );
      $newCol.prop('id', game + '-tab');
      $newCol.attr('href', '#' + game);
      if (game === 'Uno') {
        $newCol.addClass('active');
      }
      $newRow.append($newCol);
      $('#myTab').append($newRow);
      $newCol = $(
        '<div class="tab-pane fade" role="tabpanel" aria-labelledby="profile-tab"> </div>'
      );
      $newCol.prop('id', game);
      $newCol.attr('aria-labelledby', game + '-tab');
      if (game === 'Uno') {
        $newCol.addClass('show');
        $newCol.addClass('active');
      }
      let $allcontent = $('<div class = "pre-scrollable"> </div>');
      let $table = $('<div class="container"> </div>');
      $table.append(
        $(
          '<div class="row">' +
            '<div class="col">' +
            '<b>Name</b>' +
            '</div>' +
            '<div class="col">' +
            '<b>Score</b>' +
            '</div>' +
            '</div>'
        )
      );
      $allcontent.append($table);
      $newCol.append($allcontent);
      $('#myTabContent').append($newCol);

      for (let person of data[game]) {
        let $tableCon = $('<div class="row"> </div>');
        $tableCon.append(
          $(
            '<div class="col leadName">' +
              person.name +
              '</div>' +
              '<div class="col leadScore">' +
              person.score +
              '</div>'
          )
        );
        $tableCon.data('gameType', game);
        $tableCon.data('id', person.id);
        $table.append($tableCon);
        // Pulling out my Score //
        if (Scratch.me.id === person.id) {
          let $scoreDiv = $('<div class"row"></div>');
          $scoreDiv.append(
            $(
              '<div class="col leadName">' +
                'Your Score' +
                '</div>' +
                '<div class="col leadScore">' +
                person.score +
                '</div>'
            )
          );
          $('#' + game).append($scoreDiv);
        }
      }
    }
  });
  socket.on('update', function(person) {
    let $local = $('#' + person.game);
    $local
      .children()
      .eq(1)
      .filter(function() {
        return $(this).data('id') === person.id;
      });
    $local.find('div.leadScore').text(person.score);
    if (Scratch.me.id === person.id) {
      $('#' + person.game)
        .children()
        .eq(1)
        .empty();
      let $scoreDiv = $('<div class"row"></div>');
      $scoreDiv.append(
        $(
          '<div class="col leadName">' +
            'Your Score' +
            '</div>' +
            '<div class="col leadScore">' +
            person.score +
            '</div>'
        )
      );
      $('#' + person.game).append($scoreDiv);
    }
  });
})();
