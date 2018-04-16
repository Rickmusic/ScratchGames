'use strict';

let Sequelize = require('sequelize');
let logger = require('winston').loggers.get('db');

let config = require('../config');

let sequelize = new Sequelize({
  host: config.db.host,
  port: config.db.port,
  username: config.db.username,
  password: config.db.password,
  database: config.db.name,
  operatorsAliases: Sequelize.Op, // use Sequelize.Op
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: msg => logger.verbose(msg),
});

sequelize
  .authenticate()
  .then(() => {
    logger.info('Database Connection Established');
  })
  .catch(err => logger.error('Database Connection Failed: ', err));

/* Import All Of The Tables */
let Auth = sequelize.import('auth', require('./models/auth'));
let Lobby = sequelize.import('lobby', require('./models/lobby'));
let Leaderboard = sequelize.import('leaderboard', require('./models/leaderboard'));
let Message = sequelize.import('message', require('./models/message'));
let Token = sequelize.import('token', require('./models/token'));
let User = sequelize.import('user', require('./models/user'));

/* Add In the References
 * A.has*(B): adds getter/setter methods to A, and puts foreign key in B
 * A.belongsTo(B): adds getter/setter methods to A, and puts foregin key in A
 */
let UserAuth = User.hasOne(Auth, { foreignKey: 'userId' });
let TokenUser = Token.belongsTo(User, { foreignKey: 'userId' });
let LobbyUser = Lobby.hasMany(User, { as: 'Users', foreignKey: 'lobbyId' });
let UserLobby = User.belongsTo(Lobby, { foreignKey: 'lobbyId' });
let UserLeaderboard = User.hasMany(Leaderboard, { as: 'Ranks', foreignKey: 'userId' });
let MessageFrom = Message.belongsTo(User, { as: 'Sender', foreignKey: 'senderId' });
let MassageLobby = Message.belongsTo(Lobby, { foreignKey: 'lobbyId' });
let MessageTo = Message.belongsTo(User, { as: 'Recipient', foreignKey: 'recipientId' });

/* The following relationships are not foreignKey constrained on the DB */
let LobbyHost = Lobby.belongsTo(User, { as: 'Host', foreignKey: 'hostId' });

module.exports = {
  sequelize,
  models: {
    Auth,
    Lobby,
    Leaderboard,
    Message,
    Token,
    User,
  },
  associations: {
    UserAuth,
    TokenUser,
    LobbyUser,
    UserLobby,
    LobbyHost,
    UserLeaderboard,
    MessageFrom,
    MassageLobby,
    MessageTo,
  },
};
