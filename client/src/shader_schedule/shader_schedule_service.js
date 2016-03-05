(function () {
    'use strict';
    angular.module('mainAppModule').factory('ShaderSchedule', function ($resource) {
        return $resource('/shader/schedules/:scheduleId', null, {
            'update': {method: 'PUT', params: {scheduleId: '@id'}, isArray:false},
            'query': {method: 'GET', params: {scheduleId: '@id'}, isArray:true }
        });
    });

    // @ngInject
    angular.module('mainAppModule').service('ShaderService', function (ShaderSchedule, $resource) {
        var self = this;

        this.isLoaddingScheules = true;
        this.isSavingData = false;

        this.schedules = ShaderSchedule.query(function shaderScheduleQquery() {
            self.isLoaddingScheules = false;
        });

        this.updateSchedule = function setSchedule(schedule) {
            this.isSavingData = true;

            var scheduleToSave = new ShaderSchedule();
            angular.extend(scheduleToSave, schedule);

            //scheduleToSave.update(function (schedule, putResponseHeaders) {
            //    self.isSavingData = false;
            //});

            scheduleToSave.$update();
        };
    });
}());
