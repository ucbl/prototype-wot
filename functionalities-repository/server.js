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
    var capabilitiesResponse = { "@context": hostServerPort + "/context/Collection",
                                      "@type": "Collection",
                                      "@id": hostServerPort + "/capabilities",
                                      "capabilities" : [] };
    // Read the JSON-LD file that contains all the information
    fs.readFile(dataLocation, 'utf8', function (error, data) {
        if (!error) {
            var tripleStore = new N3Store();
            jsonld.toRDF(JSON.parse(data), function (error, triples) {
                for (var graphName in triples) {
                    triples[graphName].forEach(function (triple) {
                        tripleStore.addTriple(triple.subject.value, triple.predicate.value, triple.object.value);
                    });
                }
                var triplesResponse = tripleStore.find(null, nsType, nsCapability);
                for (i in triplesResponse) {
                    var graphItemEle = {"@id": triplesResponse[i].subject, "@type": "vocab:Capability"};
                    capabilitiesResponse.capabilities.push(graphItemEle);
                }
                response.end(JSON.stringify(capabilitiesResponse));
            });
        } else {
            response.end('');
        }
    });
    return true;
});

// GET the entire list of functionalities
app.get('/functionalities', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/ld+json",
                            "Link": linkVocab});
    var functionalitiesResponse = { "@context": hostServerPort + "/context/Collection",
                                      "@type": "Collection",
                                      "@id": hostServerPort + "/functionalities",
                                      "functionalities" : [] };
    var capabilitiesArray = request.query.capabilities;
    // Read the JSON-LD file that contains all the information
    fs.readFile(dataLocation, 'utf8', function (error, data) {
        if (!error) {
            var tripleStore = new N3Store();
            jsonld.toRDF(JSON.parse(data), function (error, triples) {
                for (var graphName in triples) {
                    triples[graphName].forEach(function (triple) {
                        tripleStore.addTriple(triple.subject.value, triple.predicate.value, triple.object.value);
                    });
                }
                if (capabilitiesArray) {
                    var triplesResponse = [];
                    for (j in capabilitiesArray) {
                        triplesResponse = triplesResponse.concat(tripleStore.find(null, nsIsImplementedBy, capabilitiesArray[j]));
                    }
                } else {
                    var triplesResponse = tripleStore.find(null, nsType, nsFunctionality);
                }
                for (i in triplesResponse) {
                    var graphItemEle = {"@id": triplesResponse[i].subject, "@type": "vocab:Functionality"};
                    functionalitiesResponse.functionalities.push(graphItemEle);
                }
                response.end(JSON.stringify(functionalitiesResponse));
            });
        } else {
            response.end('');
        }
    });
    return true;
});

// GET the information of a functionality
app.get('/functionality', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/ld+json", "Link": linkVocab});
    response.end('');
});
app.get('/functionality/:functionality', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/ld+json", "Link": linkVocab});
    var requestUrl = request.protocol + '://' + request.get('host') + request.originalUrl;
    var functionalityResponse = {"@context": hostServerPort + "/context/Functionality", "@type": "Functionality", "@id": requestUrl};
    fs.readFile(dataLocation, 'utf8', function (error, data) {
        if (!error) {
            var tripleStore = new N3Store();
            jsonld.toRDF(JSON.parse(data), function (error, triples) {
                for (var graphName in triples) {
                    triples[graphName].forEach(function (triple) {
                        tripleStore.addTriple(triple.subject.value, triple.predicate.value, triple.object.value);
                    });
                }
                var functionalityInfo = tripleStore.find(requestUrl, null, null);
                for (i in functionalityInfo) {
                    if (functionalityInfo[i].predicate == nsName) {
                        functionalityResponse.name = functionalityInfo[i].object;
                    }
                    if (functionalityInfo[i].predicate == nsDescription) {
                        functionalityResponse.description = functionalityInfo[i].object;
                    }
                    if (functionalityInfo[i].predicate == nsIsImplementedBy) {
                        functionalityResponse.isImplementedBy = {"@id" : functionalityInfo[i].object, "@type": "vocab:Capability"};
                    }
                    if (functionalityInfo[i].predicate == nsIsComposedOf) {
                        if (!functionalityResponse.isComposedOf) {
                            functionalityResponse.isComposedOf = [];
                        }
                        var isComposedOfItem = {"@id" : functionalityInfo[i].object, "@type": "vocab:Functionality"};
                        functionalityResponse.isComposedOf.push(isComposedOfItem);
                    }
                }
                response.end(JSON.stringify(functionalityResponse));
            });
        } else {
            response.end('');
        }
    });
    return true;
});

// GET the information of a capability
app.get('/capability', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/ld+json", "Link": linkVocab});
    response.end('');
});
app.get('/capability/:capability', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/ld+json", "Link": linkVocab});
    var requestUrl = request.protocol + '://' + request.get('host') + request.originalUrl;
    var capabilityResponse = {"@context": hostServerPort + "/context/Capability", "@type": "Capability", "@id": requestUrl};
    fs.readFile(dataLocation, 'utf8', function (error, data) {
        if (!error) {
            var tripleStore = new N3Store();
            jsonld.toRDF(JSON.parse(data), function (error, triples) {
                for (var graphName in triples) {
                    triples[graphName].forEach(function (triple) {
                        tripleStore.addTriple(triple.subject.value, triple.predicate.value, triple.object.value);
                    });
                }
                var capabilityInfo = tripleStore.find(requestUrl, null, null);
                for (i in capabilityInfo) {
                    if (capabilityInfo[i].predicate == nsName) {
                        capabilityResponse.name = capabilityInfo[i].object;
                    }
                    if (capabilityInfo[i].predicate == nsDescription) {
                        capabilityResponse.description = capabilityInfo[i].object;
                    }
                }
                response.end(JSON.stringify(capabilityResponse));
            });
        } else {
            response.end('');
        }
    });
    return true;
});

// POST a mashup of functionalities
app.post('/mashup', function(request, response, next) {
    var functionalitiesMashup = [];
    var functionalitiesMashupResponse = [];
    for (i in request.body) {
        functionalitiesMashup.push((request.body)[i]);
    }
    fs.readFile(dataLocation, 'utf8', function (error, data) {
        if (!error) {
            var tripleStore = new N3Store();
            jsonld.toRDF(JSON.parse(data), function (error, triples) {
                for (var graphName in triples) {
                    triples[graphName].forEach(function (triple) {
                        tripleStore.addTriple(triple.subject.value, triple.predicate.value, triple.object.value);
                    });
                }
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
                for (i in composedFunctionalitiesInfo) {
                    var functionalitiesFound = 0;
                    for (j in (composedFunctionalitiesInfo[i]).isComposedOf) {
                        if (functionalitiesMashup.indexOf((composedFunctionalitiesInfo[i]).isComposedOf[j]) >= 0) {
                            functionalitiesFound++;
                        }
                    }
                    if (functionalitiesFound == (composedFunctionalitiesInfo[i]).isComposedOf.length) {
                        functionalitiesMashupResponse.push(i);
                    }
                }
                functionalitiesMashupResponse = functionalitiesMashupResponse.concat(functionalitiesMashup);
                response.end(JSON.stringify({"functionalities":functionalitiesMashupResponse}));
            });
        } else {
            response.end('');
        }
    });
    return true;
});

// GET, POST, PUT by default
app.all('/*', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/ld+json",
                            "Link": linkVocab});
    response.end('');
});