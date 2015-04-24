/* global require,console,module */
module.exports = (function () {
    'use strict';
	var _ = require('underscore');
    var config = require('./../config');
    var logger = require('./logger');
    var Pin = require('./pin');
    var when = require('when');

    var gpio;
    if(process.env.developmentMode){
        gpio = require('./pi-gpio-mock');
    } else {
        gpio = require('pi-gpio');
    }

    var _pinsModelCollection = [];
    closeAllPins().then(function(){
    	createPins(config);
    });

    return {
        writeToPin: writeToPin,
        getPinsState: getPinsState,
        closeAllPins: closeAllPins
    };

    function closeAllPins() {
    	var promises = [];    	
    	logger.log('closing all pins');
    	
    	config.gpioPins.forEach(function(pinConfig){
    		var defer = when.defer();
    		gpio.close(pinConfig.id, function(error){
    			logger.log('closed pin:' + pinConfig.id);
    			defer.resolve(error);
    		});
    		
    		promises.push(defer.promise);
    	});
        
        return when.all(promises);
    }

    function createPins(config) {
        var promises = [];

        config.gpioPins.forEach(function (pinConfig) {
            var newPinModel = new Pin(pinConfig);
            var pinsPromise = newPinModel.open()
                .then(function () {
                    return newPinModel.write(pinConfig.initialState);
                })
                .then(function () {
                    _pinsModelCollection.push(newPinModel);
                })
                .done();

            promises.push(pinsPromise);
        });

        return when.all(promises);
    }

    function writeToPin(pinNumber, value) {
    	if (!_.isNumber(value)){
    		value = value ? 1 : 0;
    	}
        var pin = _.findWhere(_pinsModelCollection, {id:pinNumber});
        if(pin) {
            logger.log('pin: ' + pin.id);
            return pin.write(value);
        }

        return when.reject(new Error('the requested pin: ' + pinNumber + 'is not supported'));
    }

    function getPinsState() {
        var promises = [];
        var returnedResult = [];
        _pinsModelCollection.forEach(function (pin) {
            var objectToReturn = {
                id: pin.id,
                state: undefined
            };

            returnedResult.push(objectToReturn);

            var promise = pin.read().then(function (value) {
                objectToReturn.state = value;
            });

            promises.push(promise);
        });

        return when.all(promises).then(function () {
          return when(returnedResult);
        });
    }
})();

