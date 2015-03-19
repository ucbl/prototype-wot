angular.module('ApplianceCommunicationManager').service('serviceApplianceCommunicationManager',
	['ApplianceCommunicationManager',
 	function(ApplianceCommunicationManager) {

 		var applianceCommunicationManager;

 		// Initialization
		this.init = function(idAvatar) {
			applianceCommunicationManager = new ApplianceCommunicationManager(idAvatar);
			initSecondModule(idAvatar);
		};

		// Get CIMA Object
		this.getCimaObject = function() {
			return applianceCommunicationManager.getCimaObject();
		};

		// Get the capabilities of the CIMA Object
		this.getCapabilities = function() {
			return applianceCommunicationManager.getCapabilities();
		};

		// Get the context values of the CIMA Object
		this.getContextValues = function() {
			return applianceCommunicationManager.getContextValues();
		};

		// Load the CIMA Object (mainly it's capabilities)
		this.loadCimaObject = function() {
			return applianceCommunicationManager.loadCimaObject();
		}

	}

]);