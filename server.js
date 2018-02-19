let express = require('express');
let app = express();

let flash = require('express-flash');
let session = require('express-session');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let path = require('path');

let passport = require('./app/passport');
let router = require('./app/router');

let port = process.env.PORT || 3000;

// Put static before activating session
// app.use(express.static());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('keyboard cats'));
app.use(
  session({
    secret: 'keyboard cats',
    resave: false, // don't automatically write to session store
    saveUninitialized: false, // don't save new sessions
    cookie: {
      path: '/', // base URL path that will trigger client to send cookie
      httpOnly: true, // hide cookie from client-side JavaScript
      secure: false, // send cookie on non-secure connections
      maxAge: 172800000, // 2 days (in milliseconds)
    },
  })
);
// Passport init and session must come after express-session init
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/', router);

app.listen(port, function() {
  console.log('Server listening at port %d', port);
});
