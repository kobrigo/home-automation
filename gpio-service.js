/* global require,console */
module.exports = (function () {
    'use strict';

    var config = require('config.js');
    var logger = require('logger');
    var _ = require('underscore');
    var Pin = require('pin');

    var pinsModelCollection = [];
    createPins();

    return {
        writeToPin: writeToPin,
        getPinsState: getPinsState,
        closeAllPins: closeAllPins
    };

    function closeAllPins() {
        gpio.destroy(function () {
            logger.log('All pins unexported');
        });
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
                    pinsModelCollection.push(newPinModel);
                })
                .done();

            promises.push(pinsPromise);
        });

        return when.all(promises);
    }

    function writeToPin(pinNumber, value) {
        var pin = _.find(pinsModelCollection, {id:pinNumber});
        return pin.write(value);
    }

    function getPinsState() {
        var promises = [];
        var returnedResult = [];
        pinsModelCollection.forEach(function (pin) {
            var objectToReturn = {
                id: pin.id,
                state: undefined
            };

            returnedResult.push(objectToReturn);

            var promise = pin.read().then(function (value) {
                objectToReturn.state = value === 1;
            });

            promises.push(promise);
        });

        return when.all(promises).then(function () {
          return when(returnedResult);
        });
    }
})();

