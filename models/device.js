/**
 * Created by Lionel on 17/11/2015.
 * Common methods of "device" (appliance) for the interoperability platform
 * Added to the device data at initialization time
 */

(function(module) {
    var fs = require('fs'),
        cloneHelper = require('../helpers/cloneHelper');

    module.exports = {
        'initCapabilities': function(params) {
            for (var i in this.capabilities) {
                var capability = this.capabilities[i];
                var shortId = capability["@id"].substring(capability["@id"].lastIndexOf("/") + 1);
                var capabilityData = require("../data/interoperability/capabilities/" + shortId);

                // Clone capability file's methods and properties into device capability
                cloneHelper(capabilityData, capability);

                //Provide the capability with an access to the object values
                capability.getDeviceValues = function() {
                    return this.values;
                };

                //Debug logs
                if (params && params.verbose) {
                    console.log("New capability: " + capability["@id"]);
                    for (var propName in capability) {
                        console.log("property: " + propName + "\t" + capability[propName]);
                    }
                }
            }
        },

        'getValue': function (attributeName) {
            return this.values[attributeName];
        },

        'setValue': function (attributeName, value) {
            this.values[attributeName] = value;
        },

        'getCapability': function (capabilityId) {
            for (var i in this.capabilities) {
                console.log(this.capabilities[i]["@id"] + " -> " + capabilityId);
                if (this.capabilities[i]["id"] == capabilityId) {
                    console.log("Found");
                    return this.capabilities[i];
                }
            }
            return null;
        },

        'setCapability': function (capabilityId, value) {
            this.capabilities[capabilityId] = value;
        },

        'invokeCapability': function(capabilityId, method, params) {
            var capability = this.getCapability(capabilityId);
            console.log("invoke " + JSON.stringify(capability) + " from " + capabilityId + " on " + JSON.stringify(this));
            if(capability) {
                if(capability[method]) {
                    return capability[method](this.values, params);
                } else {
                    throw 400;
                }
            } else {
                throw 404;
            }
        }
    };
})(module);