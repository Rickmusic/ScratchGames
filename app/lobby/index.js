'use strict';

let db = require('../db');
let dblogger = require('winston').loggers.get('db');
let { Lobby } = db.models;

let lobbyio;
let listio;

let setLobbySocket = function(newio) {
  lobbyio = newio;
};

let setLobbylistSocket = function(newio) {
  listio = newio;
};

let lobbies = {};
/* Contains <lobbyid>: {<settings>} where <settings> contains
 * gamesettings - Tracked Game Specific Settings
 * players = (uid: {bool}} players + ready status
 * spectators = { uid: {}} spectators
 */

let createLobby = function(lobbyId) {
  lobbies[lobbyId] = {};
  lobbies[lobbyId].gamesettings = {};
  lobbies[lobbyId].players = {};
  lobbies[lobbyId].spectators = {};
};

let getAllLobbies = function() {
  return new Promise ((fulfill, reject) => {
    Lobby.all()
      .then(dblobbies => {
        let ret = [];
        for (let lobby of dblobbies) {
          if(!lobbies[lobby.id]) {
            createLobby(lobby.id);
          }
          ret.push({
            id: lobby.id,
            name: lobby.name,
            access: lobby.type,
            gameType: lobby.game,
            lobbyCap: lobby.maxPlayers,
            currentPlayers: Object.keys(lobbies[lobby.id].players).length,
            spectators: Object.keys(lobbies[lobby.id].spectators).length,
          });
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
  if(!lobbies[user.lobbyId]) {
    createLobby(user.lobbyId);
  }
  switch (user.role) {
    case 'host':
    case 'player':
      addPlayer(user);
      break;
    default:
      addSpectator(user);
      break;
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
};

let removeMember = function(user) {
  switch (user.role) {
   case 'host':
    io.to(user.lobbyId).emit('leave lobby', {});
  case 'player':
    removePlayer(user);
    break;
  default:
    removeSpectator(user);
    break;
  }
  //if empty, remove lpbby.
};

function addPlayer(user) {
  if (user.role === 'host')
    lobbies[user.lobbyId].players[user.id] = { ready: true };
  else
    lobbies[user.lobbyId].players[user.id] = { ready: false };
  lobbyio.to(user.lobbyId).emit('lobbyUnready', {});
};
function removePlayer(user) {
  delete lobbies[user.lobbyId].players[user.id];
};

function addSpectator(user) {
  lobbies[user.lobbyId].spectators[user.id] = {};
}
function removePlayer(user) {
  delete lobbies[user.lobbyId].spectators[user.id];
};


let checkLobbyReady = function(lobbyId) {
  for (let playerId in lobbies[lobbyId].players) {
    if (!lobbies[lobbyId].players[playerId].ready) return false;
  }
  return true;
};

let setPlayerReady = function(user) {
  lobbies[user.lobbyId].players[user.id].ready = true;
  lobbyio.to(user.lobbyId).emit('playerReady', user.id);
  if (checkLobbyReady(user.lobbyId))
    io.to(user.lobbyId).emit('lobbyReady', {});
};
let getPlayerReady = function(user) {
  return lobbies[user.lobbyId].players[user.id].ready;
};

let getGameSettings = function(lobbyId) {
  return lobbies[lobbyId].gamesettings;
};
let updateGameSettings = function(lobbyId, newSettings) {
  lobbies[lobbyId].gamesettings = newSettings;
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
};
