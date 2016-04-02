/**
 * Created by Lionel on 17/11/2015.
 * Common methods of "device" (appliance) for the interoperability platform
 * Added to the device data at initialization time
 */

(function(module) {
    var fs = require('fs'),
        cloneHelper = require('../helpers/cloneHelper'),
        templateEngine = require("../helpers/jsonTemplateEngine");

    module.exports = {
        'initCapabilities': function(params) {
            for (var i in this.capabilities) {
                var capability = this.capabilities[i];
                var shortId = capability["@id"].substring(capability["@id"].lastIndexOf("/") + 1);
                var capabilityData = require("../data/interoperability/capabilities/" + shortId);

                // Clone capability file's methods and properties into device capability
                cloneHelper(capabilityData, capability);

                //Provide an easy accessor to the short id
                capability.id = shortId;

                //Provide an URI for invocation through the interoperability platform
                capability.platform = capability["@id"].replace("/devices/", "/connected-devices/");

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

        'getCapability': function (capabilityId) {
            for (var i in this.capabilities) {
                if (this.capabilities[i]["id"] == capabilityId) {
                    return this.capabilities[i];
                }
            }
            return null;
        },

        'invokeCapability': function(capabilityId, method, params) {
            var capability = this.getCapability(capabilityId);
            console.log("Invoke " + capability["@id"] + "\non " + this["@id"] + "\nwith method " + method + "\nand parameters " + JSON.stringify(params));
            if(capability) {
                if(capability[method]) {
                    return templateEngine(capability[method](this.values, params?params.params:null));
                } else {
                    throw 400;
                }
            } else {
                throw 404;
            }
        }
    };
})(module);
