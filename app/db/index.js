'use strict';

let Sequelize = require('sequelize');
let logger = require('winston').loggers.get('sequelize');

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

let Auth = sequelize.import('auth', require('./models/auth'));
let Token = sequelize.import('toekn', require('./models/token'));
let User = sequelize.import('user', require('./models/user'));

let UserAuth = User.hasOne(Auth);
let TokenUser = Token.belongsTo(User);

function initTables() {
  Promise.all([Auth.drop(), Token.drop()]) // Drop the tables, if they exists
    .then(() => {
      User.drop() // Ordered for foreign key constraints on add/drop of tables
        .then(() => {
          User.sync() // Create table if it doesn't exist
            .then(() => {
              Promise.all([Auth.sync(), Token.sync()])
                .then(() => {
                  tablesReady();
                })
                .catch(err => logger.error('At Sync Auth/Token: ' + err));
            })
            .catch(err => logger.error('At Sync User: ' + err));
        })
        .catch(err => logger.error('At Drop User: ' + err));
    })
    .catch(err => logger.error('At Drop Auth/Token: ' + err));
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
      Token.createVerifyToken(user)
        .then(token => logger.info('Token jack Created: ' + token))
        .catch(err => logger.error('At Create Token jack: ' + err));
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
    auth: Auth,
    user: User,
    token: Token,
  },
  associations: { userauth: UserAuth, tokenuser: TokenUser },
};
