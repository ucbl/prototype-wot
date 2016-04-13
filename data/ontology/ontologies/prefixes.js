(function(module) {
    var Globals = require("../../../models/globals");
    module.exports = {
        "@context": {
            "asawooVocab": Globals.vocabularies.hydraVocab,
            "owl": "http://www.w3.org/2002/07/owl#",
            "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
            "xsd": "http://www.w3.org/2001/XMLSchema#"
        }
    };
})(module);