/**
 * Created by Lionel on 19/11/2015.
 */
var express = require('express'),
    router = express.Router(),
    fs = require('fs'),
    jsonParser = require('body-parser').json(),
    jsonld = require('jsonld'),
    Globals = require('../models/globals'),
    ontologyModel = require('../models/ontology'),
    ontologyView = require('../views/ontology/composedFunctionalities'),
    jsonldHeaders = require('../middleware/jsonldHeaders');

/*---HYDRA ROUTER---*/

// Entry point
router.get('/', function(request, response, next) {
    request.vocabUri = ontologyModel.getHydraVocabUri();
    jsonldHeaders(request, response, next);
    var responseEntryPoint = {
        "@context": Globals.vocabularies.ontology + "context/EntryPoint",
        "@id": Globals.vocabularies.ontology,
        "@type": "EntryPoint",
        "functionalities": Globals.vocabularies.ontology + "functionalities",
        "capabilities": Globals.vocabularies.ontology + "capabilities"
    };
    response.end(JSON.stringify(responseEntryPoint));
});

// GET hydra vocabularies
/*
router.get('/vocab', function(request, response, next) {
    var vocab = ontologyModel.getHydraVocab("ontology");

    request.vocabUri = ontologyModel.getHydraVocabUri();
    jsonldHeaders(request, response, next);
    response.end(JSON.stringify(vocab));
    return true;
});
*/

router.get('/vocabs/:vocabId', jsonParser, function(request, response, next) {
    //Need to store parameter values in a local variable...
    var vocabId = request.params.vocabId;
    //As adding a property to the request happens to remove its parameters :-(
    request.vocabUri = ontologyModel.getHydraVocabUri();
    jsonldHeaders(request, response, next);
    response.end(JSON.stringify(ontologyModel.getVocab(vocabId)));
    return true;
});

// GET the hydra context
router.get('/context', function(request, response, next) {
    request.vocabUri = ontologyModel.getHydraVocabUri();
    jsonldHeaders(request, response, next);
    response.end('');
});

// GET the hydra contexts
router.get('/context/:context', jsonParser, function(request, response, next) {
    //Need to store parameter values in a local variable...
    var context = request.params.context;
    //As adding a property to the request happens to remove its parameters :-(
    request.vocabUri = ontologyModel.getHydraVocabUri();
    jsonldHeaders(request, response, next);
    response.end(JSON.stringify(ontologyModel.getContext(context)));
    return true;
});

/*---WEB SERVICE---*/

// GET the entire list of capabilities
router.get('/capabilities', function(request, response, next) {
    var capabilitiesResponse = {};
    capabilitiesResponse['@context'] = Globals.vocabularies.ontology + "context/Collection";
    capabilitiesResponse['@type'] = 'Collection';
    capabilitiesResponse['@id'] = Globals.vocabularies.ontology + "capabilities";
    capabilitiesResponse.capabilities = [];

    //TODO: move to models
    var triplesResponse = ontologyModel.find(null, Globals.vocabularies.nsType, Globals.vocabularies.hydraVocab + "Capability");
    for (var i in triplesResponse) {
        // Format the triples and show the response
        var graphItemEle = ontologyModel.getCapabilityInfo(triplesResponse[i].subject);
        capabilitiesResponse.capabilities.push(graphItemEle);
    }

    request.vocabUri = ontologyModel.getHydraVocabUri();
    jsonldHeaders(request, response, next);
    response.end(JSON.stringify(capabilitiesResponse));
});

// GET the entire list of ontologies
router.get('/ontologies', function(request, response, next) {
    var functionalitiesResponse = {};
    functionalitiesResponse['@context'] = Globals.vocabularies.ontology + "context/Collection";
    functionalitiesResponse['@type'] = 'Collection';
    functionalitiesResponse['@id'] = Globals.vocabularies.ontology + "functionalities";
    functionalitiesResponse.functionalities = [];

    //TODO: move to models
    var triplesResponse = ontologyModel.find(null, Globals.vocabularies.nsType, Globals.vocabularies.hydraVocab + "Functionality");
    for (var i in triplesResponse) {
        // Format the triples and show the response
        var graphItemEle = ontologyModel.getFunctionalityInfo(triplesResponse[i].subject);
        functionalitiesResponse.functionalities.push(graphItemEle);
    }

    request.vocabUri = ontologyModel.getHydraVocabUri();
    jsonldHeaders(request, response, next);
    response.end(JSON.stringify(functionalitiesResponse));
});

// Search for ontologies using an array of capabilities
router.get('/ontologies-search', function(request, response, next) {
    var functionalitiesResponse = {};
    functionalitiesResponse['@context'] = Globals.vocabularies.ontology + "context/Collection";
    functionalitiesResponse['@type'] = 'Collection';
    functionalitiesResponse['@id'] = Globals.vocabularies.ontology + "functionalities";
    functionalitiesResponse.functionalities = [];

    //TODO: move to models
    //To test:
    //var capabilitiesArray = ["http://192.168.56.101:3000/ontology/capability/temperatureSense"];
    var capabilitiesArray = request.body.capabilities;
    var triplesResponse = [];
    if (capabilitiesArray && capabilitiesArray.length > 0) {
        for (var j in capabilitiesArray) {
            triplesResponse = triplesResponse.concat(ontologyModel.find(null, Globals.vocabularies.hydraVocab + "isImplementedBy", capabilitiesArray[j]));
        }
    }
    for (var i in triplesResponse) {
        var graphItemEle = ontologyModel.getFunctionalityInfo(triplesResponse[i].subject);
        functionalitiesResponse.functionalities.push(graphItemEle);
    }
    request.vocabUri = ontologyModel.getHydraVocabUri();
    jsonldHeaders(request, response, next);
    response.end(JSON.stringify(functionalitiesResponse));
});

// Search for incomplete ontologies
router.get('/ontologies-incomplete', function(request, response, next) {
    var functionalitiesResponse = {};
    functionalitiesResponse['@context'] = Globals.vocabularies.ontology + "context/Collection";
    functionalitiesResponse['@type'] = 'Collection';
    functionalitiesResponse['@id'] = Globals.vocabularies.ontology + "functionalities";
    functionalitiesResponse.functionalities = [];

    //TODO: move to models
    //To test
    //var functionalitiesArray = ["http://192.168.56.101:3000/ontology/functionality/temperatureSense"];
    var functionalitiesArray = request.body.functionalities || [];
    // Relate the array of the ontologies that we have and search if there are composed ontologies
    var composedFunctionalitiesInfo = ontologyModel.findComposedFunctionalities();
    for (var i in composedFunctionalitiesInfo) {
        for (var j in (composedFunctionalitiesInfo[i]).isComposedOf) {
            if (functionalitiesArray.indexOf((composedFunctionalitiesInfo[i]).isComposedOf[j]) >= 0) {
                functionalitiesResponse.functionalities.push(composedFunctionalitiesInfo[i].id);
            }
        }
    }

    request.vocabUri = ontologyModel.getHydraVocabUri();
    jsonldHeaders(request, response, next);
    response.end(JSON.stringify(functionalitiesResponse));
});

// Search for incomplete ontologies and return all the info of the composed ones
router.get('/ontologies-incomplete-all', function(request, response, next) {
    var functionalitiesResponse = {};
    functionalitiesResponse['@context'] = Globals.vocabularies.ontology + "context/Collection";
    functionalitiesResponse['@type'] = 'Collection';
    functionalitiesResponse['@id'] = Globals.vocabularies.ontology + "functionalities";
    functionalitiesResponse.functionalities = [];

    //TODO: move to models
    //To test:
    //var functionalitiesArray = ["http://192.168.56.101:3000/ontology/functionality/temperatureSense"];
    var functionalitiesArray = request.body.functionalities || [];
    // Relate the array of the ontologies that we have and search if there are composed ontologies
    var composedFunctionalitiesInfo = ontologyModel.findComposedFunctionalities();
    for (var i in composedFunctionalitiesInfo) {
        for (var j in (composedFunctionalitiesInfo[i]).isComposedOf) {
            if (functionalitiesArray.indexOf((composedFunctionalitiesInfo[i]).isComposedOf[j]) >= 0) {
                functionalitiesResponse.functionalities.push(composedFunctionalitiesInfo[i]);
            }
        }
    }

    request.vocabUri = ontologyModel.getHydraVocabUri();
    jsonldHeaders(request, response, next);
    response.end(JSON.stringify(functionalitiesResponse));
});

/** Search for composed ontologies
 * Returns composed ontologies for which all sub-ontologies are in the request body
 */
router.get('/ontologies-composed', function(request, response, next) {
    var functionalitiesResponse = {};
    functionalitiesResponse['@context'] = Globals.vocabularies.ontology + "context/Collection";
    functionalitiesResponse['@type'] = 'Collection';
    functionalitiesResponse['@id'] = Globals.vocabularies.ontology + "functionalities";
    functionalitiesResponse.functionalities = [];

    //TODO: move to models
    //To test:
    //var functionalitiesArray = ["http://192.168.56.101:3000/ontology/functionality/temperatureIncrease","http://192.168.56.101:3000/ontology/functionality/temperatureDecrease","http://192.168.56.101:3000/ontology/functionality/temperatureSense"];
    var functionalitiesArray = request.body.functionalities || [];
    // Relate the array of the ontologies that we have and search if there are composed ontologies
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

    request.vocabUri = ontologyModel.getHydraVocabUri();
    jsonldHeaders(request, response, next);
    response.end(JSON.stringify(functionalitiesResponse));
});

// GET the information of a functionality
router.get('/functionality/:functionality', jsonParser, function(request, response, next) {
    var requestUrl = request.protocol + '://' + request.get('host') + request.originalUrl;
    var functionalityResponse = ontologyModel.getFunctionalityInfo(requestUrl);

    request.vocabUri = ontologyModel.getHydraVocabUri();
    jsonldHeaders(request, response, next);
    response.end(JSON.stringify(functionalityResponse));
});

// GET the composition of a functionality
//TODO: change URL to something like /functionality/:functionality/sub-ontologies
router.get('/functionality-composed-of/:functionality', jsonParser, function(request, response, next) {
    var composedFunctionalitiesInfo = ontologyModel.findComposedFunctionalities();
    var functionalityResponse = {
        '@id': Globals.vocabularies.functionality + request.params.functionality,
        '@type': 'vocab:Functionality',
        '@context': Globals.vocabularies.ontology + "context/Functionality"
    };

    //TODO: move to models
    for (var i in composedFunctionalitiesInfo) {
        if (composedFunctionalitiesInfo[i].id == Globals.vocabularies.functionality + request.params.functionality) {
            functionalityResponse.isComposedOf = composedFunctionalitiesInfo[i].isComposedOf;
        }
    }

    request.vocabUri = ontologyModel.getHydraVocabUri();
    jsonldHeaders(request, response, next);
    response.end(JSON.stringify(functionalityResponse));
});

// GET the information of a capability
router.get('/capability/:capability', jsonParser, function(request, response, next) {
    var requestUrl = request.protocol + '://' + request.get('host') + request.originalUrl;
    var capabilityResponse = ontologyModel.getCapabilityInfo(requestUrl);

    request.vocabUri = ontologyModel.getHydraVocabUri();
    jsonldHeaders(request, response, next);
    response.end(JSON.stringify(capabilityResponse));
});

module.exports = router;