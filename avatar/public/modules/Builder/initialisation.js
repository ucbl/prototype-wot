angular.module('Builder').service('Initialisation',
    ['serviceApplianceCommunicationManager', 'serviceCapabilitiesManager', 'serviceLocalFunctionalitiesManager', 'serviceContextManager', 'serviceCollaborativeFunctionalitiesManager',
    function(serviceApplianceCommunicationManager, serviceCapabilitiesManager, serviceLocalFunctionalitiesManager, serviceContextManager, serviceCollaborativeFunctionalitiesManager) {

		this.initFirstModule = function(idAvatar) {
            console.log("INFO: 1.1 - Appliance Communication Manager - Initialization");
			serviceApplianceCommunicationManager.init(idAvatar);
		};

		initSecondModule = function(idAvatar){    		
            console.log("INFO: 1.2 - Capabilities Manager - Initialization");
            serviceCapabilitiesManager.init(idAvatar);
        };

        initThirdModule = function(idAvatar){
            console.log("INFO: 1.3 - Context Manager - Initialization");
        	serviceContextManager.init(idAvatar);
        };

        initFourthModule = function(idAvatar){
            console.log("INFO: 1.4 - Local Functionalities Manager - Initialization");
            serviceLocalFunctionalitiesManager.init(idAvatar);
        };

        initFifthModule = function(idAvatar){
            console.log("INFO: 1.5 - Collaborative Functionalities Manager - Initialization");
            serviceCollaborativeFunctionalitiesManager.init(idAvatar);
            reloadAllPage();
        };

	}
]);