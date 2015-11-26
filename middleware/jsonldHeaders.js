/**
 * Created by Lionel on 26/11/2015.
 */
//Middleware function that adds JSON-LD headers to the response

(function(module) {
    var Globals = require('./globals');

    module.exports = function (request, response, next) {
        response.writeHead(200, {
                "Content-Type": "application/ld+json",
                "Link": Globals.vocabularies.linkVocab}
        );
        next();
    };
})(module);