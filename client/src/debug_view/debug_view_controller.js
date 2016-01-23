(function () {
    'use strict';

    // @ngInject
    angular.module('mainAppModule').controller('DebugViewController', function ($log) {
       $log.log('in debug DebugViewController');
    });
}());
