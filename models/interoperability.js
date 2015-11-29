/**
 * Created by Lionel on 22/11/2015.
 * Model for the interoperability layer
 * Maintains 2 lists :
 * - known objects: loaded at init time, each object contains all the necessary information to process the object
 * - connected objects: empty until the addObject method is called. Only contains references (ids) of the objects
 */
(function(module) {

    var fs = require('fs'),
        Globals = require('./globals'),
        objectModel = require('./object'),
        cloneHelper = require('../helpers/cloneHelper'),
        templateEngine = require("../helpers/jsonTemplateEngine");

    //local variable to retrieve data stored in files
    var fileLocations = {
        'hydraVocabFile': __dirname + '/../data/interoperability/hydra.jsonld',
        'contextFileDir': __dirname + '/../data/interoperability/contexts/',
        'objectFileDir': __dirname + '/../data/interoperability/objects/'
    };

    //Stores (at init) all the objects known by the platform, as JSON objects
    var knownObjects = [];

    module.exports = {
        // List of connected interoperability (only contains their ids)
        "objects": [],

        /**Hydra descriptions**/
        // Entrypoint
        "entryPoint": {
            "@context": Globals.vocabularies.interoperability + "context/EntryPoint",
            "@type": "hydra:EntryPoint",
            "@id": Globals.vocabularies.base + "/interoperability",
            "object": Globals.vocabularies.interoperability + "object"
        },

        // Interoperability platform
        "platform": function() {
            return {
                '@context': Globals.vocabularies.interoperability + 'context/Class',
                '@type': 'hydra:Class',
                '@id': Globals.vocabularies.interoperability + "platform",
                'description': "Access to the available object collections",
                'objects': Globals.vocabularies.interoperability + "platform/objects",
                'connected-objects': Globals.vocabularies.interoperability + "platform/connected-objects"
            };
        },

        // Known objects collection
        "getKnownObjectCollection": function() {
            var result = {
                '@context': Globals.vocabularies.interoperability + 'context/Collection',
                '@type': 'hydra:Collection',
                '@id': Globals.vocabularies.interoperability + "platform/objects",
                'objects': []
            };
            for(var i in knownObjects) {
                result.objects.push(knownObjects[i]);
            }
            return result;
        },

        // Connected objects collection
        "getConnectedObjectCollection": function() {
            var result = {
                '@context': Globals.vocabularies.interoperability + 'context/Collection',
                '@type': 'hydra:Collection',
                '@id': Globals.vocabularies.interoperability + "platform/connected-objectz",
                'objects': []
            };
            for(var i in this.objects) {
                result.objects.push(knownObjects[i]);
            }
            return result;
        },

        // Loads all object descriptions and stores them in knownObjects
        "loadObjects": function(params) {
            var files = fs.readdirSync(fileLocations.objectFileDir);
            if(params && params.verbose) {
                console.log("Object directory: " + fileLocations.objectFileDir + " -> " + files.length + " files.");
            }
            for (var i in files) {
                if (files[i]!='' && files[i].indexOf('.jsonld')>0) {
                    // Read the JSON-LD file that contains all the information and use the JSON template engine to replace globals
                    fs.readFile(fileLocations.objectFileDir + files[i], 'utf8', function(error, data) {
                        var objectData = JSON.parse(templateEngine(data));

                        // Clone ObjectModel's methods and properties into objectData
                        cloneHelper(objectModel, objectData);
                        // Add it to the list of known objects
                        knownObjects.push(objectData);

                        //Debug logs
                        if (params && params.verbose) {
                            console.log("New object: " + objectData['@id'] + " -> " + objectData.length + " properties.");
                            for (var propName in objectData) {
                                console.log("property: " + propName + "\t" + objectData[propName]);
                            }
                        }
                    });
                }
            }
        },

        // Adds an object to the list of connected ones
        // Returns a boolean saying if the object is known and was not previously connected
        'addObject': function(objectId) {
            if(this.findObjectById(objectId) && !this.isConnected(objectId)) {
                this.objects.push(objectId);
                return true;
            }
            return false;
        },

        // Removes an object from the list of connected ones
        // Returns a boolean saying if the object is known and was previously connected
        'removeObject': function(objectId) {
            if(this.findObjectById(objectId) && this.isConnected(objectId)) {
                this.objects.remove(objectId);
                return true;
            }
            return false;
        },

        // Returns the list of actually connected objects
        'getAllObjects': function () {
            var results = [];
            for(var id in this.objects) {
                results.push(this.getObjectInfos(this.objects[id]));
            }
            return results;
        },

        // Informs if an object is actually connected to the interoperability layer
        "isConnected": function (objectId) {
            for (var i in this.objects) {
                if (this.objects[i] === objectId) {
                    return true;
                }
            }
            return false;
        },

        // Gets info about a known object by its complete id (URI), even if it is not connected to the interoperability layer
        "getObjectInfos": function (objectId) {
            for (var i in knownObjects) {
                var tempObject = knownObjects[i];
                if (tempObject['@id'] == objectId) {
                    return tempObject;
                }
            }
            return null;
        },

        // Finds an object by the last part of its id (supposed to be only one)
        'findObjectById': function (objectWeakId) {
            for (var i in knownObjects) {
                if (knownObjects[i].id == objectWeakId) {
                    return knownObjects[i];
                }
            }
            return null;
        },

        // Retrieves all objects with a given name
        'findObjectsByName': function (nameObject) {
            var results = [];
            for (var i in knownObjects) {
                if (knownObjects[i].name == nameObject) {
                    results.push(knownObjects[i]);
                }
            }
            return results;
        },

        /**
         * Hydra description model
         */
        "getHydraVocabulary": function()  {
            return templateEngine(fs.readFileSync(fileLocations.hydraVocabFile, 'utf8'));
        },

        'getHydraContext': function(contextId) {
            try {
                return templateEngine(fs.readFileSync(fileLocations.contextFileDir + contextId + '.jsonld', 'utf8'));
            } catch (error) {
                return null;
            }
        }
    };
})(module);