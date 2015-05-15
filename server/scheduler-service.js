var logger = require('./logger');
var moment = require('moment');
var EventEmitter = require('events').EventEmitter;

var _isRunning = false;
var _intervalId = null;
var _schedule = [];
var _executingEvents = [];
var _vent = new EventEmitter();

module.exports.init = function () {
    // read some configuration and prepare to be running.
    // TODO: take this from a file. for now I'll just do it hard coded
    //_schedule.push({
    //    onDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    //    startAtTime: moment().parse('07:00:00', 'HH:MM:SS'),
    //    duration: moment.duration('00:15:00'),
    //    fireTickEveryMls: 200,
    //    eventName: 'OpenShade',
    //    beingHandled: false
    //});
    //
    //_schedule.push({
    //    onDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    //    startAtTime: moment().parse('21:00:00', 'HH:MM:SS'),
    //    duration: moment.duration('00:15:00'),
    //    fireTickEveryMls: 200,
    //    eventName: 'CloseShade',
    //    beingHandled: false
    //});
    //
    //_schedule.push({
    //    onDays: ['Friday', 'Saturday'],
    //    startAtTime: moment().parse('09:00:00', 'HH:MM:SS'),
    //    duration: moment.duration('00:00:30'),
    //    fireTickEvery: 200,
    //    eventName: 'OpenShade',
    //    beingHandled: false
    //});

    _schedule.push({
        onDays: [5, 6],
        startAtTime: {
            hour: 1,
            minute: 11,
            second: 0
        },
        duration: moment.duration('00:00:40'),
        fireTickEvery: 200,
        eventName: 'OpenShade',
        beingHandled: false
    });
};

function checkSchedule() {
    _schedule.forEach(function (scheduleEvent) {
        var now = moment();

        if (!scheduleEvent.beingHandled && scheduleEvent.onDays.indexOf(now.day()) !== -1) {
            //normalize the event to this time since it only represented in hours in the day
            var eventStartTime = moment(now);
            eventStartTime.set({
                'hour': scheduleEvent.startAtTime.hour,
                'minute': scheduleEvent.startAtTime.minute,
                'second': scheduleEvent.startAtTime.second
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

    _vent.emit(scheduleEvent.eventName + ':start');

    var timeoutId = setTimeout(function () {
        _vent.emit(scheduleEvent.eventName + ':end');
        scheduleEvent.beingHandled = false;
        logger.log('Ending execution of event:' + scheduleEvent.eventName);
    }, scheduleEvent.duration.asMilliseconds());

    _executingEvents.push({
        eventName: scheduleEvent.eventName,
        timeoutId: timeoutId
    });
}

module.exports.start = function () {
    var sampleEveryMls = 200;

    if (!_isRunning) {
        logger.log('Scheduler Started sampling every: ' + sampleEveryMls + '(mls)');
        _intervalId = setInterval(function runningLoop() {
            // logger.log('checking schedule');
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
