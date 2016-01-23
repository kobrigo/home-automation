(function () {
    "use strict";

    // @ngInject
    angular.module('mainAppModule').controller('appController',
        function ($scope, appSocketService) {
            var vm = this;
            this.model = {
                gpioPins: [
                    //{
                    //    id: 7,
                    //    state: true
                    //},
                ]
            };

            function handlePinsStatusUpdate(e) {
                this.model.gpioPins = e.gpioPins;
            }

            //get the socket service and check the state of gpio pins from the server
            appSocketService.emit('pins:getStatus');
            appSocketService.on('pins:status', handlePinsStatusUpdate.bind(this));

            $scope.handleOnClick = function (pin) {
                appSocketService.emit('pin:write', {id: pin.id, value: pin.state});
            };

//        $scope.$watch(function(){ return this.model }, function handleModelChanged(){
//        	window.console.log('the model changed');
//        	vm.model.gpioPings.forEach(function(pin){
//        		appSocketService('pin:write', {pinNumber: pin.id, value:pin.state});
//        	});
//        }, true);

            $scope.$on('$destroy', function () {
                appSocketService.off('pins:status', handlePinsStatusUpdate);
            });
        }
    );
}());
