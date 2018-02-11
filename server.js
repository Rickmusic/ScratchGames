let express = require('express');
let app = express();

let flash = require('express-flash');
let session = require("express-session");
let bodyParser = require("body-parser");
let path = require('path');

let passport = require('./app/passport');
let router = require('./app/router');

let port = process.env.PORT || 3000;

app.set('views', path.join (__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
//app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
	secret: "keyboard cats", 
	resave: false, 
	saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use ('/', router);

app.listen(port, function () {
    console.log('Server listening at port %d', port);
});

