var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var jsonld = require('jsonld');
var N3Store = require('n3').Store;
var app = express();

// Global variables
var hostServer = 'http://localhost';
var portListen = 3232;
var hostServerPort = hostServer + ':' + portListen;
var hydraVocab = hostServerPort + '/vocab#';
var linkVocab = '<' + hydraVocab + '>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"';
var dataLocation = __dirname + '/data/functionalities.jsonld';
var hydraLocation = __dirname + '/data/hydra.jsonld';

// Config variables
var nsAsawoo = 'http://localhost:3232/';
var nsAsawooVocab = 'http://localhost:3232/vocab#';
var nsFunctionality = nsAsawooVocab + 'Functionality';
var nsCapability = nsAsawooVocab + 'Capability';
var nsIsImplementedBy = nsAsawooVocab + 'isImplementedBy';
var nsIsComposedOf = nsAsawooVocab + 'isComposedOf';
var nsName = nsAsawooVocab + 'name';
var nsDescription = nsAsawooVocab + 'description';
var nsType = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';

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









/*---LOAD ONTOLOGY---*/
var tripleStore = new N3Store();
var jsonOntology = [];
fs.readFile(dataLocation, 'utf8', function (error, data) {
    if (!error) {
        jsonOntology = JSON.parse(data)['@graph'];
        jsonld.toRDF(JSON.parse(data), function (error, triples) {
            for (var graphName in triples) {
                triples[graphName].forEach(function (triple) {
                    tripleStore.addTriple(triple.subject.value, triple.predicate.value, triple.object.value);
                });
            }
        });
    }
});








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
    response.end('');
});

// Entry point
app.get('/', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/ld+json",
                            "Link": linkVocab});
    var responseEntryPoint = {
                                "@context": hostServerPort + "/context/EntryPoint",
                                "@id": hostServerPort + "/",
                                "@type": "EntryPoint",
                                "functionalities": hostServerPort + "/functionalities/",
                                "capabilities": hostServerPort + "/capabilities/"
                            };
    response.end(JSON.stringify(responseEntryPoint));
});







/*---WEB SERVICE---*/

// GET the entire list of capabilities
app.get('/capabilities', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/ld+json",
                            "Link": linkVocab});
    var capabilitiesResponse = {};
    capabilitiesResponse['@context'] = hostServerPort + "/context/Collection";
    capabilitiesResponse['@type'] = 'Collection';
    capabilitiesResponse['@id'] = hostServerPort + "/capabilities";
    capabilitiesResponse.capabilities = [];
    var triplesResponse = tripleStore.find(null, nsType, nsCapability);
    for (i in triplesResponse) {
        // Format the triples and show the response
        var graphItemEle = infoCapability(triplesResponse[i].subject);
        capabilitiesResponse.capabilities.push(graphItemEle);
    }
    response.end(JSON.stringify(capabilitiesResponse));
});

// GET the entire list of functionalities
app.get('/functionalities', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/ld+json",
                            "Link": linkVocab});
    var functionalitiesResponse = {};
    functionalitiesResponse['@context'] = hostServerPort + "/context/Collection";
    functionalitiesResponse['@type'] = 'Collection';
    functionalitiesResponse['@id'] = hostServerPort + "/functionalities";
    functionalitiesResponse.functionalities = [];
    var triplesResponse = tripleStore.find(null, nsType, nsFunctionality);
    for (i in triplesResponse) {
        // Format the triples and show the response
        var graphItemEle = infoFunctionality(triplesResponse[i].subject);
        functionalitiesResponse.functionalities.push(graphItemEle);
    }
    response.end(JSON.stringify(functionalitiesResponse));
});

// Search for functionalities using an array of capabilities
app.get('/functionalities-search', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/ld+json",
                            "Link": linkVocab});
    var functionalitiesResponse = {};
    functionalitiesResponse['@context'] = hostServerPort + "/context/Collection";
    functionalitiesResponse['@type'] = 'Collection';
    functionalitiesResponse['@id'] = hostServerPort + "/functionalities";
    functionalitiesResponse.functionalities = [];
    var capabilitiesArray = request.body.capabilities;
    var triplesResponse = [];
    if (capabilitiesArray && capabilitiesArray.length > 0) {
        for (j in capabilitiesArray) {
            triplesResponse = triplesResponse.concat(tripleStore.find(null, nsIsImplementedBy, capabilitiesArray[j]));
        }
    }
    for (i in triplesResponse) {
        var graphItemEle = infoFunctionality(triplesResponse[i].subject);
        functionalitiesResponse.functionalities.push(graphItemEle);
    }
    response.end(JSON.stringify(functionalitiesResponse));
});

// Search for incomplete functionalities
app.get('/functionalities-incomplete', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/ld+json",
                            "Link": linkVocab});
    var functionalitiesResponse = {};
    functionalitiesResponse['@context'] = hostServerPort + "/context/Collection";
    functionalitiesResponse['@type'] = 'Collection';
    functionalitiesResponse['@id'] = hostServerPort + "/functionalities";
    functionalitiesResponse.functionalities = [];
    var functionalitiesArray = request.body.functionalities;
    // Relate the array of the functionalities that we have and search if there are composed functionalities
    var composedFunctionalitiesInfo = findComposedFunctionalitiesInfo();
    for (i in composedFunctionalitiesInfo) {
        for (j in (composedFunctionalitiesInfo[i]).isComposedOf) {
            if (functionalitiesArray.indexOf((composedFunctionalitiesInfo[i]).isComposedOf[j]) >= 0) {
                functionalitiesResponse.functionalities.push(composedFunctionalitiesInfo[i].id);
            }
        }
    }
    response.end(JSON.stringify(functionalitiesResponse));
});

// Search for composed functionalities
app.get('/functionalities-composed', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/ld+json",
                            "Link": linkVocab});
    var functionalitiesResponse = {};
    functionalitiesResponse['@context'] = hostServerPort + "/context/Collection";
    functionalitiesResponse['@type'] = 'Collection';
    functionalitiesResponse['@id'] = hostServerPort + "/functionalities";
    functionalitiesResponse.functionalities = [];
    var functionalitiesArray = request.body.functionalities;
    // Relate the array of the functionalities that we have and search if there are composed functionalities
    var composedFunctionalitiesInfo = findComposedFunctionalitiesInfo();
    for (i in composedFunctionalitiesInfo) {
        var functionalitiesFound = 0;
        for (j in (composedFunctionalitiesInfo[i]).isComposedOf) {
            if (functionalitiesArray.indexOf((composedFunctionalitiesInfo[i]).isComposedOf[j]) >= 0) {
                functionalitiesFound++;
            }
        }
        if (functionalitiesFound == (composedFunctionalitiesInfo[i]).isComposedOf.length) {
            functionalitiesResponse.functionalities.push(i);
        }
    }
    response.end(JSON.stringify(functionalitiesResponse));
});

// GET the information of a functionality
app.get('/functionality/:functionality', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/ld+json", "Link": linkVocab});
    var requestUrl = request.protocol + '://' + request.get('host') + request.originalUrl;
    var functionalityResponse = infoFunctionality(requestUrl);
    response.end(JSON.stringify(functionalityResponse));
});

// GET the information of a capability
app.get('/capability/:capability', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/ld+json", "Link": linkVocab});
    var requestUrl = request.protocol + '://' + request.get('host') + request.originalUrl;
    var capabilityResponse = infoCapability(requestUrl);
    response.end(JSON.stringify(capabilityResponse));
});

// GET, POST, PUT by default
app.all('/*', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/ld+json",
                            "Link": linkVocab});
    response.end('');
});




// EXTRA FUNCTIONS
// Extract the info of a capability
function infoCapability(capabilityUrl) {
    var info = tripleStore.find(capabilityUrl, null, null);
    var response = {};
    response['@id'] = capabilityUrl;
    response['@type'] = 'vocab:Capability';
    response['@context'] = hostServerPort + "/context/Capability";
    for (i in info) {
        if (info[i].predicate == nsName) {
            response.name = info[i].object;
        }
        if (info[i].predicate == nsDescription) {
            response.description = info[i].object;
        }
    }
    return response;
}

// Extract the info of a functionality
function infoFunctionality(functionalityUrl) {
    var info = tripleStore.find(functionalityUrl, null, null);
    var response = {};
    response['@id'] = functionalityUrl;
    response['@type'] = 'vocab:Functionality';
    response['@context'] = hostServerPort + "/context/Functionality";
    for (i in info) {
        if (info[i].predicate == nsName) {
            response.name = info[i].object;
        }
        if (info[i].predicate == nsDescription) {
            response.description = info[i].object;
        }
        if (info[i].predicate == nsIsImplementedBy) {
            response.isImplementedBy = {};
            response.isImplementedBy['@id'] = info[i].object;
            response.isImplementedBy['@type'] = 'vocab:Capability';
        }
        if (info[i].predicate == nsIsComposedOf) {
            if (!response.isComposedOf) {
                response.isComposedOf = [];
            }
            var isComposedOfItem = {};
            isComposedOfItem['@id'] = info[i].object;
            isComposedOfItem['@type'] = 'vocab:Functionality';
            response.isComposedOf.push(isComposedOfItem);
        }
    }
    return response;
}

// Info about the composed functionalities
function findComposedFunctionalitiesInfo() {
    // Find functionalities that are composed of the ones we have
    var composedFunctionalities = tripleStore.find(null, nsIsComposedOf, null);
    var composedFunctionalitiesInfo = {};
    for (i in composedFunctionalities) {
        if (!composedFunctionalitiesInfo[((composedFunctionalities[i]).subject)]) {
            composedFunctionalitiesInfo[((composedFunctionalities[i]).subject)] = {"id":((composedFunctionalities[i]).subject),
                                                                                    "isComposedOf":[]};
        }
        composedFunctionalitiesInfo[((composedFunctionalities[i]).subject)].isComposedOf.push(((composedFunctionalities[i]).object));
    }
    // Fill the functionalities that are also composed of other functionalities
    // We use three depth steps (this is obviously not the best way to do it... it should be a reasoner that does this work)
    composedFunctionalitiesInfo = formatComposedFunctionalities(composedFunctionalitiesInfo);
    composedFunctionalitiesInfo = formatComposedFunctionalities(composedFunctionalitiesInfo);
    composedFunctionalitiesInfo = formatComposedFunctionalities(composedFunctionalitiesInfo);
    return composedFunctionalitiesInfo;
}

// Format an array of composed functionalities
function formatComposedFunctionalities(composedFunctionalitiesInfo) {
    for (i in composedFunctionalitiesInfo) {
        for (j in composedFunctionalitiesInfo[i].isComposedOf) {
            for (k in composedFunctionalitiesInfo) {
                if (composedFunctionalitiesInfo[i].isComposedOf[j] == composedFunctionalitiesInfo[k].id) {
                    composedFunctionalitiesInfo[i].isComposedOf[j] = null;
                    composedFunctionalitiesInfo[i].isComposedOf = composedFunctionalitiesInfo[i].isComposedOf.concat(composedFunctionalitiesInfo[k].isComposedOf);
                }
            }
        }
    }
    // Clean the composed functionalities
    for (i in composedFunctionalitiesInfo) {
        for (j in composedFunctionalitiesInfo[i].isComposedOf) {
            if (composedFunctionalitiesInfo[i].isComposedOf[j] == null) {
                composedFunctionalitiesInfo[i].isComposedOf.splice(j, 1);
            }
        }
    }
    return composedFunctionalitiesInfo;
}

// Unique Array
function array_unique(array) {
    var seen = {};
    var out = [];
    var lengthArray = array.length;
    var j = 0;
    for (var i=0; i<lengthArray; i++) {
        var item = array[i];
        if (seen[item]!==1) {
            seen[item] = 1;
            out[j++] = item;
        }
    }
    return out;
}