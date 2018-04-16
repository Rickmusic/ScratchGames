'use strict';

let db = require('../db');
let dblogger = require('winston').loggers.get('db');
let { Lobby } = db.models;
let games = require('../games');
let nsps = require('../socket/namespaceManager');

let lobbyIO;
let listIO;

let setLobbySocket = function(newio) {
  lobbyIO = newio;
};

let setLobbylistSocket = function(newio) {
  listIO = newio;
};

let lobbies = {};
/* 
 * Contains <lobbyid>: {<settings>} 
 *   where <settings> contains
 *     gameform = {} Game Specific Settings Form
 *     players = (uid: {bool}} players + ready status
 *     spectators = { uid: {}} spectators
 *     gamestatus = {} while playing games
 *     gamesettings - {} Lobby Game Specific Settings
 */

let buildListLobby = function(dblobby) {
  return {
    id: dblobby.id,
    name: dblobby.name,
    access: dblobby.type,
    gameType: dblobby.game,
    lobbyCap: dblobby.maxPlayers,
    currentPlayers: Object.keys(lobbies[dblobby.id].players).length,
    spectators: Object.keys(lobbies[dblobby.id].spectators).length,
  };
};

let createLobby = function(dblobby, callback) {
  lobbies[dblobby.id] = {};
  lobbies[dblobby.id].gameform = {};
  lobbies[dblobby.id].players = {};
  lobbies[dblobby.id].spectators = {};
  lobbies[dblobby.id].gamesettings = {};
  lobbies[dblobby.id].gamestatus = {};
  listIO.emit('lobbylist', [buildListLobby(dblobby)]);
  if (callback) callback();
};

let getAllLobbies = function() {
  return new Promise((fulfill, reject) => {
    Lobby.all()
      .then(dblobbies => {
        let ret = [];
        for (let dblobby of dblobbies) {
          if (!lobbies[dblobby.id]) {
            //continue;
            createLobby(dblobby);
          }
          ret.push(buildListLobby(dblobby));
        }
        return fulfill(ret);
      })
      .catch(err => {
        dblogger.error('Lobby - Get All Lobbies - Find Lobby: ' + err);
        return reject();
      });
  });
};

let addMember = function(user) {
  if (!lobbies[user.lobbyId])
    user
      .getLobby()
      .then(dblobby => createLobby(dblobby, next))
      .catch(err => dblogger.error('Lobby - Add Member - Get Lobby: ' + err));
  else next();

  function next() {
    switch (user.role) {
      case 'host':
      case 'player':
        addPlayer(user);
        break;
      default:
        addSpectator(user);
        break;
    }
    listIO.emit('updateCounts', {
      id: user.lobbyId,
      players: Object.keys(lobbies[user.lobbyId].players).length,
      spectators: Object.keys(lobbies[user.lobbyId].spectators).length,
    });
  }
};

let updateMember = function(user) {
  switch (user.role) {
    case 'player':
      if (lobbies[user.lobbyId].spectators[user.id]) {
        removeSpectator(user);
      }
      addPlayer(user);
      break;
    case 'spectator':
      if (lobbies[user.lobbyId].players[user.id]) {
        removePlayer(user);
      }
      addSpectator(user);
      break;
    default:
      break;
  }
  listIO.emit('updateCounts', {
    id: user.lobbyId,
    players: Object.keys(lobbies[user.lobbyId].players).length,
    spectators: Object.keys(lobbies[user.lobbyId].spectators).length,
  });
};

let removeMember = function(user) {
  if (!lobbies[user.lobbyId]) return; // Lobby was deleted
  switch (user.role) {
    case 'host':
      lobbyIO.to(user.lobbyId).emit('leave lobby', {}); // Tell all lobby members to leave
      delete lobbies[user.lobbyId]; // Remove lobbies object
      listIO.emit('removeLobby', user.lobbyId); // Remove from lobby list
      user
        .update({ role: null })
        .then(() => {})
        .catch(err =>
          dblogger.error('Lobby - Remove Member - Update User Role (Host): ' + err)
        );
      user
        .getLobby()
        .then(dblobby => dblobby.destroy())
        .catch(err =>
          dblogger.error('Lobby - Remove Member - Get Lobby (Destroy): ' + err)
        );
      return;
    case 'player':
      removePlayer(user);
      break;
    default:
      removeSpectator(user);
      break;
  }
  listIO.emit('updateCounts', {
    id: user.lobbyId,
    players: Object.keys(lobbies[user.lobbyId].players).length,
    spectators: Object.keys(lobbies[user.lobbyId].spectators).length,
  });
  user
    .update({ role: null, lobbyId: null })
    .then(() => {})
    .catch(err => dblogger.error('Lobby - Remove Member - Update User Role: ' + err));
};

function addPlayer(user) {
  if (user.role === 'host') lobbies[user.lobbyId].players[user.id] = { ready: true };
  else lobbies[user.lobbyId].players[user.id] = { ready: false };
  lobbyIO.to(user.lobbyId).emit('lobbyUnready', {});
}
function removePlayer(user) {
  delete lobbies[user.lobbyId].players[user.id];
}

function addSpectator(user) {
  lobbies[user.lobbyId].spectators[user.id] = {};
}
function removeSpectator(user) {
  delete lobbies[user.lobbyId].spectators[user.id];
}

let checkLobbyReady = function(lobbyId) {
  //if (Object.keys(lobbies[user.lobbyId].players).length < 2) return false;
  for (let playerId in lobbies[lobbyId].players) {
    if (!lobbies[lobbyId].players[playerId].ready) return false;
  }
  return true;
};

let setPlayerReady = function(user) {
  lobbies[user.lobbyId].players[user.id].ready = true;
  lobbyIO.to(user.lobbyId).emit('playerReady', user.id);
  if (checkLobbyReady(user.lobbyId)) lobbyIO.to(user.lobbyId).emit('lobbyReady', {});
};
let getPlayerReady = function(user) {
  if (!lobbies[user.lobbyId].players[user.id]) return false; // Hotfix for addMember race condition
  return lobbies[user.lobbyId].players[user.id].ready;
};

let getGameSettings = function(lobbyId) {
  return lobbies[lobbyId].gameform;
};
let updateGameSettings = function(lobbyId, newSettings) {
  lobbies[lobbyId].gameform = newSettings;
};

/* Game Progress Function */

let endGame = function(lobbyId) {
  Lobby.findById(lobbyId)
    .then(dblobby => {
      for (let playerId in lobbies[lobbyId].players) {
        lobbies[lobbyId].players[playerId].ready = playerId === dblobby.hostId;
      }
      dblobby
        .update({ inGame: false })
        .then(() => {
          lobbyIO.to(lobbyId).emit('navigate', { loc: 'lobby' });
        })
        .catch(err => dblogger.error('Lobby - End Game - Update Lobby: ' + err));
    })
    .catch(err => dblogger.error('Lobby - End Game - Find Lobby: ' + err));
};

let endRound = {
  Uno: function endRound(lobbyId, score) {
    // TODO update Leaderboard
    if (lobbies[lobbyId].gamestatus.rounds <= 1) return endGame(lobbyId);
    lobbies[lobbyId].gamestatus.rounds -= 1;
    Lobby.findById(lobbyId)
      .then(dblobby => startRound(dblobby))
      .catch(err => dblogger.error('Lobby - End Round (Uno) - Find Lobby: ' + err));
  },
  GoFish: function endRound(lobbyId, score) {
    // TODO update Leaderboard
    if (lobbies[lobbyId].gamestatus.rounds <= 1) return endGame(lobbyId);
    lobbies[lobbyId].gamestatus.rounds -= 1;
    Lobby.findById(lobbyId)
      .then(dblobby => startRound(dblobby))
      .catch(err => dblogger.error('Lobby - End Round (GoFish) - Find Lobby: ' + err));
  },
};

let startRound = function(dblobby) {
  games[dblobby.game].create(
    lobbies[dblobby.id].gamesettings,
    dblobby.id,
    dblobby.hostId,
    endRound[dblobby.game]
  );
  lobbyIO.to(dblobby.id).emit('new round', dblobby.game, nsps.get(dblobby.game).name);
};

let startFirstRound = function(dblobby) {
  if (!nsps.exists(dblobby.game)) games[dblobby.game].init(nsps.create(dblobby.game));
  games[dblobby.game].create(
    lobbies[dblobby.id].gamesettings,
    dblobby.id,
    dblobby.hostId,
    endRound[dblobby.game]
  );
  lobbyIO.to(dblobby.id).emit('navigate', {
    loc: 'game',
    args: [dblobby.game, nsps.get(dblobby.game).name],
  });
};

let startGame = function(user, settings) {
  lobbies[user.lobbyId].gameform = settings;
  user
    .getLobby()
    .then(dblobby => {
      switch (dblobby.game) {
        case 'Uno':
          lobbies[user.lobbyId].gamesettings = {
            numMatch: lobbies[user.lobbyId].gameform.numMatch,
            numDecks: lobbies[user.lobbyId].gameform.numDecks,
          };
          lobbies[user.lobbyId].gamestatus = {
            rounds: parseInt(lobbies[user.lobbyId].gameform.rounds),
          };
          break;
        case 'GoFish':
          lobbies[user.lobbyId].gamesettings = {
            numMatch: lobbies[user.lobbyId].gameform.numMatch,
            numDecks: lobbies[user.lobbyId].gameform.numDecks,
          };
          lobbies[user.lobbyId].gamestatus = {
            rounds: parseInt(lobbies[user.lobbyId].gameform.rounds),
          };
          break;
        default:
          break;
      }
      startFirstRound(dblobby);
      dblobby
        .update({ inGame: true })
        .then(() => {})
        .catch(err => dblogger.error('Lobby - Start Game - Update Lobby: ' + err));
    })
    .catch(err => dblogger.error('Lobby - Start Game - Get Lobby: ' + err));
};

module.exports = {
  setLobbySocket,
  setLobbylistSocket,
  getAllLobbies,
  createLobby,
  addMember,
  updateMember,
  removeMember,
  setPlayerReady,
  getPlayerReady,
  checkLobbyReady,
  getGameSettings,
  updateGameSettings,
  startGame,
};
