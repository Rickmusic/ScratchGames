class Deck {
	
	constructor() {
		this.cardsAvailable = [];
		var suits = ["C", "H", "S", "D"];
		for (var s = 0; s < 4; s++) {
			for (var c = 1; c <= 13; c++) {
				this.cardsAvailable.push({suit: suits[s], num: c});
			}
		}
	}
	dealCards(numberCards, numberPlayers, options=[]) {
		var players = [];
		for (i = 0; i < numberPlayers; i++) {
			players.push([]);
		}
		
		var cardsDealt = 0;
		while (cardsDealt <= numberCards && this.cardsAvailable.length > 0) {
			
			for (var i in players) {
				var player = players[i];
				var index = Math.floor(Math.random()*this.cardsAvailable.length);
				var card = this.cardsAvailable[index];
				this.cardsAvailable.splice(index, 1);
				player.push(card)
			}
			cardsDealt += 1;
		}
		return players
	}
	pickOne() {
		var index = Math.floor(Math.random()*this.cardsAvailable.length);
		var card = this.cardsAvailable[index];
		this.cardsAvailable.splice(index, 1);
		return card;
	}
}
module.exports = Deck;