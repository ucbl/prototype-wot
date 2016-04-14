/**
 * Created by Lionel on 11/04/2016.
 */
//This file contains controllers for application code delivery,
// but also business code inside the controllers (should be put in the model)

var express = require('express'),
    router = express.Router(),
    fs = require('fs'),
    asawooModel = require('../models/asawoo/platform'),
    jsonParser = require('body-parser').json(),
    templateEngine = require("../helpers/jsonTemplateEngine"),
    jsonldHeaders = require('../middleware/jsonldHeaders');

var functionalityDirectory = asawooModel.functionalityDirectory;

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

// GET avatars
router.get('/avatars/:avatarId', function(request, response, next) {
    var avatarId = request.params["avatarId"];
    var avatar = asawooModel.getAvatar(avatarId);
    if(avatar) {
        if (request.accepts('html')) {
            response.render('asawoo/avatar', {avatar: avatar});
        } else {
            request.vocabUri = asawooModel.getHydraVocabUri();
            jsonldHeaders(request, response, next);
            response.end(JSON.stringify((require("../views/asawoo/avatar")(avatar))));
        }
    } else {
        response.sendStatus(404);
    }
});

/*---WEB SERVICE---*/

//Query functionality directory
//TODO: ADD JSON-LD CONTEXTS !!!
router.get('/directory', function(request, response, next) {
    request.vocabUri = asawooModel.getHydraVocabUri();
    jsonldHeaders(request, response, next);
    response.end(JSON.stringify(functionalityDirectory.getAll()));
});

router.get('/directory/:functionalityClassId', function(request, response, next) {
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

router.put('/directory/:functionalityId/:functionalityInstanceId', jsonParser, function(request, response, next) {
    var functionalityClassId = request.params.functionalityId;
    var functionalityInstanceId = request.params.functionalityInstanceId;
    request.vocabUri = asawooModel.getHydraVocabUri();
    jsonldHeaders(request, response, next);
    response.end(JSON.stringify(functionalityDirectory.bind(functionalityClassId, functionalityInstanceId)));
});
//TODO

module.exports = router;