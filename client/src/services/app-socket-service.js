angular.module('mainAppModule').service('appSocketService', ['socketFactory', function (socketFactory) {
    return socketFactory();
}]);
