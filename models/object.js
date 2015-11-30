/**
 * Created by Lionel on 17/11/2015.
 * Common methods of "object" (appliance) for the interoperability platform
 * Added to the object data at initialization time
 */

(function(module) {
    var fs = require('fs'),
        Globals = require('./globals'),
        cloneHelper = require('../helpers/cloneHelper');

    module.exports = {
        'initCapabilities': function(params) {
            for (var i in this.capabilities) {
                var capability = this.capabilities[i];
                var capabilityId = capability["@id"];
                var shortId = capabilityId.substring(capabilityId.lastIndexOf("/") + 1);
                var capabilityData = require("../data/interoperability/capabilities/" + shortId);

                // Clone capability file's methods and properties into object capability
                cloneHelper(capabilityData, capability);

                //Debug logs
                if (params && params.verbose) {
                    console.log("New capability: " + capabilityId);
                    for (var propName in capability) {
                        console.log("property: " + propName + "\t" + capability[propName]);
                    }
                }
            }
        },

        'getValue': function (attributeName) {
            return this.realObjectInfo[attributeName];
        },

        'setValue': function (attributeName, value) {
            this.realObjectInfo[attributeName] = value;
        },

        'getCapability': function (capabilityId) {
            for (var i in this.capabilities) {
                if (this.capabilities[i]["@id"] == capabilityId) {
                    return this.capabilities[i];
                }
            }
            return null;
        },

        'setCapability': function (capabilityId, value) {
            this.capabilities[capabilityId] = value;
        },

        'operate': function(capabilityId, method, params) {
            return this.capabilities[method] (params);
        }
    };
})(module);