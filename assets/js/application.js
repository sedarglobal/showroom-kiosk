var myApp = angular.module("acs", ['acs.controllers', 'ngRoute','ngBootbox','pascalprecht.translate'])
    .config(['$routeProvider', '$locationProvider', '$translateProvider', function ($routeProvider, $locationProvider,$translateProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
        $translateProvider.useStaticFilesLoader({
		    'prefix': './language/',
		    'suffix': '.json'
		});
		$translateProvider.preferredLanguage('en-US');
        
        $routeProvider
            .when("/", {
                controller: 'showroomHome',
                templateUrl: temp_path + 'showroom/showroomHome.html?v='+version,
                resolve: {
                    translateReady: ['$translate', function ($translate) {
                        return $translate.onReady();
                    }]
                }
            })
            .when("/showroomProduct", {
                controller: 'showroomProduct',
                templateUrl: temp_path + 'showroom/showroomProduct.html?v='+version,
                resolve: {
                    translateReady: ['$translate', function ($translate) {
                        return $translate.onReady();
                    }]
                }
            })
            .when('/swatches/:offer_code?', {
                controller: 'swatches',
                templateUrl: temp_path + 'swatch.html?v='+version,
                resolve: {
                    translateReady: ['$translate', function ($translate) {
                        return $translate.onReady();
                    }]
                }
            })
            .otherwise({
                redirectTo: '/'
            });
    }]);