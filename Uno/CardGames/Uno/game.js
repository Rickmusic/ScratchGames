var Deck = require("../deck");
var Player = require("../player");
class Uno {
	constructor() {
		this.gameStarted = false;
		this.pTurn = -1;
		this.direction = 1;
		this.players = {},
		this.leader = null,
		this.deck = new Deck();
		this.playedCards = [];
		this.playedSuit = null;
		this.playedNum = null;
	}
	get numberPlayers() {
		return Object.keys(this.players).length;
	}
	get numberCardsToDeal() {
		return 8;
	}
	get lastCard() {
		if (this.playedCards.length == 0) {
			return null;
		}
		return this.playedCards[this.playedCards.length-1];
	}
	startGame() {
		this.gameStarted = true;
		var playersCards = this.deck.dealCards(this.numberCardsToDeal, this.numberPlayers);
		var counter = 0;
		for (var i in this.players) {
			
			this.players[i].setHand(playersCards[counter]);
			counter++;
		}
		var firstCard = this.deck.pickOne()
		this.playedCards.push(firstCard);
		this.playedSuit = firstCard.suit;
		this.playedNum = firstCard.num;
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
				turn: this.pTurn,
				allowed: {suit: this.playedSuit, num: this.playedNum},
				lastCard: this.lastCard,
			}
		}
	}
	getStateFor(uid) {
		var returnData = {players: {}, allowed: {
			suit: this.playedSuit, 
			num: this.playedNum
		}, lastCard: this.lastCard};
		console.log(returnData);
		for (var i in this.players) {
			var player = this.players[i];
			if (player.uid == uid) {
				returnData["players"][player.uid] = player;
			}
			else {
				returnData["players"][player.uid] = {
					uid: player.uid,
					sid: player.sid,
					hand: player.hand.length
				}
			}
		}
		return returnData;
	}
	nextTurn() {
		for (var i in this.players) {
			this.pTurn = this.nextPlayerTurn();
			console.log(this.pTurn);
			if (this.curPlayer.hand.length > 0 || this.deck.cardsAvailable.length > 0) {
				return false;
			}
		}
		// There are no cards in the deck, and no players with cards
		return true;
		
	}
	get curPlayer() {
		var curTurnNum = Object.keys(this.players).indexOf(this.pTurn);
		var playerIds = Object.keys(this.players);
		return this.players[this.pTurn];
	}
	get nextPlayer() {
		return this.players[this.nextPlayerTurn()];
	}
	nextPlayerTurn() {
		var curTurnNum = Object.keys(this.players).indexOf(this.pTurn);
		var playerIds = Object.keys(this.players);
		var incTurnNum = (curTurnNum+this.direction);
		console.log(incTurnNum);
		var nextTurnNum;
		if (incTurnNum >= 0) {
			nextTurnNum = incTurnNum%this.numberPlayers;
		}
		else {
			nextTurnNum = this.numberPlayers+incTurnNum;
		}
		return playerIds[nextTurnNum];
	}
	giveCards(player, numCards) {
		var counter = 0;
		while (counter < numCards) {
			if (this.deck.cardsAvailable.length == 0) {
				// Re-shuffle??
				this.deck.cardsAvailable = this.playedCards.slice(0, this.playedCards.length-1);
				this.playedCards = this.playedCards.slice(this.playedCards.length-1, this.playedCards.length);
			}
			player.giveCard(this.deck.pickOne());
			counter += 1;
		}
		
	}
	placedCard(card, user, options) {
		var player = this.players[user];
		var options;
		console.log(card);
		if (card == null) {
			player.giveCard(this.deck.pickOne());
			return true;
		}
		if (card.num == 1) {
			// Change suit + 4 cards for next player
			this.playedSuit = options["suit"];
			this.playedNum = null;
			var next = this.nextPlayer;
			
			this.giveCards(next, 4);
		}
		else if (card.num == 13) {
			this.playedSuit = options["suit"];
			this.playedNum = null;
			// Change suit
		}
		else if (card.num == 12) {
			// Give 2
			var next = this.nextPlayer;
			this.giveCards(next, 2);
			this.playedSuit = card.suit;
			this.playedNum = card.num;
		}
		else if (card.num == 11) {
			// Skip or swap direction
			console.log(options);
			this.direction *= -1;
			this.playedSuit = card.suit;
			this.playedNum = card.num;
		}
		else {
			if (card.suit != this.playedSuit && card.num != this.playedNum) {
				return false
			}
			this.playedSuit = card.suit;
			this.playedNum = card.num;
		}
		this.curPlayer.takeCardOfSuit(card.num, card.suit);
		this.playedCards.push(card);
		this.nextTurn();
		return true;
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
module.exports = Uno;