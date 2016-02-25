var fs = require('fs');
var jsonld = require('jsonld');
var N3Store = require('n3').Store;
var requestModule = require('request');
var rp = require('request-promise');
var syncRequest = require('sync-request');

var ApplianceCommunicationManager = require('/applianceCommunicationManager');
var CapabilitiesManager = require('/capabilitiesManager');
var ContextManager = require('/contextManager');
var LocalFunctionalitiesManager = require('/localFunctionalitiesManager');
var CollaborativeFunctionalitiesManager = require('/collaborativeFunctionalitiesManager');

function Avatar(avatarDesc) {
	var self = this;
    //To cope with old call format with only the URI of the device in the interoperability layer
	this.urlCimaObject = typeof(avatarDesc) === "string"?avatarDesc:avatarDesc.deviceUri;
	console.log("INFO: 1.1 - Appliance Communication Manager - Initialization");
	this.applianceCommunicationManager = new ApplianceCommunicationManager(avatarDesc);
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
	if (self.id == info.avatarId) {
		for (i in self.applianceCommunicationManager.capabilitiesConnections) {
			var connection = self.applianceCommunicationManager.capabilitiesConnections[i];
			if (info.capability == connection.ontology) {
				for (j in connection.supportedOperation) {
					var operation = connection.supportedOperation[j];
					operations.push(operation);
				}
			}
		}
	}
	return operations;
}

// Find information and format it on an simple object
Avatar.prototype.getOperationsSimple = function(urlFunctionality){
	var self = this;
	var operations = [];
	var info = this.collaborativeFunctionalitiesManager.findCapability(urlFunctionality);
	if (self.id == info.avatarId) {
		for (i in self.applianceCommunicationManager.capabilitiesConnections) {
			var connection = self.applianceCommunicationManager.capabilitiesConnections[i];
			if (info.capability == connection.ontology) {
				for (j in connection.supportedOperation) {
					var operation = connection.supportedOperation[j];
					var expects = operation.expects;
					var operationSimple = {};
					operationSimple.method = operation.method;
					operationSimple.label = operation.label;
					operationSimple.avatarId = self.id;
					operationSimple.supportedProperty = [];
					if (expects && expects.supportedProperty) {
						for (k in expects.supportedProperty) {
							var supportedPropertySimple = {};
							supportedPropertySimple.id = self.functionalityId(expects.supportedProperty[k].property['@id']);
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
// optionsOperation : { value1: '3442', value2: '4324', value3: '5433' }

Avatar.prototype.executeFunctionality = function(urlFunctionality, optionsOperation){
	var self = this;
	if (self.isLocalFunctionality(urlFunctionality)) {
		// Execute a simple functionality in this avatar
		var info = this.collaborativeFunctionalitiesManager.findCapability(urlFunctionality);
		// If the functionality doesn't exist
		if (!info) {
			console.log('INFO : The functionality ' + urlFunctionality + ' doesn\'t have a capability to implement it in this avatar');
			return false;
		}
		if (info.avatarId == self.id) {
			var capabilityConnection = self.applianceCommunicationManager.findCapabilityConnection(info.capability);
			// Find if there's an operation that corresponds
			for (i in capabilityConnection.supportedOperation) {
				// Execute the first operation sending a request
				var urlOperation = capabilityConnection['@id'];
				var supportedOperation = capabilityConnection.supportedOperation[0];
				if (!optionsOperation) {
					var optionsOperation = {};
				}
				if (supportedOperation) {
					if (Object.keys(optionsOperation).length > 0) {
						var executeOperation = syncRequest(supportedOperation.method, urlOperation, {json: optionsOperation});
					} else {
						var executeOperation = syncRequest(supportedOperation.method, urlOperation);
					}
					var responseExecuteOperation = JSON.parse(executeOperation.body.toString('utf-8'));
					console.log('INFO : Functionality executed ' + urlOperation + ' by ' + info.avatarId + ' with response :');
					console.log(responseExecuteOperation);
					return responseExecuteOperation;
				}
			}
		}
	} else {
		// Execute a composed functionality in this avatar
		var urlCode = 'http://localhost:3535/code/'+self.functionalityId(urlFunctionality);
		var infoCode = syncRequest('GET', urlCode);
		var infoCodeJson = JSON.parse(infoCode.body.toString('utf-8'));
		var codeExecute = infoCodeJson.code;
		var execArguments = optionsOperation;
		eval(codeExecute);
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
Avatar.prototype.functionalityId = function(urlFunctionality) {
	var info = urlFunctionality.split('/');
	return info[info.length - 1];
}

// Is local functionality
Avatar.prototype.isLocalFunctionality = function(urlFunctionality) {
	var localFunctionalities = this.localFunctionalitiesManager.getFunctionalities();
	for (i in localFunctionalities) {
		if (localFunctionalities[i] == urlFunctionality) {
			return true;
		}
	}
	return false;
}


//UI
Avatar.prototype.toJsonHydra = function(hostServerPort) {
	var avatar = this;
	var hostServerPort = (!hostServerPort) ? 'http://localhost:3000' : hostServerPort;
	var avatarHydra = {};
	avatarHydra['@id'] = hostServerPort + '/avatar/' + avatar.id;
	avatarHydra['@context'] = hostServerPort + '/context/Avatar';
	avatarHydra['@type'] = 'vocab:Avatar';
	avatarHydra.name = avatar.name;
	avatarHydra.description = avatar.description;
	avatarHydra.functionalities = [];
	if (avatar.collaborativeFunctionalitiesManager) {	
		// Load all simple functionalities in this avatar
		simpleFunctionalities = avatar.collaborativeFunctionalitiesManager.getFunctionalitiesToExpose();
		for (i in simpleFunctionalities) {
			var functionalityHydra = avatar.toJsonFunctionalityHydraSimple(simpleFunctionalities[i]);
	    	avatarHydra.functionalities.push(functionalityHydra);
		}
		// Load all composed functionalities in this avatar
		composedFunctionalities = avatar.collaborativeFunctionalitiesManager.getFunctionalitiesComposedWithOtherAvatars();
		for (i in composedFunctionalities) {
			var functionalityComposedHydra = avatar.toJsonFunctionalityHydraComposed(composedFunctionalities[i]);
	    	avatarHydra.functionalities.push(functionalityComposedHydra);
		}
	}
	return avatarHydra;
}

Avatar.prototype.toJsonFunctionalityHydra = function(functionality, hostServerPort) {
	if (this.isLocalFunctionality(functionality)) {
		return this.toJsonFunctionalityHydraSimple(functionality, hostServerPort);
	} else {
		return this.toJsonFunctionalityHydraComposed(functionality, hostServerPort);
	}
}

Avatar.prototype.toJsonFunctionalityHydraSimple = function(functionality, hostServerPort) {
	var avatar = this;
	var hostServerPort = (!hostServerPort) ? 'http://localhost:3000' : hostServerPort;
	var functionalityHydra = {};
	functionalityHydra['@id'] = hostServerPort + '/avatar/' + avatar.id + '/' + avatar.functionalityId(functionality);
	functionalityHydra['@context'] = "http://www.w3.org/ns/hydra/context.jsonld";
	functionalityHydra['@type'] = 'http://localhost:3000/vocab#Functionality';
	functionalityHydra.supportedOperation = avatar.getOperations(functionality);
	return functionalityHydra;
}

Avatar.prototype.toJsonFunctionalityHydraComposed = function(functionality, hostServerPort) {
	var avatar = this;
	var urlCode = 'http://localhost:3535/code-simple/'+avatar.functionalityId(functionality);
	var hostServerPort = (!hostServerPort) ? 'http://localhost:3000' : hostServerPort;
	var functionalityHydra = {};
	functionalityHydra['@id'] = hostServerPort + '/avatar/' + avatar.id + '/' + avatar.functionalityId(functionality);
	functionalityHydra['@context'] = "http://www.w3.org/ns/hydra/context.jsonld";
	functionalityHydra['@type'] = 'http://localhost:3000/vocab#Functionality';
	var infoCode = syncRequest('GET', urlCode);
	var infoCodeJson = JSON.parse(infoCode.body.toString('utf-8'));
	var supportedOperation = {};
	supportedOperation['@id'] = '_:'+infoCodeJson.functionalityId;
	supportedOperation['@type'] = 'hydra:Operation';
	supportedOperation.method = 'POST';
	supportedOperation.label = infoCodeJson.label;
	supportedOperation.description = infoCodeJson.description;
	supportedOperation.expects = infoCodeJson.expects;
	supportedOperation.returns = infoCodeJson.returns;
	functionalityHydra.supportedOperation = [supportedOperation];
	return functionalityHydra;
}

function getUrl(url) {
  return httpclient({
    method: 'GET',
      url: url
    }).finish().body.read().decodeToString();
}

module.exports = Avatar;