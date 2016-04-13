/**
 * Created by Lionel on 12/04/2016.
 */
//View returning a JSON-LD description of the ASAWoO platform entrypoint

(function(module) {
    module.exports = function () {
        var Globals = require('../../models/globals');

        return  {
            "@context": Globals.vocabularies.asawoo + "context/EntryPoint",
            "@type": "hydra:EntryPoint",
            "@id": Globals.vocabularies.base + "asawoo",
            "available-functionalities": Globals.vocabularies.asawoo + "directory",
            "avatars": Globals.vocabularies.asawoo + "avatars"
        };
    }
})(module);