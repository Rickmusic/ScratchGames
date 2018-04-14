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
}

let createLobby = function(dblobby, callback) {
  lobbies[dblobby.id] = {};
  lobbies[dblobby.id].gamesettings = {};
  lobbies[dblobby.id].players = {};
  lobbies[dblobby.id].spectators = {};
  listio.emit('lobbylist', [buildListLobby(dblobby)]);
  if (callback) callback();
};

let getAllLobbies = function() {
  return new Promise ((fulfill, reject) => {
    Lobby.all()
      .then(dblobbies => {
        let ret = [];
        for (let dblobby of dblobbies) {
          if(!lobbies[dblobby.id]) {
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
  if (!lobbies[user.lobbyId]) {
    user.getLobby()
      .then(dblobby => createLobby(dblobby, next))
      .catch(err => dblogger.error('Lobby - Add Member - Get Lobby: ' + err));
  } else {
    next();
  }

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
  if (!lobbies[user.lobbyId]) return; // Lobby was deleted
  switch (user.role) {
   case 'host':
    io.to(user.lobbyId).emit('leave lobby', {});
    delete lobbies[user.lobbyId]; 
    user.getLobby()
      .then(dblobby => dblobby.destroy())
      .catch(err => dblogger.error('Lobby - Remove User - Get Lobby: ' + err));
    break;
  case 'player':
    removePlayer(user);
    break;
  default:
    removeSpectator(user);
    break;
  }
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
