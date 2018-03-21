'use strict';

let Deck = require('../deck');
let Player = require('../player');
class GoFish {
  constructor() {
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
    this.players[player.uid] = pl;
  }
  getStatus(player) {
    if (!this.gameStarted) {
      return {
        players: this.players,
        leader: this.leader,
        turn: this.pTurn,
      };
    }
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
          hand: player.hand.length,
        };
      }
    }
    return returnData;
  }
  nextTurn() {
    console.log('Turn');
    let curTurnNum = Object.keys(this.players).indexOf(this.pTurn);
    console.log(curTurnNum);
    let playerIds = Object.keys(this.players);
    let nextTurnNum = (curTurnNum + 1) % this.numberPlayers;
    console.log(nextTurnNum);
    this.pTurn = playerIds[nextTurnNum];
  }
  goFish(ask) {
    let to = this.players[ask.uid];
    let fr = this.players[ask.asks];
    let card = ask.asksFor;
    let takeCards = fr.takeCard(card);
    console.log(takeCards);
    let books = to.giveCards(takeCards);

    this.nextTurn();
    if (takeCards.length == 0) {
      let draw = this.deck.pickOne();
      books = to.giveCard(draw);
      return { result: 'Go Fish', books: books };
    }

    return {
      result: 'I have ' + takeCards.length + ' ' + card + "'s",
      books: books,
    };
  }
}
module.exports = GoFish;
