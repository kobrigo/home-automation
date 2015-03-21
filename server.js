/* global require,console,__dirname,process */
var express = require('express');
var httpModule = require('http');
var socketio = require('socket.io');
var logger = require('logger');
var gpioService = require('gpio-service');

var app = express();
var server = httpModule.Server(app);
var io = socketio(server);

app.use(express.static(__dirname + '/public'));

io.on('connection', function (socket) {
    'use strict';

    logger.log('a user connected. id: ' + socket.id);

    socket.on('pins:getStatus', function () {
        logger.log('got pins:getStatus');
        gpioService.getPinsState().then(function (result) {
            logger.log('sending pins:status:' + JSON.stringify(result));
            socket.emit('pins:status', {gpioPins: result});
        })
    });

    socket.on('disconnect', function (socket) {
        logger.log('a user disconnected . id: ' + this.id);
    })
});

server.listen(3000, function () {
    'use strict';

    logger.log('listening on *:3000');
});

function stopServer() {
    'use strict';

    logger.log('closing the server.');
    server.close(function () {
        logger.log('exiting');
        process.exit(0);
    })
}

function onSignaledToStop(signalName) {
    'use strict';

    logger.log('Got ' + signalName + ' terminating.');
    stopServer();
}

process.on('SIGTERM', function () {
    'use strict';

    onSignaledToStop('SIGTERM');
});

process.on('SIGBREAK', function () {
    'use strict';

    onSignaledToStop('SIGBREAK');
});

process.on('SIGINT', function () {
    'use strict';

    onSignaledToStop('SIGINT');
});

process.on('uncaughtException', function(error) {
    'use strict';

    // handle the error safely
    logger.log('handling uncaughtException:');

    logger.log(error);
    stopServer();
});

