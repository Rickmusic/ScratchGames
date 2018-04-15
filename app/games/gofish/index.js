'use strict';

let GoFish = require('./game');

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
	        sid: socket.id,
	        name: socket.request.user.displayName
	      });
	
	      io.to(socket.request.user.lobbyId).emit('user-joined', {
	        uid: userId,
	        sid: socket.id,
	        name: socket.request.user.displayName
	      });
		  if (game.gameStarted){
			io.to(socket.id).emit('game-state', game.getStateFor(userId));
			io.to(socket.request.user.lobbyId).emit('players-turn', game.pTurn);
		  }
	      socket.emit('status', game.getStatus(userId));
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

    socket.on('ask-for', function(ask) {
      let game = games[socket.request.user.lobbyId];
      let res = game.goFish(ask);
      let result = res['result'];
      if (result == "Game Over") {
	  	var winner = game.getWinner();
	  	io.emit("game-over", winner)
      return game.onWin(game.score());
	  }
      let resultFrom = ask.asks;
      socket.emit('game-state', game.getStateFor(ask.uid));
      io.to(socket.request.user.lobbyId).emit('game-info', {
        player: socket.request.user.id,
        message: game.players[ask.asks].name + ', do you have any ' + ask.asksFor + '\'s?',
      });
      if (result != 'Go Fish') {
        console.log('UPDATE OTHERS HAND');
        io
          .to(game.players[ask.asks].sid)
          .emit('game-state', game.getStateFor(ask.asks));
      }
      io.to(socket.request.user.lobbyId).emit('game-info', { player: ask.asks, message: result });
      for (let i in game.spectators) {
	     let player = game.spectators[i];
	     io.to(player.sid).emit('game-state', game.getSpectatorStatus());
	  }
      io.to(socket.request.user.lobbyId).emit('players-turn', game.pTurn);
      if (res['books'].length != 0) {
        io.to(socket.request.user.lobbyId).emit('player-books', { player: socket.request.user.id, gotBooks: res['books'] });
      }
    });

    socket.on('leave', function() {
      socket.disconnect(); // Manually remove client from the game namespace.
    });
  });
};

let create = function(settings, lobbyId, hostId, winCall) {
  games[lobbyId] = new GoFish();
  games[lobbyId].leader = hostId;
  games[lobbyId].onWin = winCall;
};

module.exports = { init, create };
