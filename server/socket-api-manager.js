var logger = require('./logger');
var gpioService = require('./gpio-service');

var _io = null;

module.exports.init = function (io) {
    _io = io;

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

        socket.on('pin:write', function (data) {
            logger.log('got a request to write to pin: ' + data.id + ' value: ' + data.value);
            gpioService.writeToPin(data.id, data.value).then(function () {
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
};

module.exports.broadcastStatus = function (pinsStatus) {
    _io.sockets.emit('pins:status', {gpioPins: pinsStatus});
    logger.log('emitting the status to all the sockets');
};
