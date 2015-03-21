angular.module('mainAppModule').controller('appController', ['$scope', 'appSocketService',
    function ($scope, appSocketService) {
    	this.model = {
            gpioPins: [
                //{
                //    id: 7,
                //    state: true
                //},
            ]
        };
    	
        function handlePinsStatusUpdate(e){
            this.model.gpioPins = e.gpioPins;
        }

        //get the socket service and check the state of gpio pins from the server
        appSocketService.emit('pins:getStatus');
        appSocketService.on('pins:status', handlePinsStatusUpdate.bind(this));

        $scope.$on('$destroy', function () {
            appSocketService.off('pins:status', handlePinsStatusUpdate);
        });
    }
]);