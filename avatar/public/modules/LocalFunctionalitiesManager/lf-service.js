angular.module('LocalFunctionalitiesManager').service('serviceLocalFunctionalitiesManager',
	['serviceContextManager', 'serviceCapabilitiesManager', 'LocalFunctionalityManager','$http', '$q',
    function(serviceContextManager, serviceCapabilitiesManager, LocalFunctionalityManager, $http, $q) {

    var localFunctionalityManager;

    // Initialization
	this.init = function(idAvatar) {
        localFunctionalityManager = new LocalFunctionalityManager();
        var capabilities = this.getCapabilities();
        var self = this;
        this.getLocalFunctionalities(capabilities).then(
            function(){
                console.log("INFO 1.4.3 - Filtering the exposable functionalities using the Context Manager");
                console.log(serviceContextManager.getExposableFunctionalities(self.getExposedFunctionalities()));
                initFifthModule(idAvatar);
            },
            function(){
                console.log("INFO 1.4 - Error getting the local functionalities from the repository");
            }
        );
	};

    // Get the list of capabilities from the Capabilities Manager
	this.getCapabilities = function(){
        console.log("INFO: 1.4.1 - Get the list of capabilities from the Capabilities Manager:");
        console.log(serviceCapabilitiesManager.getCapabilities());
        return serviceCapabilitiesManager.getCapabilities();
	};

    // Get the local functionalities from the Functionalities Repository
    this.getLocalFunctionalities = function(capabilities){
        console.log("INFO: 1.4.2 - Get the local functionalities from the Functionalities Repository:");
        var q = $q.defer();
        capabilitiesRequest = capabilities;
        $http(
                {method: 'GET',
                url: 'http://localhost:3232/functionalities',
                params: {
                    "capabilities[]": capabilitiesRequest
                }}
            )
            .success(function(data, status, headers, config) {
                if (data.functionalities) {
                    localFunctionalityManager.addFunctionalities(data.functionalities);
                }
                console.log(localFunctionalityManager.getAvailableFunctionalities());
                q.resolve();
            }).error(function(data, status, headers, config) {
                q.reject();
            });
        /*
        $http
            .get('/find-functionalities/' + capabilitiesRequest)
            .success(function(data, status, headers, config) {
                if (data.functionalities) {
                    localFunctionalityManager.addFunctionalities(data.functionalities);
                }
                console.log(localFunctionalityManager.getAvailableFunctionalities());
                q.resolve();
            }).error(function(data, status, headers, config) {
                q.reject();
            });
        */
        return q.promise;
    }

    // Get the exposed functionalities
    this.getExposedFunctionalities = function(){
        return localFunctionalityManager.getAvailableFunctionalities();
    };

}]);