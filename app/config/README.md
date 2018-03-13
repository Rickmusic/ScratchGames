# The Config

The `config.json` file holds developer settings. 
An example has been provided as [`config.json.example`](config.json.example)
When building the app in production, please provide the settings via the environment.

All settings will be listed by environment name, followed by `config.json` key in brackets.


Database
--------

See [`app/db`](../db) for information about the database to use.

* `dbUsername` [`db.username`]: The username to connect to the database with
* `dbPassword` [`db.password`]: The password to connect to the database with
* `dbHost` [`db.host`]: The location of the database
* `dbPort` [`db.port`]: The port to use when connecting to the database
* `dbName` [`db.name`]: The schema name to use in the database


Mailer
------

To be able to send out verification and password resets, our app uses a nodemailer instance configured to use OAuth.

* `mailerService` [`mailer.service`]: nodemailer service type
* `mailerAddress` [`mailer.address`]: The from contact address
* `mailerUsername` [`mailer.username`]: account username
* `mailerClientID` [`mailer.clientID`]: OAuth Client ID
* `mailerClientSecret` [`mailer.clientSecret`]: OAuth Client Secret
* `mailerAccessToken` [`mailer.accessToken`]: OAuth Access Token
* `mailerRefreshToken` [`mailer.refreshToken`]: OAuth Refresh Token
* `mailerExpiryDate` [`mailer.expiryDate`]: Access Token Expiry Date


Session
-------

* `sessionSecret` [`session.secret`]: The secret to use for cookies


Facebook
--------

Our app can be used to allow users to log in through Facebook OAuth 

* `facebookClientID` [`facebook.clientID`]: Facebook App ID
* `facebookClientSecret` [`facebook.clientSecret`]: Facebook App Secret


Google
------

Our app can be used to allow users to log in through Google OAuth

* `googleClientID` [`google.clientID`]: Facebook App ID
* `googleClientSecret` [`google.clientSecret`]: Facebook App Secret

