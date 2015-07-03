var moment = require('moment');

var logger = {
    log: function (message) {
        var now = moment();
        console.log(now.toString() + ': ' + message);
    },

    debug: function (message) {
        var now = moment();
        console.log(now.toString() + ': ' + message);
    },

    error: function (message) {
        var now = moment();
        console.error(now.toString() + ': ' + 'ERROR: ' + message);
    },
    warn: function (message) {
        var now = moment();
        console.waits(now.toString() + ': ' + message);
    }
};

module.exports = logger;
