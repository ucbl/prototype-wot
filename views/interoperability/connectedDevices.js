/**
 * Created by Lionel on 01/12/2015.
 */
//View returning a JSON-LD description of the interoperability platform entrypoint

(function(module) {
    module.exports = function (devices) {
        var Globals = require('../../models/globals');

        var result = {
            '@context': Globals.vocabularies.interoperability + 'context/ConnectedDeviceRefs',
            '@type': 'vocab:ConnectedDeviceRefs',
            '@id': Globals.vocabularies.interoperability + "connected-devices",
            'connectedDevices': []
        };
        for(var i in devices) {
            result.connectedDevices.push(devices[i]['@id']);
        }
        return result;
    }
})(module);