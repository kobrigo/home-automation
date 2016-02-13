(function () {
    'use strict';

    // @ngInject
    angular.module('mainAppModule').controller('ShaderScheduleController', function ($log, ShaderService) {
        $log.log('in debug ShaderScheduleController');

        this.schedules = ShaderService.schedules;
    });
}());

