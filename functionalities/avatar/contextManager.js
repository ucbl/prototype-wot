var fs = require('fs');
var jsonld = require('jsonld');
var N3Store = require('n3').Store;
var requestModule = require('request');

function ContextManager(capabilitiesManager, applianceCommunicationManager) {
	this.capabilitiesManager = capabilitiesManager;
	this.applianceCommunicationManager = applianceCommunicationManager;
    this.capabilities = [];
    this.contextType = [];
    this.contextValue = [];
    this.functionalities = [];
}

// Getters
ContextManager.prototype.getCapabilities = function(){
    return this.capabilities;
};

ContextManager.prototype.getFunctionalities = function() {
    return this.functionalities;
};

// Setters
ContextManager.prototype.setCapabilities = function(capabilities){
    this.capabilities = capabilities;
};

ContextManager.prototype.setFunctionalities = function(functionalities) {
	// TODO Medi
	// Each time we receive a list of functionalities we should filter them here
    this.functionalities = functionalities;
};

// Loaders
ContextManager.prototype.loadCapabilities = function() {
    this.capabilities = this.capabilitiesManager.getCapabilities();
};

ContextManager.prototype.loadContextType = function() {
	// TODO Medi
	// Send this.capabilities to the Context Repository and populate the contextType
};

ContextManager.prototype.loadContextValue = function() {
	// TODO Medi
	// Send this.contextType to the ApplianceCommunicationManager
	// and populate the contextValue
};

// Get the list of context types from the repository
this.getCapabilitiesRepository = function(){
	// TODO Medi
};

// Get the list of context values from the Appliacion Communication Manager
this.getContextValues = function(){
	// TODO Medi
};

// Get the list of exposable functionalities
this.getExposableFunctionalities = function(functionalities){
	return functionalities;
};

module.exports = ContextManager;