angular.module('ApplianceCommunicationManager').factory('CimaObject',
	['$resource',
	function($resource){
		return $resource('/load-external/:idAvatar');
	}
]);