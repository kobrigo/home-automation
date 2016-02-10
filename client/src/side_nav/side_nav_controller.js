(function () {
    'use strict';

    // @ngInject
    angular.module('mainAppModule').controller('SideNavController',
        function ($log, $scope, appSocketService, $mdSidenav, $timeout, $state) {
            this.$log = $log;
            this.$timeout = $timeout;
            /**
             * Supplies a function that will continue to operate until the
             * time is up.
             */
            this.debounce = function debounce(func, wait, context) {
                var timer;
                return function debounced() {
                    var context = this,
                        args = Array.prototype.slice.call(arguments);
                    context.$timeout.cancel(timer);
                    timer = context.$timeout(function () {
                        timer = undefined;
                        func.apply(context, args);
                    }, wait || 10);
                };
            };

            this.buildToggler = function buildToggler(navID) {
                var self = this;
                return function () {
                    self.$log.log('toggled');
                    $mdSidenav(navID)
                        .toggle()
                        .then(function () {
                            self.$log.debug('toggle ' + navID + ' is done');
                        });
                };
            };

            this.toggleLeft = this.buildToggler('left');
            this.isLeftOpen = function () {
                return $mdSidenav('left').isOpen();
            };

            this.openShaderSchedule = function openShaderSchedule() {
                $state.go('root.shaderSchedule');
                $mdSidenav('left').close();
            };

            this.openDebugging = function openDebugging() {
                $state.go('root.debug');
                $mdSidenav('left').close();
            };

            this.closeSideNav = function closeSideNav() {
                $mdSidenav('left').close();
            };

        });
}());
