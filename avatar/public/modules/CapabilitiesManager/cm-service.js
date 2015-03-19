angular.module('CapabilitiesManager').service('serviceCapabilitiesManager',
	function(serviceApplianceCommunicationManager, CapabilitiesManager) {

	var capabilitiesManager;

	// Initialization
	this.init = function(idAvatar) {
		this.capabilitiesManager = new CapabilitiesManager();
		this.getCapabilitiesAppliance(idAvatar);
	};

	// Get the list of capabilities from the appliance and stock it in the capability manager
	this.getCapabilitiesAppliance = function(idAvatar){
        var self = this;
        serviceApplianceCommunicationManager.loadCimaObject()
        				.$promise.then(function(result){
							self.capabilitiesManager.addCapabilityProvider(idAvatar, serviceApplianceCommunicationManager.getCapabilities());
				            console.log("INFO: 1.2.1 - Information loaded in the Capabilities Manager");
				            console.log("Capabilities :");
				            console.log(self.capabilitiesManager.getCapabilities());
				            console.log("Providers :");
				            console.log(self.capabilitiesManager.getProviders());
				            console.log("Linkers :");
				            console.log(self.capabilitiesManager.getLinkers());
				        	initThirdModule(idAvatar);
				        },
				        function(error){
				            console.log("INFO: 1.2.1 - Error loading information in the Capabilities Manager");
				        	console.log("Sorry, we couldn't create the avatar because there's an error trying to recover the JSON-LD file of the CIMA Object");
				        });
    };

    // Get the list of capabilities
	this.getCapabilities = function() {
		return this.capabilitiesManager.getCapabilities();
	};

	// Get the list of providers
	this.getProviders = function() {
		return this.capabilitiesManager.getProviders();
	};

	// Get the list of linkers
	this.getLinkers = function() {
		return this.capabilitiesManager.getLinkers();
	};

});