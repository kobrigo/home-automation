var logger = require('./logger').createPrefixedLogger('SchedulerService:');
var moment = require('moment');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');

var _isRunning = false;
var _intervalId = null;
var _schedules = [];
var _executingEvents = [];
var _scheduleIds = 0;
var _vent = new EventEmitter();

module.exports.vent = _vent;

module.exports.init = function () {

    module.exports.start();
};

function checkSchedule() {
    _schedules.forEach(function (schedule) {
        var now = moment();

        if (!schedule.beingHandled && schedule.onDays.indexOf(now.day()) !== -1) {
            //normalize the event to this time since it only represented in hours in the day
            var eventStartTime = moment(now);
            eventStartTime.set({
                'hour': schedule.startAtTime.hours(),
                'minute': schedule.startAtTime.minutes(),
                'second': schedule.startAtTime.seconds()
            });

            var eventEndTime = moment(eventStartTime);
            eventEndTime.add(schedule.duration);

            if (now.isAfter(eventStartTime) && now.isBefore(eventEndTime)) {
                executeEvent(schedule);
            }
        }
    });
}

function emitStartEvent(scheduleEvent) {
    _vent.emit(scheduleEvent.eventName + ':start', scheduleEvent);
}

function emitEndEvent(scheduleEvent) {
    _vent.emit(scheduleEvent.eventName + ':end', scheduleEvent);
}

function stopEvent(schedule) {
    if (schedule.beingHandled) {
        logger.log('Ending execution of event:' + schedule.eventName);
        emitEndEvent(schedule);
        schedule.beingHandled = false;
        var indexToRemove = _.findIndex(_executingEvents, {originatingSchedule: schedule});
        if(indexToRemove !== -1){
            _executingEvents.splice(indexToRemove, 1);
            logger.log('Ended execution of event:' + schedule.eventName);
        } else {
            logger.error('could not find the event:' + schedule.eventName + ' in order to remove it from the executing events');
        }
    }
}

function executeEvent(schedule) {
    logger.log('Executing event:' + schedule.eventName);

    schedule.beingHandled = true;

    emitStartEvent(schedule);

    logger.log('Executing event: will stop after (Mls): ' + schedule.duration.asMilliseconds());
    var timeoutId = setTimeout(function () {
        stopEvent(schedule);
    }, schedule.duration.asMilliseconds());

    _executingEvents.push({
        eventName: schedule.eventName,
        timeoutId: timeoutId,
        originatingSchedule: schedule
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
            var momentDay = moment(dayAsString, 'e');
            return momentDay.day();
        }),
        startAtTime: moment(schedulerEventData.startAtTime, 'hh:mm:ss'),
        duration: moment.duration(schedulerEventData.duration),
        fireTickEveryMls: 200,
        eventName: schedulerEventData.eventName,
        beingHandled: false
    };

    //push it to the scheduled events array
    _schedules.push(newScheduledEvent);

    return newScheduledEvent.id;
};


/**
 * remove the scheduled event
 * @param schedulerEventId
 */
module.exports.removeSchedule = function (schedulerEventId) {
    var scheduleToRemove;
    //find the scheduledEvent
    //remove it from the list of scheduled events
    var indexToRemove = _.findIndex(_schedules, {id: schedulerEventId});
    if (indexToRemove !== -1) {
        //if it is running stop it
        scheduleToRemove = _schedules[indexToRemove];
        stopEvent(scheduleToRemove);
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
