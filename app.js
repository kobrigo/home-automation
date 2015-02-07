//var gpio = require('rpi-gpio');
//
//gpio.on('export', function(channel) {
//    console.log('Channel set: ' + channel);
//});
//
////gpio.setup(7, gpio.DIR_OUT);
////gpio.setup(15, gpio.DIR_OUT);
//gpio.setup(11, gpio.DIR_OUT, pause);
//
//
//function pause() {
//    gpio.write(7, true);
//    setTimeout(closePins, 3000);
//}
//


var gpio = require("pi-gpio");
var pinToWorkOn = 7;

function closePins() {
    gpio.destroy(function() {
        console.log('All pins unexported');
        return process.exit(0);
    });
}

gpio.open(pinToWorkOn, "output", function(err) { 

    console.log("error: " + err);

    gpio.write(pinToWorkOn, 1, function() {
        setTimeout(function() { 
            console.log("closing pin: " + pinToWorkOn);
            gpio.write(pinToWorkOn, 0, function() {
            	gpio.close(pinToWorkOn);

                closePins();
            });

        }, 5000);
    });
});