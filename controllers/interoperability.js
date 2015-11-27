//This file contains a mock of an interoperability platform that is supposed to provide access to the connected objects

var express = require('express'),
    router = express.Router(),
    fs = require('fs'),
    Globals = require('../models/globals'),
    interoperabilityModel = require('../models/interoperability'),
    capabilityModel = require('../models/capability'),
    jsonldHeaders = require('../middleware/jsonldHeaders');

/*---WEB SERVICE---*/

/*-- Entry point management --*/

// Entry point and home page
router.get('/', function(request, response, next) {
    if (request.accepts('html')) {
        //Send the interoperability platform homepage
        response.redirect('/interoperability-public');
    } else {
        jsonldHeaders(request, response, next);
        response.end(JSON.stringify(interoperabilityModel.entryPoint));
    }
});

// Sends the collection of known objects
router.get('/platform', function(request, response, next) {
    var platform = interoperabilityModel.getKnownObjectCollection();
    if (request.accepts('html')) {
        response.render('interoperability/platform', {platform: platform});
    } else {
        jsonldHeaders(request, response, next);
        response.end(JSON.stringify((require("../views/objectsSimple")(platform))));
    }
});

// Sends a collection of interoperability (detailed descriptions)
router.get('/platform/objects', function(request, response, next) {
    var platform = interoperabilityModel.getKnownObjectCollection();
    if (request.accepts('html')) {
        response.render('interoperability/objectsSimple', {objects: platform.objects});
    } else {
        jsonldHeaders(request, response, next);
        response.end(JSON.stringify((require("../views/objectsSimple")(platform))));
    }
});

// Sends a collection of interoperability (detailed descriptions)
router.get('/platform/connected-objects', function(request, response, next) {
    var platform = interoperabilityModel.getConnectedObjectCollection();
    if (request.accepts('html')) {
        response.render('interoperability/objectsSimple', {objects: platform.objects});
    } else {
        jsonldHeaders(request, response, next);
        response.end(JSON.stringify((require("../views/objectsSimple")(platform))));
    }
});

// Retrieves info about a particular object
router.get('/object/:objectId', function(request, response, next) {
    //Search object by name, then by id, then provide an empty object
    var object = interoperabilityModel.getObjectInfos(request.params.objectId) || interoperabilityModel.findObjectById(request.params.objectId) || {realObjectInfo:[]};
    if (request.accepts('html')) {
        response.render('interoperability/object', {object: object});
    } else {
        jsonldHeaders(request, response, next);
        response.end(JSON.stringify(object));
    }
});

// Add a new object to the currently connected object list
router.put('/object/:objectId', function(request, response) {
    if(interoperabilityModel.isConnected(request.params.objectId)) {
        response.sendStatus(405);
    } else {
        interoperabilityModel.addObject(request.params.objectId);
        response.sendStatus(201);
    }
});

// Add a new object to the currently connected object list
//TODO: do something more if a graph is posted to the object
router.post('/object/:objectId', function(request, response) {
    if(interoperabilityModel.isConnected(request.params.objectId)) {
        response.sendStatus(405);
    } else {
        interoperabilityModel.addObject(request.params.objectId);
        response.sendStatus(201);
    }
});

// Remove an object from the currently connected object list
router.delete('/object/:objectId', function(request, response) {
    if(interoperabilityModel.isConnected(request.params.objectId)) {
        interoperabilityModel.removeObject(request.params.objectId);
        response.sendStatus(204);
    } else {
        response.sendStatus(405);
    }
});

/*-- Object capability management --*/

//TODO: REFACTOR THAT ASAP!
// GET and PUT operations on the real interoperability
router.get('/object/:objectId/:capabilityId', function(request, response, next) {
    var object = interoperabilityModel.findObjectById(request.params.objectId);
    var capability = request.params.capabilityId;
    var responseJson = {"@id": Globals.vocabularies.interoperability + request.params["objectId"] + '/' + capability};
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
    jsonldHeaders(request, response, next);
    response.end(JSON.stringify(responseJson));
});

router.put('/object/:objectId/:capability', function(request, response, next) {
    jsonldHeaders(request, response, next);
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

router.post('/object/:objectId/:capability', function(request, response, next) {
    jsonldHeaders(request, response, next);
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
router.get('/vocab', function(request, response, next) {
    jsonldHeaders(request, response, next);
    var hydraLocation = __dirname + '/../data/interoperability/hydra.jsonld';
    fs.readFile(hydraLocation, 'utf8', function (error, data) {
        response.end(data);
    });
});

// GET the hydra context
router.get('/context', function(request, response, next) {
    jsonldHeaders(request, response, next);
    response.end("{}");
});

router.get('/context/:context', function(request, response, next) {
    jsonldHeaders(request, response, next);
    var contextLocation = __dirname + '/../data/interoperability/contexts/' + request.params.context + '.jsonld';
    fs.readFile(contextLocation, 'utf8', function (error, data) {
        response.end(data);
    });
    return true;
});

module.exports = router;