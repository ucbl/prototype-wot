var avatar = angular.module('avatar', [
	'CapabilitiesManager',
	'ApplianceCommunicationManager',
	'LocalFunctionalitiesManager',
	'ContextManager',
	'CollaborativeFunctionalitiesManager',
	'Builder'
]);

angular.module('CapabilitiesManager', []);
angular.module('ApplianceCommunicationManager', ['ngResource']);
angular.module('LocalFunctionalitiesManager', ['ngResource']);
angular.module('ContextManager', ['ngResource']);
angular.module('CollaborativeFunctionalitiesManager', ['ngResource']);
angular.module('Builder', []);

function reloadAllPage() {
	angular.element(document.getElementById('bodyFrame')).scope().reloadAll();
}

avatar.controller('mainCtrl', ['$scope', '$http', function ($scope, $http){
	
	var cimaObjects;
	var functionalitiesServer;
	var functionalitiesMashup;
	var responseInfo;

	// Reload all functionalities and objects
	$scope.reloadAll = function() {
		$scope.getAllFunctionalities().then($scope.getAvailableObjects());
	}

	// Call the webservice to get all the information on the available objects
	$scope.getAvailableObjects = function(){
		return $http.get('/cima-info').
				success(function(data, status, headers, config) {
					cimaObjects = [];
					for (i in data) {
						var objectExists = false;
						for (j in functionalitiesServer) {
							if (functionalitiesServer[j].idAvatar == data[i]['@id']) {
								objectExists = true;
							}
						}
						cimaObjects.push({"id":data[i]['@id'], "name":data[i].name, "objectExists":objectExists});
					}
					$scope.cimaObjects = cimaObjects;
				}).error(function(data, status, headers, config) {
					console.log("Error: " + status);
					$scope.cimaObjects = [];
				});
	};

	// Call the web service to get all the functionalities stored in the server
	$scope.getAllFunctionalities = function(){
		return $http.get('/functionalities-server').
				success(function(data, status, headers, config) {
					functionalitiesServer = data;
					$scope.functionalitiesServer = functionalitiesServer;
				}).error(function(data, status, headers, config) {
					console.log("Error: " + status);
					$scope.functionalitiesServer = [];
				});
	};

	// Send the list of functionalities to a repository and see what we can do with them
	$scope.getFunctionalitiesServer = function() {
		return $http.get('/functionalities-mashup').
				success(function(data, status, headers, config) {
					if (data.functionalities) {
						functionalitiesMashup = data.functionalities;
						$scope.functionalitiesMashup = functionalitiesMashup;
					}
				}).error(function(data, status, headers, config) {
					console.log("Error: " + status);
					$scope.functionalitiesMashup = [];
				});
	}

	// Function to load an URL and show the response.
	// It's used to view the different functionality and avatar's information
	$scope.loadInfo = function(urlInfo) {
		$http.get(urlInfo).
			success(function(data, status, headers, config) {
				responseInfo = data;
				$scope.responseInfo = responseInfo;
			}).error(function(data, status, headers, config) {
				console.log("Error: " + status);
				$scope.responseInfo = [];
			});
	}


}]);