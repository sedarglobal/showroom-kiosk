'use strict';

angular.module('acs.filters', [])

	.filter('htmlSafe', [
	    '$sce', function ($sce) {
		return $sce.trustAsHtml;
	    }
	]);