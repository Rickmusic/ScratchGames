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

  return Lobby;
};

module.exports = init;
