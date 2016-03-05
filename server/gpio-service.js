/* global require,console,module */
'use strict';
var _ = require('underscore');
var config = require('./config');
var logger = require('./logger').createPrefixedLogger('GPIO-Service:');
var Pin = require('./pin');
var when = require('when');

var gpio;
if (config.developmentMode) {
    gpio = require('./pi-gpio-mock');
} else {
    gpio = require('pi-gpio');
}

var _pinsModelCollection = [];

closeAllPins().then(function () {
    createPins(config);
});

module.exports.writeToPin = writeToPin;
module.exports.getPinsState = getPinsState;
module.exports.closeAllPins = closeAllPins;
module.exports.writeToAllPins = writeToAllPins;

function writeToAllPins(value) {
    var promises = [];

    logger.log('Writing: ' + value + ' to all pins');
    _pinsModelCollection.forEach(function (pin) {
        promises.push(pin.write(0));
    });

    return when.all(promises);
}

function closeAllPins() {
    var promises = [];
    logger.log('Closing all pins:');

    config.gpioPins.forEach(function (pinConfig) {
        var defer = when.defer();
        gpio.close(pinConfig.id, function (error) {
            logger.log('closed pin:' + pinConfig.id);
            defer.resolve(error);
        });

        promises.push(defer.promise);
    });

    //leave the pins in their shutdown state when closing


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
    if (!_.isNumber(value)) {
        value = value ? 1 : 0;
    }
    var pin = _.findWhere(_pinsModelCollection, {id: pinNumber});
    if (pin) {
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

