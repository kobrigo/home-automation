/* global module */
module.exports = (function () {
    'use strict';

    return  {
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

