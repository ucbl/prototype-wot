/**
 * Created by Lionel on 17/11/2015.
 * Common methods of "object" (appliance) for the interoperability platform
 * Added to the object data at initialization time
 */

(function(module) {
    module.exports = {
        'getValue': function (attributeName) {
            return this.realObjectInfo[attributeName];
        },

        'setValue': function (attributeName, value) {
            this.realObjectInfo[attributeName] = value;
        },

        'getCapability': function (capabilityId) {
            return this.capabilities[capabilityId];
        },

        'setCapability': function (capabilityId, value) {
            this.capabilities[capabilityId] = value;
        }
    };
})(module);