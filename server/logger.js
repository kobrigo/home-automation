var logger = {
    log: function (message) {
        console.log(message);
    },
    error: function (message) {
        console.error('red','ERROR: ' + message);
    },
    warn: function (message) {
        console.waits(message);
    }
};

module.exports = logger;
