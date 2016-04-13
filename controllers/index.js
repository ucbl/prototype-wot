(function(module) {
    var express = require('express'),
        router = express.Router();

    router.use('/interoperability', require('./interoperability'));
    router.use('/code-repository', require('./code-repository'));
    router.use('/ontology', require('./ontology'));
    router.use('/asawoo', require('./asawoo'));

    router.get('/', function(req, res) {
        res.render('index');
    });
    module.exports = router;
})(module);