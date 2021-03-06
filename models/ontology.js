/**
 * Created by Lionel on 19/11/2015.
 */

(function(module) {

    var fs = require('fs'),
        jsonld = require('jsonld'),
        N3Store = require('n3').Store,
        Globals = require('../models/globals'),
        ontologyHelper = require('../helpers/ontologyHelper'),
        templateEngine = require("../helpers/jsonTemplateEngine");

    /*---LOAD ONTOLOGY---*/

    var tripleStore = new N3Store();

    //Store the entire ontology
    var asawooOntology = {};

    var ontology = {
        'loadOntology': function(params) {
            //Separate the context from the data, to be able to replace namespaces by their values
            asawooOntology = {
                "@context": templateEngine(require("../data/ontology/ontologies/prefixes.js")['@context'])
            };

            var dataLocation = __dirname + '/../data/ontology/ontologies/functionalities.jsonld';
            fs.readFile(dataLocation, 'utf8', function (error, data) {
                if (!error) {
                    asawooOntology["@graph"] = templateEngine(JSON.parse(data)['@graph']);
                    jsonld.toRDF(asawooOntology, function (error, triples) {
                        for (var graphName in triples) {
                            triples[graphName].forEach(function (triple) {
                                tripleStore.addTriple(triple.subject.value, triple.predicate.value, triple.object.value);
                                if(params && params.verbose) {
                                    console.log("Adding: (" + triple.subject.value + "," + triple.predicate.value + "," + triple.object.value + ")");
                                }
                            });
                        }
                    });
                } else {
                    //TODO: throw an error here
                    console.log('Could not read file "ontologies.jsonld" in ' + dataLocation);
                }
            });
        },

        //Return the entire ontology
        "getOntology": function() {
            return asawooOntology;
        },

        //Uri of the ontology vocabulary
        "getHydraVocabUri": function() {
            return Globals.vocabularies.ontology + 'vocab#';
        },

        //Returns the vocabulary corresponding to a particular object
        "getHydraVocab": function(contextName)  {
            return  templateEngine(JSON.parse(fs.readFileSync(__dirname + '/../data/ontology/vocabs/' + contextName + '.jsonld')));
        },

        //Returns the context corresponding to a particular object
        "getContext": function(contextName)  {
            return  templateEngine(JSON.parse(fs.readFileSync(__dirname + '/../data/ontology/contexts/' + contextName + '.jsonld')));
        },

        'find': function(subject, predicate, object, graph) {
            var res = tripleStore.find(subject, predicate, object, graph);
            console.log("tripleStore.find: " + res.length + " result(s).");
            return templateEngine(res);
        },

        // Extract the info of a capability
        'getCapabilityInfo': function(capabilityUrl) {
            var info = tripleStore.find(capabilityUrl, null, null);
            var response = {};
            response['@id'] = capabilityUrl;
            response['@type'] = 'vocab:Capability';
            response['@context'] = Globals.vocabularies.ontology + "context/Capability";
            for (var i in info) {
                if (info[i].predicate == Globals.vocabularies.nsName ) {
                    response.name = info[i].object;
                }
                if (info[i].predicate == Globals.vocabularies.nsDescription) {
                    response.description = info[i].object;
                }
            }
            return templateEngine(response);
        },

        // Extract the info of a functionality
        'getFunctionalityInfo': function(functionalityUrl) {
            var info = tripleStore.find(functionalityUrl, null, null);
            var response = {};
            response['@id'] = functionalityUrl;
            response['@type'] = 'vocab:Functionality';
            response['@context'] = Globals.vocabularies.ontology + "context/Functionality";
            for (var i in info) {
                if (info[i].predicate == Globals.vocabularies.nsName) {
                    response.name = info[i].object;
                }
                if (info[i].predicate == Globals.vocabularies.nsDescription) {
                    response.description = info[i].object;
                }
                if (info[i].predicate == Globals.vocabularies.hydraVocab + "isImplementedBy") {
                    response.isImplementedBy = {};
                    response.isImplementedBy['@id'] = info[i].object;
                    response.isImplementedBy['@type'] = 'vocab:Capability';
                }
                if (info[i].predicate == Globals.vocabularies.base.hydraVocab + "isComposedOf") {
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

        // Info about the composed ontologies
        'findComposedFunctionalities': function() {
            // Find ontologies that are composed of the ones we have
            var composedFunctionalities = tripleStore.find(null, Globals.vocabularies.hydraVocab + "isComposedOf", null);
            var composedFunctionalitiesInfo = {};
            for (var i in composedFunctionalities) {
                if (!composedFunctionalitiesInfo[((composedFunctionalities[i]).subject)]) {
                    composedFunctionalitiesInfo[((composedFunctionalities[i]).subject)] = {
                        "id":((composedFunctionalities[i]).subject),
                        "isComposedOf":[]
                    };
                }
                composedFunctionalitiesInfo[((composedFunctionalities[i]).subject)].isComposedOf.push(((composedFunctionalities[i]).object));
            }
            // Fill the ontologies that are also composed of other ontologies
            // We use three depth steps (this is obviously not the best way to do it... it should be a reasoner that does this work)
            //TODO: add a boolean and loop until nothing is done.
            composedFunctionalitiesInfo = this.getSubFunctionalities(composedFunctionalitiesInfo);
            composedFunctionalitiesInfo = this.getSubFunctionalities(composedFunctionalitiesInfo);
            composedFunctionalitiesInfo = this.getSubFunctionalities(composedFunctionalitiesInfo);
            return composedFunctionalitiesInfo;
        },

        // Format an array of composed ontologies
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
            // Clean the composed ontologies
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