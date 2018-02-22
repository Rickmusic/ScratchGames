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

let Auth = sequelize.import('auth', require('./schemas/auth'));
let User = sequelize.import('user', require('./schemas/user'));

let UserAuth = User.hasOne(Auth);

Auth.drop() // Drop the table, if it exists
  .then(() => {
    User.drop()
      .then(() => {
        User.sync() // Create table if it doesn't exist
          .then(() => {
            Auth.sync()
              .then(() => {
                createUsers();
              })
              .catch(err => {
                console.log('MySQL Error (@Sync Auth): ' + err);
              });
          })
          .catch(err => {
            console.log('MySQL Error (@Sync User): ' + err);
          });
      })
      .catch(err => {
        console.log('MySQL Error (@Drop User):' + err);
      });
  })
  .catch(err => {
    console.log('MySQL Error (@Drop User):' + err);
  });

function createUsers() {
  console.log('MySQL Tables are Ready');
  User.create(
    {
      displayName: 'Jack',
      auth: {
        username: 'jack',
      },
    },
    {
      include: [UserAuth],
    }
  )
    .then(user => {
      user.updatePassword('secret').catch(err => {
        console.log('MySQL Error (@Set Password jack): ' + err);
      });
    })
    .catch(err => {
      console.log('MySQL Error (@User create jack): ' + err);
    });

  User.create(
    {
      displayName: 'Jill',
      auth: {
        username: 'jill',
      },
    },
    {
      include: [UserAuth],
    }
  )
    .then(user => {
      user.updatePassword('birthday').catch(err => {
        console.log('MySQL Error (@Set Password jill): ' + err);
      });
    })
    .catch(err => {
      console.log('MySQL Error (@User create jill): ' + err);
    });
}

module.exports = {
  sequelize,
  schemas: {
    auth: Auth,
    user: User,
  },
  assoc: {
    userauth: UserAuth,
  },
};
