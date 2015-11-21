//This file contains controllers for application code delivery,
// but also business code inside the controllers (should be put in the model)

var express = require('express'),
    router = express.Router(),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    Globals = require('../models/globals');


/*---HYDRA ROUTER---*/

// Entry point and home page
// GET the list of available codes
router.get('/', function(request, response) {
    var responseJson = {
        '@id': Globals.vocabularies.base + "/code-repository",
        '@type': "vocab:Collection",
        '@context': Globals.vocabularies.base + "/context/Collection",
        'codes': []
    };
    var directoryFiles = fs.readdirSync(__dirname + '/../data/code-repository/codes-info/');
    for (var i in directoryFiles) {
        var fileJson = __dirname + '/../data/code-repository/codes-info/' + directoryFiles[i];
        responseJson.codes.push(JSON.parse(fs.readFileSync(fileJson, 'utf8')));
    }
    response.writeHead(200, {"Content-Type": "application/ld+json",
        "Link": Globals.vocabularies.linkVocab});
    response.end(JSON.stringify(responseJson));
});

// GET the hydra vocabulary
router.get('/vocab', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/ld+json"});
    var hydraLocation = __dirname + '/../data/code-repository/hydra.jsonld';
    fs.readFile(hydraLocation, 'utf8', function (error, data) {
        response.end(data);
    });
    return true;
});

// GET the hydra context
router.get('/context/:context', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/ld+json"});
    var contextLocation = __dirname + '/../data/code-repository/contexts/' + request.params.context + '.jsonld';
    fs.readFile(contextLocation, 'utf8', function (error, data) {
        response.end(data);
    });
    return true;
});

router.get('/context', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/ld+json",
        "Link": Globals.vocabularies.linkVocab});
    response.end("{}");
});

/*---WEB SERVICE---*/

// GET the information of a code
router.get('/code/:idFunctionality', function(request, response) {
    var codeResponse = {};
    var idFunctionality = request.params.idFunctionality;
    var dataLocationFile = __dirname + '/../data/code-repository/codes-info/' + idFunctionality + '.json';
    try {
        codeResponse = JSON.parse(fs.readFileSync(dataLocationFile, 'utf8'));
        //Read file with the proper code
        var codeLocationFile = __dirname + '/../data/code-repository/codes/' + codeResponse.code.replace('file:','');
        codeResponse.code = fs.readFileSync(codeLocationFile, 'utf8');
    } catch(e) {}
    //Add headers
    response.writeHead(200, {"Content-Type": "application/ld+json",
        "Link": Globals.vocabularies.linkVocab});
    response.end(JSON.stringify(codeResponse));
});

// GET the simple information of a code
router.get('/code-simple/:idFunctionality', function(request, response) {
    var codeResponse = {};
    var idFunctionality = request.params.idFunctionality;
    var dataLocationFile = __dirname + '/../data/code-repository/codes-info/' + idFunctionality + '.json';
    try {
        codeResponse = JSON.parse(fs.readFileSync(dataLocationFile, 'utf8'));
    } catch(e) {}
    //Add headers
    response.writeHead(200, {"Content-Type": "application/ld+json",
        "Link": Globals.vocabularies.linkVocab});
    response.end(JSON.stringify(codeResponse));
});

/*
// GET, POST, PUT by default
router.all('/*', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/ld+json",
        "Link": Globals.vocabularies.linkVocab});
    response.end("{}");
});
*/

module.exports = router;