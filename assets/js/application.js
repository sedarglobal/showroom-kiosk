angular.module('ngIntlTelInput', []);
var myApp = angular.module("acs", ['acs.controllers', 'acs.filters','acs.services', 'acs.directives', 'ngRoute','ngBootbox','pascalprecht.translate','ngMaterial', 'ui.bootstrap', 'ngAnimate', 'ngMessages', 'ngIntlTelInput'])
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
            }).when('/brand/:id?', {
                controller: 'brand',
                templateUrl: temp_path + 'showroom/showroomProduct.html?v='+version,
                resolve: {
                translateReady: ['$translate', function ($translate) {
                    return $translate.onReady();
                    }]
                }
            }).when("/measureInstall/:id", {
                controller: 'measureInstall', 
                templateUrl: temp_path + 'showroom/measureInstall.html?v='+version,
                resolve: {
                    translateReady: ['$translate', function ($translate) {
                        return $translate.onReady();
                    }]
                }
            }).when('/swatches/:offer_code?', {
                controller: 'swatches',
                templateUrl: temp_path + 'swatch.html?v='+version,
                resolve: {
                    translateReady: ['$translate', function ($translate) {
                        return $translate.onReady();
                    }]
                }
            })
            .when('/customizing/:category?/:product_id/:matrial_id?/:product_desc?', {
				controller: 'customizing',
				templateUrl: temp_path + 'showroom/customizing.html?v='+version,
				resolve: {
				translateReady: ['$translate', function ($translate) {
					return $translate.onReady();
					}]
				}
			}).when('/material', {
                controller: 'materialFamily',
                templateUrl: temp_path + 'sample/material.html?v='+version,
                resolve: {
                translateReady: ['$translate', function ($translate) {
                    return $translate.onReady();
                    }]
                }
            }).when('/404', {
                templateUrl: temp_path + 'showroom/page_not_found.html?v='+version,
                resolve: {
                translateReady: ['$translate', function ($translate) {
                    return $translate.onReady();
                    }]
                }
            }).when('/login', {
                controller: 'login',
                templateUrl: temp_path + 'login.html?v='+version,
                resolve: {
                translateReady: ['$translate', function ($translate) {
                    return $translate.onReady();
                    }]
                }
            }).when('/wishList', {
                controller: 'wishList',
                templateUrl: temp_path + 'showroom/wish_list.html?v='+version,
                resolve: {
                translateReady: ['$translate', function ($translate) {
                    return $translate.onReady();
                    }]
                }
            }).when('/logout', {
                templateUrl: temp_path + 'showroom/logout.html?v='+version,
                resolve: {
                translateReady: ['$translate', function ($translate) {
                    return $translate.onReady();
                    }]
                }
            }).otherwise({
                redirectTo: window.location.pathname == "/" ? '/' : '/404'
            });
    }]);