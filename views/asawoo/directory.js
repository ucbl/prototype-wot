/**
 * Created by Lionel on 14/04/2016.
 */
//View returning a JSON-LD description of the functionality directory

(function(module) {
    module.exports = function (directory) {
        var Globals = require('../../models/globals');

        return  {
            "@context": Globals.vocabularies.asawoo + "context/directory",
            "@type": "asawooVocab:directory",
            "@id": Globals.vocabularies.asawoo + "directory",
            "functionalities": directory.functionalities
        };
    }
})(module);