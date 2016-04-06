/**
 * Created by Lionel on 26/11/2015.
 * Middleware function that adds JSON-LD headers to the response
 * In order not to modify its common middleware interface, params are passed as request attributes (as done in Java)
 * The vocabulary URI is searched in request.hydraVocab
 */

(function(module) {
    var Globals = require('../models/globals');

    module.exports = function (request, response, next) {
        response.writeHead(200, {
                "Content-Type": "application/ld+json",
                "Link": '<' + request.vocabUri + '>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"'}
        );
        next();
    };
})(module);