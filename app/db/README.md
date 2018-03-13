# The Database

This app is configured to use a MySQL database. 
You can grab the MySQL Community Server for free at 
<https://dev.mysql.com/downloads/mysql/>, or use the instance that is 
included in [XAMPP](https://www.apachefriends.org/download.html) 
(see [this note](https://gist.github.com/odan/c799417460470c3776ffa8adce57eece)) 
or [WAMP](http://www.wampserver.com/en/#download-wrapper).

Refer to your chosen MySQL provider for instructions on how to install and run.


Tables
------

To build the tables for this app, please see the [MySQL Schema Wiki](../../wiki/MySQL-Schema).


App Configuration
-----------------

Once you have a mySQL instance up and running, you will need to add some information into `app/config/config.json`:
- `db.username` and `db.password`: The username and password for an account with SELECT, INSERT, UPDATE, DELETE, privileges on `db.name` 
- `db.host` and `db.port`: The hostname and port for the MySQL server (probably `localhost` and `3306`)
- `db.name`: the schema name for the app to use


Logging
-------

All database queries, messages, and errors are logged in `app/log/database.log`, 
while only info, warn, and error messages get shown on the console.

