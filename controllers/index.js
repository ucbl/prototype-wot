(function(module) {
    var express = require('express'),
        router = express.Router(),
        Globals = require('../models/globals'),
        interoperabilityModel = require('../models/interoperability'),
        ontologyModel = require('../models/ontology');

    router.use('/interoperability', require('./interoperability'));
    router.use('/code-repository', require('./code-repository'));
    router.use('/ontology', require('./ontology'));

    router.get('/', function(req, res) {
        res.render('index');
    });
    module.exports = router;
})(module);