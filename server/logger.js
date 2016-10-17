var moment = require('moment');
var _ = require('lodash');
var util = require('util');
var winston = require('winston');


function logFormatterFunction(options) {
    return options.timestamp().format('L LTS') +' '+ options.level.toUpperCase() +' '+ (undefined !== options.message ? options.message : '') +
        (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
}

var consoleTransport, fileTransport;
try {
    consoleTransport = new (winston.transports.Console)({
        level: 'debug',
        timestamp: function() {
            return moment();
        },
        formatter: logFormatterFunction
    });
    fileTransport = new (winston.transports.File)({
        filename: './server/logs/server.log',
        json: false,
        level: 'debug',
        maxFiles: 10,
        maxsize: 2 * 1024 * 1024,
        timestamp: function() {
            return moment();
        },

        formatter: logFormatterFunction
    });

} catch (e) {
   console.error(e);
}

var winstonLogger = new (winston.Logger)({
    transports: [
        consoleTransport,
        fileTransport
    ]
});

var logger = {
    createPrefixedLogger: function createPrefixedLogger(messagesPrefix) {
        var returnedLogger = {};
        _.forOwn(logger, function iterator(func, functionName) {
           returnedLogger[functionName] = function(message){
               var messageWithPerfix = messagesPrefix + ' ' + message;
               func.call(this, messageWithPerfix);
           };
        });

        return returnedLogger;
    },

    log: function log(message) {
        winstonLogger.info(message);
    },

    debug: function debug(message) {
        winstonLogger.debug(message);
    },

    error: function error(message) {
        winstonLogger.error(message);
    },
    warn: function warn(message) {
        winstonLogger.warn(message);
    }
};

module.exports = logger;
