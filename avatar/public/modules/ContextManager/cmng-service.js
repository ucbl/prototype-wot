angular.module('ContextManager').service('serviceContextManager',
    function(serviceApplianceCommunicationManager, serviceCapabilitiesManager, ContextManager) {

    var contextManager;

    // Initialization
	this.init = function(idAvatar) {
        contextManager = new ContextManager();
		this.getCapabilities();
		this.getCapabilitiesRepository();
		this.getContextValues();
		initFourthModule(idAvatar);
	};

    // Get the list of capabilities from the capability manager
	this.getCapabilities = function(){
        contextManager.addCapabilities(serviceCapabilitiesManager.getCapabilities());
		console.log("INFO: 1.3.3.1 - Get the list of capabilities from the Capabilities Manager :");
		console.log(serviceCapabilitiesManager.getCapabilities());
	};

    // Get the list of context types from the repository
	this.getCapabilitiesRepository = function(){
		console.log("INFO: 1.3.3.2 - Get the list of context types from the repository");
	};

    // Get the list of context values from the Appliacion Communication Manager
	this.getContextValues = function(){
		console.log("INFO: 1.3.3.3 - Get the list of context values from the Appliacion Communication Manager");
		console.log(serviceApplianceCommunicationManager.getContextValues());
	};

    // Get the list of exposable functionalities
	this.getExposableFunctionalities = function(functionalities){
		return contextManager.getExposableFunctionalities(functionalities);
	};

});