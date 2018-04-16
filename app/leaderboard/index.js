'use strict';

let db = require('../db');
let dblogger = require('winston').loggers.get('db');
let { Leaderboard, User } = db.models;

let leaderboardIO;

let setLeaderboardSocket = function(newIO) {
  leaderboardIO = newIO;
};

let getLeaderboards = function() {
  return new Promise((fulfill, reject) => {
    Leaderboard.all({ include: [User] })
      .then(leaderboards => {
        let ret = { Uno: [], GoFish: [] };
        for (let leaderboard of leaderboards) {
          if (!ret[leaderboard.game]) ret[leaderboard.game] = [];
          ret[leaderboard.game].push({
            id: leaderboard.user.id,
            name: leaderboard.user.displayName,
            score: leaderboard.score,
          });
        }
        for (let game of Object.keys(ret)) {
          switch (game) {
            case 'Uno':
              ret[game].sort(function(a, b) {
                return b.score > a.score ? 1 : -1;
              });
              break;
            default:
              ret[game].sort(function(a, b) {
                return b.score < a.score ? 1 : -1;
              });
              break;
          }
        }
        return fulfill(ret);
      })
      .catch(err => {
        dblogger.error('Leaderboard - Get Leaderboards - Find All: ' + err);
        return reject();
      });
  });
};

let addScores = {
  Uno: function(scores) {
    return new Promise((fulfill, reject) => {
      for (let player in scores) {
        Leaderboard.findOrCreate({
          where: { userId: player, game: 'Uno' },
          defaults: { score: 0, played: 0 },
        })
          .then(leaderboards => {
            let leaderboard = leaderboards[0];
            leaderboard
              .update({
                score: (leaderboard.score + scores[player]) / 2,
                played: leaderboard.played + 1,
              })
              .then(() =>
                leaderboardIO.emit('update', {
                  game: 'Uno',
                  id: leaderboard.userId,
                  score: leaderboard.score,
                })
              )
              .catch(err =>
                dblogger.error('Leaderboard - Add Score (Uno) - Update: ' + err)
              );
          })
          .catch(err => dblogger.error('Leaderboard - Add Score (Uno) - Get: ' + err));
      }
    });
  },
  GoFish: function(scores) {
    return new Promise((fulfill, reject) => {
      for (let player in scores) {
        Leaderboard.findOrCreate({
          where: { userId: player, game: 'GoFish' },
          defaults: { score: 0, played: 0 },
        })
          .then(leaderboards => {
            let leaderboard = leaderboards[0];
            leaderboard
              .update({
                score: leaderboard.score + scores[player],
                played: leaderboard.played + 1,
              })
              .then(() =>
                leaderboardIO.emit('update', {
                  game: 'GoFish',
                  id: leaderboard.userId,
                  score: leaderboard.score,
                })
              )
              .catch(err =>
                dblogger.error('Leaderboard - Add Score (GoFish) - Update: ' + err)
              );
          })
          .catch(err => dblogger.error('Leaderboard - Add Score (GoFish) - Get: ' + err));
      }
    });
  },
};

module.exports = { setLeaderboardSocket, getLeaderboards, addScores };
