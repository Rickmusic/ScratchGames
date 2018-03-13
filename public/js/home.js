Scratch.home = function() {};



Scratch.home.init = function () {
    // Determine game state and load. Currently only loading the not in a game or lobby state.
    lobbylist();



  function lobbylist(){
      $('#createLobby').submit(function(e) {
          e.preventDefault();
          let data = $(this).closest('form').serializeArray();
          $('.modal').css('display', 'none');
          // TODO Form valid and filled out ? //
          //TODO Something with this data to tell server were creating lobby.
          loadLobby();
      });

      $('#change').load('lobbyListSnip.html', function() {
          $('#createbtn').click(function() {
              $('.modal').css('display', 'block');
          });
          $('.close').click(function() {
              $('.modal').css('display', 'none');
          });
      });
  }

  // We also run this after a game has terminated // Can choose to start another game etc//
  function loadLobby(){
      $('#change').load('lobbySnip.html');
      // TODO tell UI what game settings to load and other information we should have now  //
      // Perhaps another js file but if we can avoid it till we can load game specific js.
      //
  }
};

