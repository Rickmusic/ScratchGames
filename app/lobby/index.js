'use strict';

let lobbyio;

let init = function(newio) {
  lobbyio = newio;
};

let lobbies = {};
/* Contains <lobbyid>: {<settings>} values with game specifice settings, player readyness, ect. */

let createLobby = function(lobbyId) {
  lobbies[lobbyId] = {};
  lobbies[lobbyId].gamesettings = {};
  lobbies[lobbyId].ready = {};
};

let lobbyAddPlayer = function(user) {
  lobbies[user.lobbyId].ready[user.id] = false;
  lobbyio.to(user.lobbyId).emit('lobbyUnready', {});
};

let lobbyRemovePlayer = function(user) {
  delete lobbies[user.lobbyId].ready[user.id];
};

let setPlayerReady = function(user) {
  lobbies[user.lobbyId].ready[user.id] = true;
};
let getPlayerReady = function(user) {
  return lobbies[user.lobbyId].ready[user.id];
};

let checkLobbyReady = function(lobbyId) {
  for (let player in lobbies[lobbyId].ready) {
    if (!lobbies[lobbyId].ready[player]) return false;
  }
  return true;
};

let getGameSettings = function(lobbyId) {
  return lobbies[lobbyId].gamesettings;
};

let updateGameSettings = function(lobbyId, newSettings) {
  lobbies[lobbyId].gamesettings = newSettings;
};

module.exports = {
  init,
  createLobby,
  lobbyAddPlayer,
  lobbyRemovePlayer,
  setPlayerReady,
  getPlayerReady,
  checkLobbyReady,
  getGameSettings,
  updateGameSettings,
};
