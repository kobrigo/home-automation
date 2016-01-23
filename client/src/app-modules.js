(function () {
    'use strict';

    //this sets the ground for the template cache to piggy-back the templates here
    angular.module('templates', []);

    angular.module('mainAppModule', [
        'ngMaterial',
        'btford.socket-io',
        'ui.router',
        'templates'
    ]);
}());

