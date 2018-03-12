# ScratchGames


Installation:
--------------

To Install:
* run: `npm install`
* See [Database Readme](app/db/) for installing the database
* [optional] See [Nginx Readme](nginx/) for installing Nginx


Running:
---------

To Run:
* run: `node server.js`
* Make sure the Database is running (see [Database Readme](app/db/))
* Open browser to localhost:3000 (or whichever port the server is listening on)

To Run [with Nginx]:
* run: `node server.js`
* Make sure Nginx is running (see [Nginx Readme](nginx/))
* Make sure the Database is running (see [Database Readme](app/db/))
* Open browser to localhost:80


Logs:
-----

Node logs are located at [`app/log`](app/log/).
Check Nginx docs for Nginx log location.
