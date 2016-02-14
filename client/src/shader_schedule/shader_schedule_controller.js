(function () {
    'use strict';

    // @ngInject
    angular.module('mainAppModule').controller('ShaderScheduleController', function ($log, ShaderService) {
        $log.log('in debug ShaderScheduleController');

        this.schedules = ShaderService.schedules;

        this.saveSchedule = function saveSchedule(schedule){
            ShaderService.updateSchedule(schedule);
        };
    });
}());

