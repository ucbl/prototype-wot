angular.module('LocalFunctionalitiesManager').factory('LocalFunctionalityManager', 
	function(CapabilitiesManager) {

    var LocalFunctionalityManager = function() {
		this.availableFunctionalities = [];
	};

	// Getters
	LocalFunctionalityManager.prototype.getAvailableFunctionalities = function() {
		return this.availableFunctionalities;
	};

	// Add functionalities
	LocalFunctionalityManager.prototype.addFunctionalities = function(functionalities) {
		var self = this;
		for(var i=0; i<functionalities.length; i++) {
			var functionalityId = functionalities[i]['@id'];
			if (!self.functionalityExists(functionalityId)) {
				self.availableFunctionalities.push(functionalityId);
			}
		}
	};

	// Check the existence of a functionality
	LocalFunctionalityManager.prototype.functionalityExists = function(functionality) {
		var self = this;
		for(var i=0; i<self.availableFunctionalities.length; i++) {
			if (self.availableFunctionalities[i] == functionality)
				return true;
		}
		return false;
	};

	return LocalFunctionalityManager;

});