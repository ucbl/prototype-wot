/**
 * Created by Lionel on 11/04/2016.
 */
//This file contains controllers for application code delivery,
// but also business code inside the controllers (should be put in the model)

var express = require('express'),
    router = express.Router(),
    fs = require('fs'),
    asawooModel = require('../models/asawoo/platform'), //We keep the asawoo platform model to ne able to retrieve JSON-LD contexts
    directoryModel = require('../models/functionalityDirectory'),
    jsonParser = require('body-parser').json(),
    templateEngine = require("../helpers/jsonTemplateEngine"),
    jsonldHeaders = require('../middleware/jsonldHeaders');

var functionalityDirectory = new directoryModel();

/*---WEB SERVICE---*/

//Query functionality directory
//TODO: ADD JSON-LD CONTEXTS !!!
router.get('/', function(request, response, next) {
    request.vocabUri = asawooModel.getHydraVocabUri();
    jsonldHeaders(request, response, next);
    response.end(JSON.stringify((require("../views/asawoo/directory")({functionalities: functionalityDirectory.getAll()}))));
});

router.get('/:functionalityClassId', function(request, response, next) {
    var functionalityId = request.params.functionalityId;
    var functionalityInstances = functionalityDirectory.lookup(functionalityId);
    if(functionalityInstances) {
        request.vocabUri = asawooModel.getHydraVocabUri();
        jsonldHeaders(request, response, next);
        response.end(JSON.stringify(functionalityInstances));
    } else {
        response.sendStatus(404);
    }
});

router.put('/', jsonParser, function(request, response, next) {
    console.log("PUT: " + JSON.stringify(request.body));
    var functionality = request.params["test"];
    request.vocabUri = asawooModel.getHydraVocabUri();
    jsonldHeaders(request, response, next);
    for (var i = 0; i < request.body.length; i++) {
        functionality = request.body[i];
        functionalityDirectory.bind(functionality);
    }
    response.end();
});

router.delete('/:functionalityId', function(request, response, next) {
    var functionalityId = request.params.functionalityId;
    var result = functionalityDirectory.unbind(functionalityId);
    request.vocabUri = asawooModel.getHydraVocabUri();
    jsonldHeaders(request, response, next);
    if(result) {
        response.sendStatus(204);
    } else {
        response.sendStatus(404);
    }
});

module.exports = router;