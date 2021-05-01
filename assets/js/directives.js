/* global _, angular, i18n, Ladda, Odometer */
'use strict';



angular.module('acs.directives', [])
    .directive('menu', [function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var $this = jQuery(element);
                    $this.find('li').has('ul').children('ul').addClass('collapse');
                    $this.find('li').has('ul').children('a').on('click', function (e) {
                        e.preventDefault();
                        $(this).parent('li').toggleClass('active').children('ul').collapse('toggle');
                        $(this).parent('li').siblings().removeClass('active').children('ul.in').collapse('hide');
                    });
                }
            };
        }])
    .directive('i18n', [function () {
            return {
                restrict: 'A',
                priority: -1000,
                link: function (scope, element, attrs) {
                    scope.$watch(function () {
                        return attrs.i18n;
                    }, function (newValue) {
                        element.html(i18n.t(attrs.i18n));
                    });
                }
            };
        }])
    .directive('i18nPlaceholder', [function () {
            return {
                restrict: 'A',
                priority: -1000,
                link: function (scope, element, attrs) {
                    scope.$watch(function () {
                        return attrs.i18nPlaceholder;
                    }, function (newValue) {
                        element.attr('placeholder', i18n.t(newValue));
                    });
                }
            };
        }])
    .directive('loading', [function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs, ngModel) {
                    var loaders = ['loaded'].concat(scope.$eval(attrs.loading));
                    var watch = function (newValue) {
                        if (_.every(loaders, function (loader) {
                            return ((loader == '') || (_.isUndefined(loader))) ? true : scope.$eval(loader);
                        })) {
                            jQuery(element).removeClass('loading');
                            jQuery(element).css('opacity', 1);
                        } else {
                            jQuery(element).css('opacity', 0.4);
                            jQuery(element).addClass('loading');
                        }
                    };
                    _.forEach(loaders, function (loader) {
                        scope.$watch(loader, watch);
                    });
                }
            };
        }])
    .directive('selectpicker', [function () {
            return {
                require: 'ngModel',
                restrict: 'A',
                priority: 10,
                link: function (scope, element, attrs, ngModel) {
                    jQuery(element).selectpicker();
                    scope.$watch(function () {
                        return ngModel.$modelValue;
                    }, function (newValue) {
                        jQuery(element).selectpicker('refresh');
                    });
                    scope.$watch(function () {
                        return scope.$eval(attrs.options);
                    }, function (newVal) {
                        jQuery(element).selectpicker('refresh');
                    });
                }
            };
        }])
    .directive('confirm', ['$translate', function ($translate) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    element.bind('click', function (event) {
                        if (window.confirm($translate.instant('are_you_sure'))) {
                            scope.$eval(attrs.confirm);
                        }
                    });
                }
            };
        }])
    .directive('langUrl', [function () {
    return {
        restrict: 'A',
        priority: -1000,
        link: function (scope, element, attrs) {
            scope.$on('$routeChangeSuccess', function ($event, next, current) {
                element.attr('href', base_url + attrs.langUrl + location.hash);
            });

        }
    };
        }]).directive('ngIntlTelInput', ['ngIntlTelInput', '$log', '$window', '$parse', '$http',
        function (ngIntlTelInput, $log, $window, $parse, $http) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, elm, attr, ctrl) {
                    // Warning for bad directive usage.
                    if ((!!attr.type && (attr.type !== 'text' && attr.type !== 'tel')) || elm[0].tagName !== 'INPUT') {
                        $log.warn('ng-intl-tel-input can only be applied to a *text* or *tel* input');
                        return;
                    }
                    // Override default country.
                    if (attr.initialCountry) {
                        ngIntlTelInput.set({initialCountry: attr.initialCountry});
                    }
    
                    $http.get("https://ipinfo.io/json?token=5cd492508bc282").then(function (response)
                    {   // to get the current country
                        var countryName = response.data.country.toLowerCase();
                        elm.intlTelInput
                                ({
                                    utilsScript: "assets/js/utils.js",
                                    autoPlaceholder: true,
                                    numberType: "MOBILE",
                                    preferredCountries: [countryName]
                                });
    
                        var countryCode = elm.intlTelInput("getSelectedCountryData").iso2;
                        elm.intlTelInput("selectCountry", countryCode);
    
    
                    });
    
    
    
                    // Initialize.
                    /*  ngIntlTelInput.init(elm); */
                    // Set Selected Country Data.
                    function setSelectedCountryData(model) {
                        var getter = $parse(model);
                        var setter = getter.assign;
                        setter(scope, elm.intlTelInput('getSelectedCountryData'));
                    }
                    // Handle Country Changes.
                    function handleCountryChange() {
                        setSelectedCountryData(attr.selectedCountry);
                    }
                    // Country Change cleanup.
                    function cleanUp() {
                        angular.element($window).off('countrychange', handleCountryChange);
                    }
                    // Selected Country Data.
                    if (attr.selectedCountry) {
                        setSelectedCountryData(attr.selectedCountry);
                        angular.element($window).on('countrychange', handleCountryChange);
                        scope.$on('$destroy', cleanUp);
                    }
                    // Validation.
                    ctrl.$validators.ngIntlTelInput = function (value) {
                        // if phone number is deleted / empty do not run phone number validation
                        if (value || elm[0].value.length > 0) {
                            return elm.intlTelInput('isValidNumber');
                        } else {
                            scope.enquiry_form.$valid;
    
                            return true;
                        }
                    };
                    // Set model value to valid, formatted version.
                    ctrl.$parsers.push(function (value) {
                        return elm.intlTelInput('getNumber');
                    });
                    // Set input value to model value and trigger evaluation.
                    ctrl.$formatters.push(function (value) {
                        if (value) {
                            if (value.charAt(0) !== '+') {
                                value = '+' + value;
                            }
                            elm.intlTelInput('setNumber', value);
                        }
                        return value;
                    });
                }
            };
        }])
    .directive('placeHolder', ['$parse', '$compile', function ($parse, $compile) {
            return {
                restrict: 'A',
                priority: 1000,
                //  terminal: true,
                scope: true,
                compile: function (tElement, tAttrs) {
                    $('.palceholder').click(function () {
                        $(this).siblings('input').focus();
                    });
                    $('.placeholder_class').focus(function () {
                        $(this).siblings('.palceholder').hide();
                    });
                    $('.placeholder_class').blur(function () {
                        var $this = $(this);
                        if ($this.val().length == 0)
                            $(this).siblings('.palceholder').show();
                    });
                    $('.placeholder_class').blur();
                }
            }
        }])
    .directive('htmlCompile', ['$compile', function ($compile) {
            return function (scope, element, attrs) {
                scope.$watch(
                        function (scope) {
                            return scope.$eval(attrs.htmlCompile);
                        },
                        function (value) {
                            element.html(value);
                            $compile(element.contents())(scope);
                        }
                );
            };
        }])
    .directive('dateTimePicker', function () {
            return {
                restrict: 'A',
                require: 'ngModel',
                compile: function () {
                    return {
                        pre: function (scope, element, attrs, ngModelCtrl) {
                            var format, dateObj, weekDisabled;
                            dateObj = new Date();
                            if(dateObj.getDay() == 4)
                            {
                                attrs.saturdaydisabled = 6;
                            }
                            format = (!attrs.dpFormat) ? 'DD-MMM-YYYY' : attrs.dpFormat;
                            weekDisabled = attrs.weekdisabled ? [attrs.weekdisabled, attrs.saturdaydisabled] : false;
                            minDate = attrs.mindate ? attrs.mindate : false;
                            if (!attrs.initDate && !attrs.dpFormat) {
                                // If there is no initDate attribute than we will get todays date as the default
                                //dateObj = new Date();
                                scope[attrs.ngModel] = dateObj.getDate() + '/' + (dateObj.getMonth() + 1) + '/' + dateObj.getFullYear();
                            } else if (!attrs.initDate) {
                                // Otherwise set as the init date
                                scope[attrs.ngModel] = attrs.initDate;
                            } else {
                                // I could put some complex logic that changes the order of the date string I
                                // create from the dateObj based on the format, but I'll leave that for now
                                // Or I could switch case and limit the types of formats...
                            }

                            if (attrs.dateTimePicker == 'timepicker')
                            {
                                $position = 'top';
                            } else if (attrs.dateTimePicker == 'dobpicker' || attrs.dateTimePicker == 'nopicker')
                            {
                                $position = 'auto';
                            } else {
                                $position = 'bottom';
                            }
                            var d = new Date();

                            // Initialize the date-picker
                            $(element).datetimepicker({
                                //format: 'DD-MMM-YYYY',
                                format: format,
                                minDate: minDate ? new Date(d.getFullYear(), d.getMonth(), d.getDate() + eval(minDate)) : false,
                                daysOfWeekDisabled: weekDisabled,
                                widgetPositioning: {
                                    horizontal: 'auto',
                                    vertical: $position
                                }
                                //inline: true
                            }).on('dp.change', function (ev) {
                                // To me this looks cleaner than adding $apply(); after everything.
                                scope.$apply(function () {
                                    ngModelCtrl.$setViewValue($(element).val());
                                    //console.log($(element).val());
                                });
                            });
                        }
                    }
                }
            }
        })
    .directive('dateTimeStatement', function () {
            return {
                restrict: 'A',
                require: 'ngModel',
                compile: function () {
                    return {
                        pre: function (scope, element, attrs, ngModelCtrl) {
                            var format, dateObj, weekDisabled;

                            format = (!attrs.dpFormat) ? 'DD-MMM-YYYY' : attrs.dpFormat;
                            weekDisabled = attrs.weekdisabled ? [attrs.weekdisabled] : false;
                            if (!attrs.initDate && !attrs.dpFormat) {
                                // If there is no initDate attribute than we will get todays date as the default
                                dateObj = new Date();
                                scope[attrs.ngModel] = dateObj.getDate() + '/' + (dateObj.getMonth() + 1) + '/' + dateObj.getFullYear();
                            } else if (!attrs.initDate) {
                                // Otherwise set as the init date
                                scope[attrs.ngModel] = attrs.initDate;
                            } else {
                                // I could put some complex logic that changes the order of the date string I
                                // create from the dateObj based on the format, but I'll leave that for now
                                // Or I could switch case and limit the types of formats...
                            }

                            if (attrs.dateTimePicker == 'timepicker')
                            {
                                $position = 'top';
                            } else if (attrs.dateTimePicker == 'dobpicker' || attrs.dateTimePicker == 'nopicker')
                            {
                                $position = 'auto';
                            } else {
                                $position = 'bottom';
                            }
                            // Initialize the date-picker
                            $(element).datetimepicker({
                                //format: 'DD-MMM-YYYY',
                                format: format,
                                //    minDate: format == 'DD-MMM-YYYY' ? new Date() : false,
                                daysOfWeekDisabled: weekDisabled,
                                widgetPositioning: {
                                    horizontal: 'auto',
                                    vertical: $position
                                }
                                //inline: true
                            }).on('dp.change', function (ev) {
                                // To me this looks cleaner than adding $apply(); after everything.
                                scope.$apply(function () {
                                    ngModelCtrl.$setViewValue($(element).val());
                                    //console.log($(element).val());
                                });
                            });
                        }
                    }
                }
            }
        })
    .directive('fileModel', ['$parse', function ($parse) {
                return {
                    restrict: 'A',
                    link: function (scope, element, attrs) {
                        var model = $parse(attrs.fileModel);
                        var modelSetter = model.assign;

                        element.bind('change', function (e) {

                            scope.file = (e.srcElement || e.target).files[0];

                            var allowed = ["jpeg", "png", "gif", "jpg"];
                            var found = false;
                            var img;
                            img = new Image();

                            allowed.forEach(function (extension) {

                                if (scope.file.type.match('image/' + extension)) {
                                    found = true;
                                }
                            });
                            if (!found) {
                                alert('file type should be .jpeg, .png, .jpg, .gif');
                                //return 
                                return $('#ds').attr('i18n', i18n.t('upload_document_tc'));

                            }
                            var fileSize = this.files[0].size / 1024;
                            if (fileSize > 2000) {
                                alert("File size is larze; maximum file size 600 KB");
                            } else {
                                scope.$apply(function () {
                                    scope.btobDoc[attrs.fileModel] = element[0].files[0];
                                    //console.log(scope.btobDoc);
                                    $parse(attrs.fileModel).assign(scope, element[0].files[0]);
                                    //modelSetter(scope, element[0].files[0]);
                                });
                            }
                        });
                    }
                };
        }])
    .directive('backImg', [function () {
            return {
                restrict: 'A',
                priority: -1000,
                link: function (scope, element, attrs) {

                    scope.$watch(function () {
                        return attrs.backImg;
                    }, function (url) {
                        if (url.length <= 0) {
                            return false;
                        }
                        element.css({
                            'background-image': 'url(' + s3_image_path + url + ')',
                            'background-size': '100 % 100 %'
                        });
                    });
                }
            };
        }])
    .directive("bnLazySrc", function ($window, $document, $location) {


            // I manage all the images that are currently being
            // monitored on the page for lazy loading.
            var lazyLoader = (function () {

                // I maintain a list of images that lazy-loading
                // and have yet to be rendered.
                var images = [];

                // I define the render timer for the lazy loading
                // images to that the DOM-querying (for offsets)
                // is chunked in groups.
                var renderTimer = null;
                var renderDelay = 100;

                // I cache the window element as a jQuery reference.
                var win = $location.$$path.split('/')[1] == 'customizing' ? $('.materialHeight') : $($window);

                // I cache the document document height so that
                // we can respond to changes in the height due to
                // dynamic content.
                var doc = $location.$$path.split('/')[1] == 'customizing' ? $('.materialHeight') : $document;
                var documentHeight = doc.height();
                var documentTimer = null;
                var documentDelay = 2000;

                // I determine if the window dimension events
                // (ie. resize, scroll) are currenlty being
                // monitored for changes.
                var isWatchingWindow = false;


                // ---
                // PUBLIC METHODS.
                // ---


                // I start monitoring the given image for visibility
                // and then render it when necessary.
                function addImage(image) {

                    images.push(image);

                    if (!renderTimer) {

                        startRenderTimer();

                    }

                    if (!isWatchingWindow) {

                        startWatchingWindow();

                    }

                }


                // I remove the given image from the render queue.
                function removeImage(image) {

                    // Remove the given image from the render queue.
                    for (var i = 0; i < images.length; i++) {

                        if (images[ i ] === image) {

                            images.splice(i, 1);
                            break;

                        }

                    }

                    // If removing the given image has cleared the
                    // render queue, then we can stop monitoring
                    // the window and the image queue.
                    if (!images.length) {

                        clearRenderTimer();

                        stopWatchingWindow();

                    }

                }


                // ---
                // PRIVATE METHODS.
                // ---


                // I check the document height to see if it's changed.
                function checkDocumentHeight() {

                    // If the render time is currently active, then
                    // don't bother getting the document height -
                    // it won't actually do anything.
                    if (renderTimer) {

                        return;

                    }

                    var currentDocumentHeight = doc.height();

                    // If the height has not changed, then ignore -
                    // no more images could have come into view.
                    if (currentDocumentHeight === documentHeight) {

                        return;

                    }

                    // Cache the new document height.
                    documentHeight = currentDocumentHeight;

                    startRenderTimer();

                }


                // I check the lazy-load images that have yet to
                // be rendered.
                function checkImages() {

                    // Log here so we can see how often this
                    // gets called during page activity.
                    //console.log("Checking for visible images...");

                    var visible = [];
                    var hidden = [];

                    // Determine the window dimensions.
                    var windowHeight = win.height();
                    var scrollTop = win.scrollTop();

                    // Calculate the viewport offsets.
                    var topFoldOffset = $location.$$path.split('/')[1] == 'customizing' ? scrollTop + 150 : scrollTop;
                    var bottomFoldOffset = (topFoldOffset + windowHeight);

                    // Query the DOM for layout and seperate the
                    // images into two different categories: those
                    // that are now in the viewport and those that
                    // still remain hidden.
                    for (var i = 0; i < images.length; i++) {

                        var image = images[ i ];

                        if (image.isVisible(topFoldOffset, bottomFoldOffset)) {

                            visible.push(image);

                        } else {

                            hidden.push(image);

                        }

                    }

                    // Update the DOM with new image source values.
                    for (var i = 0; i < visible.length; i++) {

                        visible[ i ].render();

                    }

                    // Keep the still-hidden images as the new
                    // image queue to be monitored.
                    images = hidden;

                    // Clear the render timer so that it can be set
                    // again in response to window changes.
                    clearRenderTimer();

                    // If we've rendered all the images, then stop
                    // monitoring the window for changes.
                    if (!images.length) {

                        stopWatchingWindow();

                    }

                }


                // I clear the render timer so that we can easily
                // check to see if the timer is running.
                function clearRenderTimer() {

                    clearTimeout(renderTimer);

                    renderTimer = null;

                }


                // I start the render time, allowing more images to
                // be added to the images queue before the render
                // action is executed.
                function startRenderTimer() {

                    renderTimer = setTimeout(checkImages, renderDelay);

                }


                // I start watching the window for changes in dimension.
                function startWatchingWindow() {

                    isWatchingWindow = true;

                    // Listen for window changes.
                    win.on("resize.bnLazySrc", windowChanged);
                    win.on("scroll.bnLazySrc", windowChanged);

                    // Set up a timer to watch for document-height changes.
                    documentTimer = setInterval(checkDocumentHeight, documentDelay);

                }


                // I stop watching the window for changes in dimension.
                function stopWatchingWindow() {

                    isWatchingWindow = false;

                    // Stop watching for window changes.
                    win.off("resize.bnLazySrc");
                    win.off("scroll.bnLazySrc");

                    // Stop watching for document changes.
                    clearInterval(documentTimer);

                }


                // I start the render time if the window changes.
                function windowChanged() {

                    if (!renderTimer) {

                        startRenderTimer();

                    }

                }


                // Return the public API.
                return({
                    addImage: addImage,
                    removeImage: removeImage
                });

            })();


            // ------------------------------------------ //
            // ------------------------------------------ //


            // I represent a single lazy-load image.
            function LazyImage(element) {

                // I am the interpolated LAZY SRC attribute of
                // the image as reported by AngularJS.
                var source = null;

                // I determine if the image has already been
                // rendered (ie, that it has been exposed to the
                // viewport and the source had been loaded).
                var isRendered = false;

                // I am the cached height of the element. We are
                // going to assume that the image doesn't change
                // height over time.
                var height = null;


                // ---
                // PUBLIC METHODS.
                // ---


                // I determine if the element is above the given
                // fold of the page.
                function isVisible(topFoldOffset, bottomFoldOffset) {

                    // If the element is not visible because it
                    // is hidden, don't bother testing it.
                    if (!element.is(":visible")) {

                        return(false);

                    }

                    // If the height has not yet been calculated,
                    // the cache it for the duration of the page.
                    if (height === null) {

                        height = element.height();

                    }

                    // Update the dimensions of the element.
                    var top = element.offset().top;
                    var bottom = (top + height);

                    // Return true if the element is:
                    // 1. The top offset is in view.
                    // 2. The bottom offset is in view.
                    // 3. The element is overlapping the viewport.
                    return(
                            (
                                    (top <= bottomFoldOffset) &&
                                    (top >= topFoldOffset)
                                    )
                            ||
                            (
                                    (bottom <= bottomFoldOffset) &&
                                    (bottom >= topFoldOffset)
                                    )
                            ||
                            (
                                    (top <= topFoldOffset) &&
                                    (bottom >= bottomFoldOffset)
                                    )
                            );

                }


                // I move the cached source into the live source.
                function render() {

                    isRendered = true;

                    renderSource();

                }


                // I set the interpolated source value reported
                // by the directive / AngularJS.
                function setSource(newSource) {

                    source = newSource;

                    if (isRendered) {

                        renderSource();

                    }

                }


                // ---
                // PRIVATE METHODS.
                // ---


                // I load the lazy source value into the actual
                // source value of the image element.
                function renderSource() {

                    element[ 0 ].src = source;

                }


                // Return the public API.
                return({
                    isVisible: isVisible,
                    render: render,
                    setSource: setSource
                });

            }


            // ------------------------------------------ //
            // ------------------------------------------ //


            // I bind the UI events to the scope.
            function link($scope, element, attributes) {

                var lazyImage = new LazyImage(element);

                // Start watching the image for changes in its
                // visibility.
                lazyLoader.addImage(lazyImage);


                // Since the lazy-src will likely need some sort
                // of string interpolation, we don't want to
                attributes.$observe(
                        "bnLazySrc",
                        function (newSource) {

                            lazyImage.setSource(newSource);

                        }
                );


                // When the scope is destroyed, we need to remove
                // the image from the render queue.
                $scope.$on(
                        "$destroy",
                        function () {

                            lazyLoader.removeImage(lazyImage);

                        }
                );

            }


            // Return the directive configuration.
            return({
                link: link,
                restrict: "A"
            });

        })
    
    .directive('ngPatternRestrict', ['$log', function ($log) {
                'use strict';

                function showDebugInfo() {
                    $log.debug("[ngPatternRestrict] " + Array.prototype.join.call(arguments, ' '));
                }

                return {
                    restrict: 'A',
                    require: "?ngModel",
                    compile: function uiPatternRestrictCompile() {
                        DEBUG && showDebugInfo("Loaded");

                        return function ngPatternRestrictLinking(scope, iElement, iAttrs, ngModelController) {
                            var regex, // validation regex object
                                    oldValue,
                                    // keeping track of the previous value of the element
                                    caretPosition,
                                    // keeping track of where the caret is at to avoid jumpiness
                                    // housekeeping
                                    initialized = false,
                                    // have we initialized our directive yet?
                                    eventsBound = false,
                                    // have we bound our events yet?
                                    // functions
                                    getCaretPosition,
                                    // function to get the caret position, set in detectGetCaretPositionMethods
                                    setCaretPosition; // function to set the caret position, set in detectSetCaretPositionMethods

                            //-------------------------------------------------------------------
                            // caret position
                            function getCaretPositionWithInputSelectionStart() {
                                return iElement[0].selectionStart; // we need to go under jqlite
                            }

                            function getCaretPositionWithDocumentSelection() {
                                // create a selection range from where we are to the beggining
                                // and measure how much we moved
                                var range = document.selection.createRange();
                                range.moveStart('character', -iElement.val().length);
                                return range.text.length;
                            }

                            function getCaretPositionWithWindowSelection() {
                                var s = window.getSelection(),
                                        originalSelectionLength = String(s).length,
                                        selectionLength,
                                        didReachZero = false,
                                        detectedCaretPosition,
                                        restorePositionCounter;

                                do {
                                    selectionLength = String(s).length;
                                    s.modify('extend', 'backward', 'character');
                                    // we're undoing a selection, and starting a new one towards the beggining of the string
                                    if (String(s).length === 0) {
                                        didReachZero = true;
                                    }
                                } while (selectionLength !== String(s).length);

                                detectedCaretPosition = didReachZero ? selectionLength : selectionLength - originalSelectionLength;
                                s.collapseToStart();

                                restorePositionCounter = detectedCaretPosition;
                                while (restorePositionCounter-- > 0) {
                                    s.modify('move', 'forward', 'character');
                                }
                                while (originalSelectionLength-- > 0) {
                                    s.modify('extend', 'forward', 'character');
                                }

                                return detectedCaretPosition;
                            }

                            function setCaretPositionWithSetSelectionRange(position) {
                                iElement[0].setSelectionRange(position, position);
                            }

                            function setCaretPositionWithCreateTextRange(position) {
                                var textRange = iElement[0].createTextRange();
                                textRange.collapse(true);
                                textRange.moveEnd('character', position);
                                textRange.moveStart('character', position);
                                textRange.select();
                            }

                            function setCaretPositionWithWindowSelection(position) {
                                var s = window.getSelection(),
                                        selectionLength;

                                do {
                                    selectionLength = String(s).length;
                                    s.modify('extend', 'backward', 'line');
                                } while (selectionLength !== String(s).length);
                                s.collapseToStart();

                                while (position--) {
                                    s.modify('move', 'forward', 'character');
                                }
                            }

                            // HACK: Opera 12 won't give us a wrong validity status although the input is invalid
                            // we can select the whole text and check the selection size
                            // Congratulations to IE 11 for doing the same but not returning the selection.
                            function getValueLengthThroughSelection(input) {
                                // only do this on opera, since it'll mess up the caret position
                                // and break Firefox functionality
                                if (!/Opera/i.test(navigator.userAgent)) {
                                    return 0;
                                }

                                input.focus();
                                document.execCommand("selectAll");
                                var focusNode = window.getSelection().focusNode;
                                return (focusNode || {}).selectionStart || 0;
                            }

                            //-------------------------------------------------------------------
                            // event handlers
                            function revertToPreviousValue() {
                                if (ngModelController) {
                                    scope.$apply(function () {
                                        ngModelController.$setViewValue(oldValue);
                                    });
                                }
                                iElement.val(oldValue);

                                if (!angular.isUndefined(caretPosition)) {
                                    setCaretPosition(caretPosition);
                                }
                            }

                            function updateCurrentValue(newValue) {
                                oldValue = newValue;
                                caretPosition = getCaretPosition();
                            }

                            function genericEventHandler(evt) {
                                DEBUG && showDebugInfo("Reacting to event:", evt.type);

                                //HACK Chrome returns an empty string as value if user inputs a non-numeric string into a number type input
                                // and this may happen with other non-text inputs soon enough. As such, if getting the string only gives us an
                                // empty string, we don't have the chance of validating it against a regex. All we can do is assume it's wrong,
                                // since the browser is rejecting it either way.
                                var newValue = iElement.val(),
                                        inputValidity = iElement.prop("validity");
                                if (newValue === "" && iElement.attr("type") !== "text" && inputValidity && inputValidity.badInput) {
                                    DEBUG && showDebugInfo("Value cannot be verified. Should be invalid. Reverting back to:", oldValue);
                                    evt.preventDefault();
                                    revertToPreviousValue();
                                } else if (newValue === "" && getValueLengthThroughSelection(iElement[0]) !== 0) {
                                    DEBUG && showDebugInfo("Invalid input. Reverting back to:", oldValue);
                                    evt.preventDefault();
                                    revertToPreviousValue();
                                } else if (regex.test(newValue)) {
                                    DEBUG && showDebugInfo("New value passed validation against", regex, newValue);
                                    updateCurrentValue(newValue);
                                } else {
                                    DEBUG && showDebugInfo("New value did NOT pass validation against", regex, newValue, "Reverting back to:", oldValue);
                                    evt.preventDefault();
                                    revertToPreviousValue();
                                }
                            }

                            //-------------------------------------------------------------------
                            // setup based on attributes
                            function tryParseRegex(regexString) {
                                try {
                                    regex = new RegExp(regexString);
                                } catch (e) {
                                    throw "Invalid RegEx string parsed for ngPatternRestrict: " + regexString;
                                }
                            }

                            //-------------------------------------------------------------------
                            // setup events
                            function bindListeners() {
                                if (eventsBound) {
                                    return;
                                }

                                iElement.bind('input keyup click', genericEventHandler);

                                DEBUG && showDebugInfo("Bound events: input, keyup, click");
                            }

                            function unbindListeners() {
                                if (!eventsBound) {
                                    return;
                                }

                                iElement.unbind('input', genericEventHandler);
                                //input: HTML5 spec, changes in content

                                iElement.unbind('keyup', genericEventHandler);
                                //keyup: DOM L3 spec, key released (possibly changing content)

                                iElement.unbind('click', genericEventHandler);
                                //click: DOM L3 spec, mouse clicked and released (possibly changing content)

                                DEBUG && showDebugInfo("Unbound events: input, keyup, click");

                                eventsBound = false;
                            }

                            //-------------------------------------------------------------------
                            // initialization
                            function readPattern() {
                                var entryRegex = !!iAttrs.ngPatternRestrict ? iAttrs.ngPatternRestrict : iAttrs.pattern;
                                DEBUG && showDebugInfo("RegEx to use:", entryRegex);
                                tryParseRegex(entryRegex);
                            }

                            function notThrows(testFn, shouldReturnTruthy) {
                                try {
                                    return testFn() || !shouldReturnTruthy;
                                } catch (e) {
                                    return false;
                                }
                            }

                            function detectGetCaretPositionMethods() {
                                var input = iElement[0];

                                // Chrome will throw on input.selectionStart of input type=number
                                // See http://stackoverflow.com/a/21959157/147507
                                if (notThrows(function () {
                                    return input.selectionStart;
                                })) {
                                    getCaretPosition = getCaretPositionWithInputSelectionStart;
                                } else {
                                    // IE 9- will use document.selection
                                    // TODO support IE 11+ with document.getSelection()
                                    if (notThrows(function () {
                                        return document.selection;
                                    }, true)) {
                                        getCaretPosition = getCaretPositionWithDocumentSelection;
                                    } else {
                                        getCaretPosition = getCaretPositionWithWindowSelection;
                                    }
                                }
                            }

                            function detectSetCaretPositionMethods() {
                                var input = iElement[0];
                                if (typeof input.setSelectionRange === 'function') {
                                    setCaretPosition = setCaretPositionWithSetSelectionRange;
                                } else if (typeof input.createTextRange === 'function') {
                                    setCaretPosition = setCaretPositionWithCreateTextRange;
                                } else {
                                    setCaretPosition = setCaretPositionWithWindowSelection;
                                }
                            }

                            function initialize() {
                                if (initialized) {
                                    return;
                                }
                                DEBUG && showDebugInfo("Initializing");

                                readPattern();

                                oldValue = iElement.val();
                                if (!oldValue) {
                                    oldValue = "";
                                }
                                DEBUG && showDebugInfo("Original value:", oldValue);

                                bindListeners();

                                detectGetCaretPositionMethods();
                                detectSetCaretPositionMethods();

                                initialized = true;
                            }

                            function uninitialize() {
                                DEBUG && showDebugInfo("Uninitializing");
                                unbindListeners();
                            }

                            iAttrs.$observe("ngPatternRestrict", readPattern);
                            iAttrs.$observe("pattern", readPattern);

                            scope.$on("$destroy", uninitialize);

                            initialize();
                        };
                    }
                };
        }])
    .directive('dynamicClass', [function () {
            return {
                restrict: 'A',
                priority: -1000,
                link: function (scope, element, attrs) {

                    scope.$watch(function () {
                        return attrs.dynamicClass;
                    }, function (cls) {
                        if (cls == 2 || cls == 4) {
                            element.addClass('col-md-6 col-sm-6 col-xs-6');
                        }
                        else {
                            element.addClass('col-md-4 col-sm-4 col-xs-4');
                        }
                    });
                }
            };
        }])
    .directive('fabriclimtdesc', ['$translate', function ($translate) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    scope.$watch(function () {
                        var data=JSON.parse(attrs.fabriclimtdesc);            
                        var mgs=$translate.instant(data.mgs_key,{fabric_h:data.fabric_h,mes_height:data.mes_height});
                        element.html(mgs);
                    });
                }
            };
        }])
    .directive('pajinatifydir', function(){
        return{
            restrict: 'A',
            link: function(scope, element, attrs){
                scope.$watch(function () {
                    $('.pagination').pajinatify({
                        onChange: function (currentPage) {
                            scope.selectPage(currentPage,location.search.split('id=')[1].split('&')[0]);
                        },
                        // debug: 1
                    });
                
                    $('.pagination').pajinatify('set', parseInt(location.search.split('page=')[1]), scope.totalItems);
                
                });
            }

        };
    });




    

