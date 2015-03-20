/* global require,console */
var gpio = require('pi-gpio');
var config = require('server.config.js');

function closePins() {
    gpio.destroy(function() {
        console.log('All pins unexported');
    });
}

var service = {
    writeToPin: function (pinNumber, value) {

    }

};

