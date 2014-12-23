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

io.sockets.on('connection', function(socket) {
    // console.log(socket.id);
    io.sockets.sockets['nickname'] = socket.id;
    socket.on('messages', function(message) {
        // console.log(socket.nickname + ' said - ' + message);
        socket.broadcast.emit('messages', {
            'nickname': socket.nickname,
            'message': message
        });
    }).on('join', function(name) {
        socket.nickname = name;
        socket.emit('messages', {
            'isNewUser': true,
            'nickname': name
        });
    }).on('on-private', function(chatKey) {
        // console.log(chatKey);
    });
});

module.exports = app;
