'use strict';

let db = require('../db');
let dblogger = require('winston').loggers.get('db');
let { Message, User } = db.models;

let init = function(io) {
  io.on('connection', function(socket) {

    let navigate = function() {
      let nav = {};
      switch (socket.request.session.histnav) {
        case 'profile':
          nav = { html: 'snippets/profile.html', modal: false, js: null /*'profile.js'*/, call: null /*'profile'*/ };
          break;
        case 'leaderboard':
          nav = { html: 'snippets/leaderboard.html', modal: false, js: null, call: null /*'leaderboard'*/ };
          break;
        case 'lobby':
          nav = { html: 'snippets/lobby.html', modal: false, js: null, call: null };
          break;
        case 'game':
          nav = { html: null, modal: false, js: null, call: null };
          break;
        case 'joincode':
          nav = { html: 'snippets/joincode.html', modal: false, js: null, call: null };
          break;
        case 'lobbylist':
        default:
          nav = { html: 'snippets/lobbyList.html', modal: false, js: 'lobbylist.js', call: 'lobbylist' };
          break;
      }
      socket.emit('navigate', nav);
    }

    socket.on('hello', function(data) {
      if (!socket.request.session.histnav) socket.request.session.histnav = 'lobbylist';
      navigate();
    });

    socket.on('navigate', function(data) {
      socket.request.session.histnav = data.nav;
      navigate();
    });

    socket.on('create lobby', function(data) {
    });

  });
};

module.exports = init;
