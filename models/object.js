/**
 * Created by Lionel on 17/11/2015.
 */
//Extra common functions (just a cut and paste to make the whole app work)
//TODO refactor and move to the appropriate directories

(function(module) {
    module.exports = function(params) {
        return {
            'constructor': function () {
                for (var key in params) {
                    this[key] = params[key];
                }
                if (!this.realObjectInfo) {
                    this.realObjectInfo = [];
                }
                if (!this.capabilities) {
                    this.capabilities = [];
                }
            },

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
    };
})(module);