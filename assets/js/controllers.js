var controllers = angular.module('acs.controllers', []);

controllers.controller('root', ['$scope','$translate', function ($scope,$translate) {
    
    $scope.temp_path = temp_path;
    $scope.version = version;
    $scope.image_path = 'images/';

     var langKey = 'en-US';
    $translate.preferredLanguage(langKey);
    $translate.use(langKey);

    bootbox.setDefaults({ 'locale': langKey });
	
   
}]);

controllers.controller('showroomHome', ['$scope', '$http','$location','$rootScope' ,'$ngBootbox','$translate', function ($scope, $http,$location,$rootScope ,$ngBootbox,$translate) {
    
    $http.get('https://www.sedarglobal.com/service/ecommerce/getHomeList',{
        cache : true
    }).then(function (response) {
        console.log(response)
    });
    $scope.loginMenu = function () {
            
        var step_options = {
            templateUrl: $scope.temp_path + 'showroom/login.html?v='+version,
            scope: $scope,
            size: 'small',
            // backdrop: false,
            title:'Login',
            className: 'ShowroomLogin',
            onEscape: function () {
            }
        };
        $ngBootbox.customDialog(step_options);        
        $('.signupshowroom').modal('hide');
   
};
    $scope.SignUpModal = function () {
        var step_options = {
            templateUrl: $scope.temp_path + 'showroom/signup.html?v='+version,
            scope: $scope,
            size: 'small',
            // backdrop: false,
            // title:' $translate.instant('sign_up')',
            title:null,
            className: 'signupshowroom',
            onEscape: function () {
            }
        };
        
        $ngBootbox.customDialog(step_options);
        //console.log($location.url().split('/')[0]);
        $('.ShowroomLogin').modal('hide');
   
};

    // $http({method : 'GET',url : 'https://api.parse.com/1/classes/Users', headers: { 'X-Parse-Application-Id':'XXXXXXXXXXXXX', 'X-Parse-REST-API-Key':'YYYYYYYYYYYYY'}})
    // .success(function(data, status) {
    //     $scope.items = data;
    //     })
    // .error(function(data, status) {
    //     alert("Error");
    // });


    // $http.get('https://www.sedarglobal.com/service/ecommerce/getHomeList',{
    //     cache : true
    // }).then(function (response) {
    //     if (response.data.status) {
    //         $rootScope.shopping = response.data.shopping;
    //         $scope.$root.country_list = response.data.COUNTRY;
    //         $scope.$root.page_head = response.data.PAGE_HEAD;
    //         $scope.$root.category = response.data.category;
    //         $scope.$root.sedar_catalog = dataGroup(response.data.PAGE_HEAD[4].PAGE_LINE, 4);
    //         store.set('categoryRecord', response.data.category);
    //         //console.log(response.data.SITE_REGION.GEO_COUNTRY);
    //         $scope.geo_location =  response.data.SITE_REGION.GEO_COUNTRY;
    //         if($location.$$search["country"]){
    //             $scope.$root.office_country = $location.$$search["country"];
    //         }else{
    //             $scope.$root.office_country = $scope.geo_location ? $scope.geo_location : 'AE';
    //         }
            
    //         console.log($scope.$root.office_country);
    //         $scope.$root.site_region = response.data.SITE_REGION;
    //         $scope.$root.exc_rate = response.data.exc_rate;

    //         setTimeout(function () {
    //             $('.selectpicker').selectpicker('refresh');
    //             //$scope.beInspired();
    //         }, 500);
    //     }
    // });
 
  
    
}]);

controllers.controller('showroomProduct', ['$scope', function ($scope) {
    
   

}]);