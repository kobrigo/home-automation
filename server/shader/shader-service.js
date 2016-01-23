var logger = require('./../logger');
var moment = require('moment');
var schedulerService = require('./../scheduler-service');
var gpioService = require('./../gpio-service');
var _ = require('underscore');

var _operating = false;
var _intervalId = null;
var _shadeIsMoving = false;
var _handlingEvent = false;
var _eventElapsedTime = 0;
var _eventStartTime = 0;
var _shaderOpenPin = 7;
var _shaderClosePin = 11;
var _shaderSpeed = 20 / 1000; // the speed is expresses in cm/ms
var _minWorkTimeInterval = 1 * 1000;
var _currentShaderSequence = [];
var _timeItTakesToClose = 0;

function openShadeTick() {
    var timeToMoveShade = true;
    var timeToPause = true;
    _eventElapsedTime = new Date() - _eventStartTime;

    logger.log('_eventElapsedTime: ' + _eventElapsedTime);

    // check at what interval are we now
    var currentInterval = _.find(_currentShaderSequence, function (interval) {
        return ((_eventElapsedTime <= interval.endTime) && (_eventElapsedTime > interval.startTime));
    });

    if (currentInterval) {
        if (currentInterval.type === 'stop') {
            timeToMoveShade = false;
        } else if (currentInterval.type === 'work') {
            timeToMoveShade = true;
        } else {
            logger.error('openShadeTick: The type of the current interval is unknown: ' + currentInterval.type);
        }
    } else {
        logger.error('openShadeTick: could not find the currentInterval');
        return;
    }

    if (timeToMoveShade && !_shadeIsMoving) {
        gpioService.writeToPin(_shaderOpenPin, 1);
        _shadeIsMoving = true;
    }

    if (!timeToMoveShade && _shadeIsMoving) {
        gpioService.writeToPin(_shaderOpenPin, 0);
        _shadeIsMoving = false;
    }
}

function closeShadeTick() {
    _eventElapsedTime = moment().subtract(_eventStartTime);

    if (!_shadeIsMoving) {
        gpioService.writeToPin(_shaderClosePin, 1);
        _shadeIsMoving = true;
    }

}

module.exports.init = function () {
    //todo: this can be improved by getting the pins real state and setting the variables to the right value. (important only of we restart the pi during it's action)
    _shadeIsMoving = false;

    //register to the scheduler events
    schedulerService.vent.on('OpenShade:start', function (openStartEvent) {
        logger.log('shader-service: got OpenShade:start event: \n' + JSON.stringify(openStartEvent, null, '\t'));
        if (_handlingEvent) {
            logger.log('Already handling an event. skipping this one.');
            return;
        }

        _eventElapsedTime = 0;
        _eventStartTime = new Date();
        module.exports.calculateOpenShaderSequence();
        _intervalId = setInterval(openShadeTick, 200);
        _handlingEvent = true;
    });

    schedulerService.vent.on('OpenShade:end', function (openEndEvent) {
        logger.log('shader-service: got OpenShade:end event: \n' + JSON.stringify(openEndEvent, null, '\t'));
        logger.log('_eventElapsedTime: ' + _eventElapsedTime);

        if (_handlingEvent) {
            clearTimeout(_intervalId);
            gpioService.writeToPin(_shaderOpenPin, 0);

            _handlingEvent = false;
            _shadeIsMoving = false;
        }
    });

    schedulerService.vent.on('CloseShade:start', function (closeStartEvent) {
        logger.log('shader-service: got CloseShade:start event: \n' + JSON.stringify(closeStartEvent, null, '\t'));
        if (_handlingEvent) {
            logger.log('Already handling an event. skipping this one.');
            return;
        }

        _eventElapsedTime = 0;
        _eventStartTime = new Date();
        module.exports.calculateCloseShaderSequence();
        _intervalId = setInterval(closeShadeTick, 200);
        _handlingEvent = true;
    });

    schedulerService.vent.on('CloseShade:end', function (closeEndEvent) {
        logger.log('shader-service: got CloseShade:end event: \n' + JSON.stringify(closeEndEvent, null, '\t'));
        logger.log('_eventElapsedTime: ' + _eventElapsedTime);

        if (_handlingEvent) {
            clearTimeout(_intervalId);
            gpioService.writeToPin(_shaderClosePin, 0);
            _handlingEvent = false;
            _shadeIsMoving = false;
        }
    });
};

module.exports.stop = function () {
    logger.log('Shader service stopping');
    if (_handlingEvent) {
        clearTimeout(_intervalId);
    }
};

module.exports.calculateCloseShaderSequence = function () {
    var lengthToClose = 100; //in cm
    _timeItTakesToClose = 100 / _shaderSpeed;
};

module.exports.calculateOpenShaderSequence = function () {
    //create a shader open sequence
    var lengthToOpen = 100; //in cm
    var duration = 40 * 1000; //15 minuets for the whole event.
    var timeItWouldTakeWithoutStopIntervals = 100 / _shaderSpeed;
    var numberOfWorkIntervals = timeItWouldTakeWithoutStopIntervals / _minWorkTimeInterval;
    var timeSpentStopping = duration - timeItWouldTakeWithoutStopIntervals;
    var timeStoppingPerInterval = timeSpentStopping / numberOfWorkIntervals;

    var tempStartTime = 0, tempEndTime = 0, tempLastEndTime = 0;
    for (var i = 0; i < numberOfWorkIntervals; i++) {
        tempStartTime = tempLastEndTime + 1;
        tempEndTime = timeStoppingPerInterval + tempLastEndTime;

        _currentShaderSequence.push({
            type: 'stop',
            startTime: tempStartTime,
            endTime: tempEndTime
        });

        _currentShaderSequence.push({
            type: 'work',
            startTime: tempEndTime + 1,
            endTime: tempEndTime + _minWorkTimeInterval
        });

        tempLastEndTime = tempEndTime + _minWorkTimeInterval;
    }

    logger.log('initiatingSequence:' + JSON.stringify(_currentShaderSequence, null, '\t'));
};
