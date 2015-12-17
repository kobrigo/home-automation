var argv = require('optimist').argv;

module.exports = (function () {
    'use strict';

    return  {
        portToListenTo : argv.port || 3000,
        developmentMode: argv.development || false,
        gpioPins: [
            {
                id: 7,
                workMode: 'output',
                initialState: 1
            },
            {
                id: 11,
                workMode: 'output',
                initialState: 1
            },
            {
                id: 15,
                workMode: 'output',
                initialState: 0
            }
        ]
    };
})();

