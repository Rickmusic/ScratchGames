class Uno {
	
	constructor() {
		this.turn = null;
		this.loby = {};
		this.leader = null;
		this.me = {};
		this.gameStarted = false;
		console.log("SETUP");
		this.allowed = {};
		this.lastCard;
	}
	get numberPlayers() {
		return Object.keys(this.loby).length;
	}
	updateGameState(state) {
		for (var i in state["players"]) {
			var player = state["players"][i];
			if (player["uid"] == this.me["uid"]) {
				this.me = player;
				console.log("NEW CARDS");
				console.log(this.me);
			}
			else {
				this.loby[player["uid"]] = player;
			}
		}
		this.allowed = state["allowed"];
		this.lastCard = state["lastCard"];
	}
	updateMe(data) {
		this.me = data;
	}
	addUser(user) {
		this.loby[user["uid"]] = user;
	}
	userLeft(user) {
		delete this.loby[user];
	}
	setLeader(leader) {
		this.leader = leader;
	}
	amLeader() {
		return this.leader == this.me["uid"];
	}
	startGame() {
		this.gameStarted = true;
	}
	isAllowed(card) {
		return card["num"] > 10 || card["num"] == 1 || card["num"] == this.allowed["num"] || card["suit"] == this.allowed["suit"];
	}
	
}