var controllers = angular.module('acs.controllers', ['ngSilent']);

controllers.controller('root', ['$scope','$translate','$rootScope','user', function ($scope,$translate,$rootScope,user) {
    $scope.user = user;
    $scope.temp_path = temp_path;
    $scope.version = version;
    $scope.image_path = image_path;
   // $scope.upload_url = 'https://www.sedarglobal.com/service/uploads/';
    $scope.s3_image_path = 'https://bkt.sedarglobal.com/';
    $scope.asset_img = 'https://ast.sedarglobal.com/images/';
    var langKey = 'en-US';
    $translate.preferredLanguage(langKey);
    $translate.use(langKey);

    bootbox.setDefaults({ 'locale': langKey });
	
    $rootScope.upload_url = image_upload;//'https://www.sedarglobal.com/service/uploads/';
    
    $scope.$root.is_login = user.getSysId() ? true : false;
    console.log($scope.$root.is_login);
    if (user.getSysId()) {
        $scope.usersInfo = store.get('USER_INFO');
        $scope.user_sys_id = $scope.usersInfo.USER_SYS_ID != undefined ? $scope.usersInfo.USER_SYS_ID : '';
        $rootScope.login_userName = $scope.usersInfo.USER_FIRST_NAME != undefined ? $scope.usersInfo.USER_FIRST_NAME : '';
    }

    $scope.orientation = screen.orientation.type;

}]);



controllers.controller('globalFunction', ['$scope', '$location', '$http', '$ngBootbox', '$rootScope', 'alerts', 'user', '$translate', function ($scope, $location, $http, $ngBootbox, $rootScope, alerts, user, $translate,) {
    $ngBootbox.hideAll();    
    $scope.usersInfo = store.get('USER_INFO') != undefined ? store.get('USER_INFO') : '';
    $scope.user_sys_id = $scope.usersInfo.USER_SYS_ID != undefined ? $scope.usersInfo.USER_SYS_ID : '';

    $scope.input = {};

    if($location.$$url == '/login' && $scope.$root.is_login == true){
        
        $location.path('wishList');

    }

   

    $scope.login = function () {
        $scope.waiting = true;
        $http({
            method: 'POST',
            url: service_url + 'ShowroomApi/login',
            data: $.param({
                email: $scope.input.email,
                password: CryptoJS.MD5($scope.input.password).toString()
            }),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function (response) {
            $scope.waiting = false;
            console.log(response.data);
            if (response.data.status == true && response.data.user_detail != null) {
                
                $rootScope.is_login = true;
                $rootScope.login_userName = response.data.user_detail.USER_FIRST_NAME;
                $rootScope.USER_KEY_TYPE = response.data.user_detail.USER_KEY_TYPE;
                store.set('USER_INFO', response.data.user_detail);
                user.setSysId(response.data.user_detail.USER_SYS_ID);

                if($location.$$url == '/login' && $scope.$root.is_login == true){
                    $location.path('wishList');
                }

                $('.ShowroomLogin').modal('hide');
                if (response.data.user_detail.USER_KEY_TYPE == 'Email Verification') {
                    var options = {
                        message: $translate.instant('email_vaification_message'),
                        className: 'email_vaification',
                        buttons: {
                            warning: {
                                label: "Resend",
                                className: "btn-warning pull-left",
                                callback: function () {
                                    $http.post(service_url + 'ecommerce/resendAcountActiveEmail', {
                                        data: response.data.user_detail
                                    }).then(function (response) {
                                        console.log('mail sent');
                                    });
                                }

                            },
                            success: {
                                label: "Ok",
                                className: "btn-success",
                            }
                        }
                    };
                    $ngBootbox.customDialog(options);
                }
                $('.ShowroomLogin').modal('hide');
            } else {
                alerts.fail($translate.instant('userid_password_invalid'));
            }
        });
    };

    $scope.showRoomLogout = function () {
        console.log('here..');
        $scope.user.clear();
        store.remove('USER_INFO');
        $rootScope.is_login = false;
        
        $location.path('showroomHome');
        // window.location.reload();
    };

    
   $scope.socialShare = function(link){
   
        $scope.link = link.currentTarget.getAttribute("data-href");
        var step_options = {
            templateUrl: $scope.temp_path + 'showroom/socialShare.html?v='+version,
            scope: $scope,
            size: 'small',
            title:'Share it',
            className: 'socialShare',
            onEscape: function () {
            }
        };
        $ngBootbox.customDialog(step_options);  
    }

    $scope.fa_wishList = function (material, $likeCheck) {

        $likeCheck = $likeCheck ? $likeCheck : false

        var ECM_CODE = $scope.favoriteColor == undefined ? material.ECM_CODE : $scope.favoriteColor;
        
        if ($rootScope.is_login == false) {

            $('#loader_div').show();
            var step_options = {
                templateUrl: $scope.temp_path + 'popup/login.html?v='+version,
                scope: $scope,
                size: 'small',
                //title: 'Login',
                className: 'ShowroomLogin',
                onEscape: function () {
                }
            };
            $ngBootbox.customDialog(step_options);
            $('#loader_div').hide();
            $scope.favorite = 'FAVORITE';
            $('#' + material.ECM_CODE).removeClass('far');
        } else {
            if ($likeCheck == false) {
                if ($('#like' + material.ECM_CODE).hasClass('fal') == true && material.FAV_YN != 'Y') {
                    $scope.favorite = 'FAVORITE';
                    $('#like' + material.ECM_CODE).removeClass('fal');
                    $('#like' + material.ECM_CODE).addClass('fas');
                }  else {
                    console.log('UNLIKE');
                    $scope.like.splice($scope.like.indexOf(ECM_CODE), 1);
                    $scope.favorite = 'UNLIKE';
                    $('#like' + material.ECM_CODE).addClass('fal');
                    $('#like' + material.ECM_CODE).removeClass('fas');
                }


                $http({
                    method: 'GET',
                    url: service_url + 'ShowroomApi/favorite_prod_item/' + material.ECM_ECI_CODE + '/' + ECM_CODE + '/swatches/' + $scope.favorite + '/'+ $scope.user_sys_id,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}

                }).then(function (response) {
                });
            }
            else {
                //console.log( $scope.like);

                if (material.FAV_YN == 'Y' && $scope.like[$scope.like.indexOf(ECM_CODE)] == ECM_CODE) {
                    $('#like' + material.ECM_CODE).removeClass('fal');
                    $('#like' + material.ECM_CODE).addClass('fas');
                } else if (material.FAV_YN != 'Y' && $scope.like[$scope.like.indexOf(ECM_CODE)] == ECM_CODE) {
                    $('#like' + material.ECM_CODE).removeClass('fal');
                    $('#like' + material.ECM_CODE).addClass('fas');
                } else {
                    if ($scope.like[$scope.like.indexOf(ECM_CODE)] == ECM_CODE) {
                        $scope.like.splice($scope.like.indexOf(ECM_CODE), 1);
                    }
                    $('#like' + material.ECM_CODE).addClass('fal');
                    $('#like' + material.ECM_CODE).removeClass('fas');
                }
            }
        }
    };

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

    $scope.logOut = function () {
        $scope.$root.is_login = false;
        store.remove('USER_INFO');
        $scope.user.clear();
        $rootScope.login_userName = '';
    //    $location.path('login');
    };
   

    $scope.loginMenu = function () {
            
        var step_options = {
            templateUrl: $scope.temp_path + 'popup/login.html?v='+version,
            scope: $scope,
            size: 'small',
            // backdrop: false,
            // title:'Login',
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


    $scope.showroomUserRegister = function (isValid) {

        if (isValid == false) {
            $scope.submitted = true;
        } else {
            
            $scope.waiting = true;
            if ($scope.input.password != $scope.input.confirmation) {
                alerts.fail($translate.instant('passwords_not_match'));
                $scope.waiting = false;
                return;
            } else if ($scope.input.$email_valid) {
                alerts.fail($translate.instant('email_alerady_register'));
                $scope.waiting = false;
                return;
            } else if ($scope.input.$mobile_valid) {
                alerts.fail($translate.instant('mobile_number_alerady_register'));
                $scope.waiting = false;
                return;
            }


            $http({
                method: 'POST',
                url: service_url + 'ecommerce/register',
                data: $.param({
                    data: $scope.input
                }),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function (response) {
                $scope.waiting = false;

                console.log(response.data);
                if (response.data.status == true) {      
                    $scope.$root.is_login = true;
                    $scope.$root.login_userName = response.data.data.user_detail.USER_FIRST_NAME;
                    store.set('USER_INFO', response.data.data.user_detail);

                    user.setSysId(response.data.user_detail.USER_EMAIL_ID);

                    $('.signupshowroom').modal('hide');

                    if ($location.search().ref) {
                        $location.path($location.search().ref);
                    } else {
                        $location.path('showroomProduct');
                    }
                    // $('#loader_div').hide();
                } else {
                    if (_.isEmpty(data.errors)) {
                        data.errors = '';
                    }
                    _.forEach(data.errors, function (error) {
                        if (error != null) {
                            alerts.fail($translate.instant(error.type, error.field));
                        }
                    });
                }
            });
        }
    };

    $http({
        method: 'GET',
        url: service_url + 'ShowroomApi/getCategory',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).then(function (response) {
        console.log(response.data);
        $scope.category = response.data;
    });

}]);

controllers.controller('showroomHome', ['$scope', '$http','$controller','$rootScope' ,'$ngBootbox','$translate', function ($scope, $http,$controller,$rootScope ,$ngBootbox,$translate) {
    
    angular.extend(this, $controller('globalFunction', { $scope: $scope }));


    // $http.get('https://www.sedarglobal.com/service/ecommerce/getHomeList',{
    //     cache : true
    // }).then(function (response) {
    // });


    
}]);

controllers.controller('showroomProduct', ['$scope', '$route', '$http', '$interval', '$controller', '$rootScope', '$location', '$ngBootbox', '$ngSilentLocation', function ($scope, $route, $http, $interval, $controller, $rootScope, $location, $ngBootbox, $ngSilentLocation) {

    angular.extend(this, $controller('globalFunction', { $scope: $scope }));

    $scope.current_slide = 0;
    $scope.product_cat = [];
    $scope.brand_list = [];
    $scope.likeCheck = [];
    $scope.like = [];
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
        $('#productslidershow').owlCarousel('destroy');
        $scope.itemLoadMore = true;
        $('#loader_div').show();
    
            $http({
                method: 'POST',
                url: service_url + 'ShowroomApi/' + $scope.url + '/' + $scope.user_sys_id,
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
                        lazyLoad : true,
                        navText : ["<img  class='slidericonImg' src='../assets/images/leftarrow.png' />","<img class='slidericonImg'  src='../assets/images/rightarrow.png' />"],
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

    if($location.$$url.split('?')[0] == '/showroomProduct'){
        $scope.productCatalog('productInfo', CATEGORY_CODE, ECP_CODE, ECI_CODE, CHILD_LINE);
    }   



  
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
        $http.post(service_url + 'ShowroomApi/productList/' + ECP_CODE,
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

        $http.post(service_url + 'ShowroomApi/productGallery',
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

    $scope.Productgallery = function (item) { 
        $("#sync1").owlCarousel('destroy');
        $("#sync2").owlCarousel('destroy');
        $http({
            method: 'GET',
            url: service_url+ 'ShowroomApi/productGallery/'+ item.ECI_CODE +'/'+ screen.orientation.type +'/'+ $scope.user_sys_id,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function (response) {

            $scope.render = response.data.render;
            $scope.theme = response.data.theme;

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


            setTimeout(function(){

                var sync1 = $("#sync1");
                var sync2 = $("#sync2");
                var slidesPerPage = 4; //globaly define number of elements per page
                var owl = sync1.owlCarousel({
        
                    items: 1,
                    slideSpeed: 2000,
                    nav: true,
                    autoplay: false,
                    lazyLoad : true,
                    dots: false,
                    loop: true,
                    responsiveRefreshRate: 200,
                    navText: ['<svg width="100%" height="100%" viewBox="0 0 11 20"><path style="fill:none;stroke-width: 1px;stroke: #000;" d="M9.554,1.001l-8.607,8.607l8.607,8.606"/></svg>', '<svg width="100%" height="100%" viewBox="0 0 11 20" version="1.1"><path style="fill:none;stroke-width: 1px;stroke: #000;" d="M1.054,18.214l8.606,-8.606l-8.606,-8.607"/></svg>'],
                });
                sync2.owlCarousel({
                    items: slidesPerPage,
                    dots: false,
                    nav: false,
                    margin: 20,
                    smartSpeed: 200,
                    slideSpeed: 500,
                    lazyLoad : true,
                    slideBy: slidesPerPage, //alternatively you can slide by 1, this way the active slide will stick to the first item in the second carousel
                    responsiveRefreshRate: 100,
                   // autoHeight:true,
                    responsive: {
        
                        0: {
                            items: 3,
                            margin: 10,
        
        
                        },
        
                        480: {
                            items: 4,
                            margin: 10,
        
        
                        },
        
                        768: {
                            items: 5,
                            margin: 15,
                        },
                        1400: {
                            items: 6
                        }
                    }
                });

                $('#sync2').on('click', '.item', function () {
        
                    var $item = $(this);
                    var filter = $item.data('owl-filter')
                    owl.owlcarousel2_filter(filter);
                    
                })
            }, 500);

        });

        // var step_options = {
        //     templateUrl: $scope.temp_path + 'showroom/thumbSlider.html?v='+version,
        //     scope: $scope,
        //     size: 'large',
        //     // backdrop: false,
        //     // title:' $translate.instant('sign_up')',
        //     title:null,
        //     className: 'thumbSlider',
        //     onEscape: function () {
        //     }
        // };
        
        // $ngBootbox.customDialog(step_options);
       
        
    };
   
}]);

controllers.controller('brand', ['$scope', '$route', '$http', '$interval', '$controller', '$rootScope', '$location', '$ngBootbox', '$ngSilentLocation', function ($scope, $route, $http, $interval, $controller, $rootScope, $location, $ngBootbox, $ngSilentLocation) {
    angular.extend(this, $controller('showroomProduct', { $scope: $scope }));
    var id =  $location.search().id ?  $location.search().id : '';
    $scope.productCatalog('getProductByBrand', id);
}]);

controllers.controller('measureInstall', ['$scope', '$route', '$http', '$interval', '$controller', '$rootScope', '$location', '$ngBootbox', '$ngSilentLocation', function ($scope, $route, $http, $interval, $controller, $rootScope, $location, $ngBootbox, $ngSilentLocation) {

    angular.extend(this, $controller('globalFunction', { $scope: $scope }));

    $scope.videoBtn = function (path) {
        //console.log(path);
        $scope.videopath = path;
        var step_options = {
            templateUrl: $scope.temp_path + 'popup/pdfVideo.html?v='+version,
            scope: $scope,
            size: 'large',
            // backdrop: false,
            title:null,
            onEscape: function () {
            }
        };
        $ngBootbox.customDialog(step_options);
       

        // $('#myVideo').load();
        // $('#myVideo').play();
    };
   $('#loader_div').show();
    $scope.id =  $route.current.params.id ? $route.current.params.id : 1;

    $('#productslidershow').owlCarousel('destroy');
            $http({
                method: 'GET',
                url: service_url + 'ShowroomApi/getTreeLevelData/' + $scope.id,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function (response) {
                $scope.measureInstall = response.data;
                setTimeout(function(){

                    $('#productslidershow').owlCarousel({
                        loop: true,
                        margin: 40,
                        responsiveClass: true,
                        dots:false,
                        nav: true,
                        lazyLoad : true,
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


      
            // $scope.pdfPopup = function (path) {
            //     $scope.pdfVideopath = path;
            //     var step_options = {
            //         templateUrl: $scope.temp_path + 'popup/pdfVideo.html?v='+version,
            //         scope: $scope,
            //         size: 'large',
            //         // backdrop: false,
            //         title:null,
            //         onEscape: function () {
            //         }
            //     };
            //     $ngBootbox.customDialog(step_options);
        
                   
              
           
            // };


}]);

controllers.controller('swatches', ['$scope', '$http', '$location', '$route', '$rootScope', '$controller', '$ngSilentLocation', '$ngBootbox', '$translate', 'alerts', function ($scope, $http, $location, $route, $rootScope, $controller, $ngSilentLocation, $ngBootbox, $translate, alerts) {
    
    angular.extend(this, $controller('globalFunction', { $scope: $scope }));

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
    $scope.like = [];
    
    
    $scope.collectionGroup = {};
    $scope.familyCount = 0;

    
    $scope.currentPage = $location.search().page != undefined ? $location.search().page : 1;
    $scope.itemsPerPage = 20;
    $scope.maxSize = 5; //Number of pager buttons to show
    


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
        //setTimeout(function(){
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
        //},200);


        $http({
            method: 'POST',
            url: service_url+ 'ShowroomApi/swatchCollection_rows22',
            data: $.param({
                item_id: prod_code,
                start_page: $scope.coll_row,
                per_page: $scope.rowperpage,
                filterArray: $scope.filterArray,
                id: $location.search().id,
                user_sys_id : $scope.user_sys_id
            }),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function successCallback(response) {
            // handle success things
            console.log(response);
            $scope.swatchResp(response, 'swatchesCollection');
        });

    };

    
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
        
        $http({
            method: 'POST',
            url: service_url+ 'ShowroomApi/ShopNow_rows22',
            data: $.param({
                item_id: prod_code,
                start_page: $scope.mat_row,
                per_page: $scope.rowperpage,
                filterArray: $scope.filterArray,
                offerType:$scope.offer_code,
                user_sys_id : $scope.user_sys_id
            }),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function successCallback(response) {
            $scope.collection_data = response.data.collection_banner;
            $scope.swatchResp(response);

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
      


    $scope.swatchResp = function (response, funcType = false) {

        $scope.collection_data = response.data.collection_banner;
      //  $rootScope.is_login = response.data.user_sys_id != '' ? true : false;

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
                    
                   // $scope.freesample_addtocart(item);

                    if($scope.collectionGroup[item.COLLECTION_DESC]==undefined){
                        $scope.collectionGroup[item.COLLECTION_DESC]=[];
                        $scope.collectionGroup[item.COLLECTION_DESC][0]=item;
                    }else{
                        $scope.collectionGroup[item.COLLECTION_DESC].push(item);
                    }
                });

           
            $('.viewHeight').css('opacity', '');
        
        }else{

            $scope.materialSection = true;
            $scope.showLoadmore = true;
            $('.collGroup').show();
            $scope.banner_img = response.data.collection_banner != null ? $scope.s3_image_path + response.data.collection_banner.ECC_BANNER_PATH : image_path + 'freeSwatches.jpg';
            var banner_desc='';
            // if(ECC_TEXT_str){
            //     banner_desc = ECC_TEXT_str && ECC_TEXT_str.ECC_TEXT && ECC_TEXT_str.ECC_TEXT.length > 5 ? response.data.collection_banner.ECC_TEXT : response.data.collection_banner.ECI_DESC;    
            // }else{
                banner_desc=($location.search().desc).toUpperCase();
            //}
            $scope.cat_desc = $location.search().desc != undefined ? banner_desc : '';
            $scope.matCount = response.data.MATERIAL_COUNT[0].FAMILY_COUNT;
            $scope.totalItems = $scope.matCount;
            

            if (response.data.material != '') {
                $('#loader_div').hide();
                $('.viewHeight').css('opacity', '');
                // Increment row position


                $scope.familyCount = 0;
                $scope.showLoadmore = false;
                $scope.mat_row += $scope.rowperpage;
                $scope.material = response.data.material;

                
            } else {
                $scope.materialLoadmore[ecc_code] = false;
                $('.more' + ecc_code).hide();
            }

        }    

    };

   

    $scope.filter = function (type, $code) {
        $scope.selectedIndex = type;
        
        $http({
            method: 'POST',
            url: service_url+ 'ecommerce/filter',
            data: $.param({
                ECI_CODE: $code
            }),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function (response) {
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

    $scope.filter(1, $scope.prodCode);

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
            
            $scope.filterArray[type].push(item_code);
         
        }

        console.log($scope.filterArray)

        if (type == 'brand') {
            $http.post(service_url + 'ShowroomApi/getCollectionByBrand/' + $scope.product_id,
                {
                    BR_CODE: $scope.filterArray['brand'],
                    ECC_CODE: $location.search().ecc_code && $location.search().ecc_code.length>0 ?$location.search().ecc_code.split(',') : ''
                }).then(function (response) {
                    $scope.collection_list = response.data.collection_list;
                });
        }
        $scope.filter_search = true;
    };

  
    
    
    $scope.selectPage = function (page, prod_code) {
     
        $ngSilentLocation.silent('swatches/'+$scope.offer_code+'?desc='+$location.search().desc+'&id='+prod_code+'&page='+page);
        
        if ($location.search().id && ['68282','134268','1'].indexOf($location.search().id)>=0) {
            $scope.ShopNow_rows(0, $location.search().id);
        }else{
            $scope.swatchCollection(prod_code);
        }    
    };


    $scope.mat_row = 0;


    
    
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
        if ($rootScope.is_login == false) {

            $('#loader_div').show();
            var step_options = {
                templateUrl: $scope.temp_path + 'popup/login.html?v='+version,
                scope: $scope,
                size: 'small',
               // title: $translate.instant('login'),
                className: 'ShowroomLogin',
                onEscape: function () {
                }
            };
            $ngBootbox.customDialog(step_options);
            $('#loader_div').hide();

        }else{
            var data = _.isEmpty($scope.singleMaterial) ? mat_family : $scope.singleMaterial[mat_family.ECM_CODE];
            $('#nonDirect' + singleFamily.ECM_CODE).removeClass('hide');
            $('#addDirect' + singleFamily.ECM_CODE).addClass('hide');
            $scope.qty[data.ECM_CODE] = { value : 1 };
            $scope.material_checkout(data, 'NON_PRODUCT');
        }
    };

   
}]);

controllers.controller('materialFamily', ['$scope', '$http', '$location', '$controller', '$rootScope', '$ngBootbox', '$translate', function ($scope, $http, $location, $controller, $rootScope, $ngBootbox, $translate) {

    angular.extend(this, $controller('globalFunction', { $scope: $scope }));

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
        $http.post(service_url + 'ShowroomApi/getFamily_Mat/' + prod_code + '/' + ecm_code,
            { cache: true }).then(function (response) {
                $('#loader_div').hide();
                $('.viewHeight').css('opacity', '');

                $scope.material_info = response.data.material_info[0];
                if(_.isEmpty($scope.material_info) == false){
                    $scope.life_style_info=response.data.life_style_info;
                    $scope.family = response.data.material_info.family;
                    $scope.guideline = response.data.guideline;
                    $scope.pattern = response.data.pattern;
                    $scope.detail = response.data.detail;
                    $scope.product = response.data.product;
                    $scope.status = response.data.status;
                }else{
                    $location.path('404');
                }
                

                $scope.imageZoomLoad = function () {
                    imageZoom("myimage", "myresult");
                };

                setTimeout(function () {
                    $scope.imageZoomLoad();
                    $('.feature_and_benefit').find('img').remove();
                    $('.how_to').remove();
                   // $('.feature_and_benefit p')[1].remove();
                }, 500);
            });
    };
    
    $scope.getIfMaterial($scope.if_code, $scope.prod_code, $scope.ecm_code);
    $scope.selectedtab = 0;
    $scope.navtab = function (val, pattern) {
        //$scope.selectedtab = val;
        $scope.loader = true;
        $http({
            method: 'GET',
            url: service_url + 'ShowroomApi/similarmaterial/' + $scope.ecm_code + '/' + $scope.prod_code + '/' + pattern + '/' + $scope.user_sys_id,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
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

controllers.controller('customizing', ['$scope', '$rootScope', '$location', '$http', '$route', '$ngBootbox', '$controller', '$translate', 'threeJS',function ($scope, $rootScope, $location, $http, $route, $ngBootbox, $controller, $translate,threeJS) {

    angular.extend(this, $controller('globalFunction', { $scope: $scope }));

    $http.get(service_url + 'ecommerce/getroomType', {
        cache: true
    }).then(function (response) {
        if (response.data) {
            $scope.roomType = response.data;
        }
    });




    $scope.customize_mobilefilter = false;
    $scope.customizemobilefilter = function (type) {
        
        if (type) {
            $('#customize_mobilefilter_loader_div').show();
        } else {
            $('#customize_mobilefilter_loader_div').hide();
        }
        $scope.customize_mobilefilter = type;
        $('#customize_mobilefilter').animate({
            width: 'toggle'
        });
    };
   
    $scope.free_sample_text = $translate.instant('free_sample');
    $scope.added_text = $translate.instant('added');
    $scope.priceRangeBtn = true;
    $scope.$root.footer = false;
    $scope.catalog = false;
    $scope.catalog_family = false;
    $scope.cart_btn = false;
    //$ngBootbox.hideAll();
    $('.material_popup').modal("hide");
    $scope.motor_code = '';
    $scope.motor_pcs_qty = '';
    $scope.bracket_code = {};
    $scope.bracket_formula_qty = {};
    $scope.bracket_price = {};
    $scope.bracket_item_value = {};
    $scope.price_array = {};
    $scope.itemProduct_array = {};
    $scope.step_array = {};
    $scope.item_price = 0;
    $scope.total_price = 0;
    $scope.style_heading = true;
    $scope.tool_section = false;
    $scope.addMore = false;
    $scope.customization_yn = true;
    
    // $('body').css('overflow', 'hidden');
    var cart_id = $scope.cart_id = $route.current.params.hasOwnProperty('id') ? $route.current.params.id : '';
    // var ECP_CODE = $route.current.params.product_id;
    $scope.product_id = $route.current.params.product_id;
    var ECI_CODE = $route.current.params.product_id;
    var matrial_id = $route.current.params.matrial_id;
    $scope.matrial_id = $route.current.params.matrial_id;
    $scope.category_code = $route.current.params.category ? $route.current.params.category : '';

    $scope.curtain_selected=ECI_CODE;
    $scope.motorPositionValue={};
    $scope.motorized={};
    $scope.track_option={};
    $scope.formula_qty = 0;
    $scope.item_value = 0;
    //  $scope.style_heading = true;
    $scope.tool_section = true;
    $scope.glue_recommend = true;
    $scope.glue_qty_show = true;
    $scope.item_currentPage = 1;
    $scope.item_numPerPage = 10;
    $scope.measurement_width = { value: '' };
    $scope.measurement_height = { value: '' };
    $scope.window_depth = { value: '' };
    var depth = '';
    $scope.checkout_btn = false;
    $scope.add_more_item = false;
    $scope.sidenav = true;
    $scope.navigation = true;
    $scope.step_selected = 'item';
    $scope.wks = { number: 1, validity: true }
    $scope.roomDescription = '';
    //  $scope.roomTypeValue = '';
    $scope.roomTypeValue = '-';
    $scope.roomTypeCode = '';
    $scope.filterTypeValue = 1;
    $scope.panel = 'Pannel';
    var m_width = '';
    var m_height = '';
    $scope.width = 0;
    $scope.height = 0;
    $scope.borderTypeValue = '1';
    $scope.border_color_array = new Object();
    $scope.filterArray = {};
    $scope.filterArray['brand'] = $location.search().brand ? $location.search().brand.split(',') : [];
    $scope.filterArray['color'] = $location.search().color ? $location.search().color.split(',') : [];
    $scope.filterArray['material'] = $location.search().material ? $location.search().material.split(',') : [];
    $scope.filterArray['pattern'] = $location.search().pattern ? $location.search().pattern.split(',') : [];
    $scope.filterArray['collection'] = $location.search().collection ? $location.search().collection.split(',') : [];
    $scope.filterArray['tag'] = [];
    $scope.filterArray['m_width'] = '';
    $scope.filterArray['search'] = '';
    $scope.remote_pcs = '';
    $scope.remote_price = '';
    $scope.remote_item_value = '';
    $scope.motorBracketValue = {};
    $scope.edit_cart_info = {};
    $scope.current_step = '';
    $scope.range = [];
    $scope.stepArray = {};
    $scope.lining_option_yn='Y';
    $scope.border_option_yn='Y';
    $scope.ecc_code_id = $location.search().ecc_code ? $location.search().ecc_code.split(',') : '';
    if($scope.ecc_code_id.length>0){
        $scope.filterArray['collection'] = $location.search().ecc_code ? $location.search().ecc_code.split(',') : '';
    }
    for (var i = 1; i <= 100; i++) {
        $scope.range.push(i);
    }
    //$scope.qty = 1;
    $scope.productYN = '';
    $scope.qty = { value: 1 };
    $scope.glueQty = { value: '' };
    $scope.lengthOfWire = ''; //{value: ''};

    $scope.stepArray['Filter'] = ['101', '102', '107'];
    
    $scope.filterRange = ['0', '1', '2', '3'];
    $scope.load_more = [];
    $scope.matrial_width = 0;
    $scope.textureTurned;
    var texture_turn = false;
    $scope.valance_code = '';
    $scope.valance_price = '';
    $scope.valance_item_value = '';
    $scope.valance_pcs = '';
    $scope.material_code = {};
    $scope.btnLength = {};
    $scope.sampleKey = {};
    $scope.singleFamily = {};
    $scope.family_material = {};
    $scope.addtoCartBtn = {};
    $scope.productCart = {};
    $scope.showLoadmore = true;
    $scope.coll_row = {};
    $scope.rowperpage = 3;
    $scope.mat_row = {};
    $scope.mat_perpage = 30;
    $scope.collection = [];
    $scope.qty = [];
    $scope.bottom_border_select = '';
    $scope.edge_border_select = '';
    //$scope.qty = {value : 1};
    $scope.sampleVisible = true;
    $scope.BorderFamily_selected = '';
    $scope.type_of_material_selected = '';
    var collection_ajax = true;
    var post_data = {}; 
    $scope.colorPost_data = {};
    $scope.colorstep_perPage = 0;
    $scope.step_number=1;
    $scope.chargerUom = '';
    $scope.control_tyep_desc='';
    $scope.select_material=$translate.instant('select_material');

    $scope.decorative_filter={
        DF01:'Contempo',
        DF02:'KryStal',
        DF03:'Hampton',
        DF04:'Priage'
    };
    $scope.stop_scean_count = false;
    $scope.tilter = {
        name: ''
    }

    $scope.wire_length_array = [];
    $scope.lengthOfWire=2.5;
    
    for (var i = 0.5; i <= 10; i += 0.5) {

        $scope.wire_length_array.push({ id: i, label: i.toFixed(2) + $translate.instant('LMT') });
        //$scope.wire_length_array.push(i);
    }

    //$scope.length_of_wire = '1';
    //	$scope.installationSurface = {
    //	    name: 'Aluminum'
    //	};

    $scope.installationSurface = {
        name: ''
    };
    $scope.current_prod_name = '';
    $scope.current_product_price = 0;
    $scope.current_prod_qty = 1;
    //   var default_steps_val = ['MT01', 'INSIDE_ROLL', 'PO03', 'BOTTOM_BAR1', 'VAL01'];


    $scope.template = $scope.temp_path + 'tool/item.html?v='+version;
    // var canvasWidth = window.innerWidth;
    // var canvasHeight = window.innerHeight;

    var canvasWidth = screen.orientation.type == 'landscape-primary' ?  $('#threeDImage').width()-450 : window.innerWidth; //window.innerWidth < 480 ? $('#threeDImage').width() : $('#threeDImage').width(); //window.innerWidth;
        $('.top_navigation').hide();
        $('#footer').hide();
        var canvasHeight =  screen.orientation.type == 'landscape-primary' ? window.innerHeight : window.innerHeight - 720; //window.innerWidth < 480 ? window.innerHeight - 350 : window.innerHeight;
        $('.costomizepage_image').css('top','0px');
        


    $('.nav-tabs').attr('style', 'display : block');
    var threeJsData = {
        canvasId: 'threeDImage',
        isMoving: false,
        canvasWidth: canvasWidth,
        canvasHeight: canvasHeight,
    };
    $scope.customDialogOptionFilter = {
        scope: $scope,
        backdrop: true,
        onEscape: function () {
        }

    };
    //threeJS.movingPlay();
    $scope.measurement_content = 'An easy step by step guide to help you get the right measurement of your window.'

    $scope.zoom_slider = window.innerWidth < 480 ? 0 : 18;
    $scope.itemProduct_array[113] = [$scope.roomDescription, $scope.roomTypeValue];
    // threeJS.init(threeJsData);
    $scope.data = threeJsData;
    document.getElementById(threeJsData.canvasId).addEventListener('mousedown', threeJS.onDocumentMouseDown, false);
    document.getElementById(threeJsData.canvasId).addEventListener('mousemove', threeJS.onDocumentMouseMove, false);
    document.getElementById(threeJsData.canvasId).addEventListener('mouseup', threeJS.onDocumentMouseUp, false);
    document.getElementById(threeJsData.canvasId).addEventListener("touchstart", threeJS.touchDown, false);
    document.getElementById(threeJsData.canvasId).addEventListener("touchend", threeJS.onDocumentMouseUp, false);
    document.getElementById(threeJsData.canvasId).addEventListener("touchcancel", threeJS.onDocumentMouseUp, false);
    document.getElementById(threeJsData.canvasId).addEventListener("touchmove", threeJS.touchMove, false);
    document.getElementById(threeJsData.canvasId).addEventListener('wheel', function (event) {
        var fov = threeJS.onDocumentMouseWheel(event);
        if (fov >= 10 && fov <= 95) {
            var zoom_val = $scope.zoom_slider - event.deltaY * 0.25;
            $scope.zoom_slider = zoom_val;
            $scope.$apply();
        }
    });
    $('#loader_div').show();
    
    $http({
        method: 'POST',
        url:service_url + 'ShowroomApi/customizing',
        data:$.param({ ECI_CODE: ECI_CODE, cart_id: cart_id, matrial_id: matrial_id, cache: true }),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).then(function (response) {
        //console.log('cart_id');
        //console.log(response);

        var mobileScr = 50;
        var mobileScrX = $(".step_tool").scrollTop() + mobileScr;
        if (mobileScrX < 60) {
            // window.scrollBy(0, mobileScrX);
        }

        
        if (response.data.status) {
            $scope.eci_motorize_min_width = response.data.item.ECI_MOTORIZE_MIN_WIDTH;
            $scope.eci_motorize_max_height = response.data.item.ECI_MOTORIZE_MAX_HEIGHT;
            $scope.eci_min_width = response.data.item.ECI_MIN_WIDTH;
            $scope.eci_min_height = response.data.item.ECI_MIN_HEIGHT;
            $scope.eci_max_width = response.data.item.ECI_MAX_WIDTH;
            $scope.eci_max_height = response.data.item.ECI_MAX_HEIGHT;
            $scope.max_height = response.data.item.ECI_MAX_HEIGHT;
            $scope.productYN = response.data.item.ECI_PRODUCT_YN;
            $scope.shopping = response.data.shopping;
            $scope.stop_scean_count = false;

            


            threeJsData.object_info = response.data.object_info[0];
            if (threeJS.init(threeJsData) === false || response.data.item.ECI_ALLOW_CUSTOMIZATION_YN == 'N') {
                $location.path('home');
            }
            $scope.isOpen = false;
            $scope.total = response.data.cart_info.total;
            $rootScope.orderList = response.data.cart_info.order_list;
            $rootScope.total_price = response.data.cart_info.total_price;
            //$rootScope.total_amount = response.data.cart_info.total_amount;

            $scope.totalamountArray = response.data.cart_info.totalAmount;

            $rootScope.total_amount = $scope.totalamountArray != undefined && $scope.totalamountArray[0].EOH_GROSS_VALUE > 0 ? $scope.totalamountArray[0].EOH_GROSS_VALUE : 0; //response.data.cart_info.order_head.EOH_GROSS_VALUE; //response.data.cart_info.total_amount;
            $rootScope.total_amount_amount = $scope.totalamountArray != undefined && $scope.totalamountArray[0].EOH_OLD_VALUE > 0 ? $scope.totalamountArray[0].EOH_OLD_VALUE : 0; //response.data.cart_info.order_head.EOH_GROSS_VALUE; //response.data.cart_info.total_amount;
            $rootScope.service_amount = $scope.totalamountArray != undefined && $scope.totalamountArray[1].EOH_GROSS_VALUE > 0 ? $scope.totalamountArray[1].EOH_GROSS_VALUE : 0;
            $rootScope.coupon_amount = $scope.totalamountArray != undefined && $scope.totalamountArray[2].EOH_GROSS_VALUE > 0 ? $scope.totalamountArray[2].EOH_GROSS_VALUE : 0;
            $rootScope.total_amount_precentage = $scope.totalamountArray != undefined && $scope.totalamountArray[0].PERCENTAGE > 0 ? $scope.totalamountArray[0].PERCENTAGE : 0; 
            $rootScope.order_head = response.data.cart_info.order_head;


            //$rootScope.total_cart_item = response.data.cart_info.total_qty;

            $rootScope.total_cart_item = response.data.cart_info.order_head != '' ? response.data.cart_info.order_head.EOH_NO_OF_ITEMS : 0; //response.total_qty;

            $rootScope.total_ccy_code = response.data.cart_info.total_ccy_code;
            $rootScope.total_taxP = response.data.cart_info.total_taxP;
            $rootScope.total_tax_value = response.data.cart_info.total_tax_value;
            $rootScope.total_gross_value = response.data.cart_info.total_gross_value;
            $scope.edit_cart_info = response.data.cart_info.order_list[cart_id];
            $scope.pro_item = response.data.item;
            $rootScope.cont_step = response.data.step;
            $scope.filter_tag = response.data.filter_tag;
            $scope.current_step = $scope.cont_step[0];
            $scope.category_code = response.data.item.EPG_SYS_ID;
            $scope.reserve_stock = response.data.cart_info.order_list[cart_id] ? response.data.cart_info.order_list[cart_id].reserve_stock : '';
            $scope.default_step_val=response.data.default_step_val;

            $scope.default_main_step=response.data.default_main_step;
            $rootScope.user_sys_id = response.data.cart_info.user_sys_id;    


            /*if ($rootScope.user_sys_id == '') {

                store.remove('USER_INFO');
                store.remove('user');
                store.remove('SHIPPING_ID');
                store.remove('COMPANY_INFO');
                store.remove('temp_code');
                store.remove('CHOOSE_FREE_DEL_CITY');
                $rootScope = false;
                $scope.$root.b2b_login = false;
                $scope.$root.login_userName = $translate.instant('my_account');

            }*/

            //$scope.qty = $scope.edit_cart_info ? $scope.edit_cart_info.qty : 1;

            $scope.step_text = $translate.instant('quantity');
            if ($scope.pro_item.ECI_QTY_CALCULATION_TYPE == 'BOTH') {
                if ($scope.pro_item.ECI_CODE == '1143189') {
                    $scope.qtyText = $translate.instant('number_of_set');
                } else {
                    $scope.qtyText = $translate.instant('number_of_roll');
                }
            }



            $scope.qty = { value: $scope.edit_cart_info ? $scope.edit_cart_info.qty : 1 };
            if ($scope.cont_step.length > 0 && matrial_id) {                
                $scope.cont_step[1].isOpen = true;
            } else {
                $scope.item_id = ECI_CODE;
                $scope.cont_step[1].isOpen = true;

                $scope.controlSection($scope.cont_step[1]);                
            }
            $scope.ECI_MATERIAL_ROWS = response.data.item.ECI_MATERIAL_ROWS ? response.data.item.ECI_MATERIAL_ROWS : 3;
            $scope.ECI_MATERIAL_EDGE = response.data.item.ECI_MATERIAL_EDGE ? response.data.item.ECI_MATERIAL_EDGE : 'Z';
            $scope.full_img_cover = [response.data.item.ECI_MATERIAL_ROWS <= 2 ? response.data.item.ECI_CODE : 0];
            $scope.zig_zagImg = [response.data.item.ECI_MATERIAL_EDGE == 'Z' ? response.data.item.ECI_CODE : 0];
            setTimeout(function () {
                /*
                if (store.get('USER_INFO') && store.get('USER_INFO').USER_EMAIL_ID && store.get('USER_INFO').USER_EMAIL_ID.length > 0) {
                    gtmAddproduct($scope.pro_item.ECI_DESC, store.get('USER_INFO').USER_EMAIL_ID,$scope);
                }*/

                if ($scope.cont_step.length > 0 && matrial_id) {
                    $scope.controlSection($scope.cont_step[1]);
                }

            }, 100);
            // $('#loader_div').hide();
            // $('#loader_div').show();
            //  console.log(response.data);
            $scope.current_prod_name = $scope.pro_item.ECI_DESC;
            $scope.item_pro_name = $scope.pro_item.ECI_DESC;
            // $scope.item_selected = $scope.pro_item.length > 0 ? $scope.pro_item[0].ECI_CODE : '';
            $scope.item_selected = ECI_CODE;
            $scope.itemProduct_array[0] = $scope.pro_item.ECI_ECP_CODE;
            $scope.itemProduct_array[1] = $scope.pro_item.ECI_CODE;
            $scope.item_id = $scope.item_selected;
            $scope.object_info = response.data.object_info;
            //$scope.prod_mat_width = response.data.material_info ? response.data.material_info.ECM_WIDTH : 0;
            $scope.prod_mat_width = $scope.pro_item?$scope.pro_item.ECI_MAX_WIDTH:0;
            threeJS.objectLoad(response.data.object_info, function () {

                // var material = {ECM_IMAGE_PATH: response.data.object_info[0].OBJ_MAIN_TEXTURE_PATH}

                var material = response.data.material_info ? response.data.material_info : { ECM_IMAGE_PATH: response.data.object_info[0].OBJ_MAIN_TEXTURE_PATH };
                /*if (matrial_id) {
                    $scope.colorSection(material, $scope.cont_step[1]);
                } else {
                    $scope.matrial_width = material.ECM_WIDTH ? material.ECM_WIDTH - 40 : 0;
                    threeJS.updateTextureImg(material);
                }*/
                if(!matrial_id){
                    $scope.matrial_width = material.ECM_WIDTH ? material.ECM_WIDTH : 0;
                    threeJS.updateTextureImg(material);
                }

                
                angular.forEach($scope.cont_step, function (e,i) {
                    if(e.EIS_PAGE_ID=='1'){
                        //console.log($scope.cont_step[i]);
                        $scope.controlSection($scope.cont_step[i]);
                    }
                    if(matrial_id && e.ECS_CODE=='102'){
                        setTimeout(function () {
                           // console.log(material);
                            $scope.colorSection(material, e);
                        }, '100');
                    }

                });
                
                if (cart_id.length > 1) {
                    $scope.item_selected = $scope.edit_cart_info.step_item_list[11] ? $scope.edit_cart_info.step_item_list[11].ECI_CODE : '';
                    $scope.itemProduct_array[1] = $scope.edit_cart_info.step_item_list[11] ? $scope.edit_cart_info.step_item_list[11].ECI_CODE : 0;
                    $scope.item_id = $scope.item_selected;

                    setTimeout(function () {
                        $scope.CartEdit();
                    }, '50');
                }else{

                    setTimeout(function () {
                        if($scope.default_step_val && $scope.default_step_val.length>1){
                            angular.forEach($scope.default_step_val, function (item) {
                                angular.forEach(item, function (parent_step) {
                                    if(parent_step && parent_step.child){
                                        $scope.findLastChild(parent_step);
                                    }else{
                                        if(parent_step.ECS_CODE=='113'){
                                            $scope.roomTypeCode='U01';
                                            $scope.roomTypeValue=$translate.instant('Living Room');
                                            $scope.roomDescription=$translate.instant('Default');
                                            $scope.itemProduct_array[113] = [$scope.roomDescription, $scope.roomTypeValue];

                                            var step_obj2 = {
                                                'remarks': $scope.roomDescription,
                                                'option_desc': $scope.roomTypeValue,
                                                'option_code': $scope.roomTypeCode,
                                                'value': $scope.roomDescription,
                                            };
                                            $('.desc113').html($scope.roomTypeValue);
                                            $scope.step_array[parent_step.EIS_ECS_CODE] = angular.merge({}, $scope.step_array_obj(parent_step), step_obj2);
                                            $scope.itemSelection();
                                        }else{
                                            $scope.defaultStep(item); 
                                        }
                                        
                                    }
                                });
                            });
                        }
                    }, 1000);

                }

                // $(".footerHide").show();
            });
            setTimeout(function () {
                $('#loader_div').hide();
                if ($scope.pro_item.ECI_QTY_CALCULATION_TYPE == 'BOTH') {
                    $('#107_title').text($scope.step_text);
                    ///console.log($scope.step_text);
                }

               if($scope.advanced_custonize_pro && $scope.advanced_custonize_pro.indexOf($scope.category_code)>=0){
                $('.all_steps.default_step_cat .panel-heading a').on('click',function(e){
                 $(this).parents('.panel').children('.panel-collapse').addClass('in')
                });
            }

            }, 3000);
            $('.control_section.right-side-tab').height(window.innerHeight - 100);
            $scope.filter(1);
            
        }	

    });
    $scope.findLastChild=function(data){
        angular.forEach(data.child, function (item) {
            if(item && item.child){
                $scope.findLastChild(item);
            }
        }); 
        $scope.defaultStep(data); 
    }

        $scope.defaultStep=function(parent_step){
            angular.forEach(parent_step.child, function (child_step) {                      
               
               if(parent_step.EIS_DEFAULT_VALUE==child_step.EIS_SYS_ID){
                switch (parseInt(child_step.EIS_ECS_CODE)) {
                    case 1660:					//Border 
                        $scope.borderSection(child_step,parent_step);
                        break;                 
                    case 1940:					//Glass section
                        $scope.glassOption(child_step,parent_step);
                        break;
                    case 109128:					//Lining Option section
                        $scope.glassOption(child_step,parent_step);
                        break;
                    case 109126:
                        $scope.tiebelt(child_step,parent_step);
                        break;
                    case 2025:					//Base type
                        $scope.baseType(child_step,parent_step);
                        break;
                    case 2912:					//Tilter Type
                        $scope.tilterType(child_step,parent_step);
                        break;
                    case 2913:					//Opening Direction
                        $scope.openingDirection(child_step,parent_step);
                        break;
                    case 7104:					//Surface
                        $scope.surface(child_step,parent_step);
                        break;
                    case 7108:					//Material Surface
                        $scope.installationFunction(child_step,parent_step);
                        break;
                    case 60272:					//Panel Blind Track (Panel Blind Rail)
                        $scope.panelTrack(child_step,parent_step);
                        break;
                    case 133856:					//Type of Material
                        $scope.type_of_material(child_step,parent_step);
                        break;
                    case 2027:				    //Operating Side
                        $scope.manualControl(child_step,parent_step);
                        break; 
					case 109:					//Control Type**
                        $scope.controlType(child_step,parent_step, 'direct');
                        break;
					case 1480:					//valance
                        $scope.valance(child_step,parent_step);
                        break;
                     case 106:					//Mounting Option**
                       $scope.mountOption(child_step, parent_step) ;
                        break;
                     case 108:					//rollType
                        $scope.rollType(child_step,parent_step);
                        break;
                     case 110:					//Bottom Bar Option**
                       $scope.bottomType(child_step, parent_step) ;
                        break;


                    case 113:					//Mounting Option**
                        $scope.defaultItemLabel(child_step) ;
                         break;
                    default:
                }
            }
             
            });
        
        }
$scope.stepSelection=function(child_step, parent_step){
    
    console.log(child_step.EIS_ECS_CODE);
    switch (parseInt(child_step.EIS_ECS_CODE)) {
        case 2027:					//Manual Position 
            $scope.manualControl(child_step,parent_step);
            break;                 
        case 3283:					//motor Position section
            $scope.motorPosition(child_step,parent_step);
            break;
        case 4068:					//typeOfMotor Option section
            $scope.typeOfMotor(child_step, parent_step, 'direct')
            break;
        default:
            console.log('here..');
            console.log(child_step.EIS_ECS_CODE);
            break;
    }
    
}

    $scope.toggle = function () {
        $scope.state = !$scope.state;
        $scope.panel_arrow = !$scope.panel_arrow;
        $scope.fadeAnimation = false;
        $('.control_section.right-side-tab').height(window.innerHeight - 100);
    };
    $scope.menuClass = function (page) {
        var current = $location.path().substring(1);
        return page === current ? "active" : "";
    };
    $scope.CartButton = function () {
        $scope.addMore = false;
    };
    $scope.movingPlay = function () {
        threeJS.movingPlay();
    };


    $scope.stepScroll = function () {
        var incr = 50;
        incr += 50;
        var x = $(".step_tool").scrollTop() + incr;

        $('.step_tool').animate({
            scrollTop: x
        }, 800);
    };
    $scope.advanceStep=function(){
        $('.step_tool').animate({
            scrollTop: $(".step_tool").scrollTop()+400
        }, 800);
    }
    var next_val=4;
$scope.styleOfProNext=function(type){
var n=1;
var list_lenth=$('.style_curtain').length

    if(type=='next' && list_lenth>next_val){
        next_val=next_val+4;
        var m=next_val>=list_lenth?list_lenth:next_val;
        for(i=4;i<m;i++){
            $('.style_curtain.list'+i).removeClass('hide');
            
            
           var k=i-4;
            $('.style_curtain.list'+k).addClass('hide'); 
            //  $('.style_curtain.list'+eval(k+1)).addClass('hide'); 
            //$('.style_curtain.list'+eval(k+2)).addClass('hide');  
            //$('.style_curtain.list'+eval(k+3)).addClass('hide');    
        }
    }

    if(type=='prev' && next_val>4){
        next_val=next_val-4;
        var m=next_val>=list_lenth?list_lenth:next_val;
        for(i=0;i<m;i++){
            $('.style_curtain.list'+i).removeClass('hide');
            var k=i+4;
             $('.style_curtain.list'+k).addClass('hide');
        }

    }


    
}
   

    $rootScope.controlSection = function (setp_obj) {
        $scope.scrollBusy = true;
        if (['5965','134268','5950'].indexOf($scope.category_code) >= 0) {

            $scope.filterArray['color'] = $rootScope.filterArray != undefined ? $rootScope.filterArray['color'][0] : [];
        }
        $scope.collectionGroup = {};
        $scope.familyGroup = {}
        $scope.familyCount = 0;
            $scope.showLoadmore = false;
            if (setp_obj == 'item') {
                $scope.template = $scope.temp_path + 'tool/item.html?v='+version;
                $scope.step_selected = 'item';
                return true;
            }
            var step_id = setp_obj.EIS_ECS_CODE;
            // if(setp_obj.ECS_CODE==$scope.step_selected){
            //     console.log('7');
            //     return true;
            // }
            if ($scope.cart_id == '' && $scope.advanced_custonize_pro && $scope.advanced_custonize_pro.indexOf($scope.category_code) == -1) {

                $scope.nextstep(setp_obj, $scope.cont_step);
            }
            $scope.dataResponse = [];
            var start_page = 0;
            var per_page = 20;
            //console.log($scope);
            var step_option = ($scope.type_of_material_selected != undefined) && (step_id == 102) ? $scope.type_of_material_selected : ''; 
            $scope.ColorloaderShowHide = false;
            $scope.setp_info = setp_obj;
            $scope.step_selected = setp_obj.ECS_CODE;
            if(['5964','5957','5965','68243','5941','5978','5954'].indexOf($scope.category_code)>=0){
                $scope.filterArray['m_width'] = '';
            }

            $scope.filterArray['search'] = $('#material_search').val() != undefined ? $('#material_search').val() : '';


            $http({
                method: 'POST',
                url:service_url + 'ShowroomApi/stepSection',
                data:$.param({ 
                    cache: true, item_id: 
                    $scope.item_id, 
                    step_id: step_id, 
                    system_id: setp_obj.EIS_SYS_ID, 
                    eis_code: setp_obj.EIS_CODE, 
                    collection_id: $scope.collection_selected, 
                    base_type: $scope.base_selected, 
                    start_page: start_page, 
                    per_page: per_page, 
                    filterArray: $scope.filterArray, 
                    matrial_id: matrial_id, 
                    material_code: $scope.BorderFamily_selected, 
                    step_option_Code: step_option, 
                    user_sys_id : $scope.user_sys_id}),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function (response) {
                $scope.dataResponse = response.data.data;
                if (step_id != 102 && $scope.advanced_custonize_pro && $scope.advanced_custonize_pro.indexOf($scope.category_code) >= 0) {

                    $scope.stepScroll();
                }

                switch (parseInt(step_id)) {
                    case 101:					//Choose Collection
                        $scope.midd101 = $scope.dataResponse;
                        break;
                    case 102:					//Color & Material
                        $scope.familyCount = response.data.familyGroup_count[0].FAMILY_COUNT;
                        $scope.showLoadmore = false;
                        $scope.familyGroup = response.data.familyGroup;

                        $scope.colorPost_data['item_id'] = $scope.item_id;
                        $scope.colorPost_data['start_page'] = per_page;
                        $scope.colorPost_data['per_page'] = 20;
                        $scope.colorPost_data['step_id'] = step_id;
                        $scope.colorPost_data['system_id'] = setp_obj.EIS_SYS_ID;
                        $scope.colorPost_data['step_id'] = setp_obj.EIS_CODE;

                        if($scope.filterArray['tag'] != 'Sale'){
                            angular.forEach(response.data.familyGroup, function (item) {
                              //  $scope.freesample_addtocart(item);

                                if($scope.collectionGroup[item.ECC_DESC]==undefined){
                                    $scope.collectionGroup[item.ECC_DESC]=[];
                                    $scope.collectionGroup[item.ECC_DESC][0]=item;
                                }else{
                                    $scope.collectionGroup[item.ECC_DESC].push(item);
                                }
                               
                            });

                            //console.log($scope.collectionGroup);
                        }
                    
                    break;
                    case 106:					//Mounting Option
                        $scope.midd106 = $scope.dataResponse;
                        // angular.forEach($scope.midd106, function (e) {
                        //     if (e.EIS_CODE == 'MT01' && quick_status) {
                        // 	$scope.mountOption(e);
                        //     }
                        // });
                        break;
                    case 107:					//Measurement
                        $scope.midd107 = $scope.dataResponse;
                        if ($scope.measurement_width.value > 0 && $scope.measurement_height.value > 0) {
                            $scope.recommend = false;
                        } else {
                            $scope.recommend = true;
                        }

                        break;
                    case 134602:					//Measurement
                        $scope.midd107 = $scope.dataResponse;
                        if ($scope.measurement_width.value > 0 && $scope.measurement_height.value > 0) {
                            $scope.recommend = false;
                        } else {
                            $scope.recommend = true;
                        }

                        break;
                    case 108:					//Roll Type
                        $scope.midd108 = $scope.dataResponse;
                        break;
                    case 109:					//Control Type
                        $scope.midd109 = $scope.dataResponse;
                        break;
                    case 110:					//Bottom Bar
                        $scope.midd110 = $scope.dataResponse;
                        break;
                    case 111:					//Add-On
                        $scope.midd111 = $scope.dataResponse;
                        break;
                    case 113:					//Label
                        $scope.midd113 = $scope.dataResponse;
                        break;
                    case 1480:					//valance
                        $scope.midd1480 = $scope.dataResponse;
                    case 2915:					//cornice
                        $scope.midd2915 = $scope.dataResponse;
                        break;
                    case 1660:					//Border
                        $scope.midd1660 = $scope.dataResponse;
                        break;
                    case 1940:					//Glass Option
                        $scope.midd1940 = $scope.dataResponse;
                        break;
                    case 6572:					//Glass Color
                        $scope.midd6572 = $scope.dataResponse;
                        break;
                    case 2024:					//Installation Surface
                        $scope.midd2024 = $scope.dataResponse;
                        break;
                    case 2025:					//Base
                        $scope.midd2025 = $scope.dataResponse;
                        break;
                    case 2026:					//Track Type
                        $scope.midd2026 = $scope.dataResponse;
                        break;
                    case 2027:					//Operating Side
                        $scope.midd2027 = $scope.dataResponse;
                        break;
                    case 2028:					//Add-on 2
                        $scope.midd2028 = $scope.dataResponse;
                        break;
                    case 2912:					//Tilter Type
                        $scope.midd2912 = $scope.dataResponse;
                        break;
                    case 2913:					//Opening Direction
                        $scope.midd2913 = $scope.dataResponse;
                        break;
                    case 4068:					//Type of motor
                        $scope.midd4068 = $scope.dataResponse;
                        break;
                    case 3283:					//Motor Position
                        $scope.midd3283 = $scope.dataResponse;
                        break;
                    case 5740:					//Window Depth
                        $scope.child_step = $scope.dataResponse;
                        break;
                    case 5745:					//Type of Remote
                        $scope.midd5745 = $scope.dataResponse;
                        break;
                    case 6843:					//Type of Remote
                        $scope.midd6843 = $scope.dataResponse;
                        break;
                    case 6844:					//Type of Remote
                        $scope.midd6844 = $scope.dataResponse;
                        break;
                    case 5747:					//Type of Remote
                        $scope.child_step = $scope.dataResponse;
                        break;
                    case 7459:					//Type of Arms(Canopy)
                        $scope.midd7459 = $scope.dataResponse;
                        break;
                    case 60272:					//Panel Blind Track (Panel Rail)
                        $scope.midd60272 = $scope.dataResponse;
                        break;
                    case 63990:					//Glue
                        $scope.midd63990 = $scope.dataResponse;
                        break;
                    case 66774:					//Gathring
                        $scope.midd66774 = $scope.dataResponse;
                        break;
                    /*case 66773:					//Lining Option(test server)
                        $scope.midd66773 = $scope.dataResponse;
                        break;*/
                    case 109128:					//Lining Option(live server)
                        $scope.midd66773 = $scope.dataResponse;
                        break;
                    case 169790:					//Trimming Option test
                        $scope.midd68069 = $scope.dataResponse;
                        break;
                    case 109667:					//Trimming Option live
                        $scope.midd68069 = $scope.dataResponse;
                        break;
                    case 133762:					//Door Frame option(test server)
                        $scope.midd170489 = $scope.dataResponse;
                        break;
                    case 133765:					//Door Frame option(live server)
                        $scope.midd170489 = $scope.dataResponse;
                        break;
                    case 109126:					//Tiebelt option(live server)
                        $scope.midd68085 = $scope.dataResponse;
                        break;
                    case 133856:					//Type of Material
                        $scope.midd133856 = $scope.dataResponse;
                        break;
                    case 134111:					//Track Option test
                        $scope.midd134111 = $scope.dataResponse;
                        break;  
                    case 134479:					//Track Option Live
                        $scope.midd134111 = $scope.dataResponse;
                        break;   
                    case 134191:					//Style of Curtains 
                        $scope.midd134191 = $scope.dataResponse;

                /*
                        $scope.style_of_proList='';
                        for (var property in $scope.dataResponse) {
                            $scope.style_of_proList=$scope.dataResponse[property];
                        }
                
                        $scope.style_of_proList.child=dataGroupObj($scope.style_of_proList.child, 3);
                    */

                        setTimeout(function () {
                            angular.forEach($scope.midd134191, function (item) {
                                angular.forEach(item.child, function (child) {
                                    if($scope.pro_item.ECI_CODE==child.EIS_CODE){
                                        var style_of_curtainID='.desc'+child.EIS_ECS_CODE;
                                        $(style_of_curtainID).html(child.EIS_DESC);
                                        $scope.itemProduct_array[child.EIS_ECS_CODE] = [child.ECS_DESC, child.EIS_DESC]; 
                                        $scope.step_array[child.EIS_ECS_CODE] = angular.merge({}, $scope.step_array_obj(child));
                                        $scope.itemSelection();
                                    }
                                });
                            });
                           
                             
                        },2000);
                        break;  
                        case 134490:					//Style of Curtains 
                        $scope.midd134191 = $scope.dataResponse;

                        setTimeout(function () {
                            angular.forEach($scope.midd134191, function (item) {
                                angular.forEach(item.child, function (child) {
                                    if($scope.pro_item.ECI_CODE==child.EIS_CODE){
                                        var style_of_curtainID='.desc'+child.EIS_ECS_CODE;
                                        $(style_of_curtainID).html(child.EIS_DESC);
                                        $scope.itemProduct_array[child.EIS_ECS_CODE] = [child.ECS_DESC, child.EIS_DESC]; 
                                        $scope.step_array[child.EIS_ECS_CODE] = angular.merge({}, $scope.step_array_obj(child));
                                        $scope.itemSelection();
                                    }
                                });
                            });
                           
                             
                        },2000);
                        

                        break;
                        
                    default:
                        $scope.midd = $scope.dataResponse;
                        break;
                }

                $scope.scrollBusy = false;
                $scope.ColorloaderShowHide = true;
            });
            //}
            //};












           // console.log($scope.step_array);

            $('.desc111').find('i').remove();
            $('.desc133856').find('i').remove();
            // $scope.loadMore();
        
    };

    $scope.loadMoreColor = function (collection_id, index) {
        $scope.load_more[collection_id] = false;
        $('#search_matrialID').val('');
        var start_page = $scope.midd102[index].color.length + 1;
        var per_page = $scope.midd102[index].color.length + 9;
        $http.post(service_url + 'ShowroomApi/loadMoreColor',
            { cache: true, item_id: $scope.item_id, collection_id: collection_id, start_page: start_page, per_page: per_page, filterArray: $scope.filterArray }
        ).then(function (response) {
            for (var i = 0; i < response.data.data.length; i++) {
                $scope.midd102[index].color.push(response.data.data[i]);
            }
            if (response.data.data.length < 9) {
                $scope.load_more[collection_id] = true;
            }
        });
    };
    $scope.loadMoreValanceColor = function () {
        var collection_id = $scope.filterArray.collection.join();
        $('#search_matrialID').val('');
        var start_page = $scope.color_data1480.length + 1;
        var per_page = $scope.color_data1480.length + 9;
                
        $http({
            method: 'POST',
            url:service_url + 'ShowroomApi/loadMoreColor',
            data:$.param({
                item_id: $scope.item_id, 
                collection_id: collection_id, 
                start_page: start_page, 
                per_page: per_page, 
                filterArray: $scope.filterArray 
            }),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function (response) {
            for (var i = 0; i < response.data.data.length; i++) {
                $scope.color_data1480.push(response.data.data[i]);
            }
            $scope.load_more_valance = response.data.data.length < 9 ? true : false;
        });
    };
   
    $scope.colorstep = function ($postData) {

        $scope.showLoadmore = true;
       
        $http({
            method: 'POST',
            url:service_url + 'ShowroomApi/colorstep',
            data:$.param({
                data: $postData, 
                filterArray: $scope.filterArray,
                user_sys_id : $scope.user_sys_id 
            }),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function (response) {
            if (response.data.status) {
                $scope.colorPost_data['start_page'] += $scope.colorPost_data['per_page'];
                $scope.showLoadmore = false;   

                
                if($scope.filterArray['tag'] != 'Sale'){
                    angular.forEach(response.data.familyGroup, function (item) {
                        //$scope.freesample_addtocart(item);

                        if($scope.collectionGroup[item.ECC_DESC]==undefined){
                            $scope.collectionGroup[item.ECC_DESC]=[];
                            $scope.collectionGroup[item.ECC_DESC][0]=item;
                            
                        }else{
                            $scope.collectionGroup[item.ECC_DESC].push(item);
                        }
                    });
                }else{
                    $scope.familyCount = response.data.familyGroup_count[0].FAMILY_COUNT;

                    angular.forEach(response.data.familyGroup, function (item) {
                        $scope.familyGroup.push(item);
                    });
                }
            
          
            }
        });
    }
       
    

    $scope.loadMore_colorstep = function (step_code) {
        
        if($('#'+step_code).children('.panel-collapse').hasClass('in') == true){

            if ($scope.colorstep_totalcoll >= $scope.colorstep_perPage && collection_ajax == true) {
                collection_ajax = false;
                post_data['start_page'] = $scope.colorstep_perPage;
                $scope.colorstep(post_data);
            }
        }else{
            $scope.colorstep_perPage = 18;
        }
    };


    $scope.searchMatrial = function () {
        //    $scope.load_more = true;
        var search_matrial = $('#search_matrialID').val().replace(/ /g, "");
        if (search_matrial.length > 1) {
            $http({
                method: 'POST',
                url:service_url + 'ShowroomApi/searchMatrial',
                data:$.param({
                    item_id: $scope.item_id, 
                    filterArray: $scope.filterArray
                }),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function (response) {
                $scope.midd102 = response.data.data;
                $scope.status = response.data.status;
                for (var i = 0; i < response.data.data.length; i++) {
                    //console.log($scope.midd102[i].ECC_CODE);
                    $scope.load_more[$scope.midd102[i].ECC_CODE] = true;
                }
            });
        }
    };
    

    $scope.familyInd = {};
  

    $scope.loadMaterial = function (ecc_code, prod_code, index) {
        $scope.materialLoadmore = true;
        console.log($scope.mat_row);
        console.log(ecc_code);
        console.log($scope.mat_row[ecc_code]);
        $http.post(service_url + 'ShowroomApi/materialIfCode/' + ecc_code + '/' + prod_code + '/' + $scope.mat_row[ecc_code] + '/' + $scope.mat_perpage, {
            cache: true
        }).then(function successCallback(response) {
            //console.log(response.data.material);
            $scope.totalmat = response.data.MATERIAL_COUNT.MATERIAL_COUNT;
            if (response.data.material != '') {
                // Increment row position
                $scope.materialLoadmore = false;
                $scope.mat_row[ecc_code] += $scope.mat_perpage;
                if ($scope.collection[index].material != undefined) {
                    // Set Delay
                    setTimeout(function () {
                        $scope.$apply(function () {
                            // Append data to $scope.collection
                            angular.forEach(response.data.material, function (item) {
                                //$scope.material.push(item);
                                $scope.collection[index].material.push(item);
                                collection_ajax = true;
                                
                            });
                        });
                    }, 500);
                } else {
                    $scope.collection[index].material = response.data.material;
                }
            } else {
                $scope.materialLoadmore = false;
                $('.more' + ecc_code).hide();
            }
        });
    };
   
    $scope.itemSection = function (obj) {
        if ($scope.item_selected == obj.ECI_CODE) {
            //console.log('Same product...');
            return false;
        }
        $scope.wireLength = '';
        $scope.price = {};
        //$scope.price_array[1] = 0;
        $scope.price_array = {};
        $scope.itemProduct_array = {};
        $scope.step_array = {};
        $scope.collection_selected = '';
        $scope.color_selected = '';
        $scope.border_selected = '';
        $scope.borderColor_selected = '';
        $scope.mount_selected = '';
        $scope.control_selected = '';
        $scope.track_option.name='';
        $scope.motorPositionValue.name='';
        $scope.motorized.name='';
        $scope.roll_selected = '';
        $scope.bottom_selected = '';
        $scope.valance_selected = '';
        $scope.valanceColor_selected = '';
        $scope.base_selected = '';
        $scope.base_desc = 'Two Way';
        $scope.manual_control_selected = '';
        $scope.itemProduct_array[0] = obj.ECI_ECP_CODE;
        $scope.itemProduct_array[1] = obj.ECI_CODE;
        $scope.item_id = obj.ECI_CODE;
        $scope.item_selected = obj.ECI_CODE;
        $scope.item_pro_name = obj.ECI_DESC;
        $scope.lining_option_yn='Y';
        $scope.border_option_yn='Y';
        //  $scope.middletemplate = '';
        $http.post(service_url + 'ShowroomApi/getStep',
            { ECI_CODE: obj.ECI_CODE, cache: true }
        ).then(function (response) {
            $scope.cont_step = response.data.data;
            $scope.object_info = response.data.object_info;
            threeJS.objectLoad(response.data.object_info, function () {
                var material = response.data.material_info ? response.data.material_info : { ECM_IMAGE_PATH: response.data.object_info[0].OBJ_MAIN_TEXTURE_PATH }
                //    console.log(material);
                $scope.matrial_width = material.ECM_WIDTH ? material.ECM_WIDTH : 0;
                threeJS.updateTextureImg(material);
                response.data.light_info.length > 0 ? threeJS.light(response.data.light_info, material.ECM_LIGHT_INTENSITY) : '';
                //threeJS.allSceanType();
                //   threeJS.rollType(response.data.object_info[0].OBJ_TYPE);
            });
            $('#loader_div').hide();
        });
        $scope.priceCalculate();
        $scope.navigation = true;
    };

    $scope.filter = function (type) {
        $scope.selectedIndex = type;
        if (!$scope.brand_list) {

            

            $http({
                method: 'POST',
                url:service_url + 'ecommerce/filter',
                data:$.param( { ECI_CODE: ECI_CODE, ECI_ECP_CODE: $scope.itemProduct_array[0],ECC_CODE:$location.search().ecc_code ? $location.search().ecc_code.split(',') : '', cache: true }),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function (response) {
                $scope.brand_list = response.data.brand_list;
                $scope.color_list = response.data.color_list;
                $scope.material_list = response.data.material_list;
                $scope.pattern_list = response.data.pattern_list;
                $scope.collection_list = response.data.collection_list;
               
               
                // $scope.price_band = [];
                // angular.forEach($scope.price_range, function (i, key) {
                //    $scope.price_band = $scope.price_band.concat("'"+i.PRB_BAND_CODE+"'");
                //    //$scope.price_band = $scope.price_band.concat(i.PRB_BAND_CODE);
                   
                // });
                
            });
        }
        return true;
    };
    $scope.filterSection = function (item_code, type, priceRangeType = '') {

        $scope.priceRangeBtn = priceRangeType == 'price_range' ?  false : true;

        

        $('.price-range-slider').css('cursor', 'none');
        if (['5965','134268','5950'].indexOf($scope.category_code) >= 0) {

            $scope.filterArray[type] = item_code;
        }else{
            if ($scope.filterArray[type].indexOf(item_code) >= 0) {
                var index = $scope.filterArray[type].indexOf(item_code);
                if (index !== -1)
                    $scope.filterArray[type].splice(index, 1);
            } else {
                $scope.filterArray[type].push(item_code);
            }
        }

        $('.all_steps').children('.collapsing').removeClass('in').attr('style', 'height:0');
        
        if ($scope.advanced_custonize_pro && $scope.advanced_custonize_pro.indexOf($scope.category_code) > -1) {

            
            setTimeout(function () {
            angular.forEach($scope.cont_step, function (e,i) {
                if(e.ECS_CODE=='102'){
                    $scope.controlSection(e);
                    //console.log(e);
                }
            });
        },500);
        }
    };

    $scope.clearRange = function(){
        $scope.priceRangeBtn = true;
        $('.price-range-slider').css('cursor', 'auto');
        $scope.filterArray['price_range'] = [];

        angular.forEach($scope.cont_step, function (e,i) {
            if(e.ECS_CODE=='102'){
                $scope.controlSection(e);
            }
        });
    }

    $scope.removeFilterList = function ($list, $id) {
        $.each($list, function (i, e) {
            if (e == $id) {
                $list.splice(i, 1);
                return true;
            }
        });
    };
    $scope.collection = function (item) {
        if ($scope.collection_selected === item.ECC_CODE) {
            return true;
        }
        $scope.itemProduct_array[item.ECC_ECS_CODE] = item.ECC_CODE;
        //$scope.price_array[item.ECC_ECS_CODE] = 0;
        $scope.collection_selected = item.ECC_CODE;
        $scope.collection_desc = item.ECC_DESC;
        $('.desc' + item.ECC_ECS_CODE).find('i').remove();
        // $('.desc111,.desc1480,.desc3247,.desc2914').find('i').remove();
        $('.desc111').find('i').remove();
        $('.desc' + item.ECC_ECS_CODE).text(item.ECC_DESC);
        $scope.itemSelection();
        //Color section reset
        $scope.color_selected = '';
        $('.desc102').text('');
        $scope.cont_step[0].isOpen = false;
        $scope.cont_step[1].isOpen = true;
        setTimeout(function () {
            $scope.controlSection($scope.cont_step[1]);
            console.log($scope.cont_step[1]);
        }, 100);
    };
    $scope.singleMat = '';
    //$scope.material_offer = 0;
    $scope.material_price = 0;
    $scope.material_price_was = 0;

    $scope.colorSectionPopup=function(){

        $scope.color102='';
        angular.forEach($scope.cont_step, function (e,i) {
           
            if(e.ECS_CODE=='102'){
                $scope.color102=e;
                $scope.controlSection(e);
            }
        });

        var options = {
            templateUrl: $scope.temp_path + 'popup/color_section_popup.html?v='+version,
            scope: $scope,
           // size: 'small',
            onEscape: true,
            backdrop: true,
            title: $translate.instant('color_section'),
            className: 'colorSection_popup',
           
        };
        $ngBootbox.customDialog(options); 
        
        setTimeout(function () {
               $('.modalColorPop').click();

            
               $('#freeDeliveryWithInst').on('click',function(){
                   console.log($scope.color102);
                
                if($scope.filterArray['free_del_with_inst']=='Y'){
                    $scope.filterArray['free_del_with_inst'] = 'N';
                }else{
                    $scope.filterArray['free_del_with_inst'] = 'Y';
                }
              //  $scope.swatchCollection($scope.prodCode, $scope.product_desc, 'direct');
              $scope.controlSection($scope.color102);

               });
        }, 2500);
    }; 
  
    $scope.colorSection = function (pro_obj, parent_step, type, colorSingle) {
        
        $('.material_popup').modal('hide');
        
        if($scope.familyInd[pro_obj.ECM_CODE] == undefined){
            var tileNum = 'NA';
        }else{
            var tileNum = $scope.familyInd[pro_obj.ECM_CODE];
        }
        
        if(tileNum == 'NA'){
            var pro_obj = pro_obj;
        }else{
            if(type == 'liswatch'){
                var pro_obj = pro_obj;
            }else{
                var pro_obj = pro_obj.family[tileNum];
            }
        }
      


        $scope.material_price = pro_obj.PRICE;
        $scope.material_price_was = pro_obj.PRICE_WAS;
        $scope.ECM_LENGTH=pro_obj.ECM_LENGTH?pro_obj.ECM_LENGTH:0;

     //   $scope.mat_width = pro_obj.ECM_WIDTH;

        $scope.lining_option_yn=pro_obj.LINING_APP_YN ?pro_obj.LINING_APP_YN :'N';
        $scope.border_option_yn=pro_obj.BORDER_APP_YN?pro_obj.BORDER_APP_YN:'N';

        if($scope.advanced_custonize_pro && $scope.advanced_custonize_pro.indexOf($scope.category_code) >= 0 && $scope.lining_option_yn=='N' && $scope.glassOption_selected!='LIN01'){
            angular.forEach($scope.midd66773, function (parent_item) {
                angular.forEach(parent_item.child,function(child_item){
                    if(child_item.EIS_CODE=='LIN01'){
                        console.log('here..');
                        $scope.glassOption(child_item,parent_item);
                    }
                });
            });
           // delete $scope.step_array[109128];
            //delete $scope.price_array[109128];
           // $scope.glassOption_selected ='';
            //$ngBootbox.alert($translate.instant('lining_option_mgs'));          
        }

      
           
        if($scope.advanced_custonize_pro && $scope.advanced_custonize_pro.indexOf($scope.category_code) >= 0 && $scope.border_selected && $scope.border_option_yn=='N' && $scope.border_selected!='BOR02'){
            delete $scope.step_array[1660];
            delete $scope.price_array[1660];
            $('.desc1660').html('');
            $scope.border_selected='';
            $ngBootbox.alert($translate.instant('border_option_mgs'));
        }

        $scope.mat_prod_max_height = pro_obj.ECM_PRODUCT_MAX_HEIGHT;
        if ($scope.mat_prod_max_height != null) {

            $scope.eci_max_height = $scope.mat_prod_max_height;
        } else {
            $scope.eci_max_height = $scope.max_height;
        }


        $scope.matrial_width = pro_obj.ECM_WIDTH;
        if ($scope.color_selected === pro_obj.ECM_CODE) {
            return true;
        }

        $('.desc102').text(pro_obj.ITEM_ID);
        threeJS.updateTextureImg(pro_obj);
        pro_obj.hasOwnProperty('light_info') && pro_obj.light_info.length > 0 ? threeJS.light(pro_obj.light_info, pro_obj.ECM_LIGHT_INTENSITY) : '';
        $scope.color_selected = pro_obj.ECM_CODE;
        $scope.BorderFamily_selected = pro_obj.ECM_BORDER_FAMILY;
        setTimeout(function () {
            //var actMat = colorSingle == undefined ? pro_obj.ECM_CODE : colorSingle;
            $('.productTile .item').removeClass('active_icon');
            $('.act' + colorSingle).addClass('active_icon');
        }, 200);
        $scope.collection_selected = pro_obj.ECM_ECC_CODE;
        var m_error = '<i class="fas fa-exclamation" style="font-size: 10px !important;color: red;" title="Measurement"></i>';
        if ($scope.measurement_width.value != '' && $scope.measurement_height.value != '') {
         
            if($scope.measurement_data){
                setTimeout(function () {
                    $scope.measurementFunc($scope.measurement_data);
                },1000);

            }else{
                $('.desc107').html(m_error);
                $scope.measurement_width.value = '';
                $scope.measurement_height.value = '';
            }
          
        }
        $scope.wallprod = ['1143108', '1152446', '1143221', '1143181', '1152442', '1152443', '1152440', '1152438', '1216599'];
        
        var step_obj2 = {
            'option_desc': pro_obj.ITEM_ID,
            'item_code': pro_obj.ECM_CODE,
            'collection': pro_obj.ECM_ECC_CODE,
            'item': pro_obj.ECM_ECI_CODE,
            'price': $scope.price, //pro_obj.ECM_PRICE_BASIC * 1,
            'desc': pro_obj.ECM_DESC,
            'uom': pro_obj.ECM_UOM_CODE,
            'ordering': parent_step.EIS_ORDERING,
            'parent_ordering': 0,
            'data_source': parent_step.ECS_DATA_SOURCE,
            'pcs': '', //parseFloat($scope.qty.value),
            'qty_pcs': parseFloat($scope.qty.value),
            'offer': parseFloat(pro_obj.PRICE_OFFER_PCT),
            'price_was': parseFloat(pro_obj.PRICE_WAS),
            'material_price': parseFloat(pro_obj.PRICE)
        };

        $scope.step_array[parent_step.EIS_ECS_CODE] = angular.merge({}, $scope.step_array_obj(pro_obj, parent_step), step_obj2);
        
        var step107 = $scope.cont_step.filter(function (item) {
            return item.EIS_ECS_CODE === '107';
        })[0];

        var step107_obj2 = {
            'width': $scope.measurement_width.value,
            'height': $scope.measurement_height.value,
            'pcs': $scope.qty.value,
            'item_code': pro_obj.ECM_CODE
        };

        $scope.step_array[107] = angular.merge({}, $scope.step_array_obj(step107), step107_obj2);
        $scope.priceCalculate();
        $scope.itemSelection();

        if (pro_obj.ECM_ECI_CODE == '1143189') {
            $scope.StepOptionPrice(107, pro_obj.ECM_ECI_CODE, $scope.color_selected, '', 'NULL', 'NULL', '', '', '', '', $scope.qty.value, '', '', 'material', $scope.reserve_stock);
            threeJS.measurementText(pro_obj.ECM_WIDTH, pro_obj.ECM_LENGTH / 0.010000);
        }
        if ($scope.wallprod.indexOf(pro_obj.ECM_ECI_CODE) >= 0) {
            $scope.StepOptionPrice(107, pro_obj.ECM_ECI_CODE, $scope.color_selected, '', 'NULL', 'NULL', '', '', '', '', $scope.qty.value, '', '', 'material', $scope.reserve_stock);
        }
       
        $scope.select_material=$translate.instant('change_material');
    };
    $scope.step_array_obj = function (item, parent_step) {
        var step_object = {};
        if (parent_step == undefined) {
            step_object = {
                'step_id': item.EIS_SYS_ID ? item.EIS_SYS_ID : '',
                'step': item.EIS_CODE ? item.EIS_CODE : '',
                'step_desc': item.ECS_DESC ? item.ECS_DESC : '',
                'ordering': item.EIS_ORDERING ? item.EIS_ORDERING : '',
                'parent_ordering': 0,
                'price': '', //item.EIS_PRICE,
                'option_id': item.EIS_CODE ? item.EIS_CODE : '',
                //'option_desc': item.EIS_DESC ? item.EIS_DESC : '',
                'option_desc': item.EIS_DESC_EN ? item.EIS_DESC_EN : '',
                'parent_step': item.EIS_EIS_SYS_ID ? item.EIS_EIS_SYS_ID : '',
                'item': item.EIS_ECI_CODE ? item.EIS_ECI_CODE : '',
                'data_source': item.ECS_DATA_SOURCE ? item.ECS_DATA_SOURCE : '',
                'addon_step_code': item.EIS_ECS_CODE ? item.EIS_ECS_CODE : '',
                'desc': '',
                'was_price': '',
                'was_value': ''
            }
        } else {
            if (parent_step.ECS_CODE != 102) {
                $scope.stepScroll();
            }
            step_object = {
                'step_id': parent_step.EIS_SYS_ID ? parent_step.EIS_SYS_ID : '',
                'step': parent_step.EIS_CODE ? parent_step.EIS_CODE : '',
                //'step_desc': parent_step.EIS_DESC ? parent_step.EIS_DESC : '',
                'step_desc': parent_step.EIS_DESC_EN ? parent_step.EIS_DESC_EN : '',
                'ordering': item.EIS_ORDERING ? item.EIS_ORDERING : '',
                'parent_ordering': parent_step.EIS_ORDERING ? parent_step.EIS_ORDERING : '',
                'price': '', //item.EIS_PRICE,
                'option_id': item.EIS_CODE ? item.EIS_CODE : '',
                //'option_desc': item.EIS_DESC ? item.EIS_DESC : '',
                'option_desc': item.EIS_DESC_EN ? item.EIS_DESC_EN : '',
                'parent_step': parent_step.EIS_EIS_SYS_ID ? parent_step.EIS_EIS_SYS_ID : '',
                'item': item.EIS_ECI_CODE ? item.EIS_ECI_CODE : '',
                'data_source': item.ECS_DATA_SOURCE ? item.ECS_DATA_SOURCE : '',
                'addon_step_code': parent_step.ADDON_ECS_CODE ? parent_step.ADDON_ECS_CODE : '',
                'desc': '',
                'was_price': '',
                'was_value': ''

            }
        }
       // console.log($scope.step_array);
        return step_object;
    };
    $scope.borderSection = function (item, parent_step) {
       
        
        if($scope.advanced_custonize_pro && $scope.advanced_custonize_pro.indexOf($scope.category_code) >= 0 && $scope.border_option_yn=='N' && item.EIS_CODE!='BOR02'){
            $ngBootbox.alert($translate.instant('border_option_mgs'));
            return true;
        }
        //$('.desc' + item.EIS_ECS_CODE).text(item.EIS_DESC);
        if ($scope.border_selected == item.EIS_CODE) {
            return true;
        }
        /*delete $scope.step_array[6844];
        delete $scope.price_array[6844];
        $scope.border_color_array = {};
        $scope.borderColor_selected = 0;*/

        $scope.border_type = item.EIS_DESC;
        //  console.log($scope.borderTypeValue);
        $scope.step_array[item.EIS_ECS_CODE] = $scope.step_array_obj(item, parent_step);
        $scope.borderTypeValue = Number.isInteger($scope.borderTypeValue) ? $scope.borderTypeValue : '1';
        $scope.border_selected = item.EIS_CODE;
        $scope.itemProduct_array[item.EIS_ECS_CODE] = item.EIS_SYS_ID;
        threeJS.borderSection(item.EIS_CODE);
        $scope.priceCalculate();
        $scope.itemSelection();
        setTimeout(function () {
            $scope.checkParentValidation(1660, item.EIS_ECS_CODE, item.EIS_DESC);
        }, 100);

        $scope.boder_qty = item.EIS_CODE == 'BOR02' ? 0 : $scope.qty.value;

        if ($scope.borderColor_selected && $scope.border_type && $scope.measurement_width.value > 0 && $scope.measurement_height.value > 0) {

            $scope.StepOptionPrice(6844, item.EIS_ECI_CODE, $scope.borderColor_selected, '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.boder_qty, $scope.border_type);
        }


    };


    $scope.tiebelt = function (item, parent_step) {

        if ($scope.tiebelt_selected == item.EIS_CODE) {
            return true;
        }

        
        var step_obj2 = {
            'item_code': item.EIS_UOM,
        };
        $scope.step_array[item.EIS_ECS_CODE] = angular.merge({}, $scope.step_array_obj(item, parent_step), step_obj2);
        //$scope.step_array[item.EIS_ECS_CODE] = $scope.step_array_obj(item, parent_step);
        
        //  $scope.borderTypeValue = Number.isInteger($scope.borderTypeValue) ? $scope.borderTypeValue : '1';
        $scope.tiebelt_selected = item.EIS_CODE;
        $scope.itemProduct_array[item.EIS_ECS_CODE] = item.EIS_SYS_ID;
       
        $scope.itemSelection();
        setTimeout(function () {
            $scope.checkParentValidation(68069, item.EIS_ECS_CODE, item.EIS_DESC);
        }, 100);

        //midd68085
        if ($scope.measurement_width.value > 0 && $scope.measurement_height.value > 0) {
            $scope.StepOptionPrice(item.EIS_ECS_CODE, item.EIS_ECI_CODE, 'TIEBELT', '', '', '', $scope.tiebelt_selected + '-' + $scope.base_selected, '', '', '', $scope.qty.value, '', '', $scope.color_selected);
        }
        $scope.priceCalculate();
    };
    $scope.armsOption = function (item) {
        $('.desc' + item.EIS_ECS_CODE).text(item.EIS_DESC);
        if ($scope.arams_selected == item.EIS_CODE) {
            return true;
        }
        $scope.step_array[item.EIS_ECS_CODE] = $scope.step_array_obj(item);
        $scope.arams_selected = item.EIS_CODE;
        $scope.itemProduct_array[item.EIS_ECS_CODE] = item.EIS_SYS_ID;
        //$scope.price_array[item.EIS_ECS_CODE] = item.EIS_PRICE * 1;
        threeJS.armsSection(item.EIS_CODE);
        //$scope.priceCalculate();
        $scope.itemSelection();
    };
    $scope.borderColorSelected = function (pro_obj, parent_step) {
        console.log(pro_obj);
        console.log(parent_step);
        $('#desc6844').text(pro_obj.ITEM_ID);
        if ($scope.borderColor_selected == pro_obj.ECM_CODE) {
            return true;
        }
        var b = $scope.borderTypeValue = $('#borderTypeValue').find('option:selected').val();
        var boder_found = ['BOR04', 'BOR05'].filter(function (item) {
            return item == $scope.border_selected;
        });
        if (boder_found.length > 0) {
            $scope.border_color_array[b] = pro_obj;
        }

        var step_obj2 = {
            'option_desc': pro_obj.ITEM_ID,
            'item_code': pro_obj.ECM_CODE,
            'collection': pro_obj.ECM_ECC_CODE,
            'item': pro_obj.ECM_ECI_CODE,
            'price': '', //pro_obj.ECM_PRICE_BASIC * 1,
            'desc': pro_obj.ECM_DESC,
            'uom': pro_obj.ECM_UOM_CODE,
            'data_source': parent_step.ECS_DATA_SOURCE,
            'ordering': parent_step.EIS_ORDERING,
            'borderFamily':$scope.BorderFamily_selected
        };
        $scope.step_array[parent_step.EIS_ECS_CODE] = angular.merge({}, $scope.step_array_obj(pro_obj, parent_step), step_obj2);
        threeJS.updateBorderTextureImg(pro_obj, $scope.borderTypeValue, $scope.border_selected);
        $scope.borderColor_selected = pro_obj.ECM_CODE;
        $scope.itemProduct_array[1660] = pro_obj.ECM_CODE;

        if ($scope.borderColor_selected && $scope.border_type && $scope.measurement_width.value > 0 && $scope.measurement_height.value > 0) {
            $scope.StepOptionPrice(6844, pro_obj.ECI_CODE, $scope.borderColor_selected, '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value, $scope.border_type);
        }
        /*if ($scope.measurement_width.value && $scope.measurement_height.value) {
            $scope.StepOptionPrice(parent_step.EIS_ECS_CODE, pro_obj.ECM_ECI_CODE, pro_obj.ECM_CODE, '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value, $scope.base_desc);
        }*/
        // console.log($scope.step_array);
        // $scope.priceCalculate();
        $scope.itemSelection();
        setTimeout(function () {
            $scope.checkValidation(parent_step.EIS_ECS_CODE);
        }, 100);
    };

    $scope.trimmingSection = function (item, parent_step) {

        if ($scope.trimming_selected == item.EIS_CODE) {
            return true;
        }

        $scope.step_array[item.EIS_ECS_CODE] = $scope.step_array_obj(item, parent_step);
        $scope.trimming_selected = item.EIS_CODE;
        $scope.itemProduct_array[item.EIS_ECS_CODE] = item.EIS_SYS_ID;
        threeJS.trimmingSection(item.EIS_CODE);
        $scope.priceCalculate();
        $scope.itemSelection();
        setTimeout(function () {
            $scope.checkParentValidation(68069, item.EIS_ECS_CODE, item.EIS_DESC);
        }, 100);
        // console.log($scope.price_array);
    };
    $scope.trimmingColor = function (pro_obj, parent_step) {

        //console.log(parent_step.EIS_ECS_CODE);
        $('#desc68076').text(pro_obj.ITEM_ID);
        if ($scope.trimmingColor_selected == pro_obj.ECM_CODE) {
            return true;
        }

        var step_obj2 = {
            'option_desc': pro_obj.ITEM_ID,
            'item_code': pro_obj.ECM_CODE,
            'collection': pro_obj.ECM_ECC_CODE,
            'item': pro_obj.ECM_ECI_CODE,
            'price': '', //pro_obj.ECM_PRICE_BASIC * 1,
            'desc': pro_obj.ECM_DESC,
            'uom': pro_obj.ECM_UOM_CODE,
            'data_source': parent_step.ECS_DATA_SOURCE,
            'ordering': parent_step.EIS_ORDERING,
        };
        $scope.step_array[parent_step.EIS_ECS_CODE] = angular.merge({}, $scope.step_array_obj(pro_obj, parent_step), step_obj2);
        threeJS.trimmingColor(pro_obj);
        $scope.trimmingColor_selected = pro_obj.ECM_CODE;
        $scope.itemProduct_array[68076] = pro_obj.ECM_CODE;
        if ($scope.measurement_width.value && $scope.measurement_height.value) {
            $scope.StepOptionPrice(parent_step.EIS_ECS_CODE, pro_obj.ECM_ECI_CODE, pro_obj.ECM_CODE, '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value, $scope.base_desc);
        }

        // $scope.priceCalculate();
        $scope.itemSelection();
        setTimeout(function () {
            $scope.checkValidation(parent_step.EIS_ECS_CODE);
        }, 100);
    };

    $scope.boderRemove = function (border_no) {
        delete $scope.border_color_array[border_no];
        threeJS.boderRemove(border_no)
    };
    $scope.mountOption = function (item, parent_step) {
        $scope.window_depth = { value: '' };
        //console.log(parent_step);
        if ($scope.mount_selected == item.EIS_CODE) {
            return true;
        }

        // if(type != 'direct')
        // {
        delete $scope.step_array[5740];
        //}

        //$('.desc' + item.EIS_ECS_CODE).text(item.EIS_DESC);
        $scope.itemProduct_array[item.EIS_ECS_CODE] = item.EIS_SYS_ID;
        $scope.mount_selected = item.EIS_CODE;
        $scope.step_array[item.EIS_ECS_CODE] = $scope.step_array_obj(item, parent_step);
        threeJS.mounting(item.EIS_CODE);
        $scope.priceCalculate();
        setTimeout(function () {
            $scope.checkParentValidation(106, item.EIS_ECS_CODE, item.EIS_DESC);
        }, 100);
    };
    $scope.baseType = function (item, parent_step) {
    
        $scope.base_desc = item.EIS_CODE == 'BA01' ? 'One Way' : 'Two Way'
        //setTimeout(function () {
        if (item.EIS_MAX_HEIGHT < $scope.measurement_width.value && item.EIS_CODE == 'BA01') {
            //$ngBootbox.confirm($translate.instant('are_you_sure'));
            var options = {
                closeButton: false,
                backdrop: true,
                title: $translate.instant('attention'),
                message: 'Base one way option required maximum width  <b>' + item.EIS_MAX_HEIGHT + 'CM</b>. We recommend for base two way.',
                className: 'addToCart_pupup',
                buttons: $scope.customCancelButtons,
            };
            $ngBootbox.customDialog(options);
            return true;
        } else {
            if ($scope.base_selected == item.EIS_CODE) {
                return true;
            }

            $scope.base_min_width = item.EIS_MAX_HEIGHT;
            $('.desc' + item.EIS_ECS_CODE).text(item.EIS_DESC);
            $scope.itemProduct_array[item.EIS_ECS_CODE] = item.EIS_SYS_ID;
            $scope.base_selected = item.EIS_CODE;
            //$scope.base_desc = item.EIS_DESC;
            $scope.step_array[item.EIS_ECS_CODE] = $scope.step_array_obj(item, parent_step);
           
            if ($scope.glassColor_selected && $scope.base_desc && isInteger($scope.measurement_width.value) && isInteger($scope.measurement_height.value)) {yy
                $scope.StepOptionPrice(6572, item.EIS_ECI_CODE, $scope.glassColor_selected, '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value, $scope.base_desc);
            }
            //sandeep start..
            if ($scope.base_selected && $scope.base_desc && m_width && m_height) {
                $scope.StepOptionPrice(107, item.EIS_ECI_CODE, $scope.color_selected, '', m_width, m_height, '', '', '', '', $scope.qty.value, $scope.base_desc, '', 'material', $scope.reserve_stock);
            }
            //sandeep end..


            //Shahid Start
            if ($scope.tiebelt_selected) {
                $scope.StepOptionPrice(109126, item.EIS_ECI_CODE, 'TIEBELT', '', '', '', $scope.tiebelt_selected + '-' + $scope.base_selected, '', '', '', $scope.qty.value, '', '', $scope.color_selected);
            }
            //Shahid End

            threeJS.baseType(item.EIS_CODE);
            $scope.itemSelection();
        }
        //},500);	



    };
    $scope.controlType = function (item, parent_step, type) {
        var height = $scope.eci_motorize_max_height >= $scope.measurement_height.value ? true : false;
        var width = $scope.eci_motorize_min_width <= $scope.measurement_width.value ? true : false;

        $scope.track_option={
            name:item.EIS_CODE
        };

        $scope.control_tyep_desc=item.EIS_DESC;
        if (height == false || width == false) {
            if (item.EIS_CODE == 'PO02' || item.EIS_CODE == 'TO03') {
                var options = {
                    closeButton: false,
                    backdrop: true,
                    title: $translate.instant('attention'),
                    message: $translate.instant('motorization_attention_mgs', { min_width: $scope.eci_motorize_min_width, max_height: $scope.eci_motorize_max_height }),
                    //message: 'Motorization option required minimum product width <b>' + $scope.eci_motorize_min_width + 'CM</b> and maximum height  <b>' + $scope.eci_motorize_max_height + 'CM</b>. We recommend the manual control.',
                    className: 'addToCart_pupup',
                    buttons: $scope.customCancelButtons,
                    locale: 'ar'
                };
                $ngBootbox.customDialog(options);
                $scope.control_selected='';
                return false;
            }
        }

        if(item.EIS_CODE=='TO05'){;
            var options = {
                templateUrl: $scope.temp_path + 'popup/decorativeRails_popup.html?v='+version,
                scope: $scope,
               // size: 'small',
                onEscape: true,
                backdrop: true,
                title: $translate.instant('decorative_rails'),
                className: 'colorSection_popup',
               
            };
            $ngBootbox.customDialog(options); 

        }
        if ($scope.control_selected == item.EIS_CODE) {
            return true;
        }


        setTimeout(function () {
            $('#109').find('.rediochecker').prop('checked', false);
            angular.forEach(item.child, function (i) {
                $('#' + i.ECS_CODE).find('.active_icon').removeClass('active_icon');
                $scope.manual_control_selected = '';
                $scope.motorPosition_selected = '';
                $scope.typeOfMotor_selected = '';
                $scope.remote_selected = '';
                $scope.motorPositionValue.name='';
                $scope.motorized.name='';
                $scope.step_array[i.ECS_CODE] = $scope.step_array_obj('');
                //delete $scope.step_array[i.ECS_CODE];
            
            });
        }, 100);
        //$('.desc' + item.EIS_ECS_CODE).text(item.EIS_DESC);
        $scope.itemProduct_array[item.EIS_ECS_CODE] = item.EIS_SYS_ID;
        $scope.control_selected = item.EIS_CODE;
        $scope.control_uom = item.EIS_UOM;
        
        var step_obj2 = {
            'item_code': item.EIS_UOM,
        };
        $scope.step_array[item.EIS_ECS_CODE] = angular.merge({}, $scope.step_array_obj(item, parent_step), step_obj2);
        //$scope.step_array[item.EIS_ECS_CODE] = $scope.step_array_obj(item, parent_step);
        threeJS.controlType(item.EIS_CODE);
        if (item.EIS_CODE == 'PO05') {
            threeJS.valance('VAL03');
            $('.desc1480').html('<i class="fas fa-exclamation hide" style="font-size: 10px !important;color: red;" title="Valance Option"></i>');
        }

        $scope.itemSelection();
        if (type != 'direct') {
            delete $scope.step_array[2027];
            delete $scope.step_array[3283];
            delete $scope.step_array[4068];
            delete $scope.step_array[251975];
            delete $scope.step_array[5745];
            delete $scope.step_array[5747];
            delete $scope.price_array[5745];
            delete $scope.price_array[4068];
            delete $scope.price_array[251975];
            
        }

        var step_order = item.EIS_ORDERING;
//         console.log($scope.category_code);
// console.log(parent_step.child);
// console.log(step_order);
        if(parent_step.child && parent_step.child[step_order] && parent_step.child[step_order].child){
            var track_texture=parent_step.child[step_order].child;
            var l=Object.keys(track_texture)[0];
            if(track_texture[l] && track_texture[l].color && track_texture[l].color.length>0){
                console.log(track_texture[l].color);
                threeJS.glassColor(track_texture[l].color[0]);
            }
        }
        //Shahid Start
        setTimeout(function () {
            console.log($scope.category_code);
            if (['5965'].indexOf($scope.category_code) > -1) {
                $scope.StepOptionPrice(item.EIS_ECS_CODE, item.EIS_ECI_CODE, $scope.control_uom, '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value, $scope.base_desc, '', 'material', $scope.reserve_stock);
                delete $scope.step_array[109127];
                delete $scope.step_array[109129];
                delete $scope.step_array[109130];
                delete $scope.step_array[109132];
                if(item.EIS_CODE == 'TO04'){
                    threeJS.valance('VAL02');
                }else{
                    threeJS.valance('VAL01');
                }
                
            }
            $scope.priceCalculate();
        }, 200);

        //Shahid End

        setTimeout(function () {
            $scope.checkParentValidation(109, item.EIS_ECS_CODE, item.EIS_DESC);
        }, 200);
        $scope.priceCalculate();
        

    };
    $scope.panelTrack = function (item, parent_step) {

        $('#desc' + parent_step.EIS_ECS_CODE).text(item.ITEM_ID);
        $('.desc' + parent_step.EIS_ECS_CODE).text(item.ITEM_ID);
        if ($scope.panelTrack_selected == item.ECM_CODE) {
            return true;
        }

        var step_obj2 = {
            'price': '',
            'option_id': parent_step.EIS_CODE,
            'option_desc': item.ITEM_ID,
            'item': parent_step.EIS_ECI_CODE,
            'data_source': parent_step.ECS_DATA_SOURCE,
            'item_code': item.ECM_CODE,
            'ordering': parent_step.EIS_ORDERING,
            'item_value': '',
            'pcs': ''
        }
        $scope.step_array[parent_step.EIS_ECS_CODE] = angular.merge({}, $scope.step_array_obj(item, parent_step), step_obj2);
        if ($scope.measurement_width.value > 0 && $scope.measurement_height.value > 0) {
            $scope.StepOptionPrice(60272, item.ECM_ECI_CODE, 'PANEL-TRACK', '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value);
        }

        $scope.itemProduct_array[parent_step.EIS_ECS_CODE] = item.ECM_CODE;
        $scope.panelTrack_selected = item.ECM_CODE;
        $scope.itemSelection();
        $scope.priceCalculate();
    };
    $scope.remoteType = function (item, parent_step) {

        // $scope.price_array[5745] = $scope.priceQtyCalculate(5745, item.ECM_ECI_CODE, item.ECM_CODE, $scope.measurement_width.value, $scope.measurement_height.value, $scope.qty.value);

        $('#desc' + parent_step.EIS_ECS_CODE).text(item.ECM_DESC);
        //$('.desc' + parent_step.EIS_ECS_CODE).text(item.ECM_ITEM_ID);
        if ($scope.remote_selected == item.ECM_CODE) {
            return true;
        }

        var step_obj2 = {
            'price': '',
            'option_id': parent_step.EIS_CODE,
            'option_desc': item.ITEM_ID,
            'item': parent_step.EIS_ECI_CODE,
            'data_source': parent_step.ECS_DATA_SOURCE,
            'item_code': item.ECM_CODE,
            'ordering': parent_step.EIS_ORDERING,
            'item_value': '',
            'pcs': '',
            'desc': item.ECM_DESC,
            'price_was': parseFloat(item.PRICE_WAS),
            'material_price': parseFloat(item.PRICE)
        }
        $scope.step_array[parent_step.EIS_ECS_CODE] = angular.merge({}, $scope.step_array_obj(item, parent_step), step_obj2);
        if ($scope.measurement_width.value > 0 && $scope.measurement_height.value > 0) {
            $scope.StepOptionPrice(5745, item.ECM_ECI_CODE, item.ECM_CODE, '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value);
        }

        $scope.itemProduct_array[parent_step.EIS_ECS_CODE] = item.ECM_CODE;
        $scope.remote_selected = item.ECM_CODE;
        $scope.itemSelection();
        $scope.priceCalculate();
        setTimeout(function () {
            $scope.checkValidation(parent_step.EIS_ECS_CODE);
            $scope.checkParentValidation(109, 109,  $scope.control_tyep_desc);
        }, 100);
    };
    $scope.manualControl = function (item, parent_step) {

        $('.desc' + item.EIS_ECS_CODE).text(item.EIS_DESC);
        $('#desc' + item.EIS_ECS_CODE).text(item.EIS_DESC);
        //$('.desc' + item.EIS_ECS_CODE).text(item.EIS_DESC);
        if ($scope.manual_control_selected == item.EIS_CODE) {
            return true;
        }

        $scope.itemProduct_array[item.EIS_ECS_CODE] = item.EIS_SYS_ID;
        $scope.manual_control_selected = item.EIS_CODE;
        $scope.step_array[item.EIS_ECS_CODE] = $scope.step_array_obj(item, parent_step);
        threeJS.manualControl(item.EIS_CODE);
        $scope.itemSelection();
        setTimeout(function () {
            $scope.checkValidation(item.EIS_ECS_CODE);
            $scope.checkParentValidation(109, 109,  $scope.control_tyep_desc);
        }, 100);
    };
    /*$scope.motorizedControl = function (item) {
     $scope.itemProduct_array[item.EIS_ECS_CODE] = item.EIS_SYS_ID;
     // $scope.step_array[item.EIS_ECS_CODE] = {
     // 'step_id': item.EIS_SYS_ID,
     // 'step': item.EIS_CODE,
     // 'ordering': item.EIS_ORDERING,
     // 'price': item.EIS_PRICE,
     // 'option_id': item.EIS_CODE,
     // 'option_desc': item.EIS_DESC,
     // 'data_source': item.ECS_DATA_SOURCE
     // };
     $scope.step_array[item.EIS_ECS_CODE] = $scope.step_array_obj(item);
     
     $scope.price_array[item.EIS_ECS_CODE] = item.EIS_PRICE * 1;
     $scope.priceCalculate();
     $scope.itemSelection();
     }; */

    $scope.tilterType = function (item) {
        $('.desc' + item.EIS_ECS_CODE).text(item.EIS_DESC);
        $scope.itemProduct_array[item.EIS_ECS_CODE] = item.EIS_SYS_ID;
        $scope.step_array[item.EIS_ECS_CODE] = $scope.step_array_obj(item, parent_step);
        $scope.tilter_selected = item.EIS_SYS_ID;
        $scope.itemSelection();
    };
    $scope.rollType = function (item, parent_step) {

        if ($scope.roll_selected == item.EIS_CODE) {
            return true;
        }

        $('.desc' + item.EIS_ECS_CODE).text(item.EIS_DESC);
        $scope.itemProduct_array[item.EIS_ECS_CODE] = item.EIS_SYS_ID;
        $scope.step_array[item.EIS_ECS_CODE] = $scope.step_array_obj(item, parent_step);
        $scope.roll_selected = item.EIS_CODE;
        threeJS.rollType11(item.EIS_CODE);
        $scope.itemSelection();
    };

    $scope.doorFrame = function (item, parent_step) {

        $scope.customization_yn = item.EIS_CODE == 'DOR01' ? false : true;
        if ($scope.doorFrame_selected == item.EIS_CODE) {
            return true;
        }

        $('.desc' + item.EIS_ECS_CODE).text(item.EIS_DESC);
        $scope.itemProduct_array[item.EIS_ECS_CODE] = item.EIS_SYS_ID;
        $scope.step_array[item.EIS_ECS_CODE] = $scope.step_array_obj(item, parent_step);
        $scope.doorFrame_selected = item.EIS_CODE;
        $scope.itemSelection();
    };


    $scope.panelTrackStep = function (item_code, step_code) {
        $http({
            method: 'GET',
            url:service_url + 'ShowroomApi/getmaterail_step/' + step_code,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function (response) {
            $scope.panelTrack = response.data;
            console.log($scope.panelTrack.EIS_DESC_EN);
            var step_obj2 = {
                'ordering': $scope.panelTrack.EIS_ORDERING,
                'parent_ordering': $scope.panelTrack.EIS_ORDERING,
                'option_desc': $scope.panelTrack.ITEM_ID,
                'item_code': $scope.panelTrack.ECM_CODE,
                'collection': $scope.panelTrack.ECM_ECC_CODE,
                'item': $scope.panelTrack.ECM_ECI_CODE,
                'desc': $scope.panelTrack.ECM_DESC,
                'uom': $scope.panelTrack.ECM_UOM_CODE,
                'data_source': $scope.panelTrack.ECS_DATA_SOURCE,
                'parent_step': '',
                'option_id': $scope.panelTrack.EIS_CODE,
                'step': $scope.panelTrack.EIS_CODE,
                // 'step_desc': $scope.panelTrack.EIS_DESC,
                'step_desc': $scope.panelTrack.EIS_DESC_EN,
                'item_value': '',
                'price': '',
                'pcs': '',
            };
            $scope.step_array[step_code] = step_obj2;
            $scope.StepOptionPrice(step_code, item_code, 'PANEL-TRACK', '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value);
        });
    }

    $scope.StepOptionPrice = function (step_code, $item_product, $component_type, $type, $width, $height, $params1, $params2, $params3, $params4, $qty, $ref_option, $params5, $materialType, $reserve_stock) {

        //console.log(step_code, $item_product, $component_type, $type, $width, $height, $params1, $params2, $params3, $params4, $qty, $ref_option, $params5, $materialType, $reserve_stock);
        $scope.usersInfo = store.get('USER_INFO') != undefined ? store.get('USER_INFO') : '';

        $materialType = $materialType ? $materialType : '';
        $ref_option = $ref_option ? $ref_option : '';
        $params5 = $params5 ? $params5 : '';

        if(($width>1 && $height>1) || $qty>0){
            
                $('.desc111').find('i').remove();
                if ($('.fa-exclamation').hasClass('hide') == true) {
                    $('.fa-exclamation').removeClass('hide');
                } else if ($('.navigation  .fa-exclamation').length == 0) {
                        var base64_img = threeJS.canvasImg();
                        $('#loader_div').show();
                        $scope.waiting = true;
                        $scope.add_more_item = true;
                        $http({
                            method: 'POST',
                            url:service_url + 'ShowroomApi/checkout',
                            data:$.param({
                                price_list: $scope.price_array, 
                                step_array: $scope.step_array, 
                                item_list: $scope.itemProduct_array, 
                                rowid: cart_id, 
                                qty: $scope.qty.value, 
                                base64_img: base64_img, 
                                formula_qty: $scope.formula_qty, 
                                total_price: $scope.total_price, 
                                product_yn: $scope.productYN,
                                user_data : $scope.usersInfo 
                            }),
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                        }).then(function (response) {
                            $scope.add_more_item = false;
                            $scope.waiting = false;
                            if(response.data.status){
                            
                                /*if ($rootScope.user_sys_id == '') {
                                    store.remove('USER_INFO');
                                    store.remove('user');
                                    store.remove('SHIPPING_ID');
                                    store.remove('COMPANY_INFO');
                                    store.remove('temp_code');
                                    store.remove('CHOOSE_FREE_DEL_CITY');
                                    $rootScope = false;
                                    $rootScope = false;
                                    $rootScope.login_userName = $translate.instant('my_account');
                                }*/
                            $('#loader_div').hide();
                            if (step_code == 'checkout') {
                                $location.path('wishList');
                            } else {
                                //$('#loader_div').show();
                                var options = {
                                    closeButton: false,
                                    backdrop: true,
                                    message: $scope.server_name == true ? $translate.instant('Your_item_added') : $translate.instant('Your_item_added_fav'),       //'Your item has been added.',
                                    className: 'addToCart_pupup',
                                    buttons: $scope.customDialogButtons
                                };
                                $ngBootbox.customDialog(options);
                            }
                        }else{
                            console.log('error...');
                        }
                            //  console.log($scope.midd);
                        });
        }
    }
    };


    $scope.stepPriceCalculate = function (step_code, $item_product, $type, $params2, $params3, $qty, responseData) {

        $scope.formula_qty = parseFloat(responseData.price.FORMULA_QTY) ? parseFloat(responseData.price.FORMULA_QTY) : 0;
        $scope.price = parseFloat(responseData.price.PRICE) ? parseFloat(responseData.price.PRICE) : 0;
        $scope.item_value = parseFloat(responseData.price.ITEM_VALUE) ? parseFloat(responseData.price.ITEM_VALUE) : 0;
        // console.log(responseData.motor_price.ITEM_VALUE);
        // console.log($scope.motor_item_value);

        if ($params2 == undefined) {
            $params2 = '';
        }

        if (step_code == 107 && $scope.step_array.hasOwnProperty('107') == true) {

            $scope.step_array[step_code].service_yn = responseData.price.FREE_DEL_INST;
            $scope.step_array[step_code].price = parseFloat($scope.price);
            $scope.step_array[step_code].item_value = parseFloat($scope.item_value);
            $scope.price_array[step_code] = parseFloat($scope.item_value) ? parseFloat($scope.item_value) : 0;
            if ($scope.pro_item.ECI_QTY_CALCULATION_TYPE == 'BOTH') {
                $scope.step_array[step_code].pcs = parseFloat($scope.formula_qty);
                if ($scope.measurement_width.value > 0 && $scope.measurement_height.value > 0) {
                    $scope.recommend = false;
                } else {
                    //$scope.qty.value = $scope.formula_qty;
                    if ($scope.pro_item.ECI_CODE == '1143189') {
                        $('.desc107').text($scope.qty.value + ' Set(s)');
                    } else {
                        $('.desc107').html($qty + $translate.instant('Roll'));
                    }
                    $scope.measurement_width.value = '';
                    $scope.measurement_height.value = '';
                    $scope.recommend = true;
                }

            } else {
                //$scope.step_array[step_code].pcs = parseFloat($qty * $scope.formula_qty);
                $scope.step_array[step_code].pcs = parseFloat($scope.formula_qty);
            }

            if ($scope.glue_selected) {
                if ($scope.step_array.hasOwnProperty('63990') == true) {
                    if ($scope.step_array[63990].glue_packet > 0) {
                        return $scope.StepOptionPrice(63990, $item_product, $scope.glue_selected, '', '0', '0', '', '', '', '', $scope.step_array[63990].glue_packet, $scope.color_selected);
                    } else {
                        return $scope.StepOptionPrice(63990, $item_product, $scope.glue_selected, '', '0', '0', '', '', '', '', $scope.formula_qty, $scope.color_selected);
                    }
                }
            }
        } else if (step_code == 1480 && $scope.step_array.hasOwnProperty('1480') == true) {

            $scope.valance_code = responseData.item.VALANCE_CODE.split('-')[0] ? responseData.item.VALANCE_CODE.split('-')[0] : '';
            $scope.valance_price = parseFloat(responseData.valance_price.PRICE) ? parseFloat(responseData.valance_price.PRICE) : 0;
            $scope.valance_item_value = parseFloat(responseData.valance_price.ITEM_VALUE) ? parseFloat(responseData.valance_price.ITEM_VALUE) : 0;
            $scope.valance_pcs = parseFloat(responseData.valance_price.FORMULA_QTY) ? parseFloat(responseData.valance_price.FORMULA_QTY) : 0;
            $scope.step_array[step_code].pcs = parseFloat($scope.valance_pcs);
            $scope.step_array[step_code].item_code = $scope.valance_code;
            $scope.step_array[step_code].price = parseFloat($scope.valance_price);
            $scope.step_array[step_code].item_value = parseFloat($scope.valance_item_value);
            $scope.step_array[step_code].remarks = 'Control:' + $params2;
            $scope.price_array[step_code] = parseFloat($scope.valance_item_value) ? parseFloat($scope.valance_item_value) : 0;
        } else if (step_code == 4068 && $scope.step_array.hasOwnProperty('4068') == true) {
            if ($scope.wireStep) {
                $scope.wireLength = parseFloat(responseData.wireLength.WIRE_LENGTH / 100);
                $scope.lengthOfWire = { id: $scope.wireLength, label: $scope.wireLength.toFixed(2) + " LMT" }; //$scope.wire_length_array[3];
                //$('#desc5747').text($scope.wireLength.toFixed(2) + ' LMT');
               
                if (cart_id && $scope.step_array.hasOwnProperty('5747') == true) {
                    $scope.lengthOfWireFun($scope.lengthOfWire, $scope.wireStep);
                } else {
                   
                    if($scope.step_array[step_code].option_id != 'MO02'){
                        angular.forEach($scope.wireStep, function (i, e) {
                            $scope.lengthOfWireFun($scope.lengthOfWire, i);
                        });
                    }
                }
                $('#lengthOfWire').find('option:selected').val($scope.wireLength);
                $('#desc5747').text($scope.wireLength.toFixed(2) + ' LMT');
            }
            $scope.motor_code = responseData.item.MOTOR_CODE ? responseData.item.MOTOR_CODE : '';
            $scope.motor_pcs_qty = parseFloat(responseData.motor_price.FORMULA_QTY) ? parseFloat(responseData.motor_price.FORMULA_QTY) : 0;
            $scope.motor_price = parseFloat(responseData.motor_price.PRICE) ? parseFloat(responseData.motor_price.PRICE) : 0;
            $scope.motor_item_value = parseFloat(responseData.motor_price.ITEM_VALUE) ? parseFloat(responseData.motor_price.ITEM_VALUE) : 0;
            $scope.step_array[step_code].pcs = $scope.motor_pcs_qty;
            $scope.step_array[step_code].item_code = $scope.motor_code;
            $scope.step_array[step_code].price = parseFloat($scope.motor_price);
            $scope.step_array[step_code].item_value = parseFloat($scope.motor_item_value);
            $scope.price_array[step_code] = parseFloat($scope.motor_item_value) ? parseFloat($scope.motor_item_value) : 0;
        } else if (step_code == 7108 && $scope.step_array.hasOwnProperty('7108') == true) {
            $scope.bracket_code = responseData.item.BRACKET_CODE ? responseData.item.BRACKET_CODE : '';
            var motor_code = $scope.step_array.hasOwnProperty('4068').item_code ? $scope.step_array.hasOwnProperty('4068').item_code : $scope.motor_code;
            if (motor_code == undefined) {
                motor_code = '';
            }

            $scope.step_array[step_code].pcs = $qty;
            $scope.step_array[step_code].item_code = $scope.bracket_code;
            var valance_remark = $scope.valance_selected == undefined ? '' : $scope.valance_selected;
            $scope.step_array[step_code].remarks = 'Control:' + $params2 + '|Surface:' + $params3 + '|Motor:' + motor_code + '|Valance:' + valance_remark + '|';
            //console.log($scope.step_array[step_code].remarks);
        } else if (step_code == 60272 && $scope.step_array.hasOwnProperty('60272') == true) {
            $scope.bracket_code = responseData.item.BRACKET_CODE ? responseData.item.BRACKET_CODE : '';
            $scope.bracket_formula_qty = parseFloat(responseData.bracket_price.FORMULA_QTY) ? parseFloat(responseData.bracket_price.FORMULA_QTY) : 0;
            $scope.bracket_price = parseFloat(responseData.bracket_price.PRICE) ? parseFloat(responseData.bracket_price.PRICE) : 0;
            $scope.bracket_item_value = parseFloat(responseData.bracket_price.ITEM_VALUE) ? parseFloat(responseData.bracket_price.ITEM_VALUE) : 0;
            $scope.step_array[step_code].pcs = $scope.bracket_formula_qty;
            $scope.step_array[step_code].item_code = $scope.bracket_code;
            $scope.step_array[step_code].price = parseFloat($scope.bracket_price);
            $scope.step_array[step_code].item_value = parseFloat($scope.bracket_item_value) ? parseFloat($scope.bracket_item_value) : 0;
            $scope.price_array[step_code] = parseFloat($scope.bracket_item_value) ? parseFloat($scope.bracket_item_value) : 0;
            $scope.glassQt = false;
            //$scope.glass_qty = $scope.bracket_formula_qty;

        } else if (step_code == 5745 && $scope.step_array.hasOwnProperty('5745') == true) {
            $scope.step_array[5745].pcs = $scope.formula_qty;
            $scope.step_array[5745].price = parseFloat($scope.price);
            $scope.step_array[5745].item_value = parseFloat($scope.item_value) ? parseFloat($scope.item_value) : 0;
            $scope.price_array[5745] = parseFloat($scope.item_value) ? parseFloat($scope.item_value) : 0;
        } else if (step_code == 6572 && $scope.step_array.hasOwnProperty('6572') == true) {
            $scope.step_array[step_code].pcs = parseFloat($scope.formula_qty);
            $scope.step_array[step_code].price = parseFloat($scope.price);
            $scope.step_array[step_code].item_value = parseFloat($scope.item_value);
            $scope.price_array[step_code] = parseFloat($scope.item_value) ? parseFloat($scope.item_value) : 0;
        } else if (step_code == 6844 && $scope.step_array.hasOwnProperty('6844') == true) {
            $scope.step_array[step_code].pcs = parseFloat($scope.formula_qty);
            $scope.step_array[step_code].price = parseFloat($scope.price);
            $scope.step_array[step_code].item_value = parseFloat($scope.item_value);
            $scope.price_array[step_code] = parseFloat($scope.item_value) ? parseFloat($scope.item_value) : 0;
        } else if (step_code == 63990 && $scope.step_array.hasOwnProperty('63990') == true) {
            if ($type == 'glueQty') {
                $scope.step_array[step_code].pcs = $qty;
                $scope.step_array[step_code].price = parseFloat($scope.price);
                $scope.step_array[step_code].item_value = parseFloat($scope.price * $qty);
                $scope.price_array[step_code] = parseFloat($scope.price) ? parseFloat($scope.price * $qty) : 0;
            } else {
                if ($scope.glue_recommend == false) {
                    $scope.step_array[step_code].pcs = parseFloat($scope.formula_qty);
                    $scope.step_array[step_code].price = parseFloat($scope.price);
                    $scope.step_array[step_code].item_value = parseFloat($scope.item_value * $qty);
                    $scope.price_array[step_code] = parseFloat($scope.item_value) ? parseFloat($scope.item_value * $qty) : 0;
                } else {

                    $scope.step_array[step_code].pcs = parseFloat($scope.formula_qty);
                    $scope.step_array[step_code].price = parseFloat($scope.price);
                    $scope.step_array[step_code].item_value = parseFloat($scope.item_value * $scope.step_array[63990].glue_packet);
                    $scope.price_array[step_code] = parseFloat($scope.item_value) ? parseFloat($scope.item_value * $scope.step_array[63990].glue_packet) : 0;
                }
            }


            if ($scope.glueQty.value > 0) {
                $scope.glue_recommend = true;
            } else {
                $scope.glue_recommend = false;
            }
            $scope.glue_qty_show = false;
        } else if (step_code == 109128 && $scope.step_array.hasOwnProperty('109128') == true) {

            $scope.step_array[step_code].pcs = parseFloat($scope.formula_qty);
            $scope.step_array[step_code].price = parseFloat($scope.price);
            $scope.step_array[step_code].item_value = parseFloat($scope.item_value);
            $scope.price_array[step_code] = parseFloat($scope.item_value) ? parseFloat($scope.item_value) : 0;
        } else if (step_code == 109 && ($scope.step_array.hasOwnProperty('109') == true || $scope.step_array.hasOwnProperty('134111') || $scope.step_array.hasOwnProperty('134479'))) {
            $scope.step_array[step_code].pcs = parseFloat($scope.formula_qty);
            $scope.step_array[step_code].price = parseFloat($scope.price);
            $scope.step_array[step_code].item_value = parseFloat($scope.item_value);
            $scope.price_array[step_code] = parseFloat($scope.item_value) ? parseFloat($scope.item_value) : 0;
            //step_code == 68085 test server   
        } else if (step_code == 109126 && $scope.step_array.hasOwnProperty('109126') == true) {
            $scope.step_array[step_code].pcs = parseFloat($scope.formula_qty);
            $scope.step_array[step_code].price = parseFloat($scope.price);
            $scope.step_array[step_code].item_value = parseFloat($scope.item_value);
            $scope.price_array[step_code] = parseFloat($scope.item_value) ? parseFloat($scope.item_value) : 0;
        }else if (step_code == 134111 &&  $scope.step_array.hasOwnProperty('134111') ) {
            $scope.step_array[step_code].pcs = parseFloat($scope.formula_qty);
            $scope.step_array[step_code].price = parseFloat($scope.price);
            $scope.step_array[step_code].item_value = parseFloat($scope.item_value);
            $scope.price_array[step_code] = parseFloat($scope.item_value) ? parseFloat($scope.item_value) : 0;
            //step_code == 134111 test server for track option
        }else if (step_code == 134479 &&  $scope.step_array.hasOwnProperty('134479') ) {
            $scope.step_array[step_code].pcs = parseFloat($scope.formula_qty);
            $scope.step_array[step_code].price = parseFloat($scope.price);
            $scope.step_array[step_code].item_value = parseFloat($scope.item_value);
            $scope.price_array[step_code] = parseFloat($scope.item_value) ? parseFloat($scope.item_value) : 0;
            //step_code == 134479 Live server for track option
        }else if(step_code == 251975 &&  $scope.step_array.hasOwnProperty('251975')){
            $scope.step_array[step_code].pcs = parseFloat($scope.formula_qty);
            $scope.step_array[step_code].price = parseFloat($scope.price);
            $scope.step_array[step_code].item_value = parseFloat($scope.item_value);
            $scope.price_array[step_code] = parseFloat($scope.item_value) ? parseFloat($scope.item_value) : 0;
        }else {
            console.log('No Price' + step_code);
            console.log($scope.step_array);
        }
        //console.log($scope.step_array);
        $scope.priceCalculate();
    };

    $scope.measurementFunc = function (item) {

        $scope.measurement_data=item;

        var height = $scope.eci_motorize_max_height >= $scope.measurement_height.value ? true : false;
        var width = $scope.eci_motorize_min_width <= $scope.measurement_width.value ? true : false;
        if ($scope.pro_item.ECI_RESTRICT_TO_MATERIAL_WIDTH_YN == 'Y') {
            if ($scope.mat_width == undefined) {

                $scope.mat_width = $scope.eci_max_width;

            } else {
                $scope.mat_width = $scope.mat_width;
            }
            var max_width = $scope.mat_width;
            $scope.eci_max_width = max_width;
        } else {
            var max_width = $scope.eci_max_width >= $scope.measurement_width.value ? true : false;
        }

        var min_height = $scope.eci_min_height <= $scope.measurement_height.value ? true : false;
        var min_width = $scope.eci_min_width <= $scope.measurement_width.value ? true : false;
        var max_height = $scope.eci_max_height >= $scope.measurement_height.value ? true : false;
        if ((min_height == false || min_width == false || max_height == false || max_width == false) && $scope.measurement_width.value != '' && $scope.measurement_height.value != '' && $scope.productYN == 'Y') {  //$scope.pro_item.ECI_CODE != '1143189'

            if ($('.addToCart_pupup').hasClass('in') == false) {
                var options = {
                    closeButton: false,
                    backdrop: true,
                    title: $translate.instant('attention'),
                    message: $translate.instant('mini_max_product_mgs', { min_width: $scope.eci_min_width, max_width: $scope.eci_max_width, min_height: $scope.eci_min_height, max_height: $scope.eci_max_height }),
                    className: 'addToCart_pupup',
                    buttons: $scope.customCancelButtons
                };
                $ngBootbox.customDialog(options);
            }
        }


        if (height == false || width == false) {
            if ($scope.control_selected == 'PO02' || $scope.typeOfMotor_selected || $scope.control_selected == 'TO03') {
                var options = {
                    closeButton: false,
                    backdrop: true,
                    title: $translate.instant('attention'),
                    message: $translate.instant('motorization_attention_mgs', { min_width: $scope.eci_motorize_min_width, max_height: $scope.eci_motorize_max_height }),
                    //message: 'Motorization option required minimum product width <b>' + $scope.eci_motorize_min_width + 'CM</b> and maximum height  <b>' + $scope.eci_motorize_max_height + 'CM</b>. We recommend the manual control.',
                    className: 'addToCart_pupup',
                    buttons: $scope.customCancelButtons,
                    locale: 'ar'
                };
               // $scope.track_option.name='';
                $ngBootbox.customDialog(options);
                delete $scope.step_array[109];
                delete $scope.step_array[134479];
                $('#3283').find('.active_icon').removeClass('active_icon');
                $scope.motorPosition_selected = '';
                $scope.typeOfMotor_selected = '';
                $scope.remote_selected = '';
                $scope.motorPositionValue.name='';
                $scope.motorized.name='';
                delete $scope.step_array[4068];
                delete $scope.step_array[5745];
                delete $scope.step_array[3283];
                delete $scope.step_array[251975];
                delete $scope.price_array[5745];
                delete $scope.price_array[4068];
                delete $scope.price_array[251975];
                $('.desc109').html('<i class="fas fa-exclamation hide" style="font-size: 10px !important;color: red;" title="Control Type"></i>');
                $('.desc134479').html('<i class="fas fa-exclamation hide" style="font-size: 10px !important;color: red;" title="Control Type"></i>');
                $scope.control_selected = '';
                $scope.track_option.name='';
                //return true;
            }
        } else if (($scope.base_min_width <= $scope.measurement_width.value) && $scope.base_selected == 'BA01') {
            //$ngBootbox.confirm($translate.instant('are_you_sure'));
            var options = {
                closeButton: false,
                backdrop: true,
                title: $translate.instant('attention'),
                message: 'Base one way option required maximum width  <b>' + $scope.base_min_width + 'CM</b>. We recommend for base two way.',
                className: 'addToCart_pupup',
                buttons: $scope.customCancelButtons
            };
            $ngBootbox.customDialog(options);
            $('.desc2025').html('<i class="fas fa-exclamation hide" style="font-size: 10px !important;color: red;" title="Base step"></i>');
            $scope.base_selected = '';
            delete $scope.step_array[2027];
        }

        var step_val = item;
        var item = item.measurement;
        var m_error = '<i class="fas fa-exclamation" style="font-size: 10px !important;color: red;" title="Measurement"></i>';
        m_width = $scope.measurement_width.value;
        m_height = $scope.measurement_height.value;
        $scope.mat_width = $scope.mat_width ? $scope.mat_width : $scope.prod_mat_width;

        if (item.hasOwnProperty('ECI_MIN_WIDTH') && m_width >= item.ECI_MIN_WIDTH && m_width <= $scope.mat_width && m_height >= item.ECI_MIN_HEIGHT && m_height <= item.ECI_MAX_HEIGHT && $scope.pro_item.ECI_RESTRICT_TO_MATERIAL_WIDTH_YN == 'Y') {
            $scope.itemProduct_array[107] = [m_width, m_height, item.EIS_ECI_CODE];
            $scope.active_cls = 'active_icon';
            threeJS.measurementText(m_width, m_height);
            var step_obj2 = {
                'width': m_width,
                'height': m_height,
                'pcs': '',
                'item_code': $scope.color_selected,
                'item_value': '',
                'price': '',
                'qty_pcs': $scope.qty.value,
                'price_was': $scope.material_price_was,
                'material_price': $scope.material_price

            };
            $scope.step_array[step_val.EIS_ECS_CODE] = angular.merge({}, $scope.step_array_obj(step_val), step_obj2);
            m_width = m_width > 0 ? m_width : 0;
            m_height = m_height > 0 ? m_height : 0;
            $('.desc107').html($translate.instant('measurement_val_mgs', { 'm_width': m_width, 'm_height': m_height }));
            m_error = '';
            if ($scope.typeOfMotor_selected) {
                if (height == false || width == false) {
                    if ($scope.control_selected == 'PO02' || $scope.typeOfMotor_selected || $scope.control_selected == 'TO03') {

                        var options = {
                            closeButton: false,
                            backdrop: true,
                            title: $translate.instant('attention'),
                            message: $translate.instant('motorization_attention_mgs', { min_width: $scope.eci_motorize_min_width, max_height: $scope.eci_motorize_max_height }),
                            //message: 'Motorization option required minimum product width <b>' + $scope.eci_motorize_min_width + 'CM</b> and maximum height  <b>' + $scope.eci_motorize_max_height + 'CM</b>. We recommend the manual control.',
                            className: 'addToCart_pupup',
                            buttons: $scope.customCancelButtons,
                            locale: 'ar'
                        };
                        $ngBootbox.customDialog(options);
                        delete $scope.step_array[109];
                        delete $scope.step_array[134479];
                        $('#3283').find('.active_icon').removeClass('active_icon');
                        $scope.motorPosition_selected = '';
                        $scope.typeOfMotor_selected = '';
                        $scope.remote_selected = '';
                        $scope.motorPositionValue.name='';
                        $scope.motorized.name='';
                        delete $scope.step_array[4068];
                        delete $scope.step_array[5745];
                        delete $scope.step_array[3283];
                        delete $scope.step_array[251975];
                        delete $scope.price_array[5745];
                        delete $scope.price_array[4068];
                        delete $scope.price_array[251975];
                        $('.desc109').html('<i class="fas fa-exclamation hide" style="font-size: 10px !important;color: red;" title="Control Type"></i>');
                        $('.desc134479').html('<i class="fas fa-exclamation hide" style="font-size: 10px !important;color: red;" title="Control Type"></i>');
                        $scope.control_selected = '';
                        $scope.track_option.name='';
                        //return true;
                    }
                } else {
                    $scope.StepOptionPrice(4068, step_val.EIS_ECI_CODE, 'MOTOR', '1', $scope.measurement_width.value, $scope.measurement_height.value, $scope.typeOfMotor_selected, '', '', '', $scope.qty.value);
                    // console.log($scope.typeOfMotor_selected);
                    // console.log($scope.chargerUom);
                    if($scope.typeOfMotor_selected == 'MO02'){
                        $scope.StepOptionPrice(251975, step_val.EIS_ECI_CODE, $scope.chargerUom, '1', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value, '', '' , 'CHARGER', '');
                    }
                }

                if ($scope.installation_selected) {
                    $scope.StepOptionPrice(7108, step_val.EIS_ECI_CODE, 'BRACKET', '', $scope.measurement_width.value, $scope.measurement_height.value, $scope.motor_code, $scope.control_selected, $scope.surface_selected, $scope.installation_selected, $scope.qty.value, '', $scope.valance_selected);
                }
            }

            if ($scope.valance_selected) {
                delete $scope.price_array[1480];
                if ($scope.valance_selected != 'VAL02') {
                    $scope.StepOptionPrice(1480, step_val.EIS_ECI_CODE, 'VALANCE', '', $scope.measurement_width.value, $scope.measurement_height.value, '', $scope.control_selected, '', '', $scope.qty.value);
                }
            }

            if ($scope.remote_selected) {
                $scope.StepOptionPrice(5745, step_val.EIS_ECI_CODE, $scope.remote_selected, '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value);
            }

            if ($scope.glassColor_selected && $scope.base_desc) {
                $scope.StepOptionPrice(6572, step_val.EIS_ECI_CODE, $scope.glassColor_selected, '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value, $scope.base_desc);
            }
            $scope.StepOptionPrice(107, step_val.EIS_ECI_CODE, $scope.color_selected, '', m_width, m_height, '', '', '', '', $scope.qty.value, '', '', 'material', $scope.reserve_stock);
            if (step_val.EIS_ECI_CODE == 1145117 || step_val.EIS_ECI_CODE == 1145119) {
                $scope.panelTrackStep(step_val.EIS_ECI_CODE, 60272);
            }

            //Shahid Start
            if (['5965', '5950'].indexOf($scope.category_code) > -1) {
                $scope.base_desc = $scope.base_desc ? $scope.base_desc : 'Two Way';
                $scope.StepOptionPrice(107, step_val.EIS_ECI_CODE, $scope.color_selected, '', m_width, m_height, '', '', '', '', $scope.qty.value, $scope.base_desc, '', 'material', $scope.reserve_stock);

                if ($scope.borderColor_selected && $scope.border_type) {
                    setTimeout(function () {
                        $scope.StepOptionPrice(6844, step_val.EIS_ECI_CODE, $scope.borderColor_selected, '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value, $scope.border_type);
                    }, 200);
                }

                //Lining Option Price

                $scope.StepOptionPrice(109128, step_val.EIS_ECI_CODE, $scope.lining_matrial_id, '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value, $scope.base_desc, '', 'material', $scope.reserve_stock);
                if ($scope.control_uom) {
                    $scope.StepOptionPrice(134479, step_val.EIS_ECI_CODE, $scope.control_uom, '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value, $scope.base_desc, '', 'material', $scope.reserve_stock);
                }

            } else {
                $scope.StepOptionPrice(107, step_val.EIS_ECI_CODE, $scope.color_selected, '', m_width, m_height, '', '', '', '', $scope.qty.value, '', '', 'material', $scope.reserve_stock);
            }
            //Shahid End

        } else if (item.hasOwnProperty('ECI_MIN_WIDTH') && m_width >= item.ECI_MIN_WIDTH && m_width <= item.ECI_MAX_WIDTH && m_height >= item.ECI_MIN_HEIGHT && m_height <= item.ECI_MAX_HEIGHT && $scope.pro_item.ECI_RESTRICT_TO_MATERIAL_WIDTH_YN == 'N') {
            $scope.itemProduct_array[107] = [m_width, m_height, item.EIS_ECI_CODE];
            $scope.active_cls = 'active_icon';
            var step_obj2 = {
                'width': m_width,
                'height': m_height,
                'pcs': '',
                'item_code': $scope.color_selected,
                'item_value': '',
                'price': '',
                'qty_pcs': $scope.qty.value
            };
            $scope.step_array[step_val.EIS_ECS_CODE] = angular.merge({}, $scope.step_array_obj(step_val), step_obj2);
            threeJS.measurementText(m_width, m_height);
            
            if ($scope.typeOfMotor_selected) {
                var height = $scope.eci_motorize_max_height >= $scope.measurement_height.value ? true : false;
                var width = $scope.eci_motorize_min_width <= $scope.measurement_width.value ? true : false;
                if (height == false || width == false) {
                    if ($scope.control_selected == 'PO02' || $scope.typeOfMotor_selected || $scope.control_selected == 'TO03') {

                        var options = {
                            closeButton: false,
                            backdrop: true,
                            title: $translate.instant('attention'),
                            message: $translate.instant('motorization_attention_mgs', { min_width: $scope.eci_motorize_min_width, max_height: $scope.eci_motorize_max_height }),
                            //message: 'Motorization option required minimum product width <b>' + $scope.eci_motorize_min_width + 'CM</b> and maximum height  <b>' + $scope.eci_motorize_max_height + 'CM</b>. We recommend the manual control.',
                            className: 'addToCart_pupup',
                            buttons: $scope.customCancelButtons,
                            locale: 'ar'
                        };
                        $ngBootbox.customDialog(options);
                        delete $scope.step_array[109];
                        delete $scope.step_array[134479];
                        $('#3283').find('.active_icon').removeClass('active_icon');
                        $scope.motorPosition_selected = '';
                        $scope.typeOfMotor_selected = '';
                        $scope.remote_selected = '';
                        $scope.motorPositionValue.name='';
                        $scope.motorized.name='';
                        delete $scope.step_array[4068];
                        delete $scope.step_array[5745];
                        delete $scope.step_array[3283];
                        delete $scope.step_array[251975];
                        delete $scope.price_array[5745];
                        delete $scope.price_array[4068];
                        delete $scope.price_array[251975];
                        $('.desc109').html('<i class="fas fa-exclamation hide" style="font-size: 10px !important;color: red;" title="Control Type Step"></i>');
                       $('.desc134479').html('<i class="fas fa-exclamation hide" style="font-size: 10px !important;color: red;" title="Control Type Step"></i>');
                        $scope.control_selected = '';
                        $scope.track_option.name='';
                        //return true;
                    }

                } else {
                    $scope.StepOptionPrice(4068, step_val.EIS_ECI_CODE, 'MOTOR', '1', $scope.measurement_width.value, $scope.measurement_height.value, $scope.typeOfMotor_selected, '', '', '', $scope.qty.value);
                    // console.log($scope.typeOfMotor_selected);
                    // console.log($scope.chargerUom);
                    if($scope.typeOfMotor_selected == 'MO02'){
                        $scope.StepOptionPrice(251975, $scope.itemProduct_array[1], $scope.chargerUom, '1', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value, '', '' , 'CHARGER', '');
                    }
                }
                if ($scope.installation_selected) {
                    $scope.StepOptionPrice(7108, step_val.EIS_ECI_CODE, 'BRACKET', '', $scope.measurement_width.value, $scope.measurement_height.value, $scope.motor_code, $scope.control_selected, $scope.surface_selected, $scope.installation_selected, $scope.qty.value, '', $scope.valance_selected);
                }
            }

            if ($scope.valance_selected) {
                delete $scope.price_array[1480];
                if ($scope.valance_selected != 'VAL02') {
                    $scope.StepOptionPrice(1480, step_val.EIS_ECI_CODE, 'VALANCE', '', $scope.measurement_width.value, $scope.measurement_height.value, '', $scope.control_selected, '', '', $scope.qty.value);
                }
            }

            if ($scope.remote_selected) {
                $scope.StepOptionPrice(5745, step_val.EIS_ECI_CODE, $scope.remote_selected, '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value);
            }

            if ($scope.glassColor_selected && $scope.base_desc) {
                $scope.StepOptionPrice(6572, step_val.EIS_ECI_CODE, $scope.glassColor_selected, '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value, $scope.base_desc);
            }

            if (step_val.EIS_ECI_CODE == 1145117 || step_val.EIS_ECI_CODE == 1145119) {
                $scope.panelTrackStep(step_val.EIS_ECI_CODE, 60272);
            }

            //$scope.StepOptionPrice(107, step_val.EIS_ECI_CODE, $scope.color_selected, '', m_width, m_height, '', '', '', '', $scope.qty.value, '', '', 'material', $scope.reserve_stock);

            //sandeep start

            if (['5965'].indexOf($scope.category_code) > -1) {//sandeep
                $scope.base_desc = $scope.base_desc ? $scope.base_desc : 'Two Way';
                $scope.StepOptionPrice(107, step_val.EIS_ECI_CODE, $scope.color_selected, '', m_width, m_height, '', '', '', '', $scope.qty.value, $scope.base_desc, '', 'material', $scope.reserve_stock);

                if ($scope.borderColor_selected && $scope.border_type) {
                    setTimeout(function () {
                        $scope.StepOptionPrice(6844, step_val.EIS_ECI_CODE, $scope.borderColor_selected, '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.boder_qty, $scope.border_type);
                    }, 200);
                }
                //Lining Option Price

                $scope.StepOptionPrice(109128, step_val.EIS_ECI_CODE, $scope.lining_matrial_id, '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value, $scope.base_desc, '', 'material', $scope.reserve_stock);
                //Shahid Start
                if ($scope.control_uom) {
                    $scope.StepOptionPrice(134479, step_val.EIS_ECI_CODE, $scope.control_uom, '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value, $scope.base_desc, '', 'material', $scope.reserve_stock);
                }

                $scope.fabricLimtHeight($scope.measurement_height.value)
                //Shahid End
            } else {
                $scope.StepOptionPrice(107, step_val.EIS_ECI_CODE, $scope.color_selected, '', m_width, m_height, '', '', '', '', $scope.qty.value, '', '', 'material', $scope.reserve_stock);
            }
            //sandeep end

            m_width = m_width > 0 ? m_width : 0;
            m_height = m_height > 0 ? m_height : 0;
            $('.desc107').html($translate.instant('measurement_val_mgs', { 'm_width': m_width, 'm_height': m_height }))
            m_error = '';
        } else {
            delete $scope.itemProduct_array[107];
            $scope.active_cls = '';
            m_error = ' <i class="fas fa-exclamation" style="font-size: 10px !important;color: red;" title="Measurement"></i>';
            $('.desc107').html(m_error);
        }

        $scope.itemSelection();
        //$scope.turnedFabric();

        $scope.filterArray['m_width']=m_width;
        
        var user_width=m_width; 
        if(item.ECI_CODE=='1145117'){ /// ---3 Sliding Panel 3 Channel 
            user_width=parseInt(m_width/3)+20; 
        }else if(item.ECI_CODE=='1145119'){  // ---4 Sliding Panel 3 Channel 
            user_width=parseInt(m_width/4)+20; 
        }else{
            user_width=m_width; 
        }
        
        if (user_width > $scope.matrial_width  && $scope.color_selected &&  ['5964','5957','5965','68243','5941','5978'].indexOf($scope.category_code)==-1) {
            console.log(m_width ,user_width, $scope.matrial_width);
            console.log($scope.color_selected);
            $scope.alertMessageMaxWidth();
            
        }
    };

    $scope.alertMessageMaxWidth=function(){
        $scope.customButton = {
            warning: {
                label: $translate.instant('change_the_selection'),    //"Checkout",
                className: "btn-Mydefault",
                callback: function () {
                    if(!$('.colorSection_popup').hasClass('in')){
                        $scope.colorSectionPopup();
                    }
                    $scope.$apply();
                }
            }
        };
        var options = {
            closeButton: false,
            backdrop: true,
            message: $translate.instant('alertMessageMaxWidth_mgs'),       //'Your item has been added.',
            className: 'addToCart_pupup',
            buttons: $scope.customButton
        };
        $ngBootbox.customDialog(options);
        console.log($scope.step_array)
    }

    $scope.fabricLimtHeight=function(m_height){
    
       // console.log($scope.ECM_LENGTH+'<='+m_height);

        if($scope.ECM_LENGTH && m_height && $scope.ECM_LENGTH>0 &&  $scope.ECM_LENGTH<m_height){
            console.log($scope.step_array);
            $scope.customButton = {
                success: {
                    label: $translate.instant('keep_the_same_selection'),  // "Continue Shopping",
                    className: "btn-Mydefault pull-left",
                    callback: function () {                       
                    var remarks_info = {mgs_key:'fabricLimt_mgs_db',fabric_h:$scope.ECM_LENGTH,mes_height:m_height} ;
                    $scope.step_array[107].remarks = JSON.stringify(remarks_info);
                        $scope.$apply();
                    }
                },
                warning: {
                    label: $translate.instant('change_the_selection'),    //"Checkout",
                    className: "btn-Mydefault",
                    callback: function () {
                        $scope.step_array[107].remarks = '';
                        if(!$('.colorSection_popup').hasClass('in')){
                            $scope.colorSectionPopup();
                        }
                        $scope.$apply();
                        //$scope.addMoreProduct('Warning', true);
                    }
                }
        
            };

            var options = {
                closeButton: false,
                backdrop: true,
                message: $translate.instant('fabricLimt_mgs',{fabric_h:$scope.ECM_LENGTH}),       //'Your item has been added.',
                className: 'addToCart_pupup',
                buttons: $scope.customButton
            };
            $ngBootbox.customDialog(options);
            console.log($scope.step_array)
        }

    };
    /*$scope.turnedFabric = function () {
     if (ECI_CODE != 1018308) {
     return true;
     }
     
     if (m_width > $scope.matrial_width && m_height > $scope.matrial_width) {
     
     //$scope.textureTurned = "Roller blind will be divided into multiple part according to fabric width(" + $scope.matrial_width + "LMT) !";
     $scope.textureTurned = "Both value(Height and Width) can not greater than fabric width(" + $scope.matrial_width + "LMT).Only one value can be greater than material Width";
     $scope.itemProduct_array['turn_texture'] = texture_turn;
     var error = ' <i class="fas fa-exclamation" style="font-size: 10px !important;color: red;" title="' + $scope.textureTurned + '"></i>';
     $('.desc107').html('W : ' + m_width + 'cm H : ' + m_height + 'cm ' + error);
     $scope.divided = true;
     } else if (m_height && m_width > $scope.matrial_width && m_height < $scope.matrial_width && !texture_turn) {
     $scope.divided = false;
     threeJS.rotateTextureImg(7.855);
     texture_turn = true;
     $scope.textureTurned = 'Fabric has been turned !';
     $scope.itemProduct_array['turn_texture'] = texture_turn;
     } else if (m_width && m_height && m_width < $scope.matrial_width && texture_turn) {
     $scope.divided = false;
     threeJS.rotateTextureImg(0);
     texture_turn = false;
     $scope.textureTurned = '';
     $scope.itemProduct_array['turn_texture'] = texture_turn;
     } else {
     if (m_height && m_width > $scope.matrial_width && m_height < $scope.matrial_width && texture_turn) {
     texture_turn = false;
     } else if (m_width && m_height && m_width < $scope.matrial_width && texture_turn) {
     texture_turn = true;
     } else if (m_width && m_height && m_width < $scope.matrial_width && m_height > $scope.matrial_width) {
     texture_turn = true;
     }
     
     //$scope.textureTurned = '';
     //$scope.itemProduct_array['turn_texture'] = false;
     $scope.itemProduct_array['turn_texture'] = texture_turn;
     }
     
     };*/

    $scope.bottomType = function (item, parent_step) {
        $('.desc' + item.EIS_ECS_CODE).text(item.EIS_DESC);
        $scope.itemProduct_array[item.EIS_ECS_CODE] = item.EIS_SYS_ID;
        $scope.step_array[item.EIS_ECS_CODE] = $scope.step_array_obj(item, parent_step);
        //console.log($scope.step_array[item.EIS_ECS_CODE]);
        $scope.step_array[item.EIS_ECS_CODE]['item_code'] = item.EIS_UOM;
        $scope.bottom_selected = item.EIS_CODE;
        // console.log($scope.step_array[item.EIS_ECS_CODE]);
        threeJS.bottomBar(item.EIS_CODE);
        $scope.itemSelection();
    };
    $scope.itemLabel = function (item) {
        $scope.roomTypeValue = $('#roomTypeValue').find('option:selected').attr('desc_en');
        $scope.roomType_desc = $('#roomTypeValue').find('option:selected').text();
        $scope.roomTypeCode = $('#roomTypeValue').find('option:selected').attr('label_code');
        $scope.roomDescription = $('#description').val();
        $scope.itemProduct_array[113] = [$scope.roomDescription, $scope.roomTypeValue];

        var step_obj2 = {
            'remarks': $scope.roomDescription,
            'option_desc': $scope.roomTypeValue,
            'option_code': $scope.roomTypeCode,
            'value': $scope.roomDescription,
        };
        $scope.step_array[item.EIS_ECS_CODE] = angular.merge({}, $scope.step_array_obj(item), step_obj2);
        //$('.desc113').text($('#roomTypeValue').find('option:selected').text());
        $('.desc113').text($scope.roomType_desc);
        $scope.itemSelection();
    };

    $scope.defaultItemLabel = function (item) {

        $scope.roomTypeValue = item.EIS_DESC_EN;
        $scope.roomType_desc = item.EIS_DESC;
        $scope.roomTypeCode =  item.EIS_CODE;
        $scope.roomDescription = $translate.instant('Default');
        $scope.itemProduct_array[113] = [$scope.roomDescription, $scope.roomTypeValue];

        var step_obj2 = {
            'remarks': $scope.roomDescription,
            'option_desc': $scope.roomTypeValue,
            'option_code': $scope.roomTypeCode,
            'value': $scope.roomDescription,
        };
        $scope.step_array[item.EIS_ECS_CODE] = angular.merge({}, $scope.step_array_obj(item), step_obj2);
        //$('.desc113').text($('#roomTypeValue').find('option:selected').text());
        $('.desc113').text($scope.roomType_desc);
        $scope.itemSelection();
    };

    $scope.lengthOfWireFun = function (val, item) {
       
        setTimeout(function () {
            $('#lengthOfWire').find('option:selected').val(val.id);
            $('#desc5747').text(val.label);
        }, 100);
        $scope.itemProduct_array[5747] = [val.id];
        var step_obj2 = {
            'option_desc': val.id ? val.id : $scope.wireLength
        };
        $scope.step_array[5747] = angular.merge({}, $scope.step_array_obj(item), step_obj2);
        // $scope.priceCalculate();
    };
    $scope.valance = function (item, parent_step) {
        //console.log(parent_step);
        //$('.desc' + item.EIS_ECS_CODE).text(item.EIS_DESC);
        $scope.itemProduct_array[item.EIS_ECS_CODE] = item.EIS_SYS_ID;
        $scope.step_array[item.EIS_ECS_CODE] = $scope.step_array_obj(item, parent_step);
        $scope.valance_selected = item.EIS_CODE;
        threeJS.valance(item.EIS_CODE);
        $scope.itemSelection();
        if ($scope.valance_selected) {
            delete $scope.price_array[1480];
            if ($scope.valance_selected != 'VAL02') {
                $scope.StepOptionPrice(1480, item.EIS_ECI_CODE, 'VALANCE', '', $scope.measurement_width.value, $scope.measurement_height.value, '', $scope.control_selected, '', '', $scope.qty.value);
            }


            if ($scope.installation_selected) {
                $scope.StepOptionPrice(7108, item.EIS_ECI_CODE, 'BRACKET', '', $scope.measurement_width.value, $scope.measurement_height.value, $scope.motor_code, $scope.control_selected, $scope.surface_selected, $scope.installation_selected, $scope.qty.value, '', $scope.valance_selected);
            }

        }
        $scope.priceCalculate();
        setTimeout(function () {
            $scope.checkParentValidation(1480, item.EIS_ECS_CODE, item.EIS_DESC);
        }, 100);
    };
    $scope.glassOption = function (item, parent_step) {

        //console.log(item);
        //  console.log(parent_step);
        delete $scope.step_array[6572];
        delete $scope.price_array[6572];
        $scope.glassColor_selected = '';
        
        if($scope.lining_option_yn=='N' && item.EIS_CODE!='LIN01' && $scope.advanced_custonize_pro && $scope.advanced_custonize_pro.indexOf($scope.category_code) > -1 && ['5941','5978'].indexOf($scope.category_code)==-1){
            $ngBootbox.alert($translate.instant('lining_option_mgs'));
            return true;
        }

        $scope.itemProduct_array[item.EIS_ECS_CODE] = item.EIS_SYS_ID;

        //$scope.step_array[item.EIS_ECS_CODE] = $scope.step_array_obj(item, parent_step);

        var step_obj2 = {
            'item_code': item.EIS_UOM,
        };
        $scope.step_array[item.EIS_ECS_CODE] = angular.merge({}, $scope.step_array_obj(item, parent_step), step_obj2);


        $scope.glassOption_selected = item.EIS_CODE;
        $scope.priceCalculate();
        threeJS.glassOption(item.EIS_CODE);
        $scope.itemSelection();
        $scope.lining_matrial_id = '';

        //Shahid Start
        if (['5965', '5950'].indexOf($scope.category_code) > -1) {
            // var lining_obj= item.child;
            //console.log(lining_obj);

            /* if(lining_obj){
                 var firstKey = Object.keys(lining_obj)[0];
                 var lining_color=lining_obj[firstKey];
                 if(lining_color.hasOwnProperty('color') && lining_color.color.length>0){
                     $scope.lining_matrial_id= lining_color.color[0].ECM_CODE
                 }

                
             }*/

            $scope.lining_matrial_id = item.EIS_UOM;

            if ($scope.measurement_width.value > 0 && $scope.measurement_height.value > 0) {
                $scope.StepOptionPrice(item.EIS_ECS_CODE, item.EIS_ECI_CODE, $scope.lining_matrial_id, '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value, $scope.base_desc, '', 'material', $scope.reserve_stock);
            }

        }
        //Shahid End


        setTimeout(function () {
            $scope.checkParentValidation(1940, item.EIS_ECS_CODE, item.EIS_DESC);
        }, 100);
    };
    $scope.glassColor = function (item, parent_step) {
        //console.log(parent_step);
        $('#desc' + parent_step.EIS_ECS_CODE).text(item.ITEM_ID);
        //$('#desc6572').html(depth);
        var step_obj2 = {
            'ordering': parent_step.EIS_ORDERING,
            'option_desc': item.ITEM_ID,
            'item_code': item.ECM_CODE,
            'collection': item.ECM_ECC_CODE,
            'item': item.ECM_ECI_CODE,
            'price': '', //item.ECM_PRICE_BASIC * 1,
            'desc': item.ECM_DESC,
            'uom': item.ECM_UOM_CODE,
            'data_source': parent_step.ECS_DATA_SOURCE
        };
        $scope.step_array[parent_step.EIS_ECS_CODE] = angular.merge({}, $scope.step_array_obj(item, parent_step), step_obj2);
        $scope.glassColor_selected = item.ECM_CODE;
        $scope.itemProduct_array[item.EIS_ECS_CODE] = item.ECM_CODE;

        // $scope.StepOptionPrice(6572, item.ECM_ECI_CODE, $scope.glassColor_selected, '', $scope.measurement_width.value, $scope.measuirement_height.value, '', '', '', '', $scope.qty.value, $scope.base_desc);

        //sandeep start

        if ($scope.advanced_custonize_pro && $scope.advanced_custonize_pro.indexOf($scope.category_code) > -1) {
            $scope.StepOptionPrice(6572, item.ECM_ECI_CODE, $scope.glassColor_selected, '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value, $scope.base_desc, '', 'material', $scope.reserve_stock);
        } else {
            $scope.StepOptionPrice(6572, item.ECM_ECI_CODE, $scope.glassColor_selected, '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value, $scope.base_desc);
        }
        //sandeep end
        threeJS.glassColor(item);
        $scope.itemSelection();
        //console.log($scope.step_array);
        setTimeout(function () {
            $scope.checkValidation(parent_step.EIS_ECS_CODE);
        }, 100);
    };
    $scope.cornice = function (item) {
        $('.desc' + item.EIS_ECS_CODE).text(item.EIS_DESC);
        $scope.itemProduct_array[item.EIS_ECS_CODE] = item.EIS_SYS_ID;
        $scope.cornice_selected = item.EIS_CODE;
        threeJS.cornice(item.EIS_CODE);
        //$scope.priceCalculate();
        $scope.itemSelection();
        $scope.step_array[item.EIS_ECS_CODE] = $scope.step_array_obj(item);
    };
    $scope.installationFunction = function (item, parent_step) {
        var error = '<i class="fas fa-exclamation show" style="font-size: 10px !important;color: red;" title="Installation Surface"></i>';
        if ($('#desc7104').children('.fa-exclamation').hasClass('hide') == true || $('#desc7104').children('.fa-exclamation').hasClass('show') == true) {
            $('.desc2024').html(error);
            //return true;
        } else {
            $('#desc7108').html(item.EIS_DESC);
            $('.desc2024').html(item.EIS_DESC);
        }
        $scope.itemProduct_array[item.EIS_ECS_CODE] = item.EIS_SYS_ID;
        $scope.installation_selected = item.EIS_CODE;
        $scope.itemSelection();
        $scope.installationSurface = {
            name: item.EIS_DESC
        };
        var step_obj2 = {
            'pcs': '',
            'item_code': '',
            'remarks': '',
        };
        $scope.step_array[item.EIS_ECS_CODE] = angular.merge({}, $scope.step_array_obj(item, parent_step), step_obj2);
        if ($scope.measurement_width.value > 0 && $scope.measurement_height.value > 0) {
            $scope.control_selected = $scope.control_selected == undefined ? '' : $scope.control_selected;
            var motor_code = $scope.step_array.hasOwnProperty('4068').item_code ? $scope.step_array.hasOwnProperty('4068').item_code : $scope.motor_code;
            $scope.StepOptionPrice(7108, item.EIS_ECI_CODE, 'BRACKET', '', $scope.measurement_width.value, $scope.measurement_height.value, motor_code, $scope.control_selected, $scope.surface_selected, item.EIS_CODE, $scope.qty.value, '', $scope.valance_selected);
        }
    };
    $scope.typeOfMotor = function (item, parent_step, type) {

        //console.log(item);
        // $scope.lengthOfWire = 5;
        // console.log($scope.lengthOfWire);
        $scope.motorized = {
            name: item.EIS_CODE
        };
        
        $http({
            method: 'POST',
            url:service_url + 'ShowroomApi/getmotor_dimension',
            data:$.param({
                item_product: item.EIS_ECI_CODE, 
                component_type: 'MOTOR', 
                p_type: 1, 
                width: $scope.measurement_width.value, 
                height: $scope.measurement_height.value, 
                params1: item.EIS_CODE, 
                params2: '', 
                params3: '', 
                params4: '', 
                params5: $scope.qty.value
            }),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function (response) {
            //console.log(response.data);
            $scope.motorStock = response.data;
            if ($scope.motorStock.stock == 'No') {
                $('#4068').find('.rediochecker').prop('checked', false);
                $('#loader_div').show();
                var options = {
                    templateUrl: $scope.temp_path + 'popup/motorDimension.html?v='+version,
                    scope: $scope,
                    size: 'small',
                    // backdrop: false,
                    title: 'Applicable dimensions for motorized product',
                    className: 'material_popup',
                    onEscape: function () {
                    }
                };
                $ngBootbox.customDialog(options);
                $('#loader_div').hide();
            } else {
                //console.log(item.child);
                
                $scope.wireStep = item.child ? item.child : parent_step.child;
                $('#desc' + item.EIS_ECS_CODE).text(item.EIS_DESC);
                // $('.desc' + item.EIS_ECS_CODE).text(item.EIS_DESC);
                $scope.itemProduct_array[item.EIS_ECS_CODE] = item.EIS_SYS_ID;
                //$scope.price_array[item.EIS_ECS_CODE] = item.EIS_PRICE * 1;
                $scope.typeOfMotor_selected = item.EIS_CODE;
                $scope.itemSelection();
                if (type != 'direct') {
                    delete $scope.step_array[5747];
                    //$scope.step_array[5745] = {};
                }
                if ($scope.measurement_width.value > 0 && $scope.measurement_height.value > 0) {
                    var step_obj2 = {
                        'pcs': parseFloat($scope.qty.value),
                        'item_code': '',
                        'price': '',
                        'item_value': '',
                    };
                    $scope.step_array[item.EIS_ECS_CODE] = angular.merge({}, $scope.step_array_obj(item, parent_step), step_obj2);
                    
                    $scope.StepOptionPrice(4068, item.EIS_ECI_CODE, 'MOTOR', '1', $scope.measurement_width.value, $scope.measurement_height.value, item.EIS_CODE, '', '', '', $scope.qty.value);
                   // setTimeout(function(){
                        if($scope.typeOfMotor_selected == 'MO02'){
                            console.log('CCCCCCCCCC');
                            console.log(item);
                            console.log(item.child);
                            
                            var charger = item.child[item.EIS_ORDERING + '.1'];
                            $scope.chargerUom = charger.EIS_UOM;
                            var step_charger = {
                                'pcs': parseFloat($scope.qty.value),
                                'item_code': charger.EIS_UOM,
                                'price': '',
                                'item_value': '',
                            };
                            $scope.step_array[charger.EIS_ECS_CODE] = angular.merge({}, $scope.step_array_obj(charger, item), step_charger);
                            $scope.StepOptionPrice(251975, charger.EIS_ECI_CODE, charger.EIS_UOM, '1', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value, '', '' , 'CHARGER', '');
                        }else{
                            delete $scope.step_array[251975];
                            delete $scope.price_array[251975];
                        }
                   // }, 500);
                    
                    
                    if ($scope.installation_selected) {
                        $scope.StepOptionPrice(7108, item.EIS_ECI_CODE, 'BRACKET', '', $scope.measurement_width.value, $scope.measurement_height.value, $scope.motor_code, $scope.control_selected, $scope.surface_selected, $scope.installation_selected, $scope.qty.value, '', $scope.valance_selected);
                    }

                    if ($scope.remote_selected) {
                        $scope.StepOptionPrice(5745, item.EIS_ECI_CODE, $scope.remote_selected, '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value);
                    }

                    if ($scope.valance_selected) {
                        delete $scope.price_array[1480];
                        if ($scope.valance_selected != 'VAL02') {
                            $scope.StepOptionPrice(1480, item.EIS_ECI_CODE, 'VALANCE', '', $scope.measurement_width.value, $scope.measurement_height.value, '', $scope.control_selected, '', '', $scope.qty.value);
                        }
                    }

                } else {
                    var step_obj2 = {
                        'pcs': '',
                        'item_code': $scope.motor_code,
                        'price': '',
                        'item_value': '',
                    };
                    $scope.step_array[item.EIS_ECS_CODE] = angular.merge({}, $scope.step_array_obj(item, parent_step), step_obj2);
                }

                setTimeout(function () {
                    $scope.checkValidation(item.EIS_ECS_CODE);
                    $scope.checkParentValidation(109, 109,  $scope.control_tyep_desc);
                }, 100);
            }
        });
    };

    $scope.charger = function (item, parent_step) {
        $scope.chargerUom = item.EIS_UOM;
        var step_charger = {
            'pcs': parseFloat($scope.qty.value),
            'item_code': item.EIS_UOM,
            'price': '',
            'item_value': '',
        };
        $scope.step_array[item.EIS_ECS_CODE] = angular.merge({}, $scope.step_array_obj(item, parent_step), step_charger);
        $scope.StepOptionPrice(251975, item.EIS_ECI_CODE, item.EIS_UOM, '1', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value, '', '' , 'CHARGER', '');
    
    };


    $scope.motorPosition = function (item, parent_step) {

        $('#desc' + item.EIS_ECS_CODE).text(item.EIS_DESC);
        // $('.desc' + item.EIS_ECS_CODE).text(item.EIS_DESC);
        $scope.itemProduct_array[item.EIS_ECS_CODE] = item.EIS_SYS_ID;
        //$scope.price_array[item.EIS_ECS_CODE] = item.EIS_PRICE * 1;
        $scope.motorPosition_selected = item.EIS_CODE;
        //$scope.priceCalculate();
        //	$scope.itemSelection();
        $scope.motorPositionValue = {
            name: item.EIS_CODE
        };
        $scope.step_array[item.EIS_ECS_CODE] = $scope.step_array_obj(item, parent_step);
        setTimeout(function () {
            $scope.checkValidation(item.EIS_ECS_CODE);
            $scope.checkParentValidation(109, 109,  $scope.control_tyep_desc);
        }, 100);
        
    };
    $scope.openingDirection = function (item, parent_step) {
        $('.desc' + item.EIS_ECS_CODE).text(item.EIS_DESC);
        $scope.itemProduct_array[item.EIS_ECS_CODE] = item.EIS_SYS_ID;
        $scope.step_array[item.EIS_ECS_CODE] = $scope.step_array_obj(item, parent_step);
        // $scope.price_array[item.EIS_ECS_CODE] = item.EIS_PRICE * 1;
        $scope.opening_direction = item.EIS_CODE;
        // $scope.priceCalculate();
        $scope.itemSelection();
    };
    $scope.valanceColor = function (item, parent_step) {
        //console.log(item.ECM_ITEM_ID);
        $('#desc' + parent_step.EIS_ECS_CODE).text(item.ITEM_ID);
        // $('.desc' + parent_step.EIS_ECS_CODE).text(item.ECM_ITEM_ID);
        if ($scope.valanceColor_selected && $scope.valanceColor_selected == item.ECM_CODE) {
            return true;
        }

        var step_obj2 = {
            'option_desc': item.ITEM_ID,
            'item_code': item.ECM_CODE,
            'collection': item.ECM_ECC_CODE,
            'item': item.ECM_ECI_CODE,
            'price': item.ECM_PRICE_BASIC * 1,
            'desc': item.ECM_DESC,
            'uom': item.ECM_UOM_CODE,
            'data_source': parent_step.ECS_DATA_SOURCE,
            'ordering': parent_step.EIS_ORDERING
        };
        $scope.step_array[parent_step.EIS_ECS_CODE] = angular.merge({}, $scope.step_array_obj(item, parent_step), step_obj2);
        $scope.valanceColor_selected = item.ECM_CODE;
        $scope.itemProduct_array[parent_step.EIS_ECS_CODE] = item.ECM_CODE;
        // $scope.price_array[parent_step.EIS_ECS_CODE] = 0;
        threeJS.valanceColor(item);
        // $scope.priceCalculate();
        $scope.itemSelection();
        setTimeout(function () {
            $scope.checkValidation(parent_step.EIS_ECS_CODE);
        }, 100);
    };
    $scope.corniceColor = function (item) {
        if ($scope.corniceColor_selected && $scope.corniceColor_selected == item.ECM_CODE) {
            return true;
        }
        $scope.corniceColor_selected = item.ECM_CODE;
        $scope.itemProduct_array[98] = item.ECM_CODE;
        // $scope.price_array[98] = 0;
        threeJS.corniceColor(item);
        // item.hasOwnProperty('light_info') && item.light_info.length > 0 ? threeJS.light(item.light_info, item.ECM_LIGHT_INTENSITY) : '';
        // $scope.priceCalculate();
        $scope.itemSelection();
    };
    $scope.designType = function (item) {
        if ($scope.design_selected == item.OBJ_CODE) {
            return false;
        }
        $scope.step_array[item.EIS_ECS_CODE] = $scope.step_array_obj(item);
        $scope.design_selected = item.OBJ_CODE;
        threeJS.designType(item, function (material) {
            threeJS.updateTextureImg(material);
        });
    };
    $scope.windowDepth = function (item, parent_step) {

        var error = '<i class="fas fa-exclamation show" style="font-size: 10px !important;color: red;" title="Window Depth"></i>';
        var window_depth = $scope.window_depth.value;
        $scope.itemProduct_array[5740] = [window_depth];
        $scope.active_cls = 'active_icon';
        depth = window_depth > 0 ? window_depth : error;
        console.log(depth);
        $('#desc5740').html(depth);
        var step_obj2 = {
            'depth': window_depth,
            'parent_ordering': parent_step.EIS_ORDERING
        };
        // console.log('$scope.step_array');
        // console.log($scope.step_array);
        $scope.step_array[item.EIS_ECS_CODE] = angular.merge({}, $scope.step_array_obj(item), step_obj2);
        setTimeout(function () {
            $scope.checkValidation(item.EIS_ECS_CODE);
        }, 100);
    };
    $scope.surface = function (item, parent_step) {
        var error = '<i class="fas fa-exclamation show" style="font-size: 10px !important;color: red;" title="Installation Surface"></i>';
        if ($scope.surface_selected == '' || $scope.installation_selected == '') {
            $('.desc2024').html(error);
            //return true;
        } else {
            $('#desc7104').text(item.EIS_DESC);
            $('.desc2024').html($scope.installationSurface.name);
            if ($scope.measurement_width.value > 0 && $scope.measurement_height.value > 0) {
                $scope.control_selected = $scope.control_selected == undefined ? '' : $scope.control_selected;
                var motor_code = $scope.step_array.hasOwnProperty('4068').item_code ? $scope.step_array.hasOwnProperty('4068').item_code : $scope.motor_code;
                $scope.StepOptionPrice(7108, item.EIS_ECI_CODE, 'BRACKET', '', $scope.measurement_width.value, $scope.measurement_height.value, motor_code, $scope.control_selected, item.EIS_CODE, $scope.installation_selected, $scope.qty.value, '', $scope.valance_selected);
            }
        }

        if ($scope.step_array.hasOwnProperty('7108') && $scope.step_array.hasOwnProperty('109')) {

            var motor_code = $scope.step_array.hasOwnProperty('4068').item_code ? $scope.step_array.hasOwnProperty('4068').item_code : '';
            $scope.step_array[7108].remarks = 'Control:' + $scope.step_array[109].option_id + '|Surface:' + item.EIS_CODE + '|Motor:' + motor_code + '|';
        }


        $('#desc' + item.EIS_ECS_CODE).text(item.EIS_DESC);
        $('.desc' + item.EIS_ECS_CODE).text(item.EIS_DESC);
        // $('#desc' + item.EIS_ECS_CODE).text(item.EIS_DESC);
        $scope.itemProduct_array[item.EIS_ECS_CODE] = item.EIS_SYS_ID;
        //$scope.price_array[item.EIS_ECS_CODE] = item.EIS_PRICE * 1;
        $scope.surface_selected = item.EIS_CODE;
        //$scope.priceCalculate();
        $scope.surfaceValue = {
            name: item.EIS_CODE
        };
        var step_obj2 = {
            'step_id': item.EIS_SYS_ID
        };
        $scope.step_array[item.EIS_ECS_CODE] = angular.merge({}, $scope.step_array_obj(item, parent_step), step_obj2);
    };
    $scope.glue = function (item, parent_step) {

        $('#desc' + parent_step.EIS_ECS_CODE).text(item.ITEM_ID);
        $('.desc' + parent_step.EIS_ECS_CODE).text(item.ITEM_ID);
        if ($scope.glue_selected == item.ECM_CODE) {
            return true;
        }

        var step_obj2 = {
            'price': '',
            'option_id': parent_step.EIS_CODE,
            'option_desc': item.ITEM_ID,
            'item': parent_step.EIS_ECI_CODE,
            'data_source': parent_step.ECS_DATA_SOURCE,
            'item_code': item.ECM_CODE,
            'ordering': parent_step.EIS_ORDERING,
            'item_value': '',
            'pcs': '',
            'glue_packet': ''
        }
        $scope.step_array[parent_step.EIS_ECS_CODE] = angular.merge({}, $scope.step_array_obj(item, parent_step), step_obj2);
        $scope.itemProduct_array[parent_step.EIS_ECS_CODE] = item.ECM_CODE;
        $scope.glue_selected = item.ECM_CODE;
        if ($scope.glueQty.value > 0) {
            var glue_qty = $scope.glueQty.value;
        } else {
            var glue_qty = $scope.step_array[107].pcs;
        }

        $scope.StepOptionPrice(63990, item.ECM_ECI_CODE, $scope.glue_selected, '', '0', '0', '', '', '', '', glue_qty, $scope.color_selected);
        $scope.glue_recommend = false;
        $scope.glue_qty_show = false;
        $scope.itemSelection();
        //$scope.priceCalculate();
    };
    $scope.noglue = function ($type) {
        $scope.no_glue = $type;
        $scope.glue_qty_show = true;
        $scope.glue_recommend = true;
        $scope.glue_selected = $type;
        $scope.glueQty = { value: 0 };
        delete $scope.step_array[63990];
        delete $scope.price_array[63990];
        $('#desc63990').html('');
        $scope.priceCalculate();
    };
    $scope.checkValidation = function (step_code) {
        if (step_code == 5740) {
            var id = 106;
        } else {
            var id = $("#" + step_code).parent().attr('id');
        }
        var parent_desc = $(".desc" + id).text();
        if ($("#" + id).find('.validationCheck').children('.fa-exclamation').length > 0) {
            $('.desc' + id).html(parent_desc + ' <i class="fas fa-exclamation" style="font-size: 10px !important;color: red;"></i>');
        } else {
            $('.desc' + id).text(parent_desc);
        }
    };
    $scope.checkParentValidation = function (parent_step, step_code, stepDesc) {
        if ($('#' + parent_step).find('.validationCheck').children('.fa-exclamation').length > 0) {
            $('.desc' + step_code).html(stepDesc + ' <i class="fas fa-exclamation" style="font-size: 10px !important;color: red;"></i>');
        } else {
            $('.desc' + step_code).text(stepDesc);
        }
    };
    $scope.imagePopupView = function (material_data) {
        $scope.material_data = material_data;
    };
    $scope.imagePopupView11 = function (val) {
        $scope.more_img_view = val;
    };
    $scope.matrialPopup = function (material_data) {
        //console.log(material_data);
        $scope.maximum_sample = false;
        $('#loader_div').show();
        $scope.material_data = material_data;
        var ECM_IF_CODE = material_data.ECM_IF_CODE;
        if ($scope.full_img_cover.indexOf(material_data.ECI_CODE) < 0 && material_data.ECI_MATERIAL_ROWS <= 2) {
            $scope.full_img_cover.push(material_data.ECI_CODE);
        }
        if ($scope.zig_zagImg.indexOf(material_data.ECI_CODE) < 0 && material_data.ECI_MATERIAL_EDGE == 'Z') {
            $scope.zig_zagImg.push(material_data.ECI_CODE);
        }
        var ECM_ECI_CODE = material_data.ECM_ECI_CODE;

        $http({
            method: 'GET',
            url:service_url + 'ShowroomApi/getFamilyMatrialImg/' + ECM_IF_CODE + '/' + ECM_ECI_CODE +'/'+ $scope.user_sys_id,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function (response) {
            $scope.family_img = dataGroup(response.data.family_img, 6);
            var matrial_options = {
                templateUrl: $scope.temp_path + 'popup/matrial_popup.html?v='+version,
                scope: $scope,
                // backdrop: false,
                title: material_data.COLLECTION_DESC,
                className: 'material_popup',
                onEscape: function () {
                }
            };
            $ngBootbox.customDialog(matrial_options);
            $('#loader_div').hide();
        });
    };
    $scope.priceCalculate = function () {
        //console.log($scope.price);
        //$scope.item_price = $scope.price;
        // $scope.itemSelection();
        var price = 0;
        var Waspr = 0;
        var Curpr = 0;
        angular.forEach($scope.price_array, function (i, e) {

            var minusvalue = parseFloat(($scope.material_price_was * $scope.step_array[107].pcs) - $scope.step_array[107].item_value);
            var data = e == 107 ? parseFloat(i + minusvalue) : i;  
            
            minusvalue=isNaN(minusvalue)?0:minusvalue;

            if (!isNaN(i) && i > 0) {
                price += parseFloat(i);
                //console.log(i);
                $scope.step_array[e].was_value = e == 107 ? parseFloat(i + minusvalue) : i;
                $scope.step_array[e].was_price = e == 107 ? $scope.material_price_was : $scope.step_array[e].price;

            }

        });

        // $scope.material_offer = $scope.material_offer > 0 ?  $scope.material_offer : $scope.step_array[102].offer;

        //console.log($scope.step_array);
        //if($scope.material_offer > 0){

        if (parseFloat($scope.material_price_was) > parseFloat($scope.material_price) && price > 0) {
            Waspr = parseFloat($scope.material_price_was * $scope.step_array[107].pcs);
            Curpr = parseFloat($scope.material_price * $scope.step_array[107].pcs);
            $scope.wasPrice = parseFloat(price + (parseFloat(Waspr) - parseFloat(Curpr)));
        } else {
            $scope.wasPrice = 0;
        }

        //console.log($scope.wasPrice);
        $scope.total_price = price;
        $scope.current_product_price = $scope.total_price;
        $scope.current_prod_qty = $scope.qty.value;

    };
    $scope.quantityUpdate = function (qty, type) {
        //console.log(qty+','+type);
        $scope.current_prod_qty = qty;
        $scope.step_array[107].qty_pcs = parseFloat(qty);
        $scope.step_array[102].qty_pcs = parseFloat(qty);

        console.log($scope.pro_item.ECI_QTY_CALCULATION_TYPE);
        // if (type != 'qty_recommend')
        // {
        $scope.recommend = true;
        if ($scope.pro_item.ECI_QTY_CALCULATION_TYPE == 'BOTH') {
            $scope.measurement_width.value = '';
            $scope.measurement_height.value = '';
            $scope.step_array[107].width = '';
            $scope.step_array[107].height = '';
            if (['5965', '5950'].indexOf($scope.category_code) > -1) {
                $scope.base_desc = $scope.base_desc ? $scope.base_desc : 'Two Way';
                $scope.StepOptionPrice(107, $scope.itemProduct_array[1], $scope.color_selected, '', 'NULL', 'NULL', '', '', '', '', $scope.qty.value, $scope.base_desc, '', 'material', $scope.reserve_stock);
            }else{
                console.log('here1221');
              $scope.StepOptionPrice(107, $scope.itemProduct_array[1], $scope.color_selected, '', 'NULL', 'NULL', '', '', '', '', parseFloat(qty), '', '', 'material', $scope.reserve_stock);
            }
        } else {
                if (['5965', '5950'].indexOf($scope.category_code) > -1) {
                    $scope.base_desc = $scope.base_desc ? $scope.base_desc : 'Two Way';
                    $scope.StepOptionPrice(107, $scope.itemProduct_array[1], $scope.color_selected, '', $scope.measurement_width.value,  $scope.measurement_height.value, '', '', '', '', $scope.qty.value, $scope.base_desc, '', 'material', $scope.reserve_stock);

                    if ($scope.measurement_width.value > 0 && $scope.measurement_height.value > 0 && $scope.lining_matrial_id) {
                        $scope.StepOptionPrice(109128,$scope.itemProduct_array[1], $scope.lining_matrial_id, '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value, $scope.base_desc, '', 'material', $scope.reserve_stock);
                    }

                    if ($scope.measurement_width.value > 0 && $scope.measurement_height.value > 0 && $scope.control_uom) {
                        $scope.StepOptionPrice(134479, $scope.itemProduct_array[1], $scope.control_uom, '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value, $scope.base_desc, '', 'material', $scope.reserve_stock);
                    }
         
                }else{
                    $scope.StepOptionPrice(107, $scope.itemProduct_array[1], $scope.color_selected, '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value, '', '', 'material', $scope.reserve_stock);
                }
                
            if ($scope.measurement_width.value > 0 && $scope.measurement_height.value > 0) {
                if ($scope.typeOfMotor_selected) {
                    $scope.StepOptionPrice(4068, $scope.itemProduct_array[1], 'MOTOR', '1', $scope.measurement_width.value, $scope.measurement_height.value, $scope.typeOfMotor_selected, '', '', '', $scope.qty.value);
                    
                    if($scope.typeOfMotor_selected == 'MO02'){
                        $scope.StepOptionPrice(251975, $scope.itemProduct_array[1], $scope.chargerUom, '1', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value, '', '' , 'CHARGER', '');
                    }
                
                }
                if ($scope.installation_selected) {
                    $scope.StepOptionPrice(7108, $scope.itemProduct_array[1], 'BRACKET', '', $scope.measurement_width.value, $scope.measurement_height.value, $scope.motor_code, $scope.control_selected, $scope.surface_selected, $scope.installation_selected, $scope.qty.value, '', $scope.valance_selected);
                }

                if ($scope.itemProduct_array[1] == 1145117 || $scope.itemProduct_array[1] == 1145119) {
                    $scope.panelTrackStep($scope.itemProduct_array[1], 60272);
                }
            }

            if ($scope.remote_selected) {
                $scope.StepOptionPrice(5745, $scope.itemProduct_array[1], $scope.remote_selected, '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value);
            }

            if ($scope.valance_selected) {
                delete $scope.price_array[1480];
                if ($scope.valance_selected != 'VAL02') {
                    $scope.StepOptionPrice(1480, $scope.itemProduct_array[1], 'VALANCE', '', $scope.measurement_width.value, $scope.measurement_height.value, '', $scope.control_selected, '', '', $scope.qty.value);
                }
            }


            if ($scope.glassColor_selected && $scope.base_desc) {
                $scope.StepOptionPrice(6572, $scope.itemProduct_array[1], $scope.glassColor_selected, '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value, $scope.base_desc);
            }

            //Shahid Start
            if ($scope.tiebelt_selected) {
                $scope.StepOptionPrice(109126, $scope.itemProduct_array[1], 'TIEBELT', '', '', '', $scope.tiebelt_selected + '-' + $scope.base_selected, '', '',  '', $scope.qty.value, '', '', $scope.color_selected);
            }
            //Shahid End
            if ($scope.borderColor_selected && $scope.border_type) {
                    $scope.StepOptionPrice(6844, $scope.itemProduct_array[1], $scope.borderColor_selected, '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value, $scope.border_type);
            }

        }

        // }
        $scope.qty.value = qty;
        //$scope.priceQtyCalculate($scope.item_selected, $scope.color_selected, 'NULL', 'NULL', $scope.qty.value);
    };
    $scope.glueQtyUpdate = function (qty) {
        $scope.step_array[63990].pcs = parseFloat(qty);
        $scope.step_array[63990].glue_packet = parseFloat(qty);
        $scope.glue_recommend = true;
        $scope.StepOptionPrice(63990, $scope.itemProduct_array[1], $scope.glue_selected, 'glueQty', '0', '0', '', '', '', '', qty, $scope.color_selected);
        $scope.glueQty.value = qty;
        $scope.priceCalculate();
    };
    $scope.checkout = function (type) {
    
        

        
        if ($rootScope.is_login == false) {

            $('#loader_div').show();
            var step_options = {
                templateUrl: $scope.temp_path + 'popup/login.html?v='+version,
                scope: $scope,
                size: 'small',
               // title: $translate.instant('login'),
                className: 'ShowroomLogin',
                onEscape: function () {
                }
            };
            $ngBootbox.customDialog(step_options);
            $('#loader_div').hide();

        }else{


        //khush

        if($scope.control_tyep_desc &&  $scope.control_tyep_desc.length>5){
            $scope.checkParentValidation(109, 109,  $scope.control_tyep_desc);
        }
        
        // $('.desc111,.desc1480,.desc3247,.desc2914').find('i').remove();
        // console.log($scope.step_array);
        // console.log($scope.price_array);

        // $scope.StepOptionPrice(type, $scope.itemProduct_array[1], $scope.color_selected, '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value, '', '', 'material', $scope.reserve_stock);
        // 
        //   //sandeep start

        $scope.error_mgs=[];    
            var j=0
                $('.fa-exclamation').each(function (i, e) {
                    var e_str=$(e).attr('title');
                    if(e_str && e_str.trim().length>1){
                        $scope.error_mgs[j++]=$(e).attr('title');    
                    
                        if($(e).attr('step_sys_id')=='102'){
                            $scope.colorSectionPopup();
                        }
                    }
                    
                });

        if($scope.error_mgs.length>0){
            var customizing_error_options = {
                templateUrl: $scope.temp_path + 'popup/customizing_error_mgs.html?v='+version,
                scope: $scope,
                // backdrop: false,
                title: $translate.instant('customizing_error_mgs_title'),
                className: 'material_popup',
                onEscape: function () {
                }
            };
            $ngBootbox.customDialog(customizing_error_options);
    
        }
        //khuush




            //$scope.add_more_item =true;
            if (['5965'].indexOf($scope.category_code) > -1) {//sandeep
                $scope.StepOptionPrice(type, $scope.itemProduct_array[1], $scope.color_selected, '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value, $scope.base_desc, '', 'material', $scope.reserve_stock);
            } else {
                $scope.StepOptionPrice(type, $scope.itemProduct_array[1], $scope.color_selected, '', $scope.measurement_width.value, $scope.measurement_height.value, '', '', '', '', $scope.qty.value, '', '', 'material', $scope.reserve_stock);
            }
            //sandeep end
        }    
    };


    function DialogController($scope, $mdDialog, image_path, material_data) {
        $scope.image_path = image_path;
        $scope.material_data = material_data;
    }
    if($scope.server_name == true){
        $scope.customDialogButtons = {
            success: {
                label: $translate.instant('Continue_Shopping'),  // "Continue Shopping",
                className: "btn-Mydefault pull-left",
                callback: function () {
                    $location.path('/');
                    $scope.$apply();
                    //$scope.checkout
                    //  console.log('here11111...');
                    //   $scope.addAction('Success!', true)
                }
            },
            warning: {
                label: $translate.instant('checkout'),    //"Checkout",
                className: "btn-Mydefault",
                callback: function () {
                    $location.path('order');
                    $scope.$apply();
                    //$scope.addMoreProduct('Warning', true);
                }
            }
        };

    }else{
        $scope.customDialogButtons = {
            success: {
                label: $translate.instant('ok'),  // "Continue Shopping",
                className: "btn-Mydefault",
                callback: function () {
                    $location.path('wishList');
                    $scope.$apply();
                    //$scope.checkout
                    //  console.log('here11111...');
                    //   $scope.addAction('Success!', true)
                }
            }
        };
    }
    $scope.customCancelButtons = {
        success: {
            label: $translate.instant('OK'), //"Ok",
            className: "btn-Mydefault left",
            callback: function () {
                $scope.$apply();
            }
        }

    };
    $scope.remotepopup = function (material_data) {
        $scope.material_data = material_data;
        var matrial_options = {
            templateUrl: $scope.temp_path + 'popup/motorization_connectivity.html?v='+version,
            scope: $scope,
            // backdrop: false,
            title: $translate.instant(material_data.ECM_DESC),
            className: 'material_popup',
            onEscape: function () {
            }
        };
        $ngBootbox.customDialog(matrial_options);
    }

    $scope.onGoToPage = function (page, type) {
        if (type == 'item') {
            $scope.item_currentPage = page;
        }
    };
    $scope.itemSelection = function () {
        $('.step_section ul li').find('.step_check').removeClass('lghide');
        $('.step_section ul li').each(function (i, e) {
            if ($scope.itemProduct_array.hasOwnProperty($(this).attr('step_id')) == true) {
                $(this).find('.step_check').addClass('lghide');
                $(this).find('.step_check').removeClass('alert');
            }
        });
    };
    $scope.nextstep = function (current_step, total_step) {
        /*if(current_step.ECS_CODE=='102' && type=='html_page'){
            console.log('here...');
            $scope.colorSectionPopup();
        }*/
        
        //console.log($scope.step_array);
        // console.log($scope.price_array);
        

        if($scope.category_code!='5965'){
            $('.all_steps').children('.collapsing').removeClass('in').attr('style', 'height:0');
            $('.all_steps').children('.collapse').removeClass('in').attr('style', 'height:0');
        }
       
        $('#' + current_step.ECS_CODE).children('.collapse').addClass('in').attr('style', 'height:auto');
        if ($('#desc7104').children('.fa-exclamation').hasClass('hide') == true) {
            $('#desc7104').children('.fa-exclamation').removeClass('hide');
            $('#desc7104').children('.fa-exclamation').addClass('show');
            return true;
        }

        if (current_step.ECS_CODE == 3247 || current_step.ECS_CODE == 111 || current_step.ECS_CODE == 133856) {
            $scope.next(current_step, total_step);
            return true;
        } else if ($.trim($('.desc' + current_step.ECS_CODE).text()) != '' && $('.desc' + current_step.ECS_CODE).children('.fa-exclamation').hasClass('hide') == false && $('.desc' + current_step.ECS_CODE).children('.fa-exclamation').hasClass('show') == false) {
            $scope.next(current_step, total_step);
            return true;
        } else {

            if ($('.desc' + current_step.ECS_CODE).children('.fa-exclamation').hasClass('hide') == true) {
                $('.desc' + current_step.ECS_CODE).children('.fa-exclamation').removeClass('hide');
                $('.desc' + current_step.ECS_CODE).children('.fa-exclamation').addClass('show');
            }
        }
    };
    $scope.next = function (current_step, total_step) {
        
        var index = 0;
        angular.forEach(total_step, function (e, i) {
            $('#' + e.ECS_CODE).children('.collapse').removeClass('in').attr('style', 'height:0');
            if (e.ECS_CODE == current_step.ECS_CODE) {
                index = i;
            }
        });
        
        var indexType = index + 1;
        var prev_step = $scope.cont_step[indexType] ? $scope.cont_step[indexType] : 0; // Current Step
        var next_step = $scope.cont_step[indexType + 1]; // Next Step
        $scope.setp_info = prev_step;
        var id = current_step.ECS_CODE; // Previous Step 
        $scope.current_step = $scope.setp_info;
        if (next_step == undefined) {
            $scope.cart_btn = true;
            $scope.next_step = true;
        }
        $('#filters').children('.collapse').removeClass('in').attr('style', 'height:0');
        $('#' + id).children('.collapse').removeClass('in').attr('style', 'height:0');
        $('#' + prev_step.ECS_CODE).children('.collapse').addClass('in').attr('style', 'height:auto');
        // console.log(prev_step.ECS_CODE + ' Current Step');
        // console.log(current_step.ECS_CODE  + ' Previous Step');
        // console.log(next_step.ECS_CODE + ' Next Step');
        $scope.controlSection($scope.setp_info);
        console.log($scope.setp_info);
        if($scope.setp_info.ECS_CODE=='102'){
            $scope.colorSectionPopup();
        }
    };
    $scope.getQuote = function (val) {
        $scope.$root.enquiry_form = {};
        $scope.$root.measurement_mgs = false;
        $scope.$root.enquiry_form.ECE_ENQUIRY_TYPE = 'I';
        $scope.item_info = val;
        $('#loader_div').show();
        var pro_string = '';
        pro_string += "\n" + ' Product: ' + val.ECI_DESC;
        if ($scope.step_array.hasOwnProperty(102) && $scope.step_array[102]) {
            pro_string += ', Color: ' + $scope.step_array[102].option_desc;
        }
        if ($scope.step_array.hasOwnProperty(107) && $scope.step_array[107]) {
            pro_string += ', Dimension: W ' + $scope.step_array[107].width;
            pro_string += ' H ' + $scope.step_array[107].height;
        }


        $scope.$root.enquiry_form.product_info = pro_string;
        $scope.$root.enquiry_form.product_imgPath = $scope.s3_image_path + val.ECI_IMAGE_PATH;

        console.log(pro_string);
        var step_options = {
            templateUrl: $scope.temp_path + 'popup/get_a_quote.html?v='+version,
            scope: $scope,
            // backdrop: false,
            title: val.ECI_DESC,
            className: 'get_a_quote',
            onEscape: function () {
            }
        };
        $ngBootbox.customDialog(step_options);
        $('#loader_div').hide();
    };
    $scope.resetScean = function () {
        threeJS.resetScean();
        $scope.zoom_slider = 18.5;
    };
    $scope.stopScean = function () {
        if ($scope.stop_scean_count) {
            threeJS.resetScean();
            $scope.zoom_slider = 18.5;
            $scope.stop_scean_count = false;
        }
    };
    $scope.zoomPlusMinus = function (type) {
        if (type == 'plus' && $scope.zoom_slider < 100) {
            $scope.zoom_slider = $scope.zoom_slider + 2;
        }
        if (type == 'minus' && $scope.zoom_slider > 0) {
            $scope.zoom_slider = $scope.zoom_slider - 2;
        }
        $scope.zoom3D();
    };
    $scope.zoom3D = function () {
        var zoom_val = $scope.zoom_slider - 98;
        var zoom_val = zoom_val > 0 ? zoom_val : -zoom_val
        threeJS.zoomScean(zoom_val);
        //            if (zoom_type) {
        //                threeJS.zoomScean(zoom_type);
        //            }
    };
    //Edit functionality....

    $scope.CartEdit = function () {
        if ($scope.edit_cart_info.hasOwnProperty('rowid') && cart_id.length > 1 && $scope.edit_cart_info.rowid == cart_id) {
            console.log($scope.edit_cart_info.step_item_list);
            $scope.cart_btn = true;
            $scope.next_step = true;
            angular.forEach($scope.edit_cart_info.step_item_list, function (val, key) {
                switch (parseInt(key)) {
                    case 11:					//product item**
                        val ? $scope.itemSection(val) : '';
                        break;
                    case 98:					//cornice Color 
                        val ? $scope.corniceColor(val.color, val) : '';
                        break;
                    case 101:					//Choose Collection**
                        val ? $scope.collection(val) : '';
                        break;
                    case 102:					//Color & Material**
                        val ? $scope.colorSection(val.color, val) : '';
                        break;
                    case 106:					//Mounting Option**
                        val ? $scope.mountOption(val.tech, val) : '';
                        break;
                    case 107:					//Measurement
                        $scope.measurement_width = { value: $scope.edit_cart_info.options.step_array.hasOwnProperty(107) ? parseFloat($scope.edit_cart_info.options.step_array[107].width) : '' };
                        $scope.measurement_height = { value: $scope.edit_cart_info.options.step_array.hasOwnProperty(107) ? parseFloat($scope.edit_cart_info.options.step_array[107].height) : '' };
                        val ? $scope.measurementFunc(val) : '';
                        if ($scope.measurement_width.value != 'NAN' && $scope.measurement_height.value != 'NAN' && $scope.measurement_width.value > 0 && $scope.measurement_height.value > 0) {
                            $('.desc107').html($translate.instant('measurement_val_mgs', { 'm_width': $scope.measurement_width.value, 'm_height': $scope.measurement_height.value }))
                        } else {
                            $scope.quantityUpdate($scope.qty.value)
                            if ($scope.pro_item.ECI_CODE == '1143189') {
                                $('.desc107').text($scope.qty.value + ' Set(s)');
                            } else {
                                $('.desc107').text($scope.qty.value + $translate.instant('Roll'));
                            }
                        }
                        break;
                    case 108:					//Roll Type**
                        val ? $scope.rollType(val.tech, val) : '';
                        break;
                    case 109:					//Control Type**
                        val ? $scope.controlType(val.tech, val, 'direct') : '';
                        break;
                    case 134479:					//Track Type for live server
                        val ? $scope.controlType(val.tech, val, 'direct') : '';
                      break;
                    case 134111:					//Track Type for Test server
                        val ? $scope.controlType(val.tech, val, 'direct') : '';
                      break;
                    case 110:					//Bottom Bar**
                        val ? $scope.bottomType(val.tech, val) : '';
                        break;
                    case 1480:					//valance
                        val ? $scope.valance(val.tech, val) : '';
                        break;
                    case 6843:					//valance Color**
                        val ? $scope.valanceColor(val.color, val) : '';
                        break;
                    case 2915:					//cornice selection
                        val ? $scope.cornice(val.tech, val) : '';
                        break;
                    case 1660:					//Border 
                        val ? $scope.borderSection(val.tech, val) : '';
                        break;
                    case 6844:					//Border Color
                        val ? $scope.borderColorSelected(val.color, val) : '';
                        break;
                    case 109129:   //Border Color selection for fabric 
                        val ? $scope.borderColorSelected(val.color, val) : '';  
                        break;                  
                    case 2027:				    //Operating Side
                        val ? $scope.manualControl(val.tech, val) : '';
                        break; 
                    case 1940:					//Glass section
                        val ? $scope.glassOption(val.tech, val) : '';
                        break;
                    case 109128:					//Lining Option section
                        val ? $scope.glassOption(val.tech, val) : '';
                        break;
                    case 6572:
                        val ? $scope.glassColor(val.color, val) : '';
                        break;
                    case 109126:
                        val ? $scope.tiebelt(val.tech, val) : '';
                        break;
                    case 2025:					//Base type
                        val ? $scope.baseType(val.tech, val) : '';
                        break;
                    case 2912:					//Tilter Type
                        val ? $scope.tilterType(val.tech, val) : '';
                        break;
                    case 2913:					//Opening Direction
                        val ? $scope.openingDirection(val.tech, val) : '';
                        break;
                    case 4068:					//Type of motor
                        $scope.motorType = val;
                        val ? $scope.typeOfMotor(val.tech, val, 'direct') : '';
                        break;
                    case 3283:					//Position of Motor
                        val ? $scope.motorPosition(val.tech, val) : '';
                        break;
                    case 5740:					//Window Depth
                        $scope.window_depth = { value: $scope.edit_cart_info.options.step_array.hasOwnProperty(5740) ? parseFloat($scope.edit_cart_info.options.step_array[5740].depth) : '' };
                        val ? $scope.windowDepth(val, $scope.edit_cart_info.step_item_list[106].tech) : '';
                        break;
                    case 5745:					//Type of Remote
                        val ? $scope.remoteType(val.color, val) : '';
                        break;
                    case 7104:					//Surface
                        val ? $scope.surface(val.tech, val) : '';
                        break;
                    case 7108:					//Material Surface
                        val ? $scope.installationFunction(val.tech, val) : '';
                        break;
                    case 5747:					//Lenght of Wire
                        var wireValue = $scope.edit_cart_info.options.step_array.hasOwnProperty(5747) ? parseFloat($scope.edit_cart_info.options.step_array[5747].item_value) : '';
                        $scope.lengthOfWire = { id: wireValue, label: wireValue.toFixed(2) + " LMT" };
                        val ? $scope.lengthOfWireFun($scope.lengthOfWire, val) : '';
                        break;
                    case 60272:					//Panel Blind Track (Panel Blind Rail)
                        val ? $scope.panelTrack(val.color, val) : '';
                        break;
                    case 63990:					//Glue
                        $scope.glueQty = { value: $scope.edit_cart_info.options.step_array.hasOwnProperty(63990) ? parseFloat($scope.edit_cart_info.options.step_array[63990].glue_packet) : '' };
                        val ? $scope.glue(val.color, val) : '';
                        if ($scope.edit_cart_info.options.step_array.hasOwnProperty(63990) > 0) {
                            $scope.glueQtyUpdate($scope.glueQty.value)
                        }
                        break;
                    case 133856:					//Type of Material
                        val ? $scope.type_of_material(val.tech, val) : '';
                        break;
                    case 251975:					//Charger
                        $scope.chargerUom = val.tech.EIS_UOM;
                        val ? $scope.charger(val.tech, val) : '';
                        break;    
                    default:

                }


            });
            $scope.roomTypeValue = $scope.edit_cart_info.options.step_array.hasOwnProperty(113) ? $scope.edit_cart_info.options.step_array[113].option_desc : '';
            $scope.roomTypeCode = $scope.edit_cart_info.options.step_array.hasOwnProperty(113) ? $scope.edit_cart_info.options.step_array[113].option_code : '';
            $scope.roomDescription = $scope.edit_cart_info.options.step_array.hasOwnProperty(113) ? $scope.edit_cart_info.options.step_array[113].remarks : '';
            $scope.itemProduct_array[113] = [$scope.roomDescription, $scope.roomTypeValue];
           
            var step_obj2 = {
                'remarks': $scope.roomDescription,
                'option_desc': $scope.roomTypeValue,
                'option_code': $scope.roomTypeCode
            };
            $scope.step_array[113] = angular.merge({}, $scope.step_array_obj($scope.edit_cart_info.step_item_list[113]), step_obj2);
            if ($scope.roomTypeValue) {
                $('.desc113').text($scope.roomTypeValue);
            }


            $('.price_panel, .Off').addClass('hide');
            $scope.addMore = false;

        }
    };


    $scope.type_of_material = function(item, parent_step){
        $scope.type_of_material_selected = item.EIS_CODE;
        $scope.typeOfMaterialCode = {
            name: item.EIS_CODE
        };
        $('.desc' + item.EIS_ECS_CODE).text(item.EIS_DESC);
        $scope.step_array[item.EIS_ECS_CODE] = $scope.step_array_obj(item, parent_step);

    };

    

    $scope.steps_info = function (item) {
        $('#loader_div').show();
        $scope.step_item_info = item;
        $scope.more_img = item.EIS_INFO_IMAGE_PATH ? item.EIS_INFO_IMAGE_PATH.split(',') : [];
        $scope.more_img_view = $scope.more_img[0];
        var step_options = {
            templateUrl: $scope.temp_path + 'popup/steps_info.html?v='+version,
            scope: $scope,
            title: item.EIS_DESC,
            className: 'step_info_popup',
            onEscape: function () {
            }
        };
        $ngBootbox.customDialog(step_options);
        $('#loader_div').hide();
    };

    $scope.backUrl = $location.search().ref + '&item=' + $location.search().item + '&syschild=' + $location.search().syschild;
    
    
    function onnavigationsteptoolRisize() {

     //   var headerheight = $('.header-container').height() + 50;
        var stepHeight = window.innerHeight;      
        $('.navigation.step_tool').attr('style', 'height :' + stepHeight + 'px');
       
    }
    
    setInterval(function(){
        onnavigationsteptoolRisize();
    },200);
   
    
    
}


]);

controllers.controller('login', ['$scope', '$rootScope', '$location', '$http', 'alerts', 'user', '$controller', '$translate', '$ngBootbox', function ($scope, $rootScope, $location, $http, alerts, user, $controller, $translate, $ngBootbox) {
   
    angular.extend(this, $controller('globalFunction', { $scope: $scope }));

    $scope.$root.is_login = user.getSysId() ? true : false;

    if($scope.$root.is_login){
        $location.path('/');
    }
    console.log($scope.$root.is_login);
}]);

controllers.controller('wishList', ['$scope', '$rootScope', '$http', '$controller', '$ngBootbox', '$location', function ($scope, $rootScope, $http, $controller, $ngBootbox, $location) {

    angular.extend(this, $controller('globalFunction', { $scope: $scope }));
    $scope.account_step = 'wishList';
    $scope.input = {};
    $scope.catalog = true;
    $scope.catalog_family = true;
    $('#loader_div').show();
    

    if($scope.$root.is_login == false){
        $location.path('login');
    }

    $http({
        method: 'GET',
        url: service_url + 'ShowroomApi/likeProduct_item/' + $scope.user_sys_id,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}

    }).then(function (response) {
        $scope.likeProduct = response.data.product;
        $scope.likeitem = response.data.item;
             
        $('#loader_div').hide();
    });

    $scope.deleteProduct = function ($head_sys_id, $line_sys_id) {
        var rowid = $line_sys_id;

        $('#' + $line_sys_id).remove();
        $http({
            method: 'POST',
            url: service_url + 'ShowroomApi/deleteProduct',
            data: $.param({
                head_sys_id: $head_sys_id,
                line_sys_id: $line_sys_id,
                user_sys_id: $scope.user_sys_id
            }),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function (response) {
            console.log(response);
        });
    }

    $scope.productdetail = function($sys_id){
        $('#loader_div').show();

        $http({
            method: 'GET',
            url: service_url + 'ecommerce/productdetail/'  + $sys_id,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function (response) {
            $scope.productView = response.data; 
            var options = {
                templateUrl: $scope.temp_path + 'popup/productView_popup.html?v='+version,
                scope: $scope,
                title: 'Product Detail',
                className: 'material_popup',
                onEscape: function () {
                }
            };
            $ngBootbox.customDialog(options);
            $('#loader_div').hide();
        });
    }

    $scope.remove_wishList = function ($pr_code, $code, $cat_code, $url, $login) {
        // console.log('here..1223');
         console.log($pr_code, $code, $cat_code, $url, $login)
         $login = $login ? $login : 'no_login';
         if ($url == "wishList") {
             $('.' + $code + '_m').remove();
         }
 
         if ($('.' + $code).hasClass('far') == true) {
             if ($scope.$root && $scope.$root.is_login == false) {
                 store.set('temp_code', [{ 'url': $url, 'category': $cat_code, 'product': $pr_code, 'item': $code }]);
                 $location.url('login?ref=' + $url + '/' + $cat_code + '/' + $pr_code);
                 return;
             }
             $scope.favorite = 'FAVORITE';
             $('.' + $code).removeClass('far');
             $('.' + $code).addClass('fas');
         } else {
             if ($login == 'with_login') {
                 $scope.favorite = 'FAVORITE';
             } else {
                 $scope.favorite = 'UNLIKE';
                 $('.' + $code).addClass('far');
                 $('.' + $code).removeClass('fas');
             }
         }

         $http({
            method: 'GET',
            url: service_url + 'ShowroomApi//favorite_prod_item/' + $pr_code + '/' + $code + '/' + $url + '/' + $scope.favorite +'/'+ $scope.user_sys_id,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}

        }).then(function (response) {
             store.set('likeRecord', response.data.data);
             store.remove('temp_code');
         });
     };

}
]);

function dataGroup(data, group) {
    var group_data = [];
    var group_val = [];
    var j = 0;
    var k = 0;
    var len = data.length;
    for (var i = 0; i < len; i++) {
        group_val[k] = data[i];
        k++;
        if (k >= group) {
            k = 0;
            j++;
            group_data.push(group_val);
            group_val = [];
        }
    }
    if (group_val.length > 0) {
        group_data.push(group_val);
    }
    return group_data;
}