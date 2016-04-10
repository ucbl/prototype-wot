/**
 * Created by Lionel on 01/12/2015.
 */
//View returning a JSON-LD description of the interoperability platform entrypoint

(function(module) {
    module.exports = function (devicesModel) {
        var Globals = require('../../models/globals');

        return {
            '@context': Globals.vocabularies.interoperability + 'context/Collection',
            '@type': 'vocab:ConnectedDeviceRefs',
            '@id': Globals.vocabularies.interoperability + "connected-devices",
            'connectedDevices': devicesModel
        };
    }
})(module);