let express = require('express');
let app = express();

let flash = require('express-flash');
let bodyParser = require('body-parser');
let path = require('path');

let morgan = require('./app/log/morgan');
let winston = require('./app/log/winston'); // All other files can just require('winston') once configured

let cookieParser = require('./app/cookie');
let session = require('./app/session');
let { passport, passportAutosave } = require('./app/passport');
let router = require('./app/router');
let http = require('./app/socket')(app);

let port = process.env.PORT || 3000;

// Put static before activating session
// app.use(express.static());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser);
app.use(session);

// Passport init and session must come after express-session init
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('remember-me'));
app.use(passportAutosave);
app.use(flash());

app.use(morgan.file);
app.use(morgan.console); // Display 400 and 500 response codes to console

app.use('/', router);

http.listen(port, function() {
  winston.info('Server listening at port %d', port);
});
