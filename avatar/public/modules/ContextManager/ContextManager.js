angular.module('ContextManager').factory('ContextManager',
    function() {

    var ContextManager = function(){ 
        this.capabilities = [];
        this.contextValues = [];
    };

    // Getters
    ContextManager.prototype.getCapabilities = function(capabilities)  {
        return this.capabilities;
    };
	
    // Filter functionalities, this is the thesis work of Medi
    // in this prototype the filter just sends the same functionalities
    ContextManager.prototype.getExposableFunctionalities = function(functionalities) {
        return functionalities;
    };

    // Add a list of capabilities
    ContextManager.prototype.addCapabilities = function(capabilities) {
        this.capabilities = capabilities;
    };
	
    return ContextManager;

});