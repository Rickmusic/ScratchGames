var Deck = require("../deck");
var Player = require("../player");
class GoFish {
	constructor() {
		this.gameStarted = false;
		this.pTurn = -1;
		this.players = {},
		this.leader = null,
		this.deck = new Deck();
	}
	get numberPlayers() {
		return Object.keys(this.players).length;
	}
	get numberCardsToDeal() {
		if (this.numberPlayers < 4) {
			return 7;
		}
		else {
			return 5;
		}
	}
	startGame() {
		this.gameStarted = true;
		var playersCards = this.deck.dealCards(this.numberCardsToDeal, this.numberPlayers);
		var counter = 0;
		for (var i in this.players) {
			
			this.players[i].setHand(playersCards[counter]);
			counter++;
		}
		this.pTurn = Object.keys(this.players)[Math.floor(Math.random()*this.numberPlayers)];
	}
	playerJoined(player) {
		var pl = new Player(player);
		this.players[player.uid] = pl;
	}
	getStatus(player) {
		if (!this.gameStarted) {
			return {
				players: this.players,
				leader: this.leader,
				turn: this.pTurn
			}
		}
	}
	getStateFor(uid) {
		var returnData = {};
		for (var i in this.players) {
			var player = this.players[i];
			if (player.uid == uid) {
				returnData[player.uid] = player;
			}
			else {
				returnData[player.uid] = {
					uid: player.uid,
					sid: player.sid,
					hand: player.hand.length
				}
			}
		}
		return returnData;
	}
	nextTurn() {
		console.log("Turn");
		var curTurnNum = Object.keys(this.players).indexOf(this.pTurn);
		console.log(curTurnNum);
		var playerIds = Object.keys(this.players);
		var nextTurnNum = (curTurnNum+1)%this.numberPlayers;
		console.log(nextTurnNum);
		this.pTurn = playerIds[nextTurnNum];
	}
	goFish(ask) {
		var to = this.players[ask.uid];
		var fr = this.players[ask.asks];
		var card = ask.asksFor;
		var takeCards = fr.takeCard(card);
		console.log(takeCards);
		var books = to.giveCards(takeCards);
		
		this.nextTurn();
		if (takeCards.length == 0) {
			var draw = this.deck.pickOne();
			books = to.giveCard(draw);
			return {result: "Go Fish", books: books};
		}
		else {
			return {result: "I have "+takeCards.length+" "+card+"'s", books: books}
		}
	}
	
}
module.exports = GoFish;