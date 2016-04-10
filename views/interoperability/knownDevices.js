/**
 * Created by Lionel on 01/12/2015.
 */
//View returning a JSON-LD description of the interoperability platform entrypoint

(function(module) {
    module.exports = function (devices) {
        var Globals = require('../../models/globals');

        var result = {
            '@context': Globals.vocabularies.interoperability + 'context/Collection',
            '@type': 'vocab:KnownDeviceRefs',
            '@id': Globals.vocabularies.interoperability + "devices",
            'knownDevices': []
        };
        for(var device in devices) {
            console.log(JSON.stringify(device));
            result.knownDevices.push(device['@id']);
        }
        return result;
    }
})(module);