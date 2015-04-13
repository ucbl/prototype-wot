var fs = require('fs');
var jsonld = require('jsonld');
var N3Store = require('n3').Store;
var requestModule = require('request');
var rp = require('request-promise');

function LocalFunctionalitiesManager(capabilitiesManager, contextManager) {
	this.capabilitiesManager = capabilitiesManager;
	this.contextManager = contextManager;
	this.functionalitiesConnections = [];
	this.functionalities = [];
	this.capabilities = [];
}

// Getters
LocalFunctionalitiesManager.prototype.getFunctionalities = function() {
	return this.functionalities;
};

LocalFunctionalitiesManager.prototype.getCapabilities = function() {
	return this.capabilities;
};

// Setters
LocalFunctionalitiesManager.prototype.setFunctionalities = function(functionalities) {
	this.functionalities = functionalities;
};

LocalFunctionalitiesManager.prototype.setCapabilities = function(capabilities) {
	this.capabilities = capabilities;
};

// Loaders
LocalFunctionalitiesManager.prototype.loadCapabilities = function() {
	this.setCapabilities(this.capabilitiesManager.getCapabilities());
};

LocalFunctionalitiesManager.prototype.contextualizeFunctionalities = function() {
	this.contextManager.setFunctionalities(this.getFunctionalities());
	this.setFunctionalities(this.contextManager.getFunctionalities());
};

// Get the local functionalities from the Functionalities Repository
LocalFunctionalitiesManager.prototype.getLocalFunctionalitiesFromRepository = function(){
	var self = this;
	if (self.getCapabilities().length > 0) {
		return rp.get({url:'http://localhost:3232/functionalities-search',
						json: {"capabilities": self.getCapabilities()}
						},
						function (reqError, reqHttpResponse, reqBody) {
							if (!reqError && reqBody && reqBody.functionalities) {
								self.functionalitiesConnections = reqBody.functionalities
								self.addFunctionalities(self.functionalitiesConnections);
							}
						});
	}
}

// Add functionalities
LocalFunctionalitiesManager.prototype.addFunctionalities = function(functionalities) {
	var self = this;
	for (i in functionalities) {
		var functionalityId = functionalities[i]['@id'];
		if (!self.functionalityExists(functionalityId)) {
			self.functionalities.push(functionalityId);
		}
	}
};

// Add functionality
LocalFunctionalitiesManager.prototype.addFunctionality = function(functionality) {
	var self = this;
	if (!self.functionalityExists(functionality)) {
		self.functionalities.push(functionality);
	}
};

// Check the existence of a functionality
LocalFunctionalitiesManager.prototype.functionalityExists = function(functionality) {
	var self = this;
	for (i in self.functionalities) {
		if (self.functionalities[i] == functionality)
			return true;
	}
	return false;
};

// Find the capability that corresponds to a functionality
LocalFunctionalitiesManager.prototype.findCapability = function(urlFunctionality) {
	var self = this;
	for (i in self.functionalitiesConnections) {
		if (self.functionalitiesConnections[i]['@id'] == urlFunctionality) {
			if (self.functionalitiesConnections[i].isImplementedBy) {
				return self.functionalitiesConnections[i].isImplementedBy['@id'];
			}
		}
	}
	return false;
};

module.exports = LocalFunctionalitiesManager;