/**
 * Created by Lionel on 22/11/2015.
 * Model for the interoperability layer
 */
(function(module) {

    var fs = require('fs'),
        Globals = require('./globals'),
        objectModel = require('./object'),
        cloneHelper = require('../helpers/cloneHelper');

    var knownObjects = [];

    module.exports = {
        // List of connected interoperability (only contains their ids)
        "objects": [],

        /**Hydra descriptions**/
        //Entrypoint
        "entryPoint": {
            "@context": Globals.vocabularies.interoperability + "context/EntryPoint",
            "@type": "hydra:EntryPoint",
            "@id": Globals.vocabularies.base + "/interoperability",
            "object": Globals.vocabularies.interoperability + "object"
        },

        //Interoperability collection
        "getPlatform": function() {
            var result = {
                '@context': Globals.vocabularies.interoperability + 'context/Collection',
                '@type': 'hydra:Collection',
                '@id': Globals.vocabularies.interoperability + "platform",
                'objects': []
            };
            for(var i in knownObjects) {
                result.objects.push(knownObjects[i]);
            }
            return result;
        },

        //Interoperability collection
        "getPlatform": function() {
            var result = {
                '@context': Globals.vocabularies.interoperability + 'context/Collection',
                '@type': 'hydra:Collection',
                '@id': Globals.vocabularies.interoperability + "platform",
                'objects': []
            };
            for(var i in knownObjects) {
                result.objects.push(knownObjects[i]);
            }
            return result;
        },

        //Interoperability collection
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

        //Interoperability collection
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

        // Loads all object descriptions and stores them in a list of known interoperability
        "loadObjects": function(params) {
            var dataLocation = __dirname + '/../data/interoperability/objects/';
            var files = fs.readdirSync(dataLocation);
            if(params && params.verbose) {
                console.log("dataLocation: " + dataLocation + " -> " + files.length + " files.");
            }
            for (var i in files) {
                if (files[i]!='' && files[i].indexOf('.jsonld')>0) {
                    var dataJson = {};
                    // Read the JSON-LD file that contains all the information
                    eval('dataJson = ' + fs.readFileSync(dataLocation + files[i], 'utf8') + ';');

                    cloneHelper(objectModel, dataJson);
                    //this.objects.push(dataJson['@id']);
                    knownObjects.push(dataJson);

                    //Debug logs
                    if(params && params.verbose) {
                        console.log("New object: " + dataJson['@id'] + " -> " + dataJson.length + " properties.");
                        for(var propName in dataJson) {
                            console.log("property: " + propName + "\t" + dataJson[propName]);
                        }
                    }
                }
            }
        },

        // Adds an object to the list of connected ones
        'addObject': function(objectId) {
            this.objects.push(objectId);
        },

        // Removes an object from the list of connected ones
        'removeObject': function(objectId) {
            this.objects.remove(objectId);
        },

        // Returns the list of actually connected interoperability
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

        // Retrieves all interoperability with a given name
        'findObjectsByName': function (nameObject) {
            var results = [];
            for (var i in knownObjects) {
                if (knownObjects[i].name == nameObject) {
                    results.push(knownObjects[i]);
                }
            }
            return results;
        }
    };
})(module);