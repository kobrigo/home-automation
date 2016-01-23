(function () {
    'use strict';

    // @ngInject
    angular.module('mainAppModule')
        .config(function ($stateProvider, $urlRouterProvider) {

            $urlRouterProvider.otherwise('/');

            $stateProvider
                .state('root', {
                    url: '/',

                    views: {
                        'main-view': {
                            templateUrl: 'src/debug_view/debug_view_template.html',
                            controller: 'DebugViewController',
                            controllerAs: 'coreVm'

                        }
                    }
                });
        })

        // @ngInject
        .run(function ($rootScope, $state, $stateParams) {

            // It's very handy to add references to $state and $stateParams to the $rootScope
            // so that you can access them from any scope within your applications.For example,
            // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
            // to active whenever 'contacts.list' or one of its decendents is active.
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
        });
}());
