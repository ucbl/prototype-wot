/**
 * Created by Lionel on 22/11/2015.
 * Model for the interoperability layer
 * Maintains 2 lists :
 * - known devices: loaded at init time, each device contains all the necessary information to process the device
 * - connected devices: empty until the addDevice method is called. Only contains references (ids) of the devices
 */
(function(module) {

    var fs = require('fs'),
        Globals = require('./../globals'),
        deviceModel = require('./device'),
        cloneHelper = require('../../helpers/cloneHelper'),
        templateEngine = require("../../helpers/jsonTemplateEngine");

    //local variable to retrieve data stored in files
    var fileLocations = {
        'hydraVocabDir': __dirname + '/../data/interoperability/vocabs/',
        "hydraVocabBaseFile": __dirname + '/../data/interoperability/vocabs/interoperability.jsonld',
        'contextFileDir': __dirname + '/../data/interoperability/contexts/',
        'deviceFileDir': __dirname + '/../data/interoperability/devices/'
    };

    //Stores (at init) all the devices known by the platform, as JSON devices
    var knownDevices = [];

    module.exports = {
        // List of connected devices (only contains their ids)
        "connectedDevices": [],

        //Uri of the interoperability layer vocabulary
        "getHydraVocabUri": function() {
            return Globals.vocabularies.ontology + 'vocabs/interoperability#';
        },

        /**
         * Service model
         */
        // Known devices collections
        "getKnownDevices": function() {
            var result = [];
            for(var i in knownDevices) {
                var device = knownDevices[i];
                result.push(device);
            }
            return result;
        },

        // Connected devices collections
        "getConnectedDevices": function() {
            var result = [];
            for(var i in this.connectedDevices) {
                var device = this.findDeviceById(this.connectedDevices[i]);
                result.push(device);
            }
            return result;
        },

        // Loads all device descriptions and stores them in knownDevices
        "loadDevices": function(params) {
            var files = fs.readdirSync(fileLocations.deviceFileDir);
            if(params && params.verbose) {
                console.log("Device directory: " + fileLocations.deviceFileDir + " -> " + files.length + " files.");
            }
            for (var i in files) {
                if (files[i]!='' && files[i].indexOf('.jsonld')>0) {
                    // Read the JSON-LD file that contains all the information and use the JSON template engine to replace globals
                    fs.readFile(fileLocations.deviceFileDir + files[i], 'utf8', function(error, data) {
                        var deviceData = JSON.parse(templateEngine(data));

                        // Clone DeviceModel's methods and properties into deviceData
                        cloneHelper(deviceModel, deviceData);

                        //Load device capabilities
                        deviceData.initCapabilities(params);

                        // Add it to the list of known devices
                        knownDevices.push(deviceData);

                        //Debug logs
                        if (params && params.verbose) {
                            console.log("New device: " + deviceData['@id'] + " -> " + deviceData.length + " properties.");
                            for (var propName in deviceData) {
                                console.log("property: " + propName + "\t" + deviceData[propName]);
                            }
                        }
                    });
                }
            }
        },

        // Adds an device to the list of connected ones
        // Returns a boolean saying if the device is known and was not previously connected
        "connectDevice": function(deviceId) {
            var device = this.findDeviceById(deviceId);
            if(device && !this.isConnected(deviceId)) {
                for(var i in device.capabilities) {
                    var capability = device.capabilities[i];
                    deviceModel.connectCapability(capability);
                }
                this.connectedDevices.push(deviceId);
                return true;
            }
            return false;
        },

        // Removes an device from the list of connected ones
        // Returns a boolean saying if the device is known and was previously connected
        "disconnectDevice": function(deviceId) {
            var device = this.findDeviceById(deviceId);
            if(device && this.isConnected(deviceId)) {
                //Remove invocation means to the device capabilities
                for(var i in device.capabilities) {
                    var capability = device.capabilities[i];
                    deviceModel.disconnectCapability(capability);
                }

                //Find the device index in this.connectedDevices
                for(var j in this.connectedDevices) {
                    if(this.connectedDevices[j] == deviceId) {
                        //Remove it and shift the rest of the list
                        this.connectedDevices.splice(j,1);
                        return true;
                    }
                }
            }
            return false;
        },

        // Informs if an device is actually connected to the interoperability layer
        "isConnected": function (deviceId) {
            for (var i in this.connectedDevices) {
                if (this.connectedDevices[i] === deviceId) {
                    return true;
                }
            }
            return false;
        },

        // Gets info about a known device by its complete id (URI), even if it is not connected to the interoperability layer
        "getDeviceInfos": function (deviceId) {
            for (var i in knownDevices) {
                var tempDevice = knownDevices[i];
                if (tempDevice['@id'] == deviceId) {
                    return tempDevice;
                }
            }
            return null;
        },

        // Finds an device by the last part of its id (supposed to be only one)
        'findDeviceById': function (deviceWeakId) {
            for (var i in knownDevices) {
                if (knownDevices[i].id == deviceWeakId) {
                    return knownDevices[i];
                }
            }
            return null;
        },

        // Retrieves all devices with a given name
        'findDevicesByName': function (nameDevice) {
            var results = [];
            for (var i in knownDevices) {
                if (knownDevices[i].name == nameDevice) {
                    results.push(knownDevices[i]);
                }
            }
            return results;
        },

        /**
         * Hydra description model
         */

        //Returns the Hydra vocabulary corresponding to a particular object or defaults to the interoperability platform vocab
        "getHydraVocabulary": function(fileName)  {
            return templateEngine(fs.readFileSync(fileName ? fileLocations.hydraVocabDir + fileName + ".jsonld" : fileLocations.hydraVocabBaseFile, 'utf8'));
        },

        //Returns the context corresponding to a given id or throws an error
        'getContext': function(contextId) {
            return templateEngine(fs.readFileSync(fileLocations.contextFileDir + contextId + '.jsonld', 'utf8'));
        }
    };
})(module);