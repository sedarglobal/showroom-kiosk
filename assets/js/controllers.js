var controllers = angular.module('acs.controllers', ['ngSilent']);

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
    //         $scope.geo_location =  response.data.SITE_REGION.GEO_COUNTRY;
    //         if($location.$$search["country"]){
    //             $scope.$root.office_country = $location.$$search["country"];
    //         }else{
    //             $scope.$root.office_country = $scope.geo_location ? $scope.geo_location : 'AE';
    //         }
            
    //         $scope.$root.site_region = response.data.SITE_REGION;
    //         $scope.$root.exc_rate = response.data.exc_rate;

    //         setTimeout(function () {
    //             $('.selectpicker').selectpicker('refresh');
    //             //$scope.beInspired();
    //         }, 500);
    //     }
    // });
 
  
    
}]);

controllers.controller('showroomProduct', ['$scope', '$route', '$http', '$interval', '$controller', '$rootScope', '$location', '$ngBootbox', '$ngSilentLocation', function ($scope, $route, $http, $interval, $controller, $rootScope, $location, $ngBootbox, $ngSilentLocation) {

    $scope.ShowroomleftSideMenu = function (type) {       
        if (type) {
            $('#left_side_loader_div').show();
        } else {
            $('#left_side_loader_div').hide();
            
        }
        $scope.ShowroomleftSide = type;
        $('#ShowroomleftSideMenu').animate({
            width: 'toggle'
        });
    };


    $scope.current_slide = 0;
    $scope.product_cat = [];
    $scope.brand_list = [];
    $scope.likeCheck = [];
    $scope.styleType = ['Fabric', 'Liner'];
    $scope.categoryRecord = store.get('categoryRecord');
   // $scope.$root.enquiry_form.ECE_ENQUIRY_TYPE = 'D';

   $('#loader_div').show();
    var el;
    $scope.$root.footer = true;
    var CATEGORY_CODE = $location.search().id ? $location.search().id : 4456;
    var type = $location.search().type ? $location.search().type : '';

   var ECP_CODE=CATEGORY_CODE;

   $scope.ecp_code=CATEGORY_CODE;
    
    var ECI_CODE = $location.search().item ? $location.search().item : 0;
    var CHILD_LINE = $location.search().syschild ? $location.search().syschild : 0;
    var brandId = $route.current.params.brand_id ? $route.current.params.brand_id : 0;
    $scope.parameter_url = '';
    $scope.url = '';
    var item_ajax = true;
    $scope.item_start_page = 0;

    
    $scope.productItem = function () {
        $scope.itemLoadMore = true;
        $('#loader_div').show();
    
            $http({
                method: 'GET',
                url:'http://localecommerce/service/ShowroomApi/' + $scope.url,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function (response) {
                $scope.shopping = response.data.shopping;
                $scope.product_cat = response.data.product_cat ? response.data.product_cat : '';
                $scope.product_item = response.data.item;
                item_ajax = true;
                $scope.itemLoadMore = false;
                setTimeout(function(){
                    $('#productslidershow').owlCarousel({
                        loop: true,
                        margin: 40,
                        responsiveClass: true,
                        dots:false,
                        nav: true,
                        navText : ["<img src='../assets/images/image488.gif' />","<img src='../assets/images/image487.gif' />"],
                        responsive: {
                            0: {
                                items: 1,
                                nav: false
                            },
                            600: {
                                items: 2,
                                nav: false
                            },
                            1000: {
                                items: 3,
                                nav: true,
                                loop: true
                            },
                            1600: {
                                items: 4,
                                nav: true,
                                loop: true
                            }
                        }
                    });
                },500);
            });


        $('#loader_div').hide();


    };


    $scope.productCatalog = function (url, category_code, tree_data) {
       
        $scope.item_start_page = 0;
        $scope.item_perpage = 10;
        $scope.product_item = [];
        $('#loader_div').show();
        window.scrollTo(0, 0);
        if (url == 'productInfo') {

            $scope.product_cat_id = category_code;
            $scope.brandId = '';
            $scope.room = '';
            $scope.style = '';
            $scope.parameter_url = '';
        } else if (url == 'getProductByBrand') {
            var brandId= $scope.brandId = category_code;
            $scope.room = '';
            $scope.style = '';

           
        } else if (url == 'room_inspiration') {
            $scope.brandId = '';
            $scope.room = category_code;
            $scope.style = '';
            $scope.parameter_url = '';
        } else if (url == 'style') {
            url = 'room_inspiration';
            $scope.brandId = '';
            $scope.room = ''
            $scope.style = category_code;
            $scope.parameter_url = '';
        }

        var subCat = tree_data == 'S' ? tree_data : type;
        $scope.url = url + '/' + category_code + '/' + subCat;
        item_ajax = false;
        $scope.productItem();
 
    };

    $scope.productCatalog('productInfo', CATEGORY_CODE, ECP_CODE, ECI_CODE, CHILD_LINE);





    // $scope.loadMoreItem = function () {
    //     if ($scope.item_start_page < $scope.item_count && item_ajax == true) {
    //         item_ajax = false;
    //         $scope.productItem();
    //     }

    // };



    // $scope.productGallery = function (item,Id) {
    //     $('#loader_div').show();
        
    //     document.getElementById(Id).style.display = "block";

    //     $http.post(service_url + 'ecommerce/productGallery',
    //         {
    //             cache: true,
    //             id: item.ECI_CODE
    //         }).then(function (response) {
    //             $scope.product_gallery = response.data[0];
    //             $scope.gallery = response.data;//dataGroup(response.data, 6);

    //             setTimeout(function(){
    //                 $('#slideshow').find('.thumb').on('click', function() {
    //                     loadClickedImage($(this).data('thumb-id'));
    //                 });
    //             },500);
    //             console.log($scope.gallery);
                
    //             $('#loader_div').hide();
    //         });

    // };
   




    // $scope.galleryPopupView = function ($val) {
    //     $scope.product_gallery = $val;
    // };



  
    $scope.clear = function (category_code) {
        $scope.categoryPanel = false;
        $("#prodInfo" + category_code).hide();
        $(".row_4455").show();
    };

    $scope.getProductList = function () {

        $scope.productArray = [];
        $scope.brandArray = [];
        $('ul.product_filter_list input.uk-checkbox').each(function () {
            if ($(this).is(':checked')) {
                $scope.productArray.push($(this).val());
            }

        });
        $('ul.brand_filter_list input.uk-checkbox').each(function () {
            if ($(this).is(':checked')) {
                $scope.brandArray.push($(this).val());
            }

        });
        $http.post(service_url + 'ecommerce/productList/' + ECP_CODE,
            { product_id: $scope.productArray, brand_id: $scope.brandArray }
        ).then(function (response) {
            $('.brand_info').addClass('disabled');
            $scope.product_item = response.data.item;
            $scope.product_cat = response.data.product_cat;
            $scope.current_slide = 0;
            $scope.brand_id = response.data.brand_id;
            $.each($scope.brand_id, function (i, e) {
                if (e.length > 0) {
                    $('.brand_info[brand_id="' + e + '"]').removeClass('disabled');
                    $('.brand_info[brand_id="' + e + '"]').prop("checked", false);
                }
            });
        });
    };

    $scope.removeList = function ($list, $id, $type) {
        $type = $type ? $type : false;
        $.each($list, function (i, e) {
            if (e == $id) {
                $list.splice(i, 1);
                return true;
            }
        });
        if ($type == 'productList') {
            setTimeout(function () {
                $scope.getProductList();
            }, 500);
        }

    };

    $scope.nextImg = function (type) {
        if (type == 'next' && $scope.product_cat.length - 1 > $scope.current_slide) {
            $scope.current_slide = $scope.current_slide + 1;
        } else if (type == 'previous' && $scope.current_slide > 0) {
            $scope.current_slide = $scope.current_slide - 1;
        } else {
            $scope.current_slide = 0;
        }
    };

    $scope.customDialogOptions = {
        scope: $scope,
        backdrop: false,
        onEscape: function () {
        }
    };

    $scope.toggleComment = function () {
        $scope.isFormOpen = !$scope.isFormOpen;
    };

    var stop = $interval(function () {
        $scope.nextImg('next');
    }, 5000);

    $scope.stopSlide = function (event) {
        if (event == 'in') {
            $interval.cancel(stop);
        } else if (event == 'out') {
            stop = $interval(function () {
                $scope.nextImg('next');
            }, 2000);
        }
    };
    
    $scope.ShowroomleftSide = false;    
    
    $scope.ShowroomleftSideMenu = function (type) {
        if (type) {
            $('#left_side_loader_div').show();
        } else {
            $('#left_side_loader_div').hide();
            
        }
        $scope.ShowroomleftSide = type;
        $('#ShowroomleftSideMenu').animate({
            width: 'toggle'
        });
    };

    $scope.Slider3D = function (item, ProductGalleryModal) {
   
        $('#loader_div').show();

        $http.post(service_url + 'ecommerce/productGallery',
        {
            cache: true,
            id: item.ECI_CODE
        }).then(function (response) {
            $scope.product_gallery = response.data[0];
            $scope.gallery = response.data;//dataGroup(response.data, 6);
            
            console.log($scope.gallery);

            var step_options = {
                templateUrl: $scope.temp_path + 'popup/showroomProduct3dSlider.html?v='+version,
                scope: $scope,
                size: 'large',
                // backdrop: false,
                title:null,
                className: 'slider3D',
                onEscape: function () {
                }
            };
            $ngBootbox.customDialog(step_options);

            setTimeout(function(){
              
                $(document).ready(function () {
                    var carousel =  $("#carouselGalaryShowRoom").waterwheelCarousel({
                        flankingItems: 3,
                        forcedImageHeight:768,                        
                        edgeFadeEnabled: true
                    });
                    $('#prev3D').bind('click', function () {
                        carousel.prev();
                        return false
                      });
                    
                      $('#next3D').bind('click', function () {
                        carousel.next();
                        return false;
                      });
                    console.log('hereee..');
                });


                $('#loader_div').hide();
            },500);
            

           
        });
   
    };

    $scope.Productgallery = function () { 
        var step_options = {
            templateUrl: $scope.temp_path + 'showroom/thumbSlider.html?v='+version,
            scope: $scope,
            size: 'large',
            // backdrop: false,
            // title:' $translate.instant('sign_up')',
            title:null,
            className: 'thumbSlider',
            onEscape: function () {
            }
        };
        
        $ngBootbox.customDialog(step_options);
       
        
    };
    
    



}]);





controllers.controller('swatches', ['$scope', '$http', '$location', '$route', '$rootScope', '$controller', '$ngSilentLocation', '$ngBootbox', '$translate', function ($scope, $http, $location, $route, $rootScope, $controller, $ngSilentLocation, $ngBootbox, $translate) {


    $scope.upload_url = 'https://www.sedarglobal.com/service/uploads/';

    $scope.user_mobile_register = function (isValid) {
        if (isValid == false) {
            $scope.submitted = true;
        } else {
            store.remove('user_mobile');
            $http.post(service_url + 'ecommerce/user_mobile_register', {
                data: $scope.input
            }).then(function (response) {
                $scope.waiting = false;
                if(response.data.error_message == 'Success'){
                    $('.material_popup').modal("hide");
                    store.set('user_mobile', $scope.input.USER_MOBILE)
                }
                
            });
        }
    };

    window.scrollTo(0, 0);
    $('.viewHeight').css('opacity', 0);

    $scope.materialSection = false;
    $scope.left_filter_menu = false;
    $rootScope.desk_footer = true;
    $scope.free_sample_text = $translate.instant('free_sample');
    $scope.added_text = $translate.instant('added');

    $scope.leftFilterSideMenu = function (type) {
        if (type) {
            $('#left_filter_loader_div').show();
        } else {
            $('#left_filter_loader_div').hide();
        }
        $scope.left_filter_menu = type;
        $('#left_filter_menu').animate({
            width: 'toggle'
        });
    };


    $scope.product_id = $location.search().id;
    $scope.product_desc = $location.search().desc
    $scope.cat_desc = '';
    $scope.qtyto = false;
    $scope.addtoCartBtn = [];
    $scope.IsVisible = false;
    $scope.isFirstOpen0 = true;
    $scope.isOpen = false;
    $scope.prodCode = $location.search().id;
    $scope.totalcoll = 0;
    // Variables
    $scope.showLoadmore = false;
    $scope.coll_row = 0
    $scope.rowperpage = 20;
    $scope.mat_row = [];
    $scope.collection = [];
    $scope.qty = [];
    $scope.materialLoadmore = {};
    $scope.totalmat = {};
    $scope.sampleVisible = true;
    $scope.added = 'ADDED';
    $scope.filterArray = {};
    $scope.filterArray['brand'] = $location.search().brand ? [$location.search().brand] : [];
    $scope.filterArray['color'] = [];
    $scope.filterArray['material'] = [];
    $scope.filterArray['pattern'] = [];
    $scope.filterArray['collection'] = $location.search().ecc_code ?$location.search().ecc_code.split(',') : [];
    $scope.filterArray['price'] = [];
    $scope.filterArray['size'] = [];
    $scope.filterArray['roll_size'] = [];
    $scope.filterArray['sort_by'] = [];
    $scope.filterArray['free_del_with_inst'] = [];
    $scope.filterArray['search'] = '';
    $scope.filterArray['tag'] = [];
    $scope.material_code = {};
    $scope.btnLength = {};
    $scope.sampleKey = {};
    $scope.family_material = {};
    $scope.singleFamily = {};
    $scope.productCart = {};
    $scope.filter_search = false;
    $scope.favourite = 'Y';
    $scope.no_record = false;
    $scope.grid = 4;
    $scope.page = $location.search().page == undefined ? 1 : $location.search().page;
    $scope.saleType = $location.search().sa == 'Sale' ? $translate.instant('all') : $translate.instant('sale');
    $scope.offer_code = $route.current.params.offer_code ? $route.current.params.offer_code : '';

    
    

    $scope.freeDeliveryWithInst=function(){
        if($scope.filterArray['free_del_with_inst']=='Y'){
            $scope.filterArray['free_del_with_inst'] = 'N';
        }else{
            $scope.filterArray['free_del_with_inst'] = 'Y';
        }
        $scope.swatchCollection($scope.prodCode, $scope.product_desc, 'direct');
    }

    
    $('#loader_div').show();

    $scope.swatchCollection = function (prod_code, $desc, $count) {
        console.log(prod_code)
        setTimeout(function(){
            window.scrollTo(0, 180);
            $scope.materialSection = true;
            $scope.material = {};
            $scope.product_id = prod_code;

            if ($scope.prodCode != prod_code) {
                $scope.filter(1, prod_code);
                $scope.prodCode = prod_code;
            }

            if ($scope.coll_row == undefined || $count == 0 || $count == 'direct') {
                $scope.coll_row = 0;
                $scope.collectionGroup = {};
            }
        
            $('div').removeClass('act');
            $scope.showLoadmore = true;
            $scope.product_desc = $desc;

            if($location.search().page){
                $scope.coll_row = $location.search().page * $scope.rowperpage - 20;
            }

            $('.collGroup').hide();
        },200);


        $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        // send login data
        $http({
            method: 'POST',
            url: 'http://localecommerce/service/ShowroomApi/swatchCollection_rows22',
            data: $.param({
                item_id: prod_code,
                start_page: $scope.coll_row,
                per_page: $scope.rowperpage,
                filterArray: $scope.filterArray,
                id: $location.search().id
            }),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function successCallback(response) {
            // handle success things
            console.log(response);
            $scope.swatchResp(response, 'swatchesCollection');
        });

    };

    if ($location.search().id && ['68282','134268','1'].indexOf($location.search().id)>=0) {
        
        $scope.ShopNow_rows(0, $location.search().id);

    } else {

        $scope.materialSection = true;
        
        $scope.showLoadmore = true;
        
        $scope.swatchCollection($location.search().id, $location.search().desc, 0);
        
    }

   



    $scope.banner_img = $scope.s3_image_path;
   // $scope.filter(1, $scope.prodCode);
      


    $scope.swatchResp = function (response, funcType = false) {

        
        $scope.collection_data = response.data.collection_banner;
        
        if(funcType == 'swatchesCollection'){
            $('.collGroup').show();
            $('#loader_div').hide();
            
            $scope.familyCount = response.data.familyGroup_count[0].FAMILY_COUNT;
            $scope.totalItems = $scope.familyCount;
            $scope.banner_img = response.data.collection_banner ? $scope.s3_image_path + response.data.collection_banner.ECC_BANNER_PATH : image_path + 'freeSwatches.jpg';
            $scope.showLoadmore = false;
            $scope.familyGroup = response.data.familyGroup;
            
            var ECC_TEXT_str = response.data.collection_banner;
            var banner_desc='';

            // if(ECC_TEXT_str){
            //     banner_desc = ECC_TEXT_str && ECC_TEXT_str.ECC_TEXT && ECC_TEXT_str.ECC_TEXT.length > 10 ? response.data.collection_banner.ECC_TEXT : response.data.collection_banner.ECI_DESC;    
            // }else{
                banner_desc= $location.search().desc != undefined ? ($location.search().desc).toUpperCase() : '';
            //}

            $scope.cat_desc = $location.search().desc;

                $scope.collectionGroup = {};

                angular.forEach(response.data.familyGroup, function (item) {
                    
                    $scope.freesample_addtocart(item);

                    if($scope.collectionGroup[item.COLLECTION_DESC]==undefined){
                        $scope.collectionGroup[item.COLLECTION_DESC]=[];
                        $scope.collectionGroup[item.COLLECTION_DESC][0]=item;
                            angular.forEach(item.family, function (family_material) {
                                $scope.addtoCartBtn[family_material.ECM_CODE] = true;
                                $scope.singleFamily[family_material.ECM_CODE] = family_material;
                            });
                    }else{
                        $scope.collectionGroup[item.COLLECTION_DESC].push(item);
                    }
                });

            setTimeout(function () {
                $scope.material_grid_view($scope.grid); 
            },500);    
            $('.viewHeight').css('opacity', '');
        
        }else{

            $scope.materialSection = true;
            $scope.showLoadmore = true;
            $('.collGroup').show();
            $scope.banner_img = response.data.collection_banner != null ? $scope.s3_image_path + response.data.collection_banner.ECC_BANNER_PATH : image_path + 'freeSwatches.jpg';
            var ECC_TEXT_str = response.data.collection_banner;
            var banner_desc='';
            if(ECC_TEXT_str){
                banner_desc = ECC_TEXT_str && ECC_TEXT_str.ECC_TEXT && ECC_TEXT_str.ECC_TEXT.length > 5 ? response.data.collection_banner.ECC_TEXT : response.data.collection_banner.ECI_DESC;    
            }else{
                banner_desc=($location.search().desc).toUpperCase();
            }
            $scope.cat_desc = $location.search().desc != undefined ? banner_desc : '';
            $scope.matCount = response.data.MATERIAL_COUNT[0].FAMILY_COUNT;
            $scope.totalItems = $scope.matCount;
            
            if (response.data.material != '') {
                $('#loader_div').hide();
                $('.viewHeight').css('opacity', '');
                // Increment row position
                $scope.showLoadmore = false;
                $scope.mat_row += $scope.rowperpage;
                $scope.material = response.data.material;
                    setTimeout(function () {
                        $scope.$apply(function () {
                            // Append data to $scope.collection
                            angular.forEach(response.data.material, function (if_material) {
                                $scope.freesample_addtocart(if_material);
                            });
                        });
                    }, 500);
                    setTimeout(function () {
                        $scope.material_grid_view($scope.grid); 
                    },500); 

            } else {
                $scope.materialLoadmore[ecc_code] = false;
                $('.more' + ecc_code).hide();
            }

        }    

    };

    $scope.filter = function (type, $code) {
        $scope.selectedIndex = type;
        $http.post(service_url + 'ecommerce/filter',
            { ECI_CODE: $code }
        ).then(function (response) {
            $scope.brand_list = response.data.brand_list;
            $scope.color_list = response.data.color_list;
            $scope.material_list = response.data.material_list;
            $scope.pattern_list = response.data.pattern_list;
            $scope.collection_list = '';
            $scope.filter_tag = response.data.filter_tag;
            $scope.below_price = response.data.below_price;
        });
        return true;
    };

    $scope.clearFilter = function () {
        $scope.filterArray = {};
        $scope.filterArray['brand'] = $location.search().brand ? [$location.search().brand] : [];
        $scope.filterArray['color'] = [];
        $scope.filterArray['material'] = [];
        $scope.filterArray['pattern'] = [];
        $scope.filterArray['collection'] = [];
        $scope.filterArray['price'] = [];
        $scope.filterArray['sort_by'] = [];
        $scope.filterArray['size'] = [];
        $scope.filterArray['roll_size'] = [];
        //$scope.filterArray['mostpopular'] = [];
        $scope.filterArray['tag'] = [];
        $scope.filterArray['search'] = '';
    }

    $scope.rangeFilter = function (type) {
        if (type == 'clear') {
            $scope.clearFilter();
        }
        $scope.filter_search = true;
        $scope.swatchCollection($scope.prodCode, $scope.product_desc, 0);
    };

    $scope.filterSection = function (item_code, type) {
        if ($scope.filterArray[type].indexOf(item_code) >= 0) {
            var index = $scope.filterArray[type].indexOf(item_code);
            if (index !== -1)
                $scope.filterArray[type].splice(index, 1);
        } else {
            if (type == 'price') {
                $scope.filterArray[type][0] = item_code;
            } else {
                $scope.filterArray[type].push(item_code);
            }
        }

        if (type == 'brand') {
            $http.post(service_url + 'ecommerce/getCollectionByBrand/' + $scope.product_id,
                {
                    BR_CODE: $scope.filterArray['brand'],
                    ECC_CODE: $location.search().ecc_code && $location.search().ecc_code.length>0 ?$location.search().ecc_code.split(',') : ''
                }).then(function (response) {
                    $scope.collection_list = response.data.collection_list;
                });
        }
        $scope.filter_search = true;
    };

    $scope.getSampleProduct = function (category_code, $desc, $code) {
        $('#loader_div').show();
        $scope.materialSection = false;
        $scope.category_desc = $desc;
        $http.post(service_url + 'ecommerce/getSampleProduct/' + category_code + '/' + $code,
            { cache: true }
        ).then(function (response) {
            $scope.item = response.data.item;
            $scope.product_desc = $scope.item[0].ECI_DESC;
            $scope.prodCode = $scope.item[0].ECI_CODE;
          
            $scope.swatchCollection($scope.prodCode, $scope.product_desc, 'direct');

            $('#category' + $code).addClass('act');
            $('#product' + $scope.prodCode).addClass('act');
            $scope.clearFilter();
            $scope.filter(1, $scope.item[0].ECI_CODE);
            $('#loader_div').hide();
        });
    };

    $scope.applyImg = function (family) {
        $('#applyFamImg' + family.ECM_IF_CODE).attr('src', image_upload + family.ECM_IMAGE_PATH);
        $('#familyItemCode' + family.ECM_ITEM_ID).text(family.ITEM_ID);
        $('.family_class' + family.ECM_CODE).addClass('active');
    };

    $scope.colorSwatches = function (family, type, material, mat_code) {
        
        
        $scope.indexOf = material == undefined ? family.ECM_CODE : material.ECM_CODE;
        var ifcode = material == undefined ? family.ECM_CODE : material.ECM_CODE;
        $scope.material_code[mat_code] = family;
        

        $scope.btnLength[ifcode] = $rootScope.catalogue_item.indexOf($scope.indexOf);
        $scope.singleFamily[ifcode] = family;

        

        $('#nonDirect' + mat_code).addClass('hide');
        $('#addDirect' + mat_code).removeClass('hide');

        if ($rootScope.non_product.indexOf($scope.indexOf) >= 0 && type == 'liswatch') {
            var index = $rootScope.non_product.indexOf($scope.indexOf);
            var val = index >= 0 ? $rootScope.noneProductKey[index].EOL_QTY : '';
            $scope.qty[mat_code] = { value: val != '' ? val : 1 };
            
            $('#nonDirect' + mat_code).removeClass('hide');
            $('#addDirect' + mat_code).addClass('hide');
        }

        if ($rootScope.catalogue_item.indexOf($scope.indexOf) >= 0) {
            $scope.addtoCartBtn[$scope.indexOf] = true;
            
            if (type == 'saveIncart') {
                var EOL_SYS_ID = $scope.sampleKey[$rootScope.catalogue_item.indexOf($scope.indexOf)].EOL_SYS_ID;
                var EOL_CART_ID = $scope.sampleKey[$rootScope.catalogue_item.indexOf($scope.indexOf)].EOL_CART_ID;
                $scope.deleteSingleItem(EOL_SYS_ID, EOL_CART_ID);
                $('#' + mat_code).html($translate.instant('Free_Sample'));
                $('#' + mat_code).removeClass('sampleAdded');
                $('#' + mat_code).addClass('freeSample');
            } else {
                $('#' + mat_code).html($translate.instant('ADDED'));
                $('#' + mat_code).removeClass('freeSample');
                $('#' + mat_code).addClass('sampleAdded');
            }
        }else {
            
            if (type == 'saveIncart') {
                if ($rootScope.sampleCount >= 5) {
                    $ngBootbox.alert($translate.instant('maximum_five_record_inserted'));
                    return true;
                } else {
                    var sampleCheckOutFamily = material == undefined ? family : material;
                    $scope.material_checkout(sampleCheckOutFamily, 'SAMPLE');
                    $('#' + mat_code).html($translate.instant('ADDED'));
                    $('#' + mat_code).removeClass('freeSample');
                    $('#' + mat_code).addClass('sampleAdded');
                }
            } else {
                $('#' + mat_code).html($translate.instant('Free_Sample'));
                $('#' + mat_code).removeClass('sampleAdded');
                $('#' + mat_code).addClass('freeSample');
            }
        }
       

    };

    $scope.singleMaterial = {};
    $("body").on("click", ".colorSwatches li", function (n) {
       
        n.stopPropagation();
        $(this).parents(".qtip-content").length < 1 && $(".moreColors").qtip("hide");
        var f = $(this),
            r = [],
            family = $(this).data("family"),

            e = family.ECM_CODE,
            t = family.ECM_ECI_CODE,
            c = $(this).data('colorizedroom'),
            ifcode = family.ECM_IF_CODE,
            catCode = $(this).data('cat_code'),
            colorid = $(this).data('colorid'),
            
            item = family.ITEM_ID,
            product_desc = family.PRODUCT_DESC,
            coll_desc = family.ECM_ECC_DESC;

            var family_product = family.product != undefined ? family.product[0].ECI_CODE : '';

            var prodid = family.ECM_ECI_CODE == undefined ? family_product : family.ECM_ECI_CODE,
            
            price = $(this).data("price"),
            was_price = $(this).data("was_price"),

            offer = family.PRICE_OFFER_PCT,
            productYN = family.ECI_PRODUCT_YN,

            ind = $(this)[0].dataset.ind;
            $scope.likeClass = e;
            
            $scope.singleMaterial[colorid] = family;

        if (offer == 0 || offer == '') {
            $('#offer_' + colorid).html('');
            $('#priceWas_' + colorid).html('');

        } else {
            
            $('#offer_' + colorid).html(offer +'% OFF');

            if(was_price > 0){
                $('#priceWas_' + colorid).html($rootScope.total_ccy_code + ' ' + $scope.format(was_price));
            }   
        }
        var fromLabel = productYN == 'Y' ? '<span style="letter-spacing: 0;font-size: 11px;font-weight: bold;"> From </span>' : '';
        
        if(price > 0){
            $('#price_' + colorid).html(fromLabel + ' ' + $rootScope.total_ccy_code + ' ' + $scope.format(price));
        }

        if ($scope.singleFamily[e] != undefined) {
            $scope.favoriteColor = $scope.singleFamily[e].ECM_CODE;
        }

        
        if ($scope.$root && $scope.$root.is_login == true) {
            if($scope.singleFamily[e] != undefined){
                $scope.fa_wishList($scope.singleFamily[e], true);
            }
        }
           $scope.colorSwatches(family, 'liswatch', undefined, colorid);
        $('.buy_' + colorid).attr('href', 'customizing/' + item + '&product=' + product_desc + '&prod_id=' + prodid + '&if=' + ifcode + '&coll_desc=' + coll_desc + '&id=' + e + '');
        $('.customize_' + colorid).attr('href', 'customizing/' + catCode + '/' + prodid + '/' + e + '');
        $('.textile_' + colorid).attr('href', 'customizing/' + catCode + '/' + prodid + '/' + e + '');
        var blno = prodid != '' ? 'inline-block' : 'none';
        $('.textile_' + colorid).attr('style','display:'+ blno );
        $('.buy_' + colorid).attr('href', 'material?item=' + item + '&product=' + product_desc + '&prod_id=' + prodid + '&if=' + ifcode + '&coll_desc=' + coll_desc + '&id=' + e + '&cat_code='+ catCode +'');
        $('#familyItemCode' + colorid).text(item);
       

        $('#applyFamImg' + colorid).attr('src', c);
        $(".colorSwatches li[data-colorid=" + colorid + "]").addClass("active").siblings("li").removeClass("active");

        if ($scope.family_material[e] != undefined) {
            if ($scope.family_material[e].FAV_YN == 'Y' || $scope.like.indexOf($scope.singleFamily[e].ECM_CODE) >= 0) {
                $(this).parents('.productTile').find('.heart_icon').addClass('fas');
                $(this).parents('.productTile').find('.heart_icon').removeClass('fal');
            } else {
                $(this).parents('.productTile').find('.heart_icon').removeClass('fas');
                $(this).parents('.productTile').find('.heart_icon').addClass('fal');
            }
        }
    });

    $scope.format = function (n) {
        return n.toFixed(2).replace(/./g, function (c, i, a) {
            return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
        });
    };

    $scope.collectionGroup = {};
    $scope.familyCount = 0;

    
    $scope.currentPage = $location.search().page != undefined ? $location.search().page : 1;
    $scope.itemsPerPage = $scope.rowperpage;
    $scope.maxSize = 5; //Number of pager buttons to show
    

    $scope.selectPage = function (page, prod_code) {
     
        $ngSilentLocation.silent('swatches/'+$scope.offer_code+'?desc='+$location.search().desc+'&id='+prod_code+'&page='+page);
        
        if ($location.search().id && ['68282','134268','1'].indexOf($location.search().id)>=0) {
            $scope.ShopNow_rows(0, $location.search().id);
        }else{
            $scope.swatchCollection(prod_code);
        }    
    };


    $scope.mat_row = 0;

    $scope.ShopNow_rows = function (ecc_code, prod_code, $count) {
        
        $scope.familyCount = 0;
        $scope.currentPage = $location.search().page != undefined ? $location.search().page : 4;

        if ($scope.prodCode != prod_code) {
            $scope.filter(1, prod_code);
            $scope.prodCode = prod_code;
        }

        if ($scope.mat_row == undefined || $count == 0 || $count == 'direct') {
            $scope.mat_row = 0;
            $scope.material = undefined;
        }

        if($location.search().search == 'Most Popular'){
            //$scope.filterArray['mostpopular'] = ['mostpopular'];
            $scope.filterArray['tag'] = ['mostpopular'];
        }

        if($location.search().page){
            $scope.mat_row = $location.search().page * $scope.rowperpage - 20;
        }

        $scope.materialSection = true;
        $scope.showLoadmore = true;
        $('.collGroup').hide();
        $http.post(service_url + 'ecommerce/ShopNow_rows22',
            {
                item_id: prod_code,
                start_page: $scope.mat_row,
                per_page: $scope.rowperpage,
                filterArray: $scope.filterArray,
                offerType:$scope.offer_code,
                cache: true
            }
        ).then(function successCallback(response) {
            $scope.collection_data = response.data.collection_banner;
            $scope.swatchResp(response);

        });
    };

    

    $scope.filterByTop = function (n) {
        return function () {
            return $(this).offset().top == n
        }
    };




    $scope.freesample_addtocart = function(if_material)
    {
        
        $scope.family_material[if_material.ECM_CODE] = if_material;
        if (if_material) {
            setTimeout(function () {
                if($rootScope.non_product != undefined){
                    var index = $rootScope.non_product.indexOf($scope.family_material[if_material.ECM_CODE].ECM_CODE);
                
                    var val = index >= 0 ? $rootScope.noneProductKey[index].EOL_QTY : null;
                    if(val != null){
                        $scope.qty[if_material.ECM_CODE] = { value: val};
                    }else{
                        $scope.qty[if_material.ECM_CODE] = { value:''};
                    }
                }
                
            }, 1000);
        }
        
        //angular.forEach(if_material.family, function (family_material) {
            $scope.addtoCartBtn[if_material.ECM_CODE] = true;
            $scope.singleFamily[if_material.ECM_CODE] = if_material;
        //});
    };




    $scope.color_refresh = function () {
        $(this).data("viewtype") == "listView" ? ($(this).attr("data-viewtype", "gridView").data("viewtype", "gridView"), $("#allTiles").attr("data-viewtype", $(this).data("viewtype")), $("#ViewType").val("gridView"), n = "Grid View") : ($(this).attr("data-viewtype", "listView").data("viewtype", "listView"), $("#allTiles").attr("data-viewtype", $(this).data("viewtype")), $("#ViewType").val("listView"), n = "List View");
        $(".moreColors").each(function () {
            var n = $(this).siblings(".colorSwatches"),
                t = n.children("li:first");
            n.children("li").length > n.children("li").filter($scope.filterByTop(t.offset().top)).length && $(this).html("+" + (n.children("li").length - n.children("li").filter($scope.filterByTop(t.offset().top)).length) + "<br />More")
        });
    };
    
    $scope.searchFilter = function (pro_id, pro_desc) {
        $scope.coll_row = 0;
        $ngSilentLocation.silent('swatches/'+$scope.offer_code+'?desc='+$location.search().desc+'&id='+pro_id+'&page=1');

        if (pro_id && ['68282','134268','1'].indexOf(pro_id)>=0) {
            $scope.ShopNow_rows(0, pro_id, 'direct');
        } else {
            $scope.swatchCollection(pro_id, pro_desc, 'direct');
        }
    };

    $scope.nonProduct = function (mat_family, ifCode, singleFamily) {
        if ($scope.$root.is_login == false && $scope.$root.server_name == false) {

            $('#loader_div').show();
            var step_options = {
                templateUrl: $scope.temp_path + 'popup/login.html?v='+version,
                scope: $scope,
                size: 'small',
                title: $translate.instant('login'),
                className: 'login_popup',
                onEscape: function () {
                }
            };
            $ngBootbox.customDialog(step_options);
            $('#loader_div').hide();

        }else if(store.get('user_mobile') == undefined && $scope.$root.server_name == false){
            var customizing_error_options = {
                templateUrl: $scope.temp_path + 'popup/user_mobile.html?v='+version,
                scope: $scope,
                // backdrop: false,
                title: $translate.instant('create_favourite_account'),
                className: 'material_popup',
                onEscape: function () {
                }
            };
            $ngBootbox.customDialog(customizing_error_options);
        }else{
            var data = _.isEmpty($scope.singleMaterial) ? mat_family : $scope.singleMaterial[mat_family.ECM_CODE];
            $('#nonDirect' + singleFamily.ECM_CODE).removeClass('hide');
            $('#addDirect' + singleFamily.ECM_CODE).addClass('hide');
            $scope.qty[data.ECM_CODE] = { value : 1 };
            $scope.material_checkout(data, 'NON_PRODUCT');
        }
    };

    var min = 1;
    var max = 30;
    var step = 1;

    var setValue = function (val, code) {
        $scope.qty[code] = { value: parseInt(val) };
    }

    $scope.minus = function (ifCode, matCode) {
        //var material = ifCode == undefined ? matCode : ifCode
        var material = _.isEmpty($scope.singleMaterial) ? matCode : $scope.singleMaterial[matCode.ECM_CODE];

        var code = material.ECM_CODE;
        var qty = $scope.qty[code].value;
        if (qty <= 1) {
            setValue(min);
            return false;
        }
        setValue((qty - step), code);
        $scope.productCart[code] = $rootScope.noneProductKey[$scope.non_product.indexOf($scope.family_material[code].ECM_CODE)];
        var data = angular.merge({}, material, $scope.productCart[code]);

        $scope.material_checkout(data, 'NON_PRODUCT');
    };

    $scope.plus = function (ifCode, matCode, noneProd) {
        var material = _.isEmpty($scope.singleMaterial) ? matCode : $scope.singleMaterial[matCode.ECM_CODE];
        var code = material.ECM_CODE;
        var qty = $scope.qty[code].value;
        if (max && (qty >= max || qty + step >= max)) {
            setValue(max);
            return false;
        }
        setValue((qty + step), code);
        var ind = $('.moreIF' + code).siblings('.colorSwatches').find('.active').data('ind');
        $scope.productCart[code] = $rootScope.noneProductKey[$scope.non_product.indexOf($scope.family_material[code].ECM_CODE)];
        var data = angular.merge({}, material, $scope.productCart[code]);

        $scope.material_checkout(data, 'NON_PRODUCT');
    };

    $scope.changed = function (ifCode, matCode) {
       var material = _.isEmpty($scope.singleMaterial) ? matCode : $scope.singleMaterial[matCode.ECM_CODE];

        var code = material.ECM_CODE;
        var qty = $scope.qty[code].value;
        setValue(qty, code);
        var ind = $('.moreIF' + code).siblings('.colorSwatches').find('.active').data('ind');
        $scope.productCart[code] = $rootScope.noneProductKey[$scope.non_product.indexOf($scope.family_material[code].ECM_CODE)];
        var data = angular.merge({}, material, $scope.productCart[code]);
        $scope.material_checkout(data, 'NON_PRODUCT');
    };

    $scope.material_grid_view=function(val){
        $scope.grid = val;
        switch(val){
            case 2:
                $scope.material_grid_view2 = true;
                $scope.material_grid_view4 = true;
                $scope.material_grid_view8 = false;

                $('#allTiles .productTile').removeClass("BrowsCollStyle4");
                $('#allTiles .productTile').removeClass("BrowsCollStyle8");
                $('#allTiles .productTile').addClass("BrowsCollStyle2");
                $('.padding_left0.padding_xs_left0').remove('style');
                break;
            case 4:
                $scope.material_grid_view2 = false;
                $scope.material_grid_view4 = false;
                $scope.material_grid_view8 = false;

                $('#allTiles .productTile').removeClass("BrowsCollStyle2");
                $('#allTiles .productTile').removeClass("BrowsCollStyle8");
                $('#allTiles .productTile').addClass("BrowsCollStyle4");
                $('.padding_left0.padding_xs_left0').remove('style');
                break;
            case 8:
                $scope.material_grid_view2 = false;
                $scope.material_grid_view4 = true;
                $scope.material_grid_view8 = true;

                $('#allTiles .productTile').removeClass("BrowsCollStyle2");
                $('#allTiles .productTile').removeClass("BrowsCollStyle4");
                $('#allTiles .productTile').addClass("BrowsCollStyle8");
                $('.padding_left0.padding_xs_left0').css('padding-right','5px');
                break;
            default:
                $('.productTile').css('width','19%');
                $('.men-thumb-item img').css('height','180px');
                $('.men-thumb-item img').css('max-height','180px');
                $('.colorSwatches li img').attr('style', 'height: 24px !important');
                $('.colorSwatches li img').css('width','24px');
                $('.freeSample, .freeSample a').css('font-size','11px');
                $('.buyNow, .buyNow a').css('font-size','11px');
                $('.padding_left0.padding_xs_left0').remove('style');
                $('.viewDetail a').remove('style');
        }

    }


    $scope.tooltipstertooltip = function (tooltipitem, ifCode) {
        
        var html = '';
        html += '<div style="width: 100%; margin-bottom:10px; color:#000"><strong>SELECT MODEL FOR YOUR CURTAIN</strong></div>';
        for(var i = 0; i < tooltipitem.length; i++){
            html += '<div style="width: 100%; margin-bottom:10px"><img src="' + $scope.s3_image_path + tooltipitem[i].ECI_IMAGE_PATH +'" width="50" height="50" style="margin-right:10px"/><a href="customizing/5965/'+tooltipitem[i].ECI_CODE+'/'+tooltipitem[i].ECM_CODE+'"><strong>'+tooltipitem[i].ECI_DESC+'</strong></p></div>';
        }

        $('.customize_'+ ifCode).tooltipster({     
            contentAsHTML: true,  
            interactive:true,
            maxWidth:350, 
            contentCloning:true,   
            arrow:false,  
            content: $(html)
        });
        
    };
   
}]);


controllers.controller('materialFamily', ['$scope', '$http', '$location', '$controller', '$rootScope', '$ngBootbox', '$translate', function ($scope, $http, $location, $controller, $rootScope, $ngBootbox, $translate) {

    
    window.scrollTo(0, 0);
    $('.viewHeight').css('opacity', 0);
    $scope.ecm_code = $location.search().id;
    $scope.if_code = $location.search().if;
    $scope.prod_code = $location.search().prod_id;
    $scope.cat_code = $location.search().cat_code;
    $scope.selectedIndex = 0;

    $scope.free_sample_text = $translate.instant('free_sample');
    $scope.added_text = $translate.instant('added');
    
   
    $scope.getIfMaterial = function (if_code, prod_code, ecm_code) {
        $('#loader_div').show();
        var prod_code = _.isEmpty(prod_code) == true ? 0 : prod_code;
        $http.post('http://localecommerce/service/ShowroomApi/getFamily_Mat/' + prod_code + '/' + ecm_code,
            { cache: true }).then(function (response) {
                $('#loader_div').hide();
                $('.viewHeight').css('opacity', '');
                $scope.material_info = response.data.material_info[0];
                $scope.life_style_info=response.data.life_style_info;
                $scope.family = response.data.material_info.family;
                $scope.guideline = response.data.guideline;
                $scope.pattern = response.data.pattern;
                $scope.detail = response.data.detail;
                $scope.product = response.data.product;
                $scope.status = response.data.status;

                

                $scope.imageZoomLoad = function () {
                    imageZoom("myimage", "myresult");
                };

                setTimeout(function () {
                    $scope.imageZoomLoad();
                    $('.feature_and_benefit').find('img').remove();
                    $('.how_to').remove();
                    $('.feature_and_benefit p')[1].remove();
                }, 500);
            });
    };
    
    $scope.getIfMaterial($scope.if_code, $scope.prod_code, $scope.ecm_code);
    $scope.selectedtab = 0;
    $scope.navtab = function (val, pattern) {
        //$scope.selectedtab = val;
        $scope.loader = true;
        $http.post(service_url + 'ecommerce/similarmaterial/' + $scope.ecm_code + '/' + $scope.prod_code + '/' + pattern, {
            cache: true
        }).then(function (response) {
            $scope.detail = response.data.detail;
            $scope.status = response.data.status;
            $scope.loader = false;
        });
    };
    $scope.lifeStyle = function (img) {

        var img_src = image_upload + img;
        //console.log(img_src);
        //$('#myresult').css('')
        $('#myimage').attr('src', img_src);
        $('#myresult').css('background-image', 'url(' + img_src + ')');
    }

    $scope.nonProduct = function (mat_family, ifCode, singleFamily) {
        //  console.log(singleFamily);
        //  console.log(ifCode);
        //$scope.addtoCartBtn[material.ECM_CODE] = false;

        var data = singleFamily == undefined ? mat_family : singleFamily;
        $('#nonDirect' + data.ECM_IF_CODE).removeClass('hide');
        $('#addDirect' + data.ECM_IF_CODE).addClass('hide');
        $scope.material_checkout(data, 'NON_PRODUCT');
    };

    $scope.tooltipstertooltip = function (tooltipitem) {

        $scope.productList = tooltipitem;

        var matrial_options = {
            templateUrl: $scope.temp_path + 'popup/product.html?v='+version,
            scope: $scope,
            // backdrop: false,
            title: 'SELECT MODEL FOR YOUR CURTAIN',
            className: 'material_popup',
            onEscape: function () {
            }
        };
        $ngBootbox.customDialog(matrial_options);


    };
}]);