/*
	Name: Benjamin Grande
	ID: 10147040
	Tut: B01
*/

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/css/*', function(req, res) {
	res.sendFile(__dirname +"/public"+ req.url);
});
app.get('/js/*', function(req, res) {
	res.sendFile(__dirname +"/public"+ req.url);
});
app.get('/images/*', function(req, res) {
	res.sendFile(__dirname +"/public"+ req.url);
});
app.get('/', function(req, res){	
	res.sendFile(__dirname + '/index.html');
});
require('./CardGames/Uno/index')(app, io);
http.listen(3000, function(){
	console.log('listening on *:3000');
});
