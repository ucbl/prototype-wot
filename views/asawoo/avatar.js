/**
 * Created by Lionel on 12/04/2016.
 */
//View returning a JSON-LD description of the ASAWoO platform entrypoint

(function(module) {
    module.exports = function (avatar) {
        var Globals = require('../../models/globals');

        return  {
            "@context": Globals.vocabularies.asawoo + "context/avatar",
            "@type": "asawooVocab:avatar",
            "@id": Globals.vocabularies.asawoo + "avatar/" + avatar.id,
            "corresponding-device": Globals.vocabularies.asawoo + "avatar.device",
            "access-point": avatar.avatar_uri,
            "exposed-functionalities": avatar.functionalities
        };
    }
})(module);