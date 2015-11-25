/**
 * Created by Lionel on 17/11/2015.
 */
//Extra common functions (just a cut and paste to make the whole app work)
//TODO refactor and move to the appropriate directories

(function(module) {
    var object = function() {
        this.getValue = function (attributeName) {
            return this.realObjectInfo[attributeName];
        };

        this.setValue = function (attributeName, value) {
            this.realObjectInfo[attributeName] = value;
        };

        this.getCapability = function (capabilityId) {
            return this.capabilities[capabilityId];
        };

        this.setCapability = function (capabilityId, value) {
            this.capabilities[capabilityId] = value;
        };
    };

    module.exports = object;
})(module);