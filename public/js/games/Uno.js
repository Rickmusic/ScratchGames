/* global io */
(function() {

  let socket; /* Links to app/games/uno/index.js */ 

  class Uno {
    constructor() {
      this.turn = null;
      this.loby = {};
      this.leader = null;
      this.me = {};
      this.gameStarted = false;
      console.log('SETUP');
      this.allowed = {};
      this.lastCard;
    }
    get numberPlayers() {
      return Object.keys(this.loby).length;
    }
    updateGameState(state) {
      for (let i in state['players']) {
        let player = state['players'][i];
        if (player['uid'] == this.me['uid']) {
          this.me = player;
          console.log('NEW CARDS');
          console.log(this.me);
        } else {
          this.loby[player['uid']] = player;
        }
      }
      this.allowed = state['allowed'];
      this.lastCard = state['lastCard'];
    }
    updateMe(data) {
      this.me = data;
    }
    addUser(user) {
      this.loby[user['uid']] = user;
    }
    userLeft(user) {
      delete this.loby[user];
    }
    setLeader(leader) {
      this.leader = leader;
    }
    amLeader() {
      return this.leader == this.me['uid'];
    }
    startGame() {
      this.gameStarted = true;
    }
    isAllowed(card) {
      return (
        card['num'] > 10 ||
        card['num'] == 1 ||
        card['num'] == this.allowed['num'] ||
        card['suit'] == this.allowed['suit']
      );
    }
  }

  let uno = new Uno();
  let buttonsActive = false;

  function updateUsers(withButton = false) {
    let otherPlayers = '';
    let angleDif = Math.PI / (uno.numberPlayers - 1);
    let curAngle = 0;
    let userMessages = '';
    for (let i in uno.loby) {
      let xLoc = 50 - (Math.cos(curAngle) * 40 + 10);
      let yLoc = 50 - (Math.sin(curAngle) * 40 + 10);

      let us = uno.loby[i];
      userMessages +=
        "<div class='user-message' id='user-message-" +
        us['uid'] +
        "' style='left: " +
        (xLoc + 20) +
        '%; top: ' +
        yLoc +
        "%; display: none;'></div>";
      let curUser =
        "<div class='player-spot' id='player-" +
        us['uid'] +
        "' style='left:" +
        xLoc +
        '%; top: ' +
        yLoc +
        "%'>" +
        us['uid'];
      console.log('CURUSER');
      curUser +=
        "<button id='choose-player-" +
        us['uid'] +
        "' class='choose-player-button' style='display: none;'>Choose</button>";
      curUser += "<div class='cards-in-hand'></div>";
      curUser += '</div>';

      curAngle += angleDif;
      otherPlayers += curUser;
    }
    $('#other-players').html(otherPlayers);
    $('#user-messages').html(userMessages);
    if (withButton) {
      for (let i in uno.loby) {
        let us = uno.loby[i];
        $('#choose-player-' + us['uid']).show();
      }
    } else {
      for (let i in uno.loby) {
        let us = uno.loby[i];
        $('#choose-player-' + us['uid']).hide();
      }
    }
  }
  let firstTurn = true;
  function hideUserButtons() {
    for (let i in uno.loby) {
      let us = uno.loby[i];
      $('#choose-player-' + us['uid']).hide();
    }
  }
  function addUserToGame(user) {
    uno.addUser(user);
    updateUsers();
  }
  function userLeft(sid) {
    userLeft(sid);
    updateUsers();
  }
  function startGame() {
    console.log(socket);
  }

  let selectedCard;
  let selectedSuit;
  let selectedChoice;
  function askFor() {
    $('#select-suit').hide();
    $('#ask-button').hide();
    $('#select-swap-or-skip').hide();
    console.log(selectedCard);
    socket.emit('placed-card', {
      uid: uno.me.uid,
      card: selectedCard,
      options: { suit: selectedSuit, choice: selectedChoice },
    });
    selectedCard = null;
    selectedSuit = null;
    selectedChoice = null;
  }
  function suitChoice() {
    $('#select-suit').show();
    $('#instructions-wording').html(
      'Play the ' + selectedCard['num'] + ' of ' + selectedCard['suit'] + '?'
    );
    $('#ask-button').hide();
  }
  function swapOrSkip() {
    $('#select-swap-or-skip').show();
    $('#instructions-wording').html(
      'Play the ' + selectedCard['num'] + ' of ' + selectedCard['suit'] + '?'
    );
    $('#ask-button').hide();
  }
  function myTurn() {
    $('#instructions-wording').html('Its your turn. Choose a card to play');
    let canPlay = false;
    for (let i in uno.me.hand) {
      let card = uno.me.hand[i];
      console.log(card);

      if (uno.isAllowed(card)) {
        canPlay = true;
        $('#' + card['num'] + '-of-' + card['suit']).click(function() {
          $('#select-suit').hide();
          $('#select-swap-or-skip').hide();
          if (selectedCard != null) {
            $('#' + selectedCard['num'] + '-of-' + selectedCard['suit']).css({
              width: '60px',
              height: '86px',
            });
          }
          let cardId = $(this).attr('id');
          $(this).css({ width: '70px', height: '100px' });
          let selectedNumber = cardId.split('-of-')[0];
          let selectedSuit = cardId.split('-of-')[1];
          selectedCard = { num: selectedNumber, suit: selectedSuit };
          if (selectedNumber > 10 || selectedNumber == 1) {
            // Special card
            if (selectedNumber == 1) {
              // Suit	choice
              suitChoice();
              return;
            } else if (selectedNumber == 11) {
              // Swap direction or skip?
              swapOrSkip();
              return;
            } else if (card.num == 13) {
              // Suit choice
              suitChoice();
              return;
            }
          }
          $('#instructions-wording').html(
            'Play the ' +
              selectedCard['num'] +
              ' of ' +
              selectedCard['suit'] +
              '?'
          );
          $('#ask-button').show();
        });
      }
    }
    if (!canPlay) {
      $('#instructions-wording').html('Draw a new card?');
      $('#ask-button').show();
    }
  }
  function updateGame() {
    if (!cardsDealt) {
      console.log('DEALING CARDS');
      console.log(uno.numberPlayers - 1);
      let angleDif = Math.PI / (uno.numberPlayers - 1);
      let curAngle = 0;
      let counter = 0;
      for (let i in uno.loby) {
        let xLoc = 50 - (Math.cos(curAngle) * 40 + 10) + 5;
        let yLoc = 50 - (Math.sin(curAngle) * 40 + 10) + 5;
        console.log(Math.cos(curAngle));
        for (let x = 0; x < uno.loby[i]['hand']; x++) {
          console.log('left: ' + xLoc + '%, top: ' + yLoc + '%');
          let card = $('.card-deck-card:nth-child(' + counter + ')');
          card.delay(counter * 500).animate(
            {
              left: xLoc + '%',
              top: yLoc + '%',
            },
            1500
          );
          counter += 1;
          card.addClass('card-player-' + i);
        }
        curAngle += angleDif;
      }
      console.log(uno.me);
      for (let x = 0; x < uno.me['hand'].length; x++) {
        let card = $('.card-deck-card:nth-child(' + counter + ')');
        card.attr('suit', uno.me['hand'][x]['suit']);
        card.attr('num', uno.me['hand'][x]['num']);
        let xLoc = x * 60;
        card.delay(counter * 500).animate(
          {
            left: xLoc + 'px',
            top: '80%',
          },
          1500,
          function() {
            $(this).addClass('card-player-me');
            //card-flip
            let crd = $(this).attr('card');
            console.log('CARD = ');
            console.log(crd);
            $('#' + $(this).attr('num') + '-of-' + $(this).attr('suit')).addClass(
              'card-flip'
            );
          }
        );
        counter += 1;
      }
    }
    $('#last-played').removeClass('card-suit-D');
    $('#last-played').removeClass('card-suit-H');
    $('#last-played').removeClass('card-suit-S');
    $('#last-played').removeClass('card-suit-C');
    console.log(uno.lastCard);
    $('#last-played').addClass('card-suit-' + uno.lastCard['suit']);
    $('#last-played').html(uno.lastCard['num']);

    for (let i in uno.loby) {
      let player = uno.loby[i];
      if (uno.me['uid'] != player['uid']) {
        $('#player-' + player['uid'] + '>.cards-in-hand')
          .first()
          .html(player['hand']);
      }
    }
    fillHand();
  }
  function fillHand() {
    let cards = '';
    for (let i in uno.me.hand) {
      let card = uno.me.hand[i];
      cards += "<div class='card card-suit-" + card['suit'];
      if (cardsDealt) {
        cards += ' card-flipped';
      }
      cards +=
        "' id='" +
        card['num'] +
        '-of-' +
        card['suit'] +
        "'>" +
        card['num'] +
        '</div>';
    }
    $('#my-cards').html(cards);
    if (!cardsDealt) {
      cardsDealt = true;
    }
    console.log('MY hand');
    for (let i in uno.me['hand']) {
      let card = uno.me['hand'][i];
      let cid = '#' + card['num'] + '-of-' + card['suit'];
      if (uno.isAllowed(card)) {
        $(cid).removeClass('disabled-card');
      } else {
        $(cid).addClass('disabled-card');
      }
    }
  }

  /* Socket Functions */

  socketFunctions = function() {};
  
  socketFunctions.disconnect = function() {
    socketFunctions.unhook();
    socket.emit('leave', {});
  };

  socketFunctions.hook = function() {
    socket.on('status', socketFunctions.status);
    socket.on('user-joined', socketFunctions.userJoined);
    socket.on('user-left', socketFunctions.userLeft);
    socket.on('game-state', socketFunctions.gameState);
    socket.on('players-turn', socketFunctions.playersTurn);
    socket.on('game-info', socketFunctions.gameInfo);
    socket.on('game-over', socketFunctions.gameOver);
  };

  socketFunctions.unhook = function() {
    socket.removeListener('status', socketFunctions.status);
    socket.removeListener('user-joined', socketFunctions.userJoined);
    socket.removeListener('user-left', socketFunctions.userLeft);
    socket.removeListener('game-state', socketFunctions.gameState);
    socket.removeListener('players-turn', socketFunctions.playersTurn);
    socket.removeListener('game-info', socketFunctions.gameInfo);
    socket.removeListener('game-over', socketFunctions.gameOver);
  };

  socketFunctions.status = function(status) {
    console.log(status);
    for (let i in status['players']) {
      let join = status['players'][i];
      if (join.sid == socket.id) {
        uno.updateMe(join);
      } else {
        addUserToGame(join);
      }
    }
    uno.setLeader(status['leader']);
    if (uno.amLeader()) {
      console.log('YOU ARE THE LEADER');
      $('#start-game').show();
      $('#start-game').click(function() {
        uno.startGame();
        $('#start-game').hide();
        socket.emit('start-game', '');
      });
    }
  };

  socketFunctions.userJoined = function(join) {
    if (join.sid == socket.id) {
      uno.updateMe(join);
    } else {
      addUserToGame(join);
    }
  };

  socketFunctions.userLeft = function(left) {
    userLeft(left);
  };

  socketFunctions.gameState = function(state) {
    console.log(state);
    uno.updateGameState(state);
    updateGame();
  };

  socketFunctions.playersTurn = function(pl) {
    if (firstTurn) {
      updateUsers();
      firstTurn = false;
    }
    $('#instructions-wording').html('');
    if (pl == uno.me['uid']) {
      console.log('MY TURN');
      $('#instructions-turn').html('It is your turn');
      myTurn();
    } else {
      hideUserButtons();
      //updateUsers();
      $('#instructions-turn').html('It is ' + pl + "'s turn");
      $('#ask-button').hide();
    }
  };

  socketFunctions.gameInfo = function(res) {
    if (res.player == uno.me.uid) {
      let message = $('#my-messages');
      $('#my-messages').html(res.message);
      $('#my-messages').show();

      setTimeout(function() {
        $('#my-messages').hide();
      }, 5000);
    } else {
      let message = $('#user-message-' + res.player);
      $('#user-message-' + res.player).html(res.message);
      $('#user-message-' + res.player).show();

      setTimeout(function() {
        $('#user-message-' + res.player).hide();
      }, 5000);
    }
  };

  socketFunctions.gameOver = function(winners) {
    // winners is array
    // TODO: what do we do here?
  };

  /* On Window Message */

  window.addEventListener('message', function(e) {
    /* if (e.origin != 'http://localhost') {
      return;
    } */

    let json;
    try {
      json = JSON.parse(e.data);
    } catch (err) {
      return console.error('Invalid json: %o', err);
    }
    
    console.log('Uno Init', json.nsp);
    socket = io(json.nsp);
    socket.on('hello', () => socket.emit('hello', {}));
    socketFunctions.hook();
  },
  false);

  /* On HTML Ready */

  let cardsDealt = false;
  $(function() {
    $('#select-diamonds').click(function() {
      selectedSuit = 'D';
      askFor();
    });
    $('#select-clubs').click(function() {
      selectedSuit = 'C';
      askFor();
    });
    $('#select-spades').click(function() {
      selectedSuit = 'S';
      askFor();
    });
    $('#select-hearts').click(function() {
      selectedSuit = 'H';
      askFor();
    });

    $('#select-swap').click(function() {
      selectedChoice = 'Swap';
      askFor();
    });
    $('#select-skip').click(function() {
      selectedChoice = 'Skip';
      askFor();
    });
    $('#ask-button').click(function() {
      askFor();
    });
    for (let i = 0; i < 52; i++) {
      $('#game-table').append("<div class='card-deck-card'></div>");
    }
  });
})();
