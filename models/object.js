/**
 * Created by Lionel on 17/11/2015.
 */
var fs = require('fs'),
    Globals = require('./globals');

//Extra common functions (just a cut and paste to make the whole app work)
//TODO refactor and move to the appropriate directories

(function(module) {

    var ConnectedObjects = [];

    module.exports = {
        "loadObjects": function() {
            var dataLocation = __dirname + '/../data/capabilities/objects/';
            var files = fs.readdirSync(dataLocation);
            for (var i in files) {
                if (files[i]!='' && files[i].indexOf('.jsonld')>0) {
                    var dataLocationFile = __dirname + '/../data/capabilities/objects/' + files[i];
                    // Read the JSON-LD file that contains all the information
                    var dataJson = JSON.parse(fs.readFileSync(dataLocationFile, 'utf8'));
                    var capabilities = [];
                    if (dataJson.object && dataJson.object.capabilities) {
                        for (var j=0; i<dataJson.object.capabilities.length; j++) {
                            capabilities.push((dataJson.object.capabilities[j])['@id']);
                        }
                    }
                    var ConnectedObject = {};
                    ConnectedObject['@id'] = Globals.vocabularies.capability + dataJson.id;
                    ConnectedObject['@context'] = Globals.vocabularies.base + '/context/CapabilityObject';
                    ConnectedObject['@type'] = 'vocab:CapabilityObject';
                    ConnectedObject.id = dataJson.id;
                    ConnectedObject.name = dataJson.name;
                    ConnectedObject.description = dataJson.description;
                    ConnectedObject.capabilities = dataJson.capabilities;
                    ConnectedObject.realObjectInfo = dataJson.realObjectInfo;
                    ConnectedObjects.push(ConnectedObject);
                }
            }
        },

        'getAllObjects': function () {
            return ConnectedObjects;
        },

        'findObject': function (objectId) {
            for (var i in ConnectedObjects) {
                if (ConnectedObjects[i]['@id'] == objectId) {
                    return ConnectedObjects[i];
                }
            }
        },

        'findObjectByName': function (nameObject) {
            for (var i in ConnectedObjects) {
                if (ConnectedObjects[i].name == nameObject) {
                    return ConnectedObjects[i];
                }
            }
        },

        'setValueToObject': function (nameObject, nameAttribute, value) {
            var object = this.findObject(nameObject);
            if (object && object.realObjectInfo) {
                object.realObjectInfo[nameAttribute] = value;
            }
        },

        'getValueFromObject': function (nameObject, nameAttribute) {
            var object = this.findObject(nameObject);
            if (object && object.realObjectInfo && object.realObjectInfo[nameAttribute]) {
                return object.realObjectInfo[nameAttribute];
            }
            return null;
        },

        //TODO: move this to code-repository
        'calculateTemperature': function () {
            // Calculate the temperature checking the different objects (Just a test)
            var temperature = 0;
            temperature -= this.getValueFromObject('cooler-swirlwind-2443', 'value') * 1;
            temperature -= this.getValueFromObject('coolerheater-swirlwind-2665', 'valueDecreaser') * 1;
            temperature += this.getValueFromObject('coolerheater-swirlwind-2665', 'valueIncreaser') * 1;
            temperature += this.getValueFromObject('heater-tesco-2336', 'value') * 1;
            this.setValueToObject('sensor-ge-2442', 'temperature', temperature);
            return temperature;
        }
/*        ,


        'objectsToString': function (request, response) {
            var string = '';
            for (var i in ConnectedObjects) {
                string += objectModel.objectToString(ConnectedObjects[i]);
            }
            return '<div class="objects">'
                + string
                +'<div class="clearer"></div>'
                +'</div>';
        },

        'objectsToStringSimple': function () {
            var string = '';
            for (var i in ConnectedObjects) {
                string += objectModel.objectToStringSimple(ConnectedObjects[i]);
            }
            return '<div class="objectsSimple">'
                + string
                +'<div class="clearer"></div>'
                +'</div>';
        },

        'objectToString': function (object) {
            var realObjectInfoHtml = '';
            for (var i in object.realObjectInfo) {
                realObjectInfoHtml += '<div class="objectValue"><strong>'+i+' :</strong> '+object.realObjectInfo[i]+'</div>';
            }
            return '<div class="object">'
                +'<div class="objectIns">'
                +'<div class="objectName">'+object.name+'</div>'
                +'<div class="objectId">'
                +'<a href="'+object['@id']+'">'+object['@id']+'</a>'
                +'</div>'
                +'<div class="objectDescription">'+object.description+'</div>'
                +'<div class="objectValues">'+realObjectInfoHtml+'</div>'
                +'</div>'
                +'</div>';
        },

        'objectToStringSimple': function (object) {
            return '<div class="objectSimple">'
                +'<div class="objectName objectActivate" rel="'+object['@id']+'">'+object.name+'</div>'
                +'</div>';
        },

        //TODO understand and correct that...
        //Seems to be kind of a templating system -> replace with Jade file...
        //Should not be used since the source directory did not exist in the original project structure.
        'parseHtml': function (content) {
            var templateLocationFile = __dirname + '/site/index.html';
            var template = fs.readFileSync(templateLocationFile, 'utf8');
            return template.replace('#CONTENT#', content);
        }
*/
    };
})(module);