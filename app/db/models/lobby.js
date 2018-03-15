'use strict';

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
        values: ['UNO', 'SomeGame'],
        allowNull: false,
        defaultValue: 'UNO',
      },
      maxPlayers: { type: DataTypes.INTEGER },
      maxSpectators: { type: DataTypes.INTEGER },
    },
    {
      getterMethods: {},
      setterMethods: {},
      tableName: 'lobbies',
    }
  );

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
