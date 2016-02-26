var fs = require('fs');
var jsonld = require('jsonld');
var N3Store = require('n3').Store;
var requestModule = require('request');

function CapabilitiesManager(applianceCommunicationManager) {
    this.applianceCommunicationManager = applianceCommunicationManager;
	this.providers = [];
    this.capabilities = [];
    this.linkers = [];
}

// Getters
CapabilitiesManager.prototype.getCapabilities = function(){
    return this.capabilities;
};

CapabilitiesManager.prototype.getProviders = function() {
    return this.providers;
};

CapabilitiesManager.prototype.getLinkers = function() {
    return this.linkers;
};

// Setters
CapabilitiesManager.prototype.setCapabilities = function(capabilities){
    return this.capabilities = capabilities;
};

CapabilitiesManager.prototype.setProviders = function(providers) {
    return this.providers = providers;
};

CapabilitiesManager.prototype.setLinkers = function(linkers) {
    return this.linkers = linkers;
};

// Loaders
CapabilitiesManager.prototype.loadCapabilitiesFromAppliance = function(){
	var urlCimaObject = this.applianceCommunicationManager.getUrlCimaObject();
	var capabilities = this.applianceCommunicationManager.getCapabilities();
	this.addCapabilityProvider(urlCimaObject, capabilities);
};
    
// Add a provider and it's capabilities
CapabilitiesManager.prototype.addCapabilityProvider = function(provider, capabilities) {
    var self = this;
    if (!self.exists(provider, "provider")) {
        (self.providers).push(provider);
        for(var i=0; i<(capabilities).length; i++) {
            if (!self.exists(capabilities[i], "capability")) {
                (self.capabilities).push(capabilities[i]);
            }
            if (!self.exists([provider, capabilities[i]], "linker")) {
                (self.linkers).push({"provider":provider,
                                    "capability":capabilities[i]});
            }
        }
    }
};

// Add a capability
CapabilitiesManager.prototype.addCapability = function(capability) {
    var self = this;
    if (!self.exists(capability, "capability")) {
        (self.capabilities).push(capability);
    }
};

// Add a provider
CapabilitiesManager.prototype.addProvider = function(provider) {
    var self = this;
    if (!self.exists(provider, "provider")) {
        (self.providers).push(provider);
    }
};

// Add a linker
CapabilitiesManager.prototype.addLinker = function(provider, capability) {
    var self = this;
    if (!self.exists([provider, capability], "linker")) {
        (self.linkers).push([provider, capability]);
    }
};

// Check if the item exists
CapabilitiesManager.prototype.exists = function(info,type) {
    var self = this;
    if (type == "provider") {
        for(var i=0; i<(self.providers).length; i++) {
            if (self.providers[i] == info)
                return true;
        }
    } else if(type == "capability") {
        for(var i=0; i<(self.capabilities).length; i++) {
            if (self.capabilities[i] == info)
                return true;
        }
    } else if(type == "linker") {
        for(var i=0; i<(self.linkers).length; i++) {
            if (self.linkers[i][0] == info[0] && self.linkers[i][1] == info[1])
                return true;
        }
    }
    return false;
};

module.exports = CapabilitiesManager;