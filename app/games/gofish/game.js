'use strict';

let Deck = require('../deck');
let Player = require('../player');
class GoFish {
  constructor() {
	  this.spectators = {}; 
	  
    this.gameStarted = false;
    this.pTurn = -1;
    this.players = {};
    this.leader = null;
    this.deck = new Deck();
  }
  get numberPlayers() {
    return Object.keys(this.players).length;
  }
  get numberCardsToDeal() {
    if (this.numberPlayers < 4) {
      return 7;
    }

    return 5;
  }
  startGame() {
    this.gameStarted = true;
    let playersCards = this.deck.dealCards(
      this.numberCardsToDeal,
      this.numberPlayers
    );
    let counter = 0;
    for (let i in this.players) {
      this.players[i].setHand(playersCards[counter]);
      counter++;
    }
    this.pTurn = Object.keys(this.players)[
      Math.floor(Math.random() * this.numberPlayers)
    ];
  }
  playerJoined(player) {
    let pl = new Player(player);
	if (this.players[player.uid] == null) {
		this.players[player.uid] = pl;
	}
	else {
		this.players[player.uid].sid = player.sid;
	}
  }
  spectatorJoined(player) {
  	let pl = new Player(player);
	if (this.spectators[player.uid] == null) {
		this.spectators[player.uid] = pl;
	}
	else {
		this.spectators[player.uid].sid = player.sid;
	} 
  }
  getStatus(player) {
    //if (!this.gameStarted) {
      return {
        players: this.players,
        leader: this.leader,
        turn: this.pTurn,
        uid: player,
        started: this.gameStarted
      };
    //}
  }
  getStateFor(uid) {
    let returnData = {};
    for (let i in this.players) {
      let player = this.players[i];
      if (player.uid == uid) {
        returnData[player.uid] = player;
      }
      else {
        returnData[player.uid] = {
          uid: player.uid,
          sid: player.sid,
          name: player.name,
          hand: player.hand.length,
        };
      }
    }
    return returnData;
  }
  getSpectatorStatus() {
	  var returnData = {
		  state: 'spectator',
		  players: this.players,
	  }
	  return returnData;
  }
  nextTurn() {
    for (var i in this.players) {
		console.log("Turn");
		var curTurnNum = Object.keys(this.players).indexOf(this.pTurn);
		console.log(curTurnNum);
		var playerIds = Object.keys(this.players);
		var nextTurnNum = (curTurnNum+1)%this.numberPlayers;
		console.log(nextTurnNum);
		this.pTurn = playerIds[nextTurnNum];
		if (this.players[this.pTurn].hand.length > 0 || this.deck.cardsAvailable.length > 0) {
			return false;
		}
	}
	// There are no cards in the deck, and no players with cards
	return true;
  }
  goFish(ask) {
    var to = this.players[ask.uid];
	var fr = this.players[ask.asks];
	var card = ask.asksFor;
	var takeCards = fr.takeCard(card);
	console.log(takeCards);
	var books = to.giveCards(takeCards);
	
	var isGameOver = this.nextTurn();
	if (isGameOver) {
		return {result: "Game Over"};
	}
	if (takeCards.length == 0) {
		var draw = this.deck.pickOne();
		books = to.giveCard(draw);
		return {result: "Go Fish", books: books};
	}
	return {result: "I have "+takeCards.length+" "+card+"'s", books: books}
	
  }
  getWinner() {
		var maxBooks = 0;
		var winners = [];
		for (var i in this.players) {
			if (this.players[i].books.length == maxBooks) {
				this.winners.push(this.players[i].uid);
			}
			else if (this.players[i].books.length > maxBooks) {
				this.winners = [this.players[i].uid];
			}
		}
		return winners;
  }
}
module.exports = GoFish;
