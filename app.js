var express = require('express');
var path = require('path');
var socket = require('socket.io');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'socket.io.notifications@gmail.com',
        pass: '%3Dcr%26ei%3DJ3IZVfiiEOXV8gfjnoDoAw%26gws_rd%3Dssl&hl=en'
    }
});

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

    socket.on('messages', function(user) {
        socket.broadcast.emit('messages', {
            'nickName': user.nickName,
            'message': user.message
        });
    });

    socket.on('join', function(user) {
        socket.nickName = user.name;
        socket.userId = user.id;
        console.log('new user - ' + socket.nickName + '(' + socket.userId + ')');
        console.log('');
        transporter.sendMail({
            from: 'socket.io.notifications@gmail.com',
            to: 'chalodem@gmail.com',
            subject: 'New User Online',
            text: user.name + ' (' + user.id + ') is online'
        });
    });

    socket.on('broadcast-refresh', function(user) {
        socket.broadcast.emit('broadcast-refresh', {
            'nickName': user.name,
            'id': user.id
        });
    });
});

module.exports = app;
