//This file contains controllers for object-related requests

var express = require('express'),
    router = express.Router(),
    fs = require('fs'),
    Globals = require('../models/globals'),
    objectModel = require('../models/object');


// Entry point and home page
router.get('/', function(request, response) {
    if (request.accepts('html')) {
        response.render('objects/objects', {objects: objectModel.getAllObjects()});
        //response.end(objectModel.objectsToStringSimple());
    } else {
        response.writeHead(200, {"Content-Type": "application/ld+json",
            "Link": Globals.vocabularies.linkVocab});
        var responseEntryPoint = {
            "@context": Globals.vocabularies.base + "/context/EntryPoint",
            "@id": Globals.vocabularies.base + "/objects",
            "@type": "EntryPoint",
            "capability": Globals.vocabularies.capability
        };
        response.end(JSON.stringify(responseEntryPoint));
    }
});

// GET a single object description
router.get('/:objectId', function(request, response) {
    //Search object by name, then by id, then provide an empty object
    var object = objectModel.findObjectByName(request.params.objectId) || objectModel.get(request.params.objectId) || {realObjectInfo:[]};
    if (request.accepts('html')) {
        response.render('objects/object', {object: object});
    } else {
        response.writeHead(200, {"Content-Type": "application/ld+json",
            "Link": Globals.vocabularies.linkVocab});
        var responseEntryPoint = {
            "@context": Globals.vocabularies.base + "/context/Object",
            "@id": Globals.vocabularies.base + "/object",
            "@type": "Object",
            "capability": Globals.vocabularies.capability
        };
        response.end(JSON.stringify(responseEntryPoint));
    }
});

module.exports = router;