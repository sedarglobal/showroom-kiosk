var controllers = angular.module('acs.controllers', []);

controllers.controller('root', ['$scope', function ($scope) {
    
    $scope.temp_path = temp_path;
    $scope.version = version;
    $scope.image_path = 'images/';

   
}]);

controllers.controller('showroomHome', ['$scope', '$http','$location','$rootScope', function ($scope, $http,$location,$rootScope) {
    
    $http.get('https://www.sedarglobal.com/service/ecommerce/getHomeList',{
        cache : true
    }).then(function (response) {
        console.log(response)
    });

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