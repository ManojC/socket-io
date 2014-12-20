var express = require('express');
var path = require('path');
var socket = require('socket.io');

var app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(request, response) {
    response.sendFile(__dirname + '/public/html/home.html');
});

//create server
var server = app.listen(3000, function() {

    var host = server.address().address;
    var port = server.address().port;
    console.log('the test app is listening to http://%s:%s', host, port);
});

var io = socket.listen(server);

io.sockets.on('connection', function(client) {
    client.on('messages', function(message) {
        console.log(client.nickname + ' said - ' + message);
        client.broadcast.emit('messages', {
            'nickname': client.nickname,
            'message': message
        });
    });
    client.on('join', function(name) {
        client.nickname = name;
    });

});

module.exports = app;
