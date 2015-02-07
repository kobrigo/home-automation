var gpio = require("pi-gpio");

function closePins() {
    gpio.destroy(function() {
        console.log('All pins unexported');
    });
}

var service = {
    writeToPin: function (pinNumber, value) {

    }

};

