(function(module) {
    var express = require('express'),
        router = express.Router(),
        Globals = require('../models/globals'),
        objectModel = require('../models/object'),
        ontologyModel = require('../models/ontology');

//Late initialization function - put here all that requires to know the server URI
    router.all('*', function(req, res, next) {
        if(!Globals.baseUriUpdated) {
            //Set up the server URI in the global variables
            Globals.vocabularies.updateBaseUri('http://' + req.hostname + (Globals.config.port !== 80?(':' + Globals.config.port):'') + '/');
            //Initiate the object discovery and construct their URIs
            objectModel.loadObjects();
            ontologyModel.loadOntology();
        }
        next();
    });

    router.use('/objects', require('./object'));
    router.use('/code-repository', require('./code-repository'));
    router.use('/ontology', require('./ontology'));

    router.get('/', function(req, res) {
        res.render('index');

    });
    module.exports = router;
})(module);