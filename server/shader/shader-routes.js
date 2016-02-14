var shaderService = require('./shader-service');
var logger = require('./../logger');
var persistencyService = require('./../persistancy-service');

module.exports.init = function (app) {
    // returns a list of all the schedules for the shader
    app.get('/shader/schedules', function (req, res) {
        var schedules = persistencyService.read('shader');
        res.send(schedules);
    });

    app.put('/shader/schedules/:id', function (req, res) {
        logger.log('setting schedule:', req.data);
    });
};
