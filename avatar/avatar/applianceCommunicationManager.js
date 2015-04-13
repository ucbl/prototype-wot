var fs = require('fs');
var jsonld = require('jsonld');
var N3Store = require('n3').Store;
var requestModule = require('request');
var rp = require('request-promise');

function ApplianceCommunicationManager(urlCimaObject) {
	this.urlCimaObject = urlCimaObject;
	this.capabilitiesConnections = [];
	this.capabilities = [];
	this.cimaObject = {};
}

// Getters
ApplianceCommunicationManager.prototype.getUrlCimaObject = function() {
	return this.urlCimaObject;
};

ApplianceCommunicationManager.prototype.getCapabilities = function() {
	return this.capabilities;
};

ApplianceCommunicationManager.prototype.getCimaObject = function() {
	return this.cimaObject;
};

// Load the capabilities of a CIMA object
ApplianceCommunicationManager.prototype.loadCimaObject = function() {
	var self = this;
	return rp.get({url: this.urlCimaObject,
					headers : {'Accept': 'application/json'}
					},
					function (reqError, reqHttpResponse, reqBody) {
						if (!reqError && reqBody) {
							self.cimaObject = JSON.parse(reqBody);
							if (self.cimaObject.capabilities) {
								self.capabilitiesConnections = self.cimaObject.capabilities;
								self.loadCapabilitiesOntologies();
							}
							//Create other request to load the Hydra options
							var hydraVocab = 'http://www.w3.org/ns/hydra/core#apiDocumentation';
							var parsedLink = self.parseLinkHeader(reqHttpResponse.headers.link);
							if (parsedLink[hydraVocab]) {
								rp.get({url: parsedLink[hydraVocab],
										headers : {'Accept': 'application/json'}
										},
										function (reqHydraError, reqHydraHttpResponse, reqHydraBody) {
											self.loadHydraOperations(JSON.parse(reqHydraBody));
										});
							}
						}
					});
};

ApplianceCommunicationManager.prototype.loadCapabilitiesOntologies = function() {
	var self = this;
	self.capabilities = [];
	for (i in self.capabilitiesConnections) {
		self.capabilities.push(self.capabilitiesConnections[i].ontology);
	}
}

ApplianceCommunicationManager.prototype.findCapabilityConnection = function(urlCapability) {
	var self = this;
	for (i in self.capabilitiesConnections) {
		if (self.capabilitiesConnections[i].ontology == urlCapability) {
			return self.capabilitiesConnections[i];
		}
	}
	return false;
};

/*HYDRA*/
// Find the proper link
ApplianceCommunicationManager.prototype.parseLinkHeader = function(header) {
	var links = {};
	if (!header || (0 === header.trim().length)) {
		return links;
	}
	var parts = header.split(',');
	for(var i = parts.length - 1; i >= 0; i--) {
		var params = parts[i].split(';');
		var url, rel;
		for (var j = params.length - 1; j >= 0; j--) {
			if ('<' === params[j].trim()[0]) {
				url = params[j].trim().slice(1, -1);
			} else {
				var p = params[j].split('=');
				if ((2 === p.length) && ('rel' === p[0].trim())) {
					rel = p[1].trim().slice(1, -1);
				}
			}
		}
		if (url && rel) {
			links[rel] = url;
		}
	}
	return links;
}

// Load supported operations using the hydra vocab
ApplianceCommunicationManager.prototype.loadHydraOperations = function(hydraVocab) {
	var self = this;
	if (hydraVocab.supportedClass) {
		var vocabLink = hydraVocab['@context'].vocab; 
		var hydraClasses = hydraVocab.supportedClass;
		for (i in self.capabilitiesConnections) {
			self.capabilitiesConnections[i].supportedOperation = [];
			var capabilityClass = self.capabilitiesConnections[i]['@type'];
			var hydraClass = self.findHydraClass(hydraVocab, capabilityClass);
			if (hydraClass) {
				// Check the expected and return values
				for (k in hydraClass.supportedOperation) {
					var expects = hydraClass.supportedOperation[k].expects;
					var returns = hydraClass.supportedOperation[k].returns;
					var expectsClass = self.findHydraClass(hydraVocab, expects);
					var returnsClass = self.findHydraClass(hydraVocab, returns);
					if (expectsClass) {
						hydraClass.supportedOperation[k].expects = expectsClass;
					}
					if (returnsClass) {
						hydraClass.supportedOperation[k].returns = returnsClass;
					}
				}
				// Add the supported operation
				self.capabilitiesConnections[i].supportedOperation = hydraClass.supportedOperation;
			}
		}
	}
}

ApplianceCommunicationManager.prototype.findHydraClass = function(hydraVocab, hydraClassSearch) {
	var self = this;
	if (hydraClassSearch && hydraVocab.supportedClass) {
		var vocabLink = hydraVocab['@context'].vocab; 
		hydraClassSearch = hydraClassSearch.replace('vocab:', vocabLink);
		var vocabLink = hydraVocab['@context'].vocab; 
		var hydraClasses = hydraVocab.supportedClass;
		for (j in hydraClasses) {
			var hydraClass = hydraClasses[j]['@id'].replace('vocab:', vocabLink);
			if (hydraClassSearch == hydraClass) {
				return hydraClasses[j];
			}
		}
	}
	return false;
}

module.exports = ApplianceCommunicationManager;