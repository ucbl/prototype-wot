/**
 * Created by Lionel on 22/11/2015.
 * Model for the interoperability layer
 */
(function(module) {

    var fs = require('fs'),
        Globals = require('./globals'),
        objectModel = require('../models/object');

    var knownObjects = [];

    module.exports = {
        // List of connected objects (only contains their ids)
        "objects": [],

        // Loads all object descriptions and stores them in a list of known objects
        "loadObjects": function(params) {
            var dataLocation = __dirname + '/../data/interoperability/objects/';
            var files = fs.readdirSync(dataLocation);
            if(params && params.verbose) {
                console.log(dataLocation + " -> " + files.length + " files.");
            }
            for (var i in files) {
                if (files[i]!='' && files[i].indexOf('.jsonld')>0) {
                    // Read the JSON-LD file that contains all the information
                    var dataJson = JSON.parse(fs.readFileSync(dataLocation + files[i], 'utf8'));
                    if(params && params.verbose) {
                        console.log("Adding object: " + dataJson.id);
                    }
                    var capabilities = [];
                    if (dataJson.object && dataJson.object.capabilities) {
                        for (var j=0; i<dataJson.object.capabilities.length; j++) {
                            capabilities.push((dataJson.object.capabilities[j])['@id']);
                        }
                    }
                    var tempObject = {
                        '@id': Globals.vocabularies.capability + dataJson.id,
                        '@context': Globals.vocabularies.interoperability + 'context/CimaObject',
                        '@type': 'vocab:CimaObject',
                        'id': dataJson.id,
                        'name': dataJson.name,
                        'description': dataJson.description,
                        'capabilities': dataJson.capabilities,
                        'realObjectInfo': dataJson.realObjectInfo
                    };
                    tempObject.prototype = new(objectModel);
                    this.objects.push(tempObject['@id']);
                    knownObjects.push(tempObject);
                    if(params && params.verbose) {
                        console.log("New object: " + tempObject['@id'] + " -> " + tempObject.length + " properties.");
                        for(var propName in tempObject) {
                            console.log("property: " + propName);
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

        // Returns the list of actually connected objects
        'getAllObjects': function () {
            var results = [];
            for(var id in this.objects) {
                results.push(this.getObjectInfos(id));
            }
            console.log(results.length + " -> " + results[0]);
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
                if (knownObjects[i]['@id'] == objectId) {
                    return knownObjects[i];
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
        }
    };
})(module);