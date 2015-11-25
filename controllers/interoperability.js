//This file contains a mock of an interoperability platform that is supposed to provide access to the connected objects

var express = require('express'),
    router = express.Router(),
    fs = require('fs'),
    Globals = require('../models/globals'),
    interoperabilityModel = require('../models/interoperability'),
    capabilityModel = require('../models/capability');


/*---WEB SERVICE---*/

/*-- Entry point management --*/

// Entry point and home page
router.get('/', function(request, response) {
    if (request.accepts('html')) {
        //Send the CIMA homepage
        response.redirect('/interoperability-public');
        //response.render('objects/objects', {objects: interoperabilityModel.getAllObjects()});
        //response.end(interoperabilityModel.objectsToStringSimple());
    } else {
        response.writeHead(200, {"Content-Type": "application/ld+json",
            "Link": Globals.vocabularies.linkVocab});
        var responseEntryPoint = {
            "@context": Globals.vocabularies.interoperability + "context/EntryPoint",
            "@id": Globals.vocabularies.base + "/objects",
            "@type": "EntryPoint",
            "interoperability": Globals.vocabularies.interoperability
        };
        response.end(JSON.stringify(responseEntryPoint));
    }
});

// Sends a collection of objects (basic descriptions)
router.get('/interoperability', function(request, response) {
    var objects = interoperabilityModel.getAllObjects();
    if (request.accepts('html')) {
        response.render('objects/objectsSimple', {objects: objects});
        //response.end(objectModel.objectsToStringSimple());
    } else {
        response.writeHead(200, {
            "Content-Type": "application/ld+json",
            "Link": Globals.vocabularies.linkVocab
        });
        var interoperabilityResponse = {
            '@context': Globals.vocabularies.interoperability + 'context/Collection',
            '@id': Globals.vocabularies.interoperability,
            '@type': 'hydra:Collection',
            objects: []
    };
        for (var i in objects) {
            interoperabilityResponse.objects.push({
                '@context':Globals.vocabularies.interoperability + 'context/CimaObject',
                '@id': objects[i]['@id'],
                '@type': 'vocab:CimaObject',
                'name': objects[i].name
            });
        }

        response.end(JSON.stringify(interoperabilityResponse));
    }
});

// Sends a collection of objects (detailed descriptions)
router.get('/interoperability-list', function(request, response) {
    var objects = interoperabilityModel.getAllObjects();
    if (request.accepts('html')) {
        response.render('objects/objectsSimple', {objects: interoperabilityModel.getAllObjects()});
        //response.end(objectsToStringSimple());
    } else {
        response.writeHead(200, {
            "Content-Type": "application/ld+json",
            "Link": Globals.vocabularies.linkVocab
        });
        var interoperabilityResponse = {
            '@context': Globals.vocabularies.interoperability + 'context/Collection',
            '@id': Globals.vocabularies.interoperability,
            '@type': 'hydra:Collection',
            objects: []
        };
        for (var i in objects) {
            var currentObject = {
                '@context': Globals.vocabularies.interoperability + 'context/CimaObject',
                '@id': objects[i]['@id'],
                '@type': 'vocab:CimaObject',
                'name': objects[i].name,
                'description': objects[i].description,
                'values': []
            };
            for(var j in objects[i].realObjectInfo) {
                currentObject.values.push(objects[i].realObjectInfo[j]);
            }
            interoperabilityResponse.objects.push(currentObject);
        }

        response.end(JSON.stringify(interoperabilityResponse));
    }
});

/*-- List of connected objects management --*/

// Retrieves info about a particular object
router.get('/:objectId', function(request, response) {
    //Search object by name, then by id, then provide an empty object
    var object = interoperabilityModel.getObjectInfos(request.params.objectId) || interoperabilityModel.findObjectById(request.params.objectId) || {realObjectInfo:[]};
    if (request.accepts('html')) {
        response.render('objects/object', {object: object});
    } else {
        response.writeHead(200, {
            "Content-Type": "application/ld+json",
            "Link": Globals.vocabularies.linkVocab}
        );
        var objectResponse = {
            "@context": Globals.vocabularies.interoperability + "context/CimaObject",
            "@id": object['@id'],
            "@type": "vocab:CimaObject",
            "capability": Globals.vocabularies.capability,
            'name': object.name,
            'description': object.description,
            'capabilities': object.capabilities
        };
        if (object.realObjectInfo && object.realObjectInfo.length >0) {
            objectResponse.values = [];
            for(var i in object.realObjectInfo) {
                object.values.push(object.realObjectInfo[i]);
            }
        }
        response.end(JSON.stringify(objectResponse));
    }
});

// Add a new object to the currently connected object list
router.put('/:objectId', function(request, response) {
    if(interoperabilityModel.isConnected(objectId)) {
        response.sendStatus(405);
    } else {
        interoperabilityModel.addObject(objectId);
        response.sendStatus(201);
    }
});

// Add a new object to the currently connected object list
//TODO: do something more if a graph is posted to the object
router.post('/:objectId', function(request, response) {
    if(interoperabilityModel.isConnected(objectId)) {
        response.sendStatus(405);
    } else {
        interoperabilityModel.addObject(objectId);
        response.sendStatus(201);
    }
});

// Remove an object from the currently connected object list
router.delete('/:objectId', function(request, response) {
    if(interoperabilityModel.isConnected(objectId)) {
        interoperabilityModel.removeObject(objectId);
        response.sendStatus(204);
    } else {
        response.sendStatus(405);
    }
});

/*-- Object capability management --*/

//TODO: REFACTOR THAT ASAP!
// GET and PUT operations on the real objects
router.get('/:objectId/:capabilityId', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/ld+json"});
    var object = interoperabilityModel.findObjectById(request.params.objectId);
    var capability = request.params.capability;
    var responseJson = {"@id": Globals.vocabularies.interoperability + request.originalUrl};
    switch (capability) {
        case 'gps':
            responseJson['@context'] = Globals.vocabularies.interoperability + 'context/Position';
            responseJson['@type'] = 'vocab:Position';
            responseJson.latitude = object.getValue('latitude');
            responseJson.longitude = object.getValue('longitude');
            break;
        case 'temperatureSense':
            responseJson['@context'] = Globals.vocabularies.interoperability + 'context/Temperature';
            responseJson['@type'] = 'vocab:Temperature';
            responseJson.value = capabilityModel.calculateTemperature();
            responseJson.type = object.getValue('type');
            break;
        case 'informationMotor':
            responseJson['@context'] = Globals.vocabularies.interoperability + 'context/MotorValue';
            responseJson['@type'] = 'vocab:MotorValue';
            responseJson.angle = object.getValue('angle');
            responseJson.speed = object.getValue('speed');
            responseJson.strength = object.getValue('strength');
            break;
    }
    response.end(JSON.stringify(responseJson));
});

router.put('/:objectId/:capability', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/ld+json"});
    var object = interoperabilityModel.findObjectById(request.params.objectId);
    var capability = request.params.capability;
    var responseJson = {"@id": Globals.vocabularies.interoperability + request.originalUrl};
    switch (capability) {
        case 'temperatureDecrease':
            var newValue = request.body.value;
            responseJson['@context'] = Globals.vocabularies.interoperability + 'context/NumericValue';
            responseJson['@type'] = 'vocab:NumericValue';
            if (request.params.objectId == 'coolerheater-swirlwind-2665') {
                object.setValue('valueDecreaser', newValue);
                responseJson.value = object.getValue('valueDecreaser');
            } else {
                object.setValue('value', newValue);
                responseJson.value = object.getValue('value');
            }
            capabilityModel.calculateTemperature();
            break;
        case 'temperatureIncrease':
            newValue = request.body.value;
            responseJson['@context'] = Globals.vocabularies.interoperability + 'context/NumericValue';
            responseJson['@type'] = 'vocab:NumericValue';
            if (request.params.objectId == 'coolerheater-swirlwind-2665') {
                object.setValue('valueIncreaser', newValue);
                responseJson.value = object.getValue('valueIncreaser');
            } else {
                object.setValue('value', newValue);
                responseJson.value = object.getValue('value');
            }
            capabilityModel.calculateTemperature();
            break;
        case 'closeWindow':
            responseJson['@context'] = Globals.vocabularies.interoperability + 'context/WindowStatus';
            responseJson['@type'] = 'vocab:WindowStatus';
            object.setValue('status', 'closed');
            responseJson.status = object.getValue('status');
            capabilityModel.calculateTemperature();
            break;
        case 'openWindow':
            responseJson['@context'] = Globals.vocabularies.interoperability + 'context/WindowStatus';
            responseJson['@type'] = 'vocab:WindowStatus';
            object.setValue('status', 'open');
            responseJson.status = object.getValue('status');
            capabilityModel.calculateTemperature();
            break;
        case 'call':
        case 'sms':
        case 'video':
        case 'photo':
            responseJson['@context'] = Globals.vocabularies.interoperability + 'context/PhoneStatus';
            responseJson['@type'] = 'vocab:PhoneStatus';
            object.setValue('status', capability);
            responseJson.status = object.getValue('status');
            break;
        case 'startApp':
            responseJson['@context'] = Globals.vocabularies.interoperability + 'context/AppStatus';
            responseJson['@type'] = 'vocab:AppStatus';
            object.setValue('statusApp', 'started');
            responseJson.status = object.getValue('statusApp');
            break;
        case 'stopApp':
            responseJson['@context'] = Globals.vocabularies.interoperability + 'context/AppStatus';
            responseJson['@type'] = 'vocab:AppStatus';
            object.setValue('statusApp', 'stopped');
            responseJson.status = object.getValue('statusApp');
            break;
    }
    response.end(JSON.stringify(responseJson));
});

router.post('/:objectId/:capability', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/ld+json"});
    var object = interoperabilityModel.findObjectById(request.params.objectId);
    var capability = request.params.capability;
    var responseJson = {"@id": Globals.vocabularies.interoperability + request.originalUrl};
    switch (capability) {
        case 'activateMotor':
            var newAngle = request.body.angle;
            var newSpeed = request.body.speed;
            var newStrength = request.body.strength;
            responseJson['@context'] = Globals.vocabularies.interoperability + 'context/MotorValue';
            responseJson['@type'] = 'vocab:MotorValue';
            object.setValue('activated', 'true');
            object.setValue('angle', newAngle);
            object.setValue('speed', newSpeed);
            object.setValue('strength', newStrength);
            responseJson.angle = object.getValue('angle');
            responseJson.speed = object.getValue('speed');
            responseJson.strength = object.getValue('strength');
            break;
    }
    response.end(JSON.stringify(responseJson));
});

/*---HYDRA---*/

// GET the hydra vocabulary
router.get('/vocab', function(request, response) {
    var hydraLocation = __dirname + '/../data/interoperability/hydra.jsonld';
    response.writeHead(200, {"Content-Type": "application/ld+json"});
    fs.readFile(hydraLocation, 'utf8', function (error, data) {
        response.end(data);
    });
    return true;
});

// GET the hydra context
router.get('/context', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/ld+json",
        "Link": Globals.vocabularies.linkVocab});
    response.end("{}");
});

router.get('/context/:context', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/ld+json"});
    var contextLocation = __dirname + '/../data/interoperability/contexts/' + request.params.context + '.jsonld';
    fs.readFile(contextLocation, 'utf8', function (error, data) {
        response.end(data);
    });
    return true;
});

module.exports = router;