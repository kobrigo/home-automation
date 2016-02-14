(function () {
    'use strict';

    // @ngInject
    angular.module('mainAppModule').service('ShaderService', function ($resource) {
        var self = this;
        this._ShaderSchedule = $resource('/shader/schedules/:scheduleId', null, {
            'update': { method:'PUT' },
            'query': {method: 'GET', params: {scheduleId: '@id'}, isArray:true }
        });

        this.isLoaddingScheules = true;
        this.isSavingData = false;

        this.schedules = this._ShaderSchedule.query(function shaderScheduleQquery() {
            self.isLoaddingScheules = false;
        });

        this.updateSchedule = function setSchedule(schedule) {
            this.isSavingData = true;
            schedule.update(function (schedule, putResponseHeaders) {
                self.isSavingData = false;
            });
        };
    });
}());
