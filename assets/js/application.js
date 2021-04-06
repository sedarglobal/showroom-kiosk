var myApp = angular.module("acs", ['acs.controllers', 'ngRoute','ngBootbox','pascalprecht.translate'])
    .config(function ($routeProvider, $locationProvider,$translateProvider) {
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
                templateUrl: temp_path + 'showroom/showroomHome.html?v='+version
            })
            .when("/showroomProduct", {
                templateUrl: temp_path + 'showroom/showroomProduct.html?v='+version
            })
            .when("/technologies", {
                template: "Our Technologies"
            })
            .otherwise({
                redirectTo: '/'
            });
    });