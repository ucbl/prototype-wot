/**
 * Created by Lionel on 01/12/2015.
 */
//View returning a JSON-LD description of the interoperability platform entrypoint

(function(module) {
    module.exports = function () {
        var Globals = require('../../models/globals');

        return  {
            "@context": Globals.vocabularies.interoperability + "context/EntryPoint",
            "@type": "hydra:EntryPoint",
            "@id": Globals.vocabularies.base + "interoperability",
            "knownDevices": Globals.vocabularies.interoperability + "devices",
            "connectedDevices": Globals.vocabularies.interoperability + "connected-devices"
        };
    }
})(module);