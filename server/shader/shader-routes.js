var shaderService = require('./shader-service');
var logger = require('./../logger');
var persistencyService = require('./../persistancy-service');

module.exports.init = function (app) {
    // returns a list of all the schedules for the shader
    app.get('/shader/schedules', function (req, res) {
        res.send(shaderService.getSchedules());
    });

    app.put('/shader/schedules/:id', function (req, res) {
        logger.log('setting schedule:' + req.params.id + ' to: ' + JSON.stringify(req.body, null, '   '));
        var schedules = shaderService.setSchedule(req.body);
        if(schedules){
            res.send(schedules);
            return;
        }

        res.status(500).send(new Error('could not update the schedule'));
    });
};
