/* global require,console,__dirname,process */
var express= require('express');
var httpModule = require('http');
var socketio = require('socket.io');

var app = express();
var server = httpModule.Server(app);
var io = socketio(server);

app.use(express.static(__dirname + '/public'));

var gpioPins = [
    {
        id: 7,
        state: true
    },
    {
        id: 8,
        state: true
    },
    {
        id: 9,
        state: false
    },
    {
        id: 10,
        state: true
    },
    {
        id: 11,
        state: false
    },
    {
        id: 12,
        state: true
    }
];

io.on('connection', function(socket){
    console.log('a user connected. id: ' + socket.id);
    socket.on('pins:getStatus', function () {
        socket.emit('pins:status', {gpioPins: gpioPins});
    });

    socket.on('disconnect', function(socket) {
        console.log('a user disconnected . id: ' + this.id);
    })
});

server.listen(3000, function(){
    console.log('listening on *:3000');
});

process.on('SIGTERM', function () {
  console.log('Got SIGTERM. terminating');
  server.close(function () {
    process.exit(0);
  });
});