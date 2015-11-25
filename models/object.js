/**
 * Created by Lionel on 17/11/2015.
 */
//Extra common functions (just a cut and paste to make the whole app work)
//TODO refactor and move to the appropriate directories

(function(module) {
    var object = function(params) {
        return {
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
/*
    object.prototype.constructor = function (params) {
        for (var key in params) {
            console.log("Adding property: " + key);
            object[key] = params[key];
        }
        if (!this.realObjectInfo) {
            object.realObjectInfo = [];
        }
        if (!this.capabilities) {
            object.capabilities = [];
        }
    };
*/
    module.exports = object;
})(module);