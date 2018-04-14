'use strict';

class Player {
  constructor(data) {
    console.log(data);
    this.uid = data['uid'];
    this.sid = data['sid'];
    this.name = data["name"];
    this.hand = [];
    this.books = [];
  }
  sortHand(a, b) {
    return a['num'] - b['num'];
  }
  anyBooks() {
    let numInRow = 1;
    let previousCard;
    let books = [];
    //console.log("BOOKS");
    for (let i in this.hand) {
      let card = this.hand[i];
      if (previousCard == null || previousCard == card['num']) {
        previousCard = card['num'];
        numInRow += 1;
      }
      else {
        previousCard = card['num'];
        numInRow = 1;
      }
      if (numInRow == 4) {
        books.push(card['num']);
      }
    }
    for (let i in books) {
      let ind = this.hand
        .map(function(e) {
          return e['num'];
        })
        .indexOf(books[i]);
      while (ind > 0) {
        ind = this.hand
          .map(function(e) {
            return e['num'];
          })
          .indexOf(books[i]);
        this.hand.splice(ind, 1);
      }
      this.books = books[i];
    }
    return books;
  }
  setHand(hand) {
    this.hand = hand.sort(this.sortHand);
  }
  giveCard(card) {
    if (card != null) {
      this.hand.push(card);
      this.hand.sort(this.sortHand);
    }
    return this.anyBooks();
  }
  takeCardOfSuit(card, suit) {
    let cardsStolen = [];
    let counter = 0;
    while (counter < this.hand.length) {
      if (this.hand[counter] == null) { 
        break;
      }
      if (this.hand[counter]["num"] == card && this.hand[counter]["suit"] == suit) {
        // Take the card
        cardsStolen.push(this.hand[counter]);
        this.hand.splice(counter, 1);
      }
      else {
        counter += 1;
      }
    }
    return cardsStolen;
	}
  takeCard(card) {
    let cardsStolen = [];
    let counter = 0;
    while (counter < this.hand.length) {
      if (this.hand[counter] == null) {
        break;
      }
      if (this.hand[counter]['num'] == card) {
        // Take the card
        cardsStolen.push(this.hand[counter]);
        this.hand.splice(counter, 1);
      }
      else {
        counter += 1;
      }
    }
    return cardsStolen;
  }
  giveCards(cards) {
    for (let i in cards) {
      this.hand.push(cards[i]);
    }
    this.hand.sort(this.sortHand);
    return this.anyBooks();
  }
}
module.exports = Player;
