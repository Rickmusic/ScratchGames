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
	  if (socket.request.user.role == "host" || socket.request.user.role == "player") {
	      game.playerJoined({
	        uid: userId,
	        name: socket.request.user.displayName,
	        sid: socket.id,
	      });
		  
		
	      io.to(socket.request.user.lobbyId).emit('user-joined', {
	        uid: userId,
	        name: socket.request.user.displayName,
	        sid: socket.id,
	      });
	      if (game.gameStarted){
			io.to(socket.id).emit('game-state', game.getStateFor(userId));
			io.to(socket.request.user.lobbyId).emit('players-turn', game.pTurn);
		  }
	
	      socket.emit('status', game.getStatus(userId, userId));
	  }
	  else {
		  game.spectatorJoined({
	        uid: userId,
	        name: socket.request.user.displayName,
	        sid: socket.id,
	      });
		  socket.emit("status", game.getSpectatorStatus());
	  }
    });

    socket.on('start-game', function(abc) {
      let game = games[socket.request.user.lobbyId];
      game.startGame();
      for (let i in game.players) {
        let player = game.players[i];
        io.to(player.sid).emit('game-state', game.getStateFor(player.uid));
      }
      for (let i in game.spectators) {
        let player = game.spectators[i];
        io.to(player.sid).emit('game-state', game.getSpectatorStatus());
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
        for (let i in game.spectators) {
          let player = game.spectators[i];
          io.to(player.sid).emit('game-state', game.getSpectatorStatus());
        }
        io.to(socket.request.user.lobbyId).emit('players-turn', game.pTurn);
      } else {
	      if (game.gameOver) {
		      // @Kayleigh - here!
	      }
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
