/**
 * Created by Lionel on 01/12/2015.
 */
//View returning a JSON-LD description of the interoperability platform entrypoint

(function(module) {
    module.exports = function (devices) {
        var Globals = require('../../models/globals');

        var result = {
            '@context': Globals.vocabularies.interoperability + 'context/Collection',
            '@type': 'vocab:ConnectedDeviceRefs',
            '@id': Globals.vocabularies.interoperability + "connected-devices",
            'connectedDevices': []
        };
        for(var device in devices) {
            result.connectedDevices.push(device['@id']);
        }
        return result;
    }
})(module);