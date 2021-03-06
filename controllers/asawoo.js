/**
 * Created by Lionel on 11/04/2016.
 */
//This file contains controllers for application code delivery,
// but also business code inside the controllers (should be put in the model)

var express = require('express'),
    router = express.Router(),
    fs = require('fs'),
    asawooModel = require('../models/asawoo/platform'),
    bodyParser = require('body-parser'),
    Globals = require('../models/globals'),
    templateEngine = require("../helpers/jsonTemplateEngine"),
    jsonldHeaders = require('../middleware/jsonldHeaders');

/*---HYDRA ROUTER---*/

// Entry point and home page
// GET the list of available codes
router.get('/', function(request, response, next) {
    if (request.accepts('html')) {
        //Send the interoperability platform homepage
        response.redirect('/asawoo-public');
    } else {
        request.vocabUri = asawooModel.getHydraVocabUri();
        jsonldHeaders(request, response, next);
        response.end(JSON.stringify((require("../views/asawoo/entryPoint")())));
    }
});

// GET contexts
router.get('/context/:context', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/ld+json"});
    var contextLocation = __dirname + '/../data/asawoo/contexts/' + request.params.context + '.jsonld';
    fs.readFile(contextLocation, 'utf8', function (error, data) {
        response.end(templateEngine(data));
    });
    return true;
});

/*---WEB SERVICE---*/

//TODO

module.exports = router;