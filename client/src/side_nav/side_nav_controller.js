(function () {
    'use strict';

    // @ngInject
    angular.module('mainAppModule').controller('SideNavController',
        function ($log, $scope, appSocketService, $mdSidenav, $timeout) {
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

            /**
             * Build handler to open/close a SideNav; when animation finishes
             * report completion in console
             */
            this.buildDelayedToggler = function buildDelayedToggler(navID) {
                var self = this;
                return this.debounce(function () {
                    self.$log.log('toggled delayed');
                    $mdSidenav(navID)
                        .toggle()
                        .then(function () {
                            self.$log.debug("toggle " + navID + " is done");
                        });
                }, 200);
            };

            this.buildToggler = function buildToggler(navID) {
                var self = this;
                return function () {
                    self.$log.log('toggled');
                    $mdSidenav(navID)
                        .toggle()
                        .then(function () {
                            self.$log.debug("toggle " + navID + " is done");
                        });
                };
            };

            this.toggleLeft = this.buildDelayedToggler('left');
            this.toggleRight = this.buildToggler('right');
            this.isOpenRight = function () {
                return $mdSidenav('right').isOpen();
            };

        })
        // @ngInject
        .controller('LeftCtrl', function ($scope, $timeout, $mdSidenav, $log) {
            $scope.close = function () {
                $mdSidenav('left').close()
                    .then(function () {
                        $log.debug("close LEFT is done");
                    });
            };
        })
        // @ngInject
        .controller('RightCtrl', function ($scope, $timeout, $mdSidenav, $log) {
            $scope.close = function () {
                $mdSidenav('right').close()
                    .then(function () {
                        $log.debug("close RIGHT is done");
                    });
            };
        });
}());
