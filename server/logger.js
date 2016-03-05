var moment = require('moment');
var _ = require('lodash');

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
        var now = moment();
        console.log(now.toString() + ': ' + message);
    },

    debug: function debug(message) {
        var now = moment();
        console.log(now.toString() + ': ' + message);
    },

    error: function error(message) {
        var now = moment();
        console.error(now.toString() + ': ' + 'ERROR: ' + message);
    },
    warn: function warn(message) {
        var now = moment();
        console.waits(now.toString() + ': ' + message);
    }
};

module.exports = logger;
