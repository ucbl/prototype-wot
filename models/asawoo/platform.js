/**
 * Created by Lionel on 11/04/2016.
 */
(function(module) {

    var fs = require('fs'),
        Globals = require('./../globals'),
        infraController = require('./infrastructureController'),
        cloneHelper = require('../../helpers/cloneHelper'),
        templateEngine = require("../../helpers/jsonTemplateEngine");

    //local variable to retrieve data stored in files
    var fileLocations = {
        'hydraVocabDir': __dirname + '/../data/interoperability/vocabs/',
        "hydraVocabBaseFile": __dirname + '/../data/interoperability/vocabs/interoperability.jsonld',
        'contextFileDir': __dirname + '/../data/interoperability/contexts/',
        'deviceFileDir': __dirname + '/../data/interoperability/devices/'
    };

    var infrastructureController = new infraController();
    //Loop each 10 seconds
    //setInterval(infrastructureController.getUpdate, 10000);

    module.exports = {

        //Uri of the interoperability layer vocabulary
        "getHydraVocabUri": function() {
            return Globals.vocabularies.ontology + 'vocabs/asawoo#';
        },

        /**
         * Service model
         */

        //TODO

        /**
         * Hydra description model
         */

        //Returns the Hydra vocabulary corresponding to a particular object or defaults to the interoperability platform vocab
        "getHydraVocabulary": function(fileName) {
            return templateEngine(fs.readFileSync(fileName ? fileLocations.hydraVocabDir + fileName + ".jsonld" : fileLocations.hydraVocabBaseFile, 'utf8'));
        },

        //Returns the context corresponding to a given id or throws an error
        'getContext': function(contextId) {
            return templateEngine(fs.readFileSync(fileLocations.contextFileDir + contextId + '.jsonld', 'utf8'));
        }
    };
})(module);