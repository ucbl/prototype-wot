/**
 * Created by Lionel on 27/11/2015.
 * Late initialization function - put here all that requires to know the server URI
 */

(function(module) {
    var Globals = require('../models/globals'),
        interoperabilityModel = require('../models/interoperability/platform'),
        ontologyModel = require('../models/ontology'),
        infrastructureController = require('../models/asawoo/infrastructureController');


    module.exports = function (request, response, next) {
        if(!Globals.baseUriUpdated) {
            //Set up the server URI in the global variables
            Globals.vocabularies.updateBaseUri('http://' + request.hostname + (Globals.config.port !== 80 ? (':' + Globals.config.port) : '') + '/');

            //Initiate the object discovery and construct their URIs
            ontologyModel.loadOntology({verbose: false});
            interoperabilityModel.loadDevices({verbose: false});

            // Start the ASAWoO infrastructure controller regular updates
            // (send requests to localhost -> shouldn't be the first to send a request)
            (function doUpdate() {
                infrastructureController.getUpdate()
                    .then(() => {
                        setTimeout(function () {
                            doUpdate();
                        }, 10000);
                    })
                    .catch((error) => {
                        throw error;
                    });
            })();


        }
        next();
    };
})(module);