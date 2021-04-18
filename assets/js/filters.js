'use strict';

angular.module('acs.filters', [])

	.filter('htmlSafe', [
	    '$sce', function ($sce) {
		return $sce.trustAsHtml;
	    }
	]).filter('trustAsResourceUrl', ['$sce', function($sce) {
		return function(val) {
			return $sce.trustAsResourceUrl(val);
		};
	}]);