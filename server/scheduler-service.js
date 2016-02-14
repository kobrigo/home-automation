var logger = require('./logger');
var moment = require('moment');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');

var _isRunning = false;
var _intervalId = null;
var _schedule = [];
var _executingEvents = [];
var _scheduleIds = 0;
var _vent = new EventEmitter();

module.exports.vent = _vent;

module.exports.init = function () {

    module.exports.start();
};

function checkSchedule() {
    _schedule.forEach(function (scheduleEvent) {
        var now = moment();

        if (!scheduleEvent.beingHandled && scheduleEvent.onDays.indexOf(now.day()) !== -1) {
            //normalize the event to this time since it only represented in hours in the day
            var eventStartTime = moment(now);
            eventStartTime.set({
                'hour': scheduleEvent.startAtTime.hours(),
                'minute': scheduleEvent.startAtTime.minutes(),
                'second': scheduleEvent.startAtTime.seconds()
            });

            var eventEndTime = moment(eventStartTime);
            eventEndTime.add(scheduleEvent.duration);

            if (now.isAfter(eventStartTime) && now.isBefore(eventEndTime)) {
                executeEvent(scheduleEvent);
            }
        }
    });
}

function executeEvent(scheduleEvent) {
    logger.log('Executing event:' + scheduleEvent.eventName);

    scheduleEvent.beingHandled = true;

    _vent.emit(scheduleEvent.eventName + ':start', scheduleEvent);

    var timeoutId = setTimeout(function () {
        _vent.emit(scheduleEvent.eventName + ':end', scheduleEvent);
        scheduleEvent.beingHandled = false;
        var indexToRemove = _executingEvents.indexOf(scheduleEvent);
        _executingEvents.splice(indexToRemove, 1);
        logger.log('Ending execution of event:' + scheduleEvent.eventName);
    }, scheduleEvent.duration.asMilliseconds());

    _executingEvents.push({
        eventName: scheduleEvent.eventName,
        timeoutId: timeoutId
    });
}

function assignNewScheduleId() {
    _scheduleIds++;
    return _scheduleIds;
}

/**
 * adds a scheduled event to the collection of events to monitor and execute
 * @param schedulerEventData
 */
module.exports.addSchedule = function (schedulerEventData) {
    //create a scheduled event object with a new Id
    var newScheduledEvent = {
        id: assignNewScheduleId(),
        onDays: schedulerEventData.onDays.map(function (dayAsString) {
            var momentDay = moment(dayAsString,'e');
            return momentDay.day();
        }),
        startAtTime: moment(schedulerEventData.startAtTime, 'hh:mm:ss'),
        duration: moment.duration(schedulerEventData.duration),
        fireTickEveryMls: 200,
        eventName: schedulerEventData.eventName,
        beingHandled: false
    };

    //push it to the scheduled events array
    _schedule.push(newScheduledEvent);

    return newScheduledEvent.id;
};

/**
 * remove the scheduled event
 * @param schedulerEventId
 */
module.exports.removeSchedule = function (schedulerEventId) {
    //find the scheduledEvent
    //if it is running stop it
    //remove it from the list of scheduled events
    var indexToRemove = _.findIndex(_schedule, {id: schedulerEventId});
    if(indexToRemove !== -1){
        _schedule.splice(indexToRemove, 1);
    } else {
        logger.warn('Trying to remove a scheduler that does not exist in the collection of schedules. scheduleId: ' + schedulerEventId);
    }

    return (indexToRemove !== -1);
};

module.exports.start = function () {
    var sampleEveryMls = 200;

    if (!_isRunning) {
        logger.log('Scheduler Started sampling every: ' + sampleEveryMls + '(mls)');
        _intervalId = setInterval(function runningLoop() {
            // logger.debug('checking schedule');
            checkSchedule();
        }, sampleEveryMls);

        _isRunning = true;
    }
};

module.exports.stop = function () {
    if (_isRunning) {
        logger.log('Stopping the scheduler');

        clearInterval(_intervalId);

        _executingEvents.forEach(function (eventData) {
            clearTimeout(eventData.timeoutId);

            logger.log('Terminating the execution of event:' + eventData.eventName);

            _vent.emit(eventData.eventName + ':terminated');
        });

        _isRunning = false;
    }
};
