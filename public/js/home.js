(function() {
  Scratch.lobbylist = function() {};

  Scratch.lobbylist.init = function () {

    // Determine game state and load. Currently only loading the not in a game state.
    lobbylist();

    function lobbylist(){
      $('#createbtn').click(function() {
          $('#createModal').css('display', 'block');
      });
      $('.close').click(function() {
          $(this).parents('.modal').css('display', 'none');
      });
    }
  };
})();

