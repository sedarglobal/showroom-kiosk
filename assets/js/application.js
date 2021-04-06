var myApp = angular.module("acs", ['acs.controllers', 'ngRoute','ngBootbox'])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
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