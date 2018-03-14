(function() {
  Scratch.lobbylist = function() {};

  Scratch.lobbylist.init = function () {

    // Determine game state and load. Currently only loading the not in a game state.
    //   Or maybe we just use a seperate page for that.
    $('#createLobby').submit(function(e) {
      e.preventDefault();
      let data = $(this).closest('form').serializeJSON();
      // TODO Form valid and filled out ? //
      //socket.emit('create lobby', data); No socket in scope. To Be Fixed.
      this.reset();
      $('#createModal').css('display', 'none');
      // TODO Instead of loading lobby here, we should wait for server to create the lobby
      //      in case validation failed, or some other feedback needs to be given.
      //      Also, server should be able to just tell base to navigate to the lobby, that way
      //      it can more easily keep track of history.
      loadLobby();
    });

    $('#createbtn').click(function() {
        $('#createModal').css('display', 'block');
    });
    $('.close').click(function() {
        $(this).parents('.modal').css('display', 'none');
    });

    // We also run this after a game has terminated // Can choose to start another game etc//
    function loadLobby(){
        Scratch.base.loadMain('snippets/lobby.html'); // Again, server should be navigating for history tracking.
        // TODO tell UI what game settings to load and other information we should have now  //
        // Perhaps another js file but if we can avoid it till we can load game specific js.
        //
    }
  };
})();

