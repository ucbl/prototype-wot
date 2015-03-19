angular.module('ApplianceCommunicationManager').factory('ApplianceCommunicationManager', 
    ['CimaObject',    
    function(CimaObject) {

    var ApplianceCommunicationManager = function(idAvatar){
        this.idAvatar = idAvatar;
        this.capabilities = [];
        this.contextValues = ['contextValue1','contextValue2','contextValue3'];
    };

    // Getters
    ApplianceCommunicationManager.prototype.getCimaObject = function()  {
        return this.cimaObject;
    };

    ApplianceCommunicationManager.prototype.getCapabilities = function()  {
        return this.capabilities;
    }

    ApplianceCommunicationManager.prototype.getContextValues = function()  {
        return this.contextValues;
    }

    // Load the information of the CIMA Object and store the capabilities and functionalities
    ApplianceCommunicationManager.prototype.loadCimaObject = function()  {
        var self = this;
        requestCimaObject = CimaObject.get(
                                {"idAvatar" : self.idAvatar},
                                function() {
                                    console.log("INFO: 1.1.1 - Storing and formatting the capabilities of the object in the Appliance Communication Manager :");
                                    if (requestCimaObject.capabilities) {
                                        self.cimaObject = requestCimaObject.rawObject;
                                        self.capabilities = requestCimaObject.capabilities;
                                        console.log("Capabilities: ");
                                        console.log(self.capabilities);
                                    } else {
                                        self.cimaObject = new CimaObject();
                                        console.log("The CIMA Object reference has no capabilities");
                                    }
                                });
        return requestCimaObject;
    };

    return ApplianceCommunicationManager;

}]);