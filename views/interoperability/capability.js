/**
 * Created by Lionel on 01/12/2015.
 */
//View returning a JSON-LD description of a capability

(function(module) {
    module.exports = function (capabilityModel) {
        return {
            '@context': capabilityModel['@context'],
            '@id': capabilityModel['@id'],
            '@type': capabilityModel['@type'],
            'access': capabilityModel['gateway']?
            {
                'platform': capabilityModel['@id'],
                'gateway': capabilityModel['gateway']
            }:{
                'platform': capabilityModel['@id']
            }
        }
    };
})(module);