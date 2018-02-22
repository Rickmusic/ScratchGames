'use strict';

let Sequelize = require('sequelize');

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
  /* logging: false, */
  logging: console.log,
});

sequelize
  .authenticate()
  .then(() => {
    console.log('MySQL connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the MySQL database:', err);
  });

module.exports = {
  sequelize,
  schemas: {
    user: sequelize.import('user', require('./schemas/user')),
  },
};
