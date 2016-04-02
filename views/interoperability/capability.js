/**
 * Created by Lionel on 01/12/2015.
 */
//View returning a JSON-LD description of a capability

(function(module) {
    module.exports = function (capabilityModel) {
        var result = {
            '@context': capabilityModel['@context'],
            '@id': capabilityModel['@id'],
            '@type': capabilityModel['@type']
        };
        if (capabilityModel['gateway'] || capabilityModel['platform']) {
            result.invocation = {};
            if(capabilityModel['gateway']) {
                result.invocation.platform = capabilityModel['platform'];
            }
            if(capabilityModel['platform']) {
                result.invocation.gateway = capabilityModel['gateway'];
            }
        }
        return result;
    }
})(module);