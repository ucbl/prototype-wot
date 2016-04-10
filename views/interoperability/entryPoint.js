/**
 * Created by Lionel on 01/12/2015.
 */
//View returning a JSON-LD description of the interoperability platform entrypoint

(function(module) {
    module.exports = function (entrypointModel) {
        var Globals = require('../../models/globals');
        //TODO add the devices
        var result = {
            "@context": Globals.vocabularies.interoperability + "context/EntryPoint",
            "@type": "hydra:EntryPoint",
            "@id": Globals.vocabularies.base + "interoperability"
        };
        result.knownDevices = entrypointModel.devices;
        result.connectedDevices = entrypointModel.connectedDevices;
        return result;
    }
})(module);