var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var app = express();

// Global variables
var hostServer = 'http://localhost';
var portListen = 3333;
var hostServerPort = hostServer + ':' + portListen;
var hydraVocab = hostServerPort + '/vocab#';
var linkVocab = '<' + hydraVocab + '>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"';
var hydraLocation = __dirname + '/data/hydra.jsonld';

// Configure App and CROS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function(request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
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

// Entry point
app.get('/', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/ld+json",
                            "Link": linkVocab});
    var responseEntryPoint = {
                                "@context": hostServerPort + "/context/EntryPoint",
                                "@id": hostServerPort + "/",
                                "@type": "EntryPoint",
                                "cima": hostServerPort + "/cima/"
                            };
    response.end(JSON.stringify(responseEntryPoint));
});








/*---WEB SERVICE---*/

// GET the information of a functionality
app.get('/cima', function(request, response, next) {
    var cimaResponse = {};
    cimaResponse['@id'] = hostServerPort + request.originalUrl;
    cimaResponse['@context'] = hostServerPort + '/context/Collection';
    cimaResponse['@type'] = 'vocab:Collection';
    cimaResponse.cimaObjects = [];
    var dataLocation = __dirname + '/data/objects/';
    var files = fs.readdirSync(dataLocation);
    for (i in files) {
        if (files[i]!='' && files[i].indexOf('.jsonld')>0) {
            var cimaObject = {'@id':hostServerPort + '/cima/' + files[i].replace('.jsonld',''),
                            '@type':'vocab:CimaObject'}
            cimaResponse.cimaObjects.push(cimaObject);
        }
    }
    response.writeHead(200, {"Content-Type": "application/ld+json",
                            "Link": linkVocab});
    response.end(JSON.stringify(cimaResponse));
});
app.get('/cima/:nameObject', function(request, response, next) {
    var nameObject = request.params.nameObject;
    var cimaResponse = {};
    var dataLocation = __dirname + '/data/objects/' + nameObject + '.jsonld';
    // Read the JSON-LD file that contains all the information
    fs.readFile(dataLocation, 'utf8', function (error, data) {
        if (!error) {
            dataJson = JSON.parse(data);
            var capabilities = [];
            if (dataJson.object && dataJson.object.capabilities) {
                for (var i=0; i<dataJson.object.capabilities.length; i++) {
                    capabilities.push((dataJson.object.capabilities[i])['@id']); 
                }
            }
            cimaResponse['@id'] = hostServerPort + request.originalUrl;
            cimaResponse['@context'] = hostServerPort + '/context/CimaObject';
            cimaResponse['@type'] = 'vocab:CimaObject';
            cimaResponse.name = dataJson.name;
            cimaResponse.description = dataJson.description;
            cimaResponse.capabilities = capabilities;
            cimaResponse.rawObject = dataJson;
            response.writeHead(200, {"Content-Type": "application/ld+json",
                                    "Link": linkVocab});
            response.end(JSON.stringify(cimaResponse));
        } else {
            response.writeHead(404, {"Content-Type": "application/ld+json"});
            response.end('');
        }
    });
    return true;
});

// GET, POST, PUT by default
app.all('/*', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/ld+json",
                            "Link": linkVocab});
    response.end("{}");
});