'use strict';

let init = (sequelize, DataTypes) => {
  let Message = sequelize.define(
    'message',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      transport: {
        type: DataTypes.ENUM,
        values: ['global', 'lobby', 'private'],
        allowNull: false,
        defaultValue: 'global',
      },
      senderRole: {
        type: DataTypes.ENUM,
        values: ['player', 'spectator'],
      },
      message: { type: DataTypes.STRING },
    },
    { tableName: 'messages' }
  );

  return Message;
};

module.exports = init;
