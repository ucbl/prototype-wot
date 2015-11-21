/**
 * Created by Lionel on 19/11/2015.
 */

(function(module) {

var fs = require('fs'),
    jsonld = require('jsonld'),
    N3Store = require('n3').Store,
    Globals = require('../models/globals'),
    ontologyHelper = require('../helpers/ontologyHelper');
/*---LOAD ONTOLOGY---*/

var tripleStore = new N3Store();

var ontology = {
    'loadOntology': function() {
        //Separate the context from the data, to be able to use "eval" to replace namespaces by their values
        var jsonOntology = {};
        var dataLocation = __dirname + '/../data/ontology/functionalities/';
        //Eval prefixes in @context
        fs.readFile(dataLocation + 'prefixes.json', 'utf8', function (error, data) {
            if (!error) {
                jsonOntology["@context"] = eval(data);
            } else {
                //TODO: throw an error here
                console.log('Could not read file "prefixes.json" in ' + dataLocation);
            }
        });

        fs.readFile(dataLocation + 'functionalities.jsonld', 'utf8', function (error, data) {
            if (!error) {
                jsonOntology["@graph"] = JSON.parse(data)['@graph'];
                jsonld.toRDF(jsonOntology, function (error, triples) {
                    for (var graphName in triples) {
                        triples[graphName].forEach(function (triple) {
                            tripleStore.addTriple(triple.subject.value, triple.predicate.value, triple.object.value);
                            console.log("Adding: (" + triple.subject.value + "," + triple.predicate.value + "," + triple.object.value + ")");
                        });
                    }
                });
            } else {
                //TODO: throw an error here
                console.log('Could not read file "functionalities.jsonld" in ' + dataLocation);
            }
        });
    },
    'find': function(subject, predicate, object, graph) {
        console.log("1: " + tripleStore.count());
        var res = tripleStore.find(subject, predicate, object, graph);
        console.log("2: " + res.length);
        return res;
    },
    // Extract the info of a capability
    'getCapabilityInfo': function(capabilityUrl) {
        var info = tripleStore.find(capabilityUrl, null, null);
        var response = {};
        response['@id'] = capabilityUrl;
        response['@type'] = 'vocab:Capability';
        response['@context'] = Globals.vocabularies.base + "/context/Capability";
        for (var i in info) {
            if (info[i].predicate == Globals.vocabularies.nsName ) {
                response.name = info[i].object;
            }
            if (info[i].predicate == Globals.vocabularies.nsDescription) {
                response.description = info[i].object;
            }
        }
        return response;
    },
    // Extract the info of a functionality
    'getFunctionalityInfo': function(functionalityUrl) {
        var info = tripleStore.find(functionalityUrl, null, null);
        var response = {};
        response['@id'] = functionalityUrl;
        response['@type'] = 'vocab:Functionality';
        response['@context'] = Globals.vocabularies.base + "/context/Functionality";
        for (var i in info) {
            if (info[i].predicate == Globals.vocabularies.nsName) {
                response.name = info[i].object;
            }
            if (info[i].predicate == Globals.vocabularies.nsDescription) {
                response.description = info[i].object;
            }
            if (info[i].predicate == Globals.vocabularies.isImplementedBy) {
                response.isImplementedBy = {};
                response.isImplementedBy['@id'] = info[i].object;
                response.isImplementedBy['@type'] = 'vocab:Capability';
            }
            if (info[i].predicate == Globals.vocabularies.base.isComposedOf) {
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
    },
    // Info about the composed functionalities
    'findComposedFunctionalities': function() {
        // Find functionalities that are composed of the ones we have
        var composedFunctionalities = tripleStore.find(null, Globals.vocabularies.isComposedOf, null);
        var composedFunctionalitiesInfo = {};
        for (var i in composedFunctionalities) {
            if (!composedFunctionalitiesInfo[((composedFunctionalities[i]).subject)]) {
                composedFunctionalitiesInfo[((composedFunctionalities[i]).subject)] = {"id":((composedFunctionalities[i]).subject),
                    "isComposedOf":[]};
            }
            composedFunctionalitiesInfo[((composedFunctionalities[i]).subject)].isComposedOf.push(((composedFunctionalities[i]).object));
        }
        // Fill the functionalities that are also composed of other functionalities
        // We use three depth steps (this is obviously not the best way to do it... it should be a reasoner that does this work)
        //TODO: add a boolean and loop until nothing is done.
        composedFunctionalitiesInfo = this.getSubFunctionalities(composedFunctionalitiesInfo);
        composedFunctionalitiesInfo = this.getSubFunctionalities(composedFunctionalitiesInfo);
        composedFunctionalitiesInfo = this.getSubFunctionalities(composedFunctionalitiesInfo);
        return composedFunctionalitiesInfo;
    },
    // Format an array of composed functionalities
    'getSubFunctionalities': function(composedFunctionalitiesInfo) {
        for (var i in composedFunctionalitiesInfo) {
            for (var j in composedFunctionalitiesInfo[i].isComposedOf) {
                for (var k in composedFunctionalitiesInfo) {
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
};

    module.exports = ontology;
})(module);