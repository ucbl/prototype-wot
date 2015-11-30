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
        'init': function(capabilityId, params) {
            var index = capabilityId.lastIndexOf("/") + 1;
            var shortId = capabilityId.substring(index);
            var capabilityData = require("../data/interoperability/capabilities/" + shortId);

            // Clone capability file's methods and properties into object capability
            console.log(JSON.stringify(this.getCapability(capabilityId)));
            cloneHelper(capabilityData, this.getCapability(capabilityId));

            //Debug logs
            if (params && params.verbose) {
                console.log("New capability: " + capabilityData['@id'] + " -> " + capabilityData.length + " properties.");
                for (var propName in capabilityData) {
                    console.log("property: " + propName + "\t" + capabilityData[propName]);
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
                if (this.capabilities[i] == capabilityId) {
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