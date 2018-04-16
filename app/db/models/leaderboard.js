'use strict';

let init = (sequelize, DataTypes) => {
  let Leaderboard = sequelize.define(
    'leaderboard',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      game: {
        type: DataTypes.ENUM,
        values: ['Uno', 'GoFish'],
        allowNull: false,
        defaultValue: 'UNO',
      },
      score: {
        type: DataTypes.INTEGER,
      },
    },
    { tableName: 'leaderboards' }
  );

  return Leaderboard;
};

module.exports = init;
