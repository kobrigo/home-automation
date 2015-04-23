// This file maps all the routes that this server serves.
var gpioService = require('./gpio-service');
var logger = require('./logger');

module.exports = (function () {
    return {
        init: function (app) {
            app.get('/pins', function (req, res) {
                logger.log('handling: GET /pins');
                gpioService.getPinsState()
                    .then(function (pinsStatus) {
                        logger.log('Sending pins statu: ' + pinsStatus);
                        res.send(pinsStatus);
                    })
                    .catch(function (error) {
                        logger.error(error);
                        res.status(500).send(error);
                    });
            });

            app.put('/pins/:pinNumber', function (req, res) {
                var pinNumber = req.params['pinNumber'] ? parseInt(req.params['pinNumber']) : null;
                logger.log('handling PUT /pins/' + pinNumber);
                if (pinNumber && (req.body.value !== undefined)) {
                    logger.log('writing to pin ' + pinNumber + ' ' + req.body.value);
                    gpioService.writeToPin(pinNumber, req.body.value)
                        .then(function () {
                            logger.log('getting status of all the pins to return');
                            return gpioService.getPinsState();
                        })
                        .then(function (pinsStatus) {
                            logger.log('sending result');
                            res.send(pinsStatus);
                        })
                        .catch(function (error) {
                            logger.error(error);
                            res.status(500).send(error);
                        })
                } else {
                    res.status(500).send('There was not body in the request');
                }
            })
        }
    }
})();