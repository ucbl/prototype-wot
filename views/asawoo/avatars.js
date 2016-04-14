/**
 * Created by Lionel on 14/04/2016.
 */
//View returning a JSON-LD description of the avatar collection

(function(module) {
    module.exports = function (avatars) {
        var Globals = require('../../models/globals');

        return  {
            "@context": Globals.vocabularies.asawoo + "context/avatars",
            "@type": "asawooVocab:avatars",
            "@id": Globals.vocabularies.asawoo + "avatars",
            "avatars": avatars
        };
    }
})(module);
