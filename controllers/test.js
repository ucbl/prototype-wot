//This file contains a mock of an interoperability platform that is supposed to provide access to the connected objects

var express = require('express'),
    router = express.Router(),
    Globals = require('../models/globals');

// Entry point and home page
router.get('/', function(request, response) {
        response.writeHead(200, {
            "Content-Type": "application/ld+json",
            "Link": Globals.vocabularies.linkVocab
        });

        response.end("test");
});
