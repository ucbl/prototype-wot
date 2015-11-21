/**
 * Created by Lionel on 19/11/2015.
 */
var express = require('express'),
    router = express.Router(),
    fs = require('fs'),
    jsonld = require('jsonld'),
    Globals = require('../models/globals'),
    ontologyModel = require('../models/ontology'),
    ontologyView = require('../view/ontologyHelper');

/*---LOAD ONTOLOGY---*/
ontologyModel.loadOntology();

/*---HYDRA ROUTER---*/

// Entry point
router.get('/', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/ld+json",
        "Link": Globals.vocabularies.linkVocab});
    var responseEntryPoint = {
        "@context": Globals.vocabularies.base + "/context/EntryPoint",
        "@id": Globals.vocabularies.base + "/ontology/",
        "@type": "EntryPoint",
        "functionalities": Globals.vocabularies.functionality,
        "capabilities": Globals.vocabularies.capability
    };
    response.end(JSON.stringify(responseEntryPoint));
});

// GET the hydra vocabulary
router.get('/vocab', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/ld+json"});
    var hydraLocation = __dirname + '/../data/ontology/hydra.jsonld';
    fs.readFile(hydraLocation, 'utf8', function (error, data) {
        response.end(data);
    });
    return true;
});

// GET the hydra context
router.get('/context', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/ld+json",
        "Link": Globals.vocabularies.linkVocab});
    response.end('');
});
router.get('/context/:context', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/ld+json"});
    var contextLocation = __dirname + '/../data/ontology/contexts/' + request.params.context + '.jsonld';
    fs.readFile(contextLocation, 'utf8', function (error, data) {
        response.end(data);
    });
    return true;
});

/*---WEB SERVICE---*/

// GET the entire list of capabilities
router.get('/capabilities', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/ld+json",
        "Link": Globals.vocabularies.linkVocab});
    var capabilitiesResponse = {};
    capabilitiesResponse['@context'] = Globals.vocabularies.base + "/context/Collection";
    capabilitiesResponse['@type'] = 'Collection';
    capabilitiesResponse['@id'] = Globals.vocabularies.base + "/capabilities";
    capabilitiesResponse.capabilities = [];

    //TODO: move to models
    var triplesResponse = ontologyModel.find(null, Globals.vocabularies.nsType, Globals.vocabularies.capability);
    for (var i in triplesResponse) {
        // Format the triples and show the response
        var graphItemEle = ontologyModel.getCapabilityInfo(triplesResponse[i].subject);
        capabilitiesResponse.capabilities.push(graphItemEle);
    }
    response.end(JSON.stringify(capabilitiesResponse));
});

// GET the entire list of functionalities
router.get('/functionalities', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/ld+json",
        "Link": Globals.vocabularies.linkVocab});
    var functionalitiesResponse = {};
    functionalitiesResponse['@context'] = Globals.vocabularies.base + "/context/Collection";
    functionalitiesResponse['@type'] = 'Collection';
    functionalitiesResponse['@id'] = Globals.vocabularies.base + "/functionalities";
    functionalitiesResponse.functionalities = [];

    //TODO: move to models
    var triplesResponse = ontologyModel.find(null, Globals.vocabularies.nsType, Globals.vocabularies.functionality);
    for (var i in triplesResponse) {
        // Format the triples and show the response
        var graphItemEle = ontologyModel.getFunctionalityInfo(triplesResponse[i].subject);
        functionalitiesResponse.functionalities.push(graphItemEle);
    }
    response.end(JSON.stringify(functionalitiesResponse));
});

// Search for functionalities using an array of capabilities
router.get('/functionalities-search', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/ld+json",
        "Link": Globals.vocabularies.linkVocab});
    var functionalitiesResponse = {};
    functionalitiesResponse['@context'] = Globals.vocabularies.base + "/context/Collection";
    functionalitiesResponse['@type'] = 'Collection';
    functionalitiesResponse['@id'] = Globals.vocabularies.base + "/functionalities";
    functionalitiesResponse.functionalities = [];

    //TODO: move to models
    var capabilitiesArray = request.body.capabilities;
    var triplesResponse = [];
    if (capabilitiesArray && capabilitiesArray.length > 0) {
        for (var j in capabilitiesArray) {
            triplesResponse = triplesResponse.concat(ontologyModel.find(null, Globals.vocabularies.isImplementedBy, capabilitiesArray[j]));
        }
    }
    for (var i in triplesResponse) {
        var graphItemEle = ontologyModel.getFunctionalityInfo(triplesResponse[i].subject);
        functionalitiesResponse.functionalities.push(graphItemEle);
    }
    response.end(JSON.stringify(functionalitiesResponse));
});

// Search for incomplete functionalities
router.get('/functionalities-incomplete', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/ld+json",
        "Link": Globals.vocabularies.linkVocab});
    var functionalitiesResponse = {};
    functionalitiesResponse['@context'] = Globals.vocabularies.base + "/context/Collection";
    functionalitiesResponse['@type'] = 'Collection';
    functionalitiesResponse['@id'] = Globals.vocabularies.base + "/functionalities";
    functionalitiesResponse.functionalities = [];

    //TODO: move to models
    var functionalitiesArray = request.body.functionalities;
    // Relate the array of the functionalities that we have and search if there are composed functionalities
    var composedFunctionalitiesInfo = ontologyModel.findComposedFunctionalities();
    for (var i in composedFunctionalitiesInfo) {
        for (var j in (composedFunctionalitiesInfo[i]).isComposedOf) {
            if (functionalitiesArray.indexOf((composedFunctionalitiesInfo[i]).isComposedOf[j]) >= 0) {
                functionalitiesResponse.functionalities.push(composedFunctionalitiesInfo[i].id);
            }
        }
    }
    response.end(JSON.stringify(functionalitiesResponse));
});

// Search for incomplete functionalities and return all the info of the composed ones
router.get('/functionalities-incomplete-all', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/ld+json",
        "Link": Globals.vocabularies.linkVocab});
    var functionalitiesResponse = {};
    functionalitiesResponse['@context'] = Globals.vocabularies.base + "/context/Collection";
    functionalitiesResponse['@type'] = 'Collection';
    functionalitiesResponse['@id'] = Globals.vocabularies.base + "/functionalities";
    functionalitiesResponse.functionalities = [];

    //TODO: move to models
    var functionalitiesArray = request.body.functionalities;
    // Relate the array of the functionalities that we have and search if there are composed functionalities
    var composedFunctionalitiesInfo = ontologyModel.findComposedFunctionalities();
    for (var i in composedFunctionalitiesInfo) {
        for (var j in (composedFunctionalitiesInfo[i]).isComposedOf) {
            if (functionalitiesArray.indexOf((composedFunctionalitiesInfo[i]).isComposedOf[j]) >= 0) {
                functionalitiesResponse.functionalities.push(composedFunctionalitiesInfo[i]);
            }
        }
    }
    response.end(JSON.stringify(functionalitiesResponse));
});

// Search for composed functionalities
router.get('/functionalities-composed', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/ld+json",
        "Link": Globals.vocabularies.linkVocab});
    var functionalitiesResponse = {};
    functionalitiesResponse['@context'] = Globals.vocabularies.base + "/context/Collection";
    functionalitiesResponse['@type'] = 'Collection';
    functionalitiesResponse['@id'] = Globals.vocabularies.base + "/functionalities";
    functionalitiesResponse.functionalities = [];

    //TODO: move to models
    var functionalitiesArray = request.body.functionalities;
    // Relate the array of the functionalities that we have and search if there are composed functionalities
    var composedFunctionalitiesInfo = ontologyModel.findComposedFunctionalities();
    for (var i in composedFunctionalitiesInfo) {
        var functionalitiesFound = 0;
        for (var j in (composedFunctionalitiesInfo[i]).isComposedOf) {
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
router.get('/functionality/:functionality', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/ld+json", "Link": Globals.vocabularies.linkVocab});
    var requestUrl = request.protocol + '://' + request.get('host') + request.originalUrl;
    var functionalityResponse = ontologyModel.getFunctionalityInfo(requestUrl);
    response.end(JSON.stringify(functionalityResponse));
});

// GET the composition of a functionality
router.get('/functionality-composed-of/:functionality', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/ld+json", "Link": Globals.vocabularies.linkVocab});
    var composedFunctionalitiesInfo = ontologyModel.findComposedFunctionalities();
    var functionalityResponse = {};

    //TODO: move to models
    for (var i in composedFunctionalitiesInfo) {
        if (composedFunctionalitiesInfo[i].id == Globals.vocabularies.functionality + request.params.functionality) {
            functionalityResponse = composedFunctionalitiesInfo[i];
        }
    }
    response.end(JSON.stringify(functionalityResponse));
});

// GET the information of a capability
router.get('/capability/:capability', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/ld+json", "Link": Globals.vocabularies.linkVocab});
    var requestUrl = request.protocol + '://' + request.get('host') + request.originalUrl;
    var capabilityResponse = ontologyModel.getCapabilityInfo(requestUrl);
    response.end(JSON.stringify(capabilityResponse));
});

/*
// GET, POST, PUT by default
router.all('/*', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/ld+json",
        "Link": Globals.vocabularies.linkVocab});
    response.end('');
});
*/