/**
 * Created by Lionel on 27/11/2015.
 * Late initialization function - put here all that requires to know the server URI
 */

(function(module) {

    module.exports = function (request, response, next) {
        if(!Globals.baseUriUpdated) {
            //Set up the server URI in the global variables
            Globals.vocabularies.updateBaseUri('http://' + req.hostname + (Globals.config.port !== 80 ? (':' + Globals.config.port) : '') + '/');

            //Initiate the object discovery and construct their URIs
            ontologyModel.loadOntology({verbose: false});
            interoperabilityModel.loadObjects({verbose: false});
        }
        next();
    };
})(module);