/* global require,console,__dirname,process */
var express = require('express');
var httpModule = require('http');
var socketio = require('socket.io');
var logger = require('./logger');
var bodyParser = require('body-parser');
var middleWares = require('./middleware');
var routes = require('./routes');

var gpioService = require('./gpio-service');
var app = express();
var server = httpModule.Server(app);

var io = socketio(server);
//Middleware
app.use(middleWares.requestLogger);
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

//initate the routes for this server
routes.init(app);

io.on('connection', function (socket) {
    'use strict';

    logger.log('a user connected. id: ' + socket.id);

    socket.on('pins:getStatus', function () {
        logger.log('got pins:getStatus');
        gpioService.getPinsState().then(function (result) {
            logger.log('sending pins:status:' + JSON.stringify(result));
            socket.emit('pins:status', {gpioPins: result});
        });
    });
    
    socket.on('pin:write', function(data){
    	logger.log('got a request to write to pin: ' + data.id + ' value: ' + data.value); 
    	gpioService.writeToPin(data.id, data.value).then(function(){
    		gpioService.getPinsState().then(function (result) {
                logger.log('sending pins:status:' + JSON.stringify(result));
                socket.emit('pins:status', {gpioPins: result});
            });
    	});
    });

    socket.on('disconnect', function (socket) {
        logger.log('a user disconnected . id: ' + this.id);
    });
});

server.listen(3000, function () {
    'use strict';

    logger.log('listening on *:3000');
});

function stopServer() {
    'use strict';

    logger.log('closing the server:');
    logger.log('Closing the pins');
    gpioService.closeAllPins().finally(function(){
    	logger.log('closing the server');
//    	if(server){
//		    server.close(function () {
//		        logger.log('exiting');
		        server = null;
		        process.exit(0);
//		    });
//	    }
    });
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
