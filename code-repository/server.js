var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var app = express();

// Global variables
var hostServer = 'http://localhost';
var portListen = 3535;
var hostServerPort = hostServer + ':' + portListen;
var hydraVocab = hostServerPort + '/vocab#';
var linkVocab = '<' + hydraVocab + '>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"';
var hydraLocation = __dirname + '/data/hydra.jsonld';


// Configure App and CROS
//app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'json' }))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function(request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    response.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});


// Start the server in the port "portListen"
var server = app.listen(portListen, function () {
	var host = server.address().address;
	var port = server.address().port;
})






/*---HYDRA---*/

// GET the hydra vocabulary 
app.get('/vocab', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/ld+json"});
    fs.readFile(hydraLocation, 'utf8', function (error, data) {
        response.end(data);
    });
    return true;
});

// GET the hydra context
app.get('/context/:context', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/ld+json"});
    var contextLocation = __dirname + '/data/contexts/' + request.params.context + '.jsonld';
    fs.readFile(contextLocation, 'utf8', function (error, data) {
        response.end(data);
    });
    return true;
});
app.get('/context', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/ld+json",
                            "Link": linkVocab});
    response.end("{}");
});

// Entry point and home page
app.get('/', function(request, response, next) {
    if (request.accepts('html')) {
        response.end(objectsToString());
    } else {
        response.writeHead(200, {"Content-Type": "application/ld+json",
                                "Link": linkVocab});
        var responseEntryPoint = {
                                    "@context": hostServerPort + "/context/EntryPoint",
                                    "@id": hostServerPort + "/",
                                    "@type": "EntryPoint",
                                    "cima": hostServerPort + "/cima/"
                                };
        response.end(JSON.stringify(responseEntryPoint));
    }
});








/*---WEB SERVICE---*/

// GET the information of a code
app.get('/code/:idFunctionality', function(request, response, next) {
    var codeResponse = {};
    var idFunctionality = request.params.idFunctionality;
    var dataLocationFile = __dirname + '/data/codes-info/' + idFunctionality + '.json';
    try {
        codeResponse = JSON.parse(fs.readFileSync(dataLocationFile, 'utf8'));
        //Read file with the proper code
        var codeLocationFile = __dirname + '/data/codes/' + codeResponse.code.replace('file:','');
        codeResponse.code = fs.readFileSync(codeLocationFile, 'utf8');
    } catch(e) {}
    //Add headers
    response.writeHead(200, {"Content-Type": "application/ld+json",
                            "Link": linkVocab});
    response.end(JSON.stringify(codeResponse));
});

// GET the simple information of a code
app.get('/code-simple/:idFunctionality', function(request, response, next) {
    var codeResponse = {};
    var idFunctionality = request.params.idFunctionality;
    var dataLocationFile = __dirname + '/data/codes-info/' + idFunctionality + '.json';
    try {
        codeResponse = JSON.parse(fs.readFileSync(dataLocationFile, 'utf8'));
    } catch(e) {}
    //Add headers
    response.writeHead(200, {"Content-Type": "application/ld+json",
                            "Link": linkVocab});
    response.end(JSON.stringify(codeResponse));
});

// GET the list of codes available
app.get('/codes', function(request, response, next) {
    var responseJson = {};
    responseJson['@id'] = hostServerPort + "/codes";
    responseJson['@type'] = "vocab:Collection";
    responseJson['@context'] = hostServerPort + "/context/Collection";
    responseJson.codes = [];
    var directoryFiles = fs.readdirSync(__dirname + '/data/codes-info/');
    for (i in directoryFiles) {
        var fileJson = __dirname + '/data/codes-info/' + directoryFiles[i];
        responseJson.codes.push(JSON.parse(fs.readFileSync(fileJson, 'utf8')));
    }
    response.writeHead(200, {"Content-Type": "application/ld+json",
                            "Link": linkVocab});
    response.end(JSON.stringify(responseJson));
});

// GET, POST, PUT by default
app.all('/*', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/ld+json",
                            "Link": linkVocab});
    response.end("{}");
});