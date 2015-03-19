angular.module('CollaborativeFunctionalitiesManager').service('serviceCollaborativeFunctionalitiesManager',
    ['CollaborativeFunctionalityManager', 'serviceLocalFunctionalitiesManager', 'serviceContextManager', '$http',
    function(CollaborativeFunctionalityManager, serviceLocalFunctionalitiesManager, serviceContextManager, $http) {

    var collaborativeFunctionalitiesManager;

    // Initialization
    this.init = function(idAvatar) {
        collaborativeFunctionalitiesManager = new CollaborativeFunctionalityManager();
        this.getExposedFunctionalities();
        this.getIncompleteFunctionalities();
        this.getFunctionalitiesWebServiceClient();
        this.getExposableFunctionalities(idAvatar);
        this.exposeFunctionalities(idAvatar, collaborativeFunctionalitiesManager.getExposableFunctionalities());
	};

    // Get the list of the exposed functionalities
	this.getExposedFunctionalities = function() {
        console.log("INFO: 1.5.1 - Get the list of the exposed functionalities:");
        console.log(serviceLocalFunctionalitiesManager.getExposedFunctionalities());
        collaborativeFunctionalitiesManager.addAvailableFunctionalities(serviceLocalFunctionalitiesManager.getExposedFunctionalities());
    };

    // Get the list of incomplete functionalities from a repository
    this.getIncompleteFunctionalities = function() {
        console.log("INFO: 1.5.2 - Get the list of incomplete functionalities from a repository");
    };

    // Get the list of functionalities from an external source
    // (other Avatar or a web service)
    this.getFunctionalitiesWebServiceClient = function() {
        console.log("INFO: 1.5.3 - Get the list of functionalities from an external source (other Avatar or a web service)");
    };

    // Get the list of exposable functionalities from the Context Manager
    this.getExposableFunctionalities = function(idAvatar){
        var availableFunctionalities = collaborativeFunctionalitiesManager.getAvailableFunctionalities();
        var exposableFunctionalities = serviceContextManager.getExposableFunctionalities(availableFunctionalities);
        collaborativeFunctionalitiesManager.addExposableFunctionalities(exposableFunctionalities);
        console.log("INFO: 1.5.4 - Get the list of exposable functionalities from the Context Manager");
        console.log(collaborativeFunctionalitiesManager.getExposableFunctionalities());
    };

    // Register the list of functionalityalities
    this.exposeFunctionalities = function(idAvatar, exposableFunctionalities){
        console.log("INFO: 1.5.5 - Expose the functionalities to the HTTP Server");
        console.log(collaborativeFunctionalitiesManager.getExposableFunctionalities());
        $http.post('/expose-functionalities/', {'idAvatar':idAvatar, 'functionalities':exposableFunctionalities}).
            success(function(data, status, headers, config) {
            })
            .error(function(data, status, headers, config) {
            });
    };

}]);