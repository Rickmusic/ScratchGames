'use strict';

let crypto = require('crypto');

let init = (sequelize, DataTypes) => {
  let Lobby = sequelize.define(
    'lobby',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: { type: DataTypes.STRING },
      type: {
        type: DataTypes.ENUM,
        values: ['public', 'private'],
        allowNull: false,
        defaultValue: 'public',
      },
      game: {
        type: DataTypes.ENUM,
        values: ['UNO', 'GoFish'],
        allowNull: false,
        defaultValue: 'UNO',
      },
      joincode: { 
        type: DataTypes.INTEGER,
        unique: true,
      },
      maxPlayers: { type: DataTypes.INTEGER },
      maxSpectators: { type: DataTypes.INTEGER },
      inGame: { 
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: '0',
      },
    },
    {
      tableName: 'lobbies',
    }
  );

  let generateJoinCode = function generateJoinCode() {
    return new Promise((fulfill, reject) => {
      let joincode = parseInt('0x' + crypto.randomBytes(3).toString('hex'));
      Lobby.findAndCountAll({ where: { joincode: joincode } })
        .then(result => {
          if (result.count === 0) return fulfill(joincode);
          generateJoinCode()
            .then(joincode => fulfill(joincode))
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  };

  Lobby.beforeCreate('generateJoinCode', (instance, options) => {
    return generateJoinCode()
      .then(joincode => {
        instance.joincode = joincode;
        return joincode;
      })
      .catch(err => console.log('At create gen joincode ', err));
  });

  Lobby.prototype.generateNewJoinCode = function() {
    return new Promise((fulfill, reject) => {
      generateJoinCode()
        .then(joincode => {
          this.update({ joincode })
            .then(() => fulfill(this.joincode))
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  };

  Lobby.prototype.addPlayer = function(user, callback) {
    if (callback) {
      this.addPlayer(user)
        .then(() => callback(null))
        .catch(err => callback(err));
      return;
    }

    return new Promise((fulfill, reject) => {
      let role = 'player';
      if (user.id === this.hostId) role = 'host';
      user.update({ role })
        .then(() => {
          this.addUser(user);
          fulfill();
        })
        .catch(err => reject(err));
    });
  };

  Lobby.prototype.addSpectator = function(user, callback) {
    if (callback) {
      this.addSpectator(user)
        .then(() => callback(null))
        .catch(err => callback(err));
      return;
    }

    return new Promise((fulfill, reject) => {
      user.update({ role: 'spectator' })
        .then(() => {
          this.addUser(user);
          fulfill();
        })
        .catch(err => reject(err));
    });
  };

  return Lobby;
};

module.exports = init;
