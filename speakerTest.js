/* global console setTimeout require process*/
var gpio = require("pi-gpio");
var pinToWorkOn = 7;

function openingPin(){
	console.log("opening Pin");
	gpio.write(pinToWorkOn, 1, function() {
		setTimeout(closingPin ,1000);
	});
}

function closingPin(){
	console.log("closing Pin");
	gpio.write(pinToWorkOn, 0, function() {
		setTimeout(openingPin, 1000);
	});
}

setTimeout(function(){
	gpio.write(pinToWorkOn, 0, function() {
		gpio.close(pinToWorkOn);
		process.exit(0);
	});
	
}, 5000);

gpio.open(pinToWorkOn, "output", function(err) {
	console.log("err:" + err);
	openingPin();
});

//gpio.open(pinToWorkOn, "output", function(err) { 
//
//    console.log("error: " + err);
//
//    gpio.write(pinToWorkOn, 1, function() {
//        setTimeout(function() { 
//            console.log("closing pin: " + pinToWorkOn);
//            gpio.write(pinToWorkOn, 0, function() {
//            	gpio.close(pinToWorkOn);	
//            });
////            gpio.close(pinToWorkOn);
//            
//        }, 3000);
//    });
//});

