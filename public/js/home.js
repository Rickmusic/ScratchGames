function home_init(){
    // Determine game state and load. Currently only loading the not in a game state.
    lobbylist();
}

function lobbylist(){
    $('#change').load('lobbySnip.html', function() {
        $('#createbtn').click(function() {
            $('.modal').css('display', 'block');
        });
        $('.close').click(function() {
            $('.modal').css('display', 'none');
        });
    });
}