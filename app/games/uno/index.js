let Uno = require('./game');

module.exports = function(app, io) {
  let game = new Uno();
  io.on('connection', function(socket) {
    // Just using socket.id as the username for now and the first one is the leader;
    let userId = socket.id;
    game.playerJoined({
      uid: userId,
      sid: socket.id,
    });
    if (game.leader == null) {
      console.log('GAME LEADER SET TO ' + userId);
      game.leader = userId;
    }
    io.emit('user-joined', {
      uid: userId,
      sid: socket.id,
    });
    io.to(socket.id).emit('status', game.getStatus(userId));

    socket.on('start-game', function(abc) {
      game.startGame();
      for (let i in game.players) {
        let player = game.players[i];
        io.to(player.sid).emit('game-state', game.getStateFor(player.uid));
      }
      io.emit('players-turn', game.pTurn);
    });
    socket.on('placed-card', function(place) {
      let res = game.placedCard(place['card'], userId, place['options']);
      if (res) {
        for (let i in game.players) {
          let player = game.players[i];
          io.to(player.sid).emit('game-state', game.getStateFor(player.uid));
        }
        io.emit('players-turn', game.pTurn);
      }
      else {
        // Display an error message
      }
      /*var result = res["result"];
		    if (result == "Game Over") {
			    var winner = game.getWinner();
			    return io.emit("game-over", winner)
		    }
		    var resultFrom = ask.asks;
		    io.to(socket.id).emit("game-state", game.getStateFor(ask.uid));
		    io.emit("game-info", {player: userId, message: ask.uid+", do you have any "+ask.asksFor+"'s?"});
		    if (result != "Go Fish") {
			    console.log("UPDATE OTHERS HAND");
			    io.to(game.players[ask.asks].sid).emit("game-state", game.getStateFor(ask.asks));
			    
		    }
		    io.emit("game-info", {player: ask.asks, message: result});
		    io.emit("players-turn", game.pTurn);
		    if (res["books"].length != 0) {
			    io.emit("player-books", {player: userId, gotBooks: res["books"]});
		    }*/
    });
  });
};
