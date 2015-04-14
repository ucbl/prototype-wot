var fs = require('fs');
var jsonld = require('jsonld');
var N3Store = require('n3').Store;
var requestModule = require('request');
var rp = require('request-promise');

var ApplianceCommunicationManager = require('../avatar/applianceCommunicationManager');
var CapabilitiesManager = require('../avatar/capabilitiesManager');
var ContextManager = require('../avatar/contextManager');
var LocalFunctionalitiesManager = require('../avatar/localFunctionalitiesManager');
var CollaborativeFunctionalitiesManager = require('../avatar/collaborativeFunctionalitiesManager');

function Avatar(urlCimaObject) {
	var self = this;
	this.urlCimaObject = urlCimaObject;
	console.log("INFO: 1.1 - Appliance Communication Manager - Initialization");
	this.applianceCommunicationManager = new ApplianceCommunicationManager(urlCimaObject);
	this.applianceCommunicationManager.loadCimaObject()
		.then(function(response) {
			var responseJson = JSON.parse(response);
			self.id = responseJson.id;
			self.name = responseJson.name;
			self.description = responseJson.description;
			self.host = 'http://localhost:3000/avatar/';
			self.hostId = self.host + self.id;
			console.log("INFO: 1.1.1 - Capabilities of the CIMA object loaded in the Appliance Communication Manager :");
			console.log(self.applianceCommunicationManager.getCapabilities());
            
            console.log("INFO: 1.2 - Capabilities Manager - Initialization");
			self.capabilitiesManager = new CapabilitiesManager(self.applianceCommunicationManager);
			self.capabilitiesManager.loadCapabilitiesFromAppliance();
		    console.log("INFO: 1.2.1 - Information loaded in the Capabilities Manager");
            
            console.log("INFO: 1.3 - Context Manager - Initialization");
			self.contextManager = new ContextManager(self.capabilitiesManager, self.applianceCommunicationManager);
			console.log("INFO: 1.3.1 - Get the list of capabilities from the Capabilities Manager");
			self.contextManager.loadCapabilities();
			console.log("INFO: 1.3.2 - Get the context type from the Context Repository");
			self.contextManager.loadContextType();
			console.log("INFO: 1.3.3 - Get the context value from the Appliance");
			self.contextManager.loadContextValue();

            console.log("INFO: 1.4 - Local Functionalities Manager - Initialization");			
			self.localFunctionalitiesManager = new LocalFunctionalitiesManager(self.capabilitiesManager, self.contextManager);
			console.log("INFO: 1.4.1 - Get the list of capabilities from the Capabilities Manager:");
			self.localFunctionalitiesManager.loadCapabilities();
			console.log("INFO: 1.4.2 - Load the functionalities from the Functionalities Repository");
		    self.localFunctionalitiesManager.getLocalFunctionalitiesFromRepository()
		    	.then(function(){

				    console.log("INFO: 1.4.3 - Add the loaded functionalities to the Context Manager and get the filtered list of functionalities");
				    self.localFunctionalitiesManager.contextualizeFunctionalities();

		            console.log("INFO: 1.5 - Collaborative Functionalities Manager - Initialization");
					self.collaborativeFunctionalitiesManager = new CollaborativeFunctionalitiesManager(self.id, self.localFunctionalitiesManager, self.contextManager);

		            console.log("INFO: 1.5.1 - Load the functionalities from the Local Functionalities Manager");
					self.collaborativeFunctionalitiesManager.loadFunctionalitiesFromLocalFunctionalities();

					console.log("INFO: 1.5.2 - Load the incomplete functionalities from the Functionalities Repository");
				    self.collaborativeFunctionalitiesManager.loadIncompleteFunctionalitiesFromFunctionalitiesRepository()
				    	.then(function(){
				    		// MODE DIRECTORY
				            console.log("INFO: 1.5.3 - Load the functionalities from the Context Manager");
							self.collaborativeFunctionalitiesManager.loadFunctionalitiesFromContextManager();

				            console.log("INFO: 1.5.4 - Expose the functionalities to the Functionalitites Registry");
							self.collaborativeFunctionalitiesManager.exposeFunctionalitiesToServer()
							.then(function(){


							});
				    	})
				    	.catch(function(error) {
					        console.log("ERROR: The Collaborative Functionalities Manager could not communicate with the Functionalities Repository.");
					        console.log(error);
				    	});
		    	})
		    	.catch(function(error) {
			        console.log("ERROR: The Local Functionalities Manager could not communicate with the Functionalities Repository.");
			        console.log(error);
		    	});
	    })
		.catch(function(error){
	        console.log("ERROR: The Appliance Communication Manager could not communicate with the CIMA object.");
	        console.log(error);
		});
}

// Find information on an action
Avatar.prototype.getOperations = function(urlFunctionality){
	var self = this;
	var operations = [];
	var info = this.collaborativeFunctionalitiesManager.findCapability(urlFunctionality);
	// If the functionality is in this object
	if (self.id == info.idAvatar) {	
		for (i in self.applianceCommunicationManager.capabilitiesConnections) {
			var connection = self.applianceCommunicationManager.capabilitiesConnections[i];
			if (info.capability == connection.ontology) {
				for (j in connection.supportedOperation) {
					var operation = connection.supportedOperation[j];
					var expects = operation.expects;
					var operationSimple = {};
					operationSimple.method = operation.method;
					operationSimple.label = operation.label;
					operationSimple.idAvatar = self.id;
					operationSimple.supportedProperty = [];
					if (expects && expects.supportedProperty) {
						for (k in expects.supportedProperty) {
							var supportedPropertySimple = {};
							supportedPropertySimple.id = self.idFunctionality(expects.supportedProperty[k].property['@id']);
							supportedPropertySimple.label = expects.supportedProperty[k].property.label;
							operationSimple.supportedProperty.push(supportedPropertySimple);
						}
					}
					operations.push(operationSimple);
				}
			}
		}
	}
	return operations;
}

// Execute an action
// Ex:
// urlFunctionality : http://localhost:3232/functionality/temperatureDecrease
// optionsOperation : { method: 'PUT', value: '3442' }

Avatar.prototype.executeFunctionality = function(urlFunctionality, optionsOperation){
	var self = this;
	var info = this.collaborativeFunctionalitiesManager.findCapability(urlFunctionality);
	// If the functionality doesn't exists
	if (!info) {
		console.log('INFO : The functionality ' + urlFunctionality + ' doesn\'t have a capability to implement it in this avatar');
		return false;
	}
	// Execute a simple functionality in this avatar
	if (info.idAvatar == self.id) {
		var capabilityConnection = self.applianceCommunicationManager.findCapabilityConnection(info.capability);
		var operationMethod = (optionsOperation.method) ? optionsOperation.method : 'GET';
		// Find if there's an operation that corresponds
		for (i in capabilityConnection.supportedOperation) {
			if (capabilityConnection.supportedOperation[i].method == operationMethod) {
				// Execute the operation sending a request
				var urlOperation = capabilityConnection['@id'];
				return rp({url: urlOperation,
						method: operationMethod,
						json: optionsOperation
						},
						function (reqError, reqHttpResponse, reqBody) {
							if (!reqError && reqBody) {
								console.log('INFO : Functionality executed ' + urlOperation + ' by ' + info.idAvatar + ' with response :');
								console.log(reqBody);
								if (optionsOperation.callback) {
									optionsOperation.callback(reqBody);
								}
							}
						});
			}
		}
	}
	// Check if other avatar can execute this operation
	if (info.idAvatar != self.id) {
		var urlOtherAvatar = self.host + info.idAvatar + '/' + self.idFunctionality(urlFunctionality);
		rp.put({url: urlOtherAvatar,
					json: {options: optionsOperation}
					},
					function (reqError, reqHttpResponse, reqBody) {
						if (!reqError && reqBody && reqBody.executed) {
							console.log('INFO : The functionality ' + urlFunctionality + ' was executed by ' + info.idAvatar + ' but it was called by ' + self.id);
						}
					});
	}
};

// Charge the functionalities from other avatars
Avatar.prototype.chargeFunctionalities = function(infoAvatar){
	this.collaborativeFunctionalitiesManager.saveFunctionalitiesFromOtherAvatars(infoAvatar);
	this.collaborativeFunctionalitiesManager.loadIncompleteFunctionalitiesFromFunctionalitiesRepository();
};

// Get the exposed functionalities to broadcast
Avatar.prototype.broadcastFunctionalities = function(){
	return this.collaborativeFunctionalitiesManager.getBroadCastFunctionalities();
};

// Get the exposed functionalities
Avatar.prototype.exposedFunctionalities = function(){
	return this.collaborativeFunctionalitiesManager.getFunctionalitiesToExpose();
};

// Find the id of a functionality
Avatar.prototype.idFunctionality = function(urlFunctionality) {
	var info = urlFunctionality.split('/');
	return info[info.length - 1];
}

module.exports = Avatar;