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
    initTables();
  })
  .catch(err => logger.error('Database Connection Failed: ', err));

/* Import All Of The Tables */
let Auth = sequelize.import('auth', require('./models/auth'));
let Lobby = sequelize.import('lobby', require('./models/lobby'));
let Message = sequelize.import('message', require('./models/message'));
let Token = sequelize.import('token', require('./models/token'));
let User = sequelize.import('user', require('./models/user'));

/* Add In the References
 * A.has*(B): adds getter/setter methods to A, and puts foreign key in B
 * A.belongsTo(B): adds getter/setter methods to A, and puts foregin key in A
 */
let UserAuth = User.hasOne(Auth);
let TokenUser = Token.belongsTo(User);
let LobbyUser = Lobby.hasMany(User, { as: 'Users', foreignKey: 'lobbyId' });
let UserLobby = User.belongsTo(Lobby, { foreignKey: 'lobbyId' })
let MessageFrom = Message.belongsTo(User, { as: 'Sender' });
let MassageLobby = Message.belongsTo(Lobby);
let MessageTo = Message.belongsTo(User, { as: 'To' });

/* Set Up the Physical Database
 * .drop() will drop the table, if it exists
 * .sync() will create the table if it doesn't exist
 * Ordered due to foreign key constraints on add/drop of tables
 */
function initTables() {
  Promise.all([Auth.drop(), Token.drop(), Message.drop()])
    .then(() => {
      User.drop() 
        .then(() => {
          Lobby.drop()
            .then(() => {
              Lobby.sync()
                .then(() => {
                  User.sync() 
                    .then(() => {
                      Promise.all([Auth.sync(), Token.sync(), Message.sync()])
                        .then(() => {
                          tablesReady();
                        })
                        .catch(err => logger.error('At Sync Auth/Token/Message: ' + err));
                    })
                    .catch(err => logger.error('At Sync User: ' + err));
                })
                .catch(err => logger.error('At Sync Lobby: ' + err));
            })
            .catch(err => logger.error('At Drop Lobby: ' + err));
        })
        .catch(err => logger.error('At Drop User: ' + err));
    })
    .catch(err => logger.error('At Drop Auth/Token/Message: ' + err));
}

function tablesReady() {
  logger.info('Database Tables are Ready');
  User.create(
    {
      displayName: 'Jack',
      auth: { username: 'jack' },
    },
    { include: [UserAuth] }
  )
    .then(user => {
      user
        .updatePassword('secret')
        .then(() => logger.info('User jack Created'))
        .catch(err => logger.error('At Set Password jack: ' + err));
    })
    .catch(err => logger.error('At User Create jack: ' + err));

  User.create(
    {
      displayName: 'Jill',
      auth: { username: 'jill' },
    },
    { include: [UserAuth] }
  )
    .then(user => {
      user
        .updatePassword('birthday')
        .then(() => logger.info('User jill Created'))
        .catch(err => logger.error('At Set Password jill: ' + err));
    })
    .catch(err => logger.error('At User Create jill: ' + err));
}

module.exports = {
  sequelize,
  models: {
    Auth,
    Lobby,
    Message,
    Token,
    User,
  },
  associations: { 
    UserAuth, 
    TokenUser,
    LobbyUser,
    UserLobby,
    MessageFrom,
    MassageLobby,
    MessageTo,
  },
};
