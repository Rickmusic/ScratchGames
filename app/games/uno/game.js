'use strict';

let Deck = require('../deck');
let Player = require('../player');
class Uno {
  constructor() {
    this.gameStarted = false;
    this.pTurn = -1;
    this.direction = 1;
    this.players = {};
    this.leader = null;
    this.deck = new Deck();
    this.playedCards = [];
    this.playedSuit = null;
    this.playedNum = null;
    this.winners = [];
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
    return this.playedCards[this.playedCards.length - 1];
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
    let firstCard = this.deck.pickOne();
    this.playedCards.push(firstCard);
    this.playedSuit = firstCard.suit;
    this.playedNum = firstCard.num;
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
  getStatus(player, uid) {
    //if (!this.gameStarted) {
      return {
        players: this.players,
        leader: this.leader,
        turn: this.pTurn,
		uid: uid,
        allowed: { suit: this.playedSuit, num: this.playedNum },
        lastCard: this.lastCard,
      };
   // }
    //return null;
  }
  getStateFor(uid) {
	  console.log(this.players);
    let returnData = {
      players: {},
      uid: uid,
      allowed: {
        suit: this.playedSuit,
        num: this.playedNum,
      },
      lastCard: this.lastCard,
    };
    console.log(returnData);
    for (let i in this.players) {
      let player = this.players[i];
      if (player.uid == uid) {
        returnData['players'][player.uid] = player;
      } else {
        returnData['players'][player.uid] = {
          uid: player.uid,
          sid: player.sid,
          name: player.name,
          hand: player.hand.length,
        };
      }
    }
    return returnData;
  }
  nextTurn() {
    for (let i in this.players) {
      this.pTurn = this.nextPlayerTurn();
      console.log(this.pTurn);
      if (
        this.curPlayer.hand.length > 0
      ) {
        return false;
      }
      if (this.winners.indexOf(this.pTurn) < 0) {
	      this.winners.push(this.pTurn);
      }
    }
    // There are no cards in the deck, and no players with cards
    return true;
  }
  get curPlayer() {
    let curTurnNum = Object.keys(this.players).indexOf(this.pTurn);
    let playerIds = Object.keys(this.players);
    return this.players[this.pTurn];
  }
  get nextPlayer() {
    return this.players[this.nextPlayerTurn()];
  }
  nextPlayerTurn() {
    let curTurnNum = Object.keys(this.players).indexOf(this.pTurn);
    let playerIds = Object.keys(this.players);
    let incTurnNum = curTurnNum + this.direction;
    if (this.direction == 2 || this.direction == -2) {
	    this.direction = this.direction/2;
    }
    console.log(incTurnNum);
    let nextTurnNum;
    if (incTurnNum >= 0) {
      nextTurnNum = incTurnNum % this.numberPlayers;
    } else {
      nextTurnNum = this.numberPlayers + incTurnNum;
    }
    return playerIds[nextTurnNum];
  }
  giveCards(player, numCards) {
    let counter = 0;
    while (counter < numCards) {
      if (this.deck.cardsAvailable.length == 0) {
        // Re-shuffle??
        this.deck.cardsAvailable = this.playedCards.slice(
          0,
          this.playedCards.length - 1
        );
        this.playedCards = this.playedCards.slice(
          this.playedCards.length - 1,
          this.playedCards.length
        );
      }
      player.giveCard(this.deck.pickOne());
      counter += 1;
    }
  }
  placedCard(card, user, options) {
    let player = this.players[user];
    console.log(card);
    if (card == null) {
      player.giveCard(this.deck.pickOne());
      return true;
    }
    if (card.num == 1) {
      // Change suit + 4 cards for next player
      this.playedSuit = options['suit'];
      this.playedNum = null;
      let next = this.nextPlayer;

      this.giveCards(next, 4);
    } else if (card.num == 13) {
      this.playedSuit = options['suit'];
      this.playedNum = null;
      // Change suit
    } else if (card.num == 12) {
      // Give 2
      let next = this.nextPlayer;
      this.giveCards(next, 2);
      this.playedSuit = card.suit;
      this.playedNum = card.num;
    } else if (card.num == 11) {
      // Skip or swap direction
      console.log("OPTIONS");
      console.log(options);
      if (options.choice == "Swap") {
	      this.direction *= -1;
      }
      else {
	      this.direction *= 2;
      }
      
      this.playedSuit = card.suit;
      this.playedNum = card.num;
    } else {
      if (card.suit != this.playedSuit && card.num != this.playedNum) {
        return false;
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
	  /*
    let maxBooks = 0;
    let winners = [];
    for (let i in this.players) {
      if (this.players[i].books.length == maxBooks) {
        this.winners.push(this.players[i].uid);
      } else if (this.players[i].books.length > maxBooks) {
        this.winners = [this.players[i].uid];
      }
    }
    return winners;*/
    return this.winners;
  }
}
module.exports = Uno;
