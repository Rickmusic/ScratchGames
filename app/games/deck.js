'use strict';

class Deck {
  constructor() {
    this.cardsAvailable = [];
    let suits = ['C', 'H', 'S', 'D'];
    for (let s = 0; s < 4; s++) {
      for (let c = 1; c <= 13; c++) {
        this.cardsAvailable.push({ suit: suits[s], num: c });
      }
    }
  }
  dealCards(numberCards, numberPlayers, options = []) {
    let players = [];
    for (let i = 0; i < numberPlayers; i++) {
      players.push([]);
    }

    let cardsDealt = 0;
    while (cardsDealt <= numberCards && this.cardsAvailable.length > 0) {
      for (let i in players) {
        let player = players[i];
        let index = Math.floor(Math.random() * this.cardsAvailable.length);
        let card = this.cardsAvailable[index];
        this.cardsAvailable.splice(index, 1);
        player.push(card);
      }
      cardsDealt += 1;
    }
    return players;
  }
  pickOne() {
    let index = Math.floor(Math.random() * this.cardsAvailable.length);
    let card = this.cardsAvailable[index];
    this.cardsAvailable.splice(index, 1);
    return card;
  }
}
module.exports = Deck;
