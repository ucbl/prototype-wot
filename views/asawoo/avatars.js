/**
 * Created by Lionel on 16/12/2015.
 * View returning a JSON-LD description of aa avatar array
 */


(function(module) {
    var Globals = require('./globals');

    module.exports = function (avatars) {
        return {
            "@context": Globals.vocabularies.asawoo + 'context/Collection',
            "@id": Globals.vocabularies.asawoo + 'avatars',
            "@type": 'vocab:EntryPoint/avatars',
            "avatars": avatars
        };
    };
})(module);