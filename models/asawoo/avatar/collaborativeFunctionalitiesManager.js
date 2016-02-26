var fs = require('fs');
var jsonld = require('jsonld');
var N3Store = require('n3').Store;
var requestModule = require('request');
var rp = require('request-promise');
var ldf = require('ldf-client');

function CollaborativeFunctionalitiesManager(idAvatar, localFunctionalitiesManager, contextManager) {
	this.localFunctionalitiesManager = localFunctionalitiesManager;
	this.idAvatar = idAvatar;
	this.contextManager = contextManager;
	this.functionalitiesToExpose = [];
	this.functionalitiesFromLocalFunctionalities = [];
	this.functionalitiesIncompleteFromFunctionalitiesRepository = [];
	this.functionalitiesComposedWithOtherAvatars = [];
	this.functionalitiesFromOtherAvatars = [];
	this.functionalitiesFromContextManager = [];
	this.functionalitiesConnections = [];
}

// Getters
CollaborativeFunctionalitiesManager.prototype.getFunctionalitiesToExpose = function() {
	return this.functionalitiesToExpose;
};

CollaborativeFunctionalitiesManager.prototype.getFunctionalitiesFromLocalFunctionalities = function() {
	return this.functionalitiesFromLocalFunctionalities;
};

CollaborativeFunctionalitiesManager.prototype.getFunctionalitiesIncompleteFromFunctionalitiesRepository = function() {
	return this.functionalitiesIncompleteFromFunctionalitiesRepository;
};

CollaborativeFunctionalitiesManager.prototype.getFunctionalitiesIncompleteFromFunctionalitiesRepositoryArray = function() {
	var arrayFunctionalities = [];
	for (i in this.functionalitiesIncompleteFromFunctionalitiesRepository) {
		arrayFunctionalities.push(this.functionalitiesIncompleteFromFunctionalitiesRepository[i].id);
	}
	arrayFunctionalities = uniqueArray(arrayFunctionalities);
	return arrayFunctionalities;
};

CollaborativeFunctionalitiesManager.prototype.getFunctionalitiesComposedWithOtherAvatars = function() {
	return this.functionalitiesComposedWithOtherAvatars;
};

CollaborativeFunctionalitiesManager.prototype.getFunctionalitiesFromOtherAvatars = function() {
	return this.functionalitiesFromOtherAvatars;
};

CollaborativeFunctionalitiesManager.prototype.getFunctionalitiesFromContextManager = function() {
	return this.functionalitiesFromContextManager;
};

CollaborativeFunctionalitiesManager.prototype.getBroadCastFunctionalities = function() {
	var self = this;
	var broadcastFunctionalities = [];
	broadcastFunctionalities = broadcastFunctionalities.concat(self.getFunctionalitiesFromLocalFunctionalities());
	broadcastFunctionalities = broadcastFunctionalities.concat(self.getFunctionalitiesFromFunctionalitiesRepository());
	return broadcastFunctionalities;
};

// Loaders
CollaborativeFunctionalitiesManager.prototype.loadFunctionalitiesFromLocalFunctionalities = function() {
	this.functionalitiesFromLocalFunctionalities = this.localFunctionalitiesManager.getFunctionalities();
	this.addFunctionalitiesToExpose(this.functionalitiesFromLocalFunctionalities);
}

CollaborativeFunctionalitiesManager.prototype.loadFunctionalitiesFromContextManager = function() {
	this.functionalitiesFromContextManager = this.contextManager.getFunctionalities();
}

CollaborativeFunctionalitiesManager.prototype.loadFunctionalitiesFromOtherAvatars = function() {
	var self = this;
	return rp.put({url:'http://localhost:3000/broadcast-functionalities',
					json: {'idAvatar':self.idAvatar,
							'functionalities': self.getFunctionalitiesToExpose()}
					},
					function (reqError, reqHttpResponse, reqBody) {
						if (!reqError && reqBody) {
							for (j in reqBody) {
								var otherAvatar = reqBody[j];
								var otherAvatarFunctionalities = otherAvatar.functionalities;
								for (k in otherAvatarFunctionalities) {
									// Save the functionality
									self.functionalitiesFromOtherAvatars.push(otherAvatarFunctionalities[k]);
									// Save the connection (it will be useful when executing a functionality)
									var functionalityConnection = {};
									functionalityConnection.idAvatar = otherAvatar.idAvatar;
									functionalityConnection.functionality = otherAvatarFunctionalities[k];
									self.addFunctionalityConnection(functionalityConnection);
								}
							}
							self.functionalitiesFromOtherAvatars = uniqueArray(self.functionalitiesFromOtherAvatars);
							self.addFunctionalitiesToExpose(self.functionalitiesFromOtherAvatars);
							// Check again for incomplete functionalities using the repository
							self.loadIncompleteFunctionalitiesFromFunctionalitiesRepository();
						}
					});
}

CollaborativeFunctionalitiesManager.prototype.saveFunctionalitiesFromOtherAvatars = function(infoAvatar) {
	var self = this;
	var infoAvatarFunctionalities = infoAvatar.functionalities;
	for (j in infoAvatarFunctionalities) {
		// Save the functionality
		self.functionalitiesFromOtherAvatars.push(infoAvatarFunctionalities[j]);
		// Save the connection (it will be useful when executing a functionality)
		var functionalityConnection = {};
		functionalityConnection.idAvatar = infoAvatar.idAvatar;
		functionalityConnection.functionality = infoAvatarFunctionalities[j];
		self.addFunctionalityConnection(functionalityConnection);
	}
	self.functionalitiesFromOtherAvatars = uniqueArray(self.functionalitiesFromOtherAvatars);
	self.addFunctionalitiesToExpose(self.functionalitiesFromOtherAvatars);
}

CollaborativeFunctionalitiesManager.prototype.loadIncompleteFunctionalitiesFromFunctionalitiesRepository = function(){
	var self = this;
	return rp.get({url:'http://localhost:3232/functionalities-incomplete-all',
					json: {'functionalities': self.getFunctionalitiesToExpose()}
					},
					function (reqError, reqHttpResponse, reqBody) {
						if (!reqError && reqBody && reqBody.functionalities) {
							self.addFunctionalitiesIncompleteFromFunctionalitiesRepository(reqBody.functionalities);
						}
					});
}

// Get the local functionalities from the Functionalities Repository
CollaborativeFunctionalitiesManager.prototype.getFunctionalitiesToExpose = function(){
	// Mashup all the functionalities to expose
	return this.functionalitiesToExpose;
}

// Add the local functionalities from the Functionalities Repository
CollaborativeFunctionalitiesManager.prototype.addFunctionalitiesToExpose = function(functionalities){
	this.functionalitiesToExpose = this.functionalitiesToExpose.concat(functionalities);
	this.functionalitiesToExpose = uniqueArray(this.functionalitiesToExpose);
}

// Add the incomplete functionalities from the Functionalities Repository
CollaborativeFunctionalitiesManager.prototype.addFunctionalitiesIncompleteFromFunctionalitiesRepository = function(functionalities){
	this.functionalitiesIncompleteFromFunctionalitiesRepository = this.functionalitiesIncompleteFromFunctionalitiesRepository.concat(functionalities);
	this.functionalitiesIncompleteFromFunctionalitiesRepository = uniqueArray(this.functionalitiesIncompleteFromFunctionalitiesRepository);
}

// Delete all executable functionality
CollaborativeFunctionalitiesManager.prototype.deleteFunctionalityComposedWithOtherAvatars = function(){
	this.functionalitiesComposedWithOtherAvatars = [];
}

// Add an executable functionality
CollaborativeFunctionalitiesManager.prototype.addFunctionalityComposedWithOtherAvatars = function(functionality){
	this.functionalitiesComposedWithOtherAvatars.push(functionality);
	this.functionalitiesComposedWithOtherAvatars = uniqueArray(this.functionalitiesComposedWithOtherAvatars);
}

// Add a functionality connection
CollaborativeFunctionalitiesManager.prototype.addFunctionalityConnection = function(functionalityConnection){
	var self = this;
	var exists = false;
	for (j in self.functionalitiesConnections) {
		if (self.functionalitiesConnections[j].idAvatar == functionalityConnection.idAvatar) {
			if (self.functionalitiesConnections[j].functionality == functionalityConnection.functionality) {
				exists = true;
			}
		}
	}
	if (!exists) {
		self.functionalitiesConnections.push(functionalityConnection);
	}
}

// Find the capability that corresponds to a functionality
CollaborativeFunctionalitiesManager.prototype.findCapability = function(urlFunctionality) {
	var self = this;
	var capabilityResponse = {};
	for (i in self.functionalitiesToExpose) {
		if (self.functionalitiesToExpose[i] == urlFunctionality) {
			// Check if this avatar has this capability
			var capabilityLocal = self.localFunctionalitiesManager.findCapability(urlFunctionality);
			if (capabilityLocal) {
				capabilityResponse.idAvatar = self.idAvatar;
				capabilityResponse.capability = capabilityLocal;
				return capabilityResponse;
			}
			// Check if there's other avatar that has this capability
			for (j in self.functionalitiesConnections) {
				if (self.functionalitiesConnections[j].functionality == urlFunctionality) {
					capabilityResponse.idAvatar = self.functionalitiesConnections[j].idAvatar;
					capabilityResponse.functionality = urlFunctionality;
					return capabilityResponse;
				}
			}
		}
	}
	return false;
};

// Expose the functionalities and the incomplete functionalities
CollaborativeFunctionalitiesManager.prototype.exposeFunctionalitiesToServer = function() {
	var self = this;
	var options = {};
    options.idAvatar = self.idAvatar;
    options.functionalities = self.getFunctionalitiesToExpose();
    options.functionalitiesIncomplete = self.getFunctionalitiesIncompleteFromFunctionalitiesRepository();
    return rp.put({url:'http://localhost:3000/expose-functionalities',
	            		json: options});
};

// Add functionalities
CollaborativeFunctionalitiesManager.prototype.addFunctionalities = function(arrayFunctionalities, functionalities) {
	for(var i=0; i<functionalities.length; i++) {
		var functionalityId = functionalities[i]['@id'];
		arrayFunctionalities.push(functionalityId);
	}
};

function uniqueArray(array, placeholder, index) {
	if (array && array.length > 0) {	
		placeholder = array.length;
		while (index = --placeholder)
			while (index--)
				array[placeholder] !== array[index] || array.splice(index,1);
	}
	return array
}

module.exports = CollaborativeFunctionalitiesManager;