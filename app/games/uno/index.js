'use strict';

let Uno = require('./game');

let games = {};

let init = function(io) {
  io.on('connection', function(socket) {
    socket.emit('hello', {});
    socket.on('hello', function() {
      socket.join(socket.request.user.lobbyId);
      let game = games[socket.request.user.lobbyId];
      let userId = socket.request.user.id;

      game.playerJoined({
        uid: userId,
        sid: socket.id,
      });

      io.to(socket.request.user.lobbyId).emit('user-joined', {
        uid: userId,
        sid: socket.id,
      });

      socket.emit('status', game.getStatus(userId));
    });

    socket.on('start-game', function(abc) {
      let game = games[socket.request.user.lobbyId];
      game.startGame();
      for (let i in game.players) {
        let player = game.players[i];
        io.to(player.sid).emit('game-state', game.getStateFor(player.uid));
      }
      io.to(socket.request.user.lobbyId).emit('players-turn', game.pTurn);
    });

    socket.on('placed-card', function(place) {
      let game = games[socket.request.user.lobbyId];
      let res = game.placedCard(place['card'], socket.request.user.id, place['options']);
      if (res) {
        for (let i in game.players) {
          let player = game.players[i];
          io.to(player.sid).emit('game-state', game.getStateFor(player.uid));
        }
        io.to(socket.request.user.lobbyId).emit('players-turn', game.pTurn);
      } else {
        // Display an error message
      }
      /*var result = res["result"];
		    if (result == "Game Over") {
			    var winner = game.getWinner();
			    return io.to(socket.request.user.lobbyId).emit("game-over", winner)
		    }
		    var resultFrom = ask.asks;
		    socket.emit("game-state", game.getStateFor(ask.uid));
		    io.to(socket.request.user.lobbyId).emit("game-info", {player: userId, message: ask.uid+", do you have any "+ask.asksFor+"'s?"});
		    if (result != "Go Fish") {
			    console.log("UPDATE OTHERS HAND");
			    io.to(game.players[ask.asks].sid).emit("game-state", game.getStateFor(ask.asks));
			    
		    }
		    io.to(socket.request.user.lobbyId).emit("game-info", {player: ask.asks, message: result});
		    io.to(socket.request.user.lobbyId).emit("players-turn", game.pTurn);
		    if (res["books"].length != 0) {
			    io.to(socket.request.user.lobbyId).emit("player-books", {player: userId, gotBooks: res["books"]});
		    }*/
    });
  });
};

let create = function(settings, lobbyId, hostId) {
  games[lobbyId] = new Uno();
  games[lobbyId].leader = hostId;
};

module.exports = { init, create };
