// This file maps all the routes that this server serves.
var gpioService = require('./gpio-service');
var logger = require('./logger');

module.export = (function () {
    return {
        initRoute: function (app) {
            app.get('/pins', function (req, res) {
                loggin.info('handling: /pins');
                gpioService.getPinsState()
                    .then(function (pinsStatus) {
                        res.send(pinsStatus)
                    })
                    .catch(function () {
                        logger.error(error);
                    })
            });

            app.put('pins/:pinNumber', function (req, res) {
                if (req.body.pinNumber && req.body.value) {
                    gpioService.writeToPin(req.body)
                        .then(function () {
                            return gpioService.getPinsState();
                        })
                        .then(function (pinsStatus) {
                            req.send(pinsStatus);
                        })
                        .catch(function (error) {
                            logger.error(error);
                        })
                }
            })
        }
    }
})();