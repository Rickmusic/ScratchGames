var socket;
var goFish = new GoFish();
var buttonsActive = false;
function updateUsers(withButton=false) {
	var otherPlayers = "";
	var angleDif = Math.PI/(goFish.numberPlayers-1);
	var curAngle = 0;
	var userMessages = "";
	for (var i in goFish.loby) {
		
		var xLoc = 50-((Math.cos(curAngle)*40)+10);
		var yLoc = 50-((Math.sin(curAngle)*40)+10);
		
		var us = goFish.loby[i];
		userMessages += "<div class='user-message' id='user-message-"+us["uid"]+"' style='left: "+(xLoc+20)+"%; top: "+yLoc+"%;' hidden></div>";
		var curUser = "<div class='player-spot' id='player-"+us["uid"]+"' style='left:"+xLoc+"%; top: "+yLoc+"%'>"+us["uid"];
		console.log("CURUSER");
		curUser+= "<button id='choose-player-"+us["uid"]+"' class='choose-player-button' hidden>Choose</button>";
		curUser += "<div class='cards-in-hand'></div>";
		curUser += "</div>";
		
		curAngle += angleDif;
		otherPlayers += curUser;
	}
	$("#other-players").html(otherPlayers);
	$("#user-messages").html(userMessages);
	if (withButton) {
		for (var i in goFish.loby) {
			var us = goFish.loby[i];
			$("#choose-player-"+us["uid"]).show();
		}
	}
	else {
		for (var i in goFish.loby) {
			var us = goFish.loby[i];
			$("#choose-player-"+us["uid"]).hide();
		}
	}
	
	activateButtons();
	
}
var firstTurn = true;
function showUserButtons() {
	for (var i in goFish.loby) {
		var us = goFish.loby[i];
		console.log("SHOWING");
		console.log(us);
		$("#choose-player-"+us["uid"]).show();
	}
}
function hideUserButtons() {
	for (var i in goFish.loby) {
		var us = goFish.loby[i];
		$("#choose-player-"+us["uid"]).hide();
	}
}
function clickedUser() {
	if (chosenPlayer != null) {
		$("#choose-player-"+chosenPlayer).show();
	}
	if (selectedCard != null) {
		$("#"+selectedCard).css({width: "60px", height: "86px"});
		selectedCard = null;
	}
	var chosenPlayerId = $(this).attr("id").replace("choose-player-", "");
	chosenPlayer = chosenPlayerId;
	$("#choose-player-"+chosenPlayer).hide();
	myTurnPartTwo();
	console.log("ABC");
}
function activateButtons() {
	for (var i in goFish.loby) {
		var us = goFish.loby[i];
		console.log(us["uid"]);
		$("#choose-player-"+us["uid"]).off(clickedUser);
		$("#choose-player-"+us["uid"]).click(clickedUser);
	}
}
function addUserToGame(user) {
	goFish.addUser(user);
	updateUsers();
}
function userLeft(sid) {
	userLeft(sid);
	updateUsers();
}
function startGame() {
	
	console.log(socket);
}
function askFor() {
	socket.emit("ask-for", {
		uid: goFish.me.uid,
		asks: chosenPlayer,
		asksFor: selectedCard.split("-of-")[0]
	});
}
var selectedCard;
var chosenPlayer;
function myTurnPartTwo(player) {
	$("#instructions-wording").html("Select a card to ask "+chosenPlayer+"for from your hand");
	for (var i in goFish.me.hand) {
		var card = goFish.me.hand[i];
		console.log(card);
		$("#"+card["num"]+"-of-"+card["suit"]).click(function() {
			if (selectedCard != null) {
				$("#"+selectedCard).css({width: "60px", height: "86px"});
			}
			selectedCard = $(this).attr("id");
			$(this).css({width: "70px", height: "100px"});
			var selectedNumber = selectedCard.split("-of-")[0];
			$("#instructions-wording").html("Ask for the "+selectedNumber+"?");
			$("#ask-button").show();
			
		});
	}

}
function myTurn() {
	$("#instructions-wording").html("Its your turn. Choose a player to ask");
	showUserButtons();
	//updateUsers(true);
}
function updateGame() {
	if (!cardsDealt) {
		console.log("DEALING CARDS");
		console.log(goFish.numberPlayers-1);
		var angleDif = Math.PI/(goFish.numberPlayers-1);
		var curAngle = 0;
		var counter = 0;
		for (var i in goFish.loby) {
			var xLoc = 50-((Math.cos(curAngle)*40)+10)+5;
			var yLoc = 50-((Math.sin(curAngle)*40)+10)+5;
			console.log(Math.cos(curAngle));
			for (var x = 0; x < goFish.loby[i]["hand"]; x++) {
				
				console.log("left: "+xLoc+"%, top: "+yLoc+"%");
				var card = $(".card-deck-card:nth-child("+counter+")");
				card.delay(counter*500).animate({
					left: xLoc+"%",
					top: yLoc+"%",
				}, 1500);
				counter += 1;
				card.addClass("card-player-"+i);
				
			}
			curAngle += angleDif
		}
		console.log(goFish.me);
		for (var x = 0; x < goFish.me["hand"].length; x++) {
			var card = $(".card-deck-card:nth-child("+counter+")");
			card.attr("suit", goFish.me["hand"][x]["suit"]);
			card.attr("num", goFish.me["hand"][x]["num"]);
			var xLoc = x*60;
			card.delay(counter*500).animate({
				left: xLoc+"px",
				top: "80%",
			}, 1500, function() {
				$(this).addClass("card-player-me");
				//card-flip
				var crd = $(this).attr("card");
				console.log("CARD = ");
				console.log(crd);
				$("#"+$(this).attr("num")+"-of-"+$(this).attr("suit")).addClass("card-flip");
			});
			counter += 1;
			
			
		}
		
		
	}
	
	
	
	
	
	
	for (var i in goFish.loby) {
		var player = goFish.loby[i];
		if (goFish.me["uid"] != player["uid"]) {
			
			$("#player-"+player["uid"]+">.cards-in-hand").first().html(player["hand"]);
		}
	}
	fillHand();
	
}
function fillHand() {
	var cards = "";
	for (var i in goFish.me.hand) {
		var card = goFish.me.hand[i];
		cards += "<div class='card card-suit-"+card["suit"];
		if (cardsDealt) {
			cards += " card-flipped";
		}
		cards += "' id='"+card["num"]+"-of-"+card["suit"]+"'>"+card["num"]+"</div>";
	}
	$("#my-cards").html(cards);
	if (!cardsDealt) {
		cardsDealt = true;
	}
	
}
function stringBooks(books) {
	var ret = "";
	if (books.length > 0) {
		ret = "I made a book of "+books[0];
		var counter = 1;
		while (counter < books.length) {
			ret +" and "+books[counter];
		}
	}
	return ret;
	
}
var cardsDealt = false;
$(function() {
	for (var i = 0; i < 52; i++) {
		$("#game-table").append("<div class='card-deck-card'></div>");
	}
	$("#ask-button").click(function() {
		askFor();
	});
	socket = io();
	socket.on('status', function(status){
		
		console.log(status);
		for (var i in status["players"]) {
			var join = status["players"][i];
			if (join.sid == socket.id) {
				goFish.updateMe(join);
			}
			else {
				addUserToGame(join);
			}
			
		}
		goFish.setLeader(status["leader"]);
		if (goFish.amLeader()) {
			console.log("YOU ARE THE LEADER");
			$("#start-game").show();
			$("#start-game").click(function() {
				goFish.startGame();
				$("#start-game").hide();
				socket.emit("start-game", "");
			});
		}
	});
	socket.on('user-joined', function(join) {
		if (join.sid == socket.id) {
			goFish.updateMe(join);
		}
		else {
			addUserToGame(join);
		}
	});
	socket.on('user-left', function(left) {
		userLeft(left);
	});
	socket.on('game-state', function(state) {
		
		console.log(state);
		goFish.updateGameState(state);
		updateGame();
		
		
	});
	socket.on('players-turn', function(pl){
		if (firstTurn) {
			updateUsers();
			firstTurn = false;
		}
		$("#instructions-wording").html("");
		if (pl == goFish.me["uid"]) {
			console.log("MY TURN");
			$("#instructions-turn").html("It is your turn");
			myTurn();
		}
		else {
			hideUserButtons()
			//updateUsers();
			$("#ask-button").hide();
			$("#instructions-turn").html("It is "+pl+"'s turn");
		}
	});
	socket.on("game-info", function(res) {
		if (res.player == goFish.me.uid) {
			var message = $("#my-messages");
			$("#my-messages").html(res.message);
			$("#my-messages").show();
			
			setTimeout(function() { $("#my-messages").hide(); }, 5000);
		}
		else {
			var message = $("#user-message-"+res.player);
			$("#user-message-"+res.player).html(res.message);
			$("#user-message-"+res.player).show();
			
			setTimeout(function() { $("#user-message-"+res.player).hide(); }, 5000);
		}
		
		
		
	});
	socket.on("player-books", function(books) {
		if (res.player == goFish.me.uid) {
			var message = $("#my-messages");
			$("#my-messages").html(stringBooks(books));
			$("#my-messages").show();
			
			setTimeout(function() { $("#my-messages").hide(); }, 5000);
		}
		else {
			var message = $("#user-message-"+res.player);
			$("#user-message-"+res.player).html(stringBooks(books));
			$("#user-message-"+res.player).show();
			
			setTimeout(function() { $("#user-message-"+res.player).hide(); }, 5000);
		}
	});
	
	
});