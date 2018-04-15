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
 *     gamesettings - {} Tracked Game Specific Settings
 *     players = (uid: {bool}} players + ready status
 *     spectators = { uid: {}} spectators
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
  lobbies[dblobby.id].gamesettings = {};
  lobbies[dblobby.id].players = {};
  lobbies[dblobby.id].spectators = {};
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
  user
    .update({ role: null, lobbyId: null })
    .then(() => {})
    .catch(err => dblogger.error('Lobby - Remove Member - Update User Role: ' + err));
  listIO.emit('updateCounts', {
    id: user.lobbyId,
    players: Object.keys(lobbies[user.lobbyId].players).length,
    spectators: Object.keys(lobbies[user.lobbyId].spectators).length,
  });
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
  return lobbies[lobbyId].gamesettings;
};
let updateGameSettings = function(lobbyId, newSettings) {
  lobbies[lobbyId].gamesettings = newSettings;
};

let startGame = function(user, settings) {
  user
    .getLobby()
    .then(dblobby => {
      // TODO store settings into lobby
      if (!nsps.exists(dblobby.game)) games[dblobby.game].init(nsps.create(dblobby.game));
      // TODO only pass game-specific settings to create
      games[dblobby.game].create(settings, dblobby.id, dblobby.hostId);
      lobbyIO.to(dblobby.id).emit('navigate', {
        loc: 'game',
        args: [dblobby.game, nsps.get(dblobby.game).name],
      });
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
