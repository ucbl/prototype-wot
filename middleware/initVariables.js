/**
 * Created by Lionel on 27/11/2015.
 * Late initialization function - put here all that requires to know the server URI
 */

(function(module) {
    var Globals = require('../models/globals'),
        interoperabilityModel = require('../models/interoperability'),
        ontologyModel = require('../models/ontology');


    module.exports = function (request, response, next) {
        if(!Globals.baseUriUpdated) {
            //Set up the server URI in the global variables
            Globals.vocabularies.updateBaseUri('http://' + request.hostname + (Globals.config.port !== 80 ? (':' + Globals.config.port) : '') + '/');

            //Initiate the object discovery and construct their URIs
            ontologyModel.loadOntology({verbose: false});
            interoperabilityModel.loadObjects({verbose: false});
        }
        next();
    };
})(module);