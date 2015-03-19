angular.module('CollaborativeFunctionalitiesManager').factory('CollaborativeFunctionalityManager',
	function() {

    var CollaborativeFunctionalityManager = function(){
		this.availableFunctionalities = [];
		this.exposableFunctionalities = [];
	};

	// Getters
	CollaborativeFunctionalityManager.prototype.getExposableFunctionalities = function(){
		return this.exposableFunctionalities;
	};

	CollaborativeFunctionalityManager.prototype.getAvailableFunctionalities = function(){
		return this.availableFunctionalities;
	};

	// Add available functionalities
	CollaborativeFunctionalityManager.prototype.addAvailableFunctionalities = function(functionalities){
		this.availableFunctionalities = functionalities;
	};

	// Add exposable functionalities
	CollaborativeFunctionalityManager.prototype.addExposableFunctionalities = function(functionalities){
		this.exposableFunctionalities = functionalities;
	};

	return CollaborativeFunctionalityManager;
	
});