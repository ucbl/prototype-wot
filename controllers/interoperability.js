//This file contains a mock of an interoperability platform that is supposed to provide access to the connected objects

var express = require('express'),
    router = express.Router(),
    fs = require('fs'),
    Globals = require('../models/globals'),
    objectModel = require('../models/object');


/*---WEB SERVICE---*/

// Entry point and home page
router.get('/', function(request, response) {
    if (request.accepts('html')) {
        //Send the CIMA homepage
        router.use(express.static(__dirname + '/../public/interoperability-public/index.html'));
        //response.render('objects/objects', {objects: objectModel.getAllObjects()});
        //response.end(objectModel.objectsToStringSimple());
    } else {
        response.writeHead(200, {"Content-Type": "application/ld+json",
            "Link": Globals.vocabularies.linkVocab});
        var responseEntryPoint = {
            "@context": Globals.vocabularies.base + "/context/EntryPoint",
            "@id": Globals.vocabularies.base + "/objects",
            "@type": "EntryPoint",
            "interoperability": Globals.vocabularies.interoperability
        };
        response.end(JSON.stringify(responseEntryPoint));
    }
});

// Sends a collection of objects (basic descriptions)
router.get('/interoperability', function(request, response) {
    var objects = objectModel.getAllObjects();
    if (request.accepts('html')) {
        response.render('objects/objectsSimple', {objects: objects});
        //response.end(objectModel.objectsToStringSimple());
    } else {
        response.writeHead(200, {
            "Content-Type": "application/ld+json",
            "Link": Globals.vocabularies.linkVocab
        });
        var interoperabilityResponse = {
            '@context': Globals.vocabularies.base + '/context/Collection',
            '@id': Globals.vocabularies.interoperability,
            '@type': 'hydra:Collection',
            objects: []
    };
        for (var i in objects) {
            interoperabilityResponse.objects.push({
                '@context':Globals.vocabularies.base + '/context/CimaObject',
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
    var objects = objectModel.getAllObjects();
    if (request.accepts('html')) {
        response.render('objects/objectsSimple', {objects: objectModel.getAllObjects()});
        //response.end(objectsToStringSimple());
    } else {
        response.writeHead(200, {
            "Content-Type": "application/ld+json",
            "Link": Globals.vocabularies.linkVocab
        });
        var interoperabilityResponse = {
            '@context': Globals.vocabularies.base + '/context/Collection',
            '@id': Globals.vocabularies.interoperability,
            '@type': 'hydra:Collection',
            objects: []
        };
        for (var i in objects) {
            var currentObject = {
                '@context':Globals.vocabularies.base + '/context/CimaObject',
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


router.get('/:objectId', function(request, response, next) {
    //Search object by name, then by id, then provide an empty object
    var object = objectModel.findObjectByName(request.params.objectId) || objectModel.findObject(request.params.objectId) || {realObjectInfo:[]};
    if (request.accepts('html')) {
        response.render('objects/object', {object: object});
    } else {
        response.writeHead(200, {
            "Content-Type": "application/ld+json",
            "Link": Globals.vocabularies.linkVocab}
        );
        var objectResponse = {
            "@context": Globals.vocabularies.base + "/context/CimaObject",
            "@id": object['@id'],
            "@type": "vocab:CimaObject",
            "capability": Globals.vocabularies.capability
        };
        if (object.id)
            objectResponse.id = object.id;
        if (object.name)
            objectResponse.name = object.name;
        if (object.description)
            objectResponse.description = object.description;
        if (object.capabilities)
            objectResponse.capabilities = object.capabilities;
        if (object.realObjectInfo) {
            objectResponse.values = [];
            for(var i in object.realObjectInfo) {
                object.values.push(object.realObjectInfo[i]);
            }
        }
        response.end(JSON.stringify(objectResponse));
    }
});

// GET and PUT operations on the real objects
router.get('/:nameObject/:capability', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/ld+json"});
    var nameObject = request.params.nameObject;
    var capability = request.params.capability;
    var responseJson = {"@id": hostServerPort + request.originalUrl};
    switch (capability) {
        case 'gps':
            responseJson['@context'] = hostServerPort + '/context/Position';
            responseJson['@type'] = 'vocab:Position';
            responseJson.latitude = getValueFromObject(nameObject, 'latitude');
            responseJson.longitude = getValueFromObject(nameObject, 'longitude');
            break;
        case 'temperatureSense':
            responseJson['@context'] = hostServerPort + '/context/Temperature';
            responseJson['@type'] = 'vocab:Temperature';
            responseJson.value = calculateTemperature();
            responseJson.type = getValueFromObject(nameObject, 'type');
            break;
        case 'informationMotor':
            responseJson['@context'] = hostServerPort + '/context/MotorValue';
            responseJson['@type'] = 'vocab:MotorValue';
            responseJson.angle = getValueFromObject(nameObject, 'angle');
            responseJson.speed = getValueFromObject(nameObject, 'speed');
            responseJson.strength = getValueFromObject(nameObject, 'strength');
            break;
    }
    response.end(JSON.stringify(responseJson));
});
router.put('/:nameObject/:capability', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/ld+json"});
    var nameObject = request.params.nameObject;
    var capability = request.params.capability;
    var responseJson = {"@id": hostServerPort + request.originalUrl};
    switch (capability) {
        case 'temperatureDecrease':
            var newValue = request.body.value;
            responseJson['@context'] = hostServerPort + '/context/NumericValue';
            responseJson['@type'] = 'vocab:NumericValue';
            if (nameObject == 'coolerheater-swirlwind-2665') {
                setValueToObject(nameObject, 'valueDecreaser', newValue);
                responseJson.value = getValueFromObject(nameObject, 'valueDecreaser');
            } else {
                setValueToObject(nameObject, 'value', newValue);
                responseJson.value = getValueFromObject(nameObject, 'value');
            }
            calculateTemperature();
            break;
        case 'temperatureIncrease':
            var newValue = request.body.value;
            responseJson['@context'] = hostServerPort + '/context/NumericValue';
            responseJson['@type'] = 'vocab:NumericValue';
            if (nameObject == 'coolerheater-swirlwind-2665') {
                setValueToObject(nameObject, 'valueIncreaser', newValue);
                responseJson.value = getValueFromObject(nameObject, 'valueIncreaser');
            } else {
                setValueToObject(nameObject, 'value', newValue);
                responseJson.value = getValueFromObject(nameObject, 'value');
            }
            calculateTemperature();
            break;
        case 'closeWindow':
            responseJson['@context'] = hostServerPort + '/context/WindowStatus';
            responseJson['@type'] = 'vocab:WindowStatus';
            setValueToObject(nameObject, 'status', 'closed');
            responseJson.status = getValueFromObject(nameObject, 'status');
            calculateTemperature();
            break;
        case 'openWindow':
            responseJson['@context'] = hostServerPort + '/context/WindowStatus';
            responseJson['@type'] = 'vocab:WindowStatus';
            setValueToObject(nameObject, 'status', 'open');
            responseJson.status = getValueFromObject(nameObject, 'status');
            calculateTemperature();
            break;
        case 'call':
        case 'sms':
        case 'video':
        case 'photo':
            responseJson['@context'] = hostServerPort + '/context/PhoneStatus';
            responseJson['@type'] = 'vocab:PhoneStatus';
            setValueToObject(nameObject, 'status', capability);
            responseJson.status = getValueFromObject(nameObject, 'status');
            break;
        case 'startApp':
            responseJson['@context'] = hostServerPort + '/context/AppStatus';
            responseJson['@type'] = 'vocab:AppStatus';
            setValueToObject(nameObject, 'statusApp', 'started');
            responseJson.status = getValueFromObject(nameObject, 'statusApp');
            break;
        case 'stopApp':
            responseJson['@context'] = hostServerPort + '/context/AppStatus';
            responseJson['@type'] = 'vocab:AppStatus';
            setValueToObject(nameObject, 'statusApp', 'stopped');
            responseJson.status = getValueFromObject(nameObject, 'statusApp');
            break;
    }
    response.end(JSON.stringify(responseJson));
});
router.post('/:nameObject/:capability', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/ld+json"});
    var nameObject = request.params.nameObject;
    var capability = request.params.capability;
    var responseJson = {"@id": hostServerPort + request.originalUrl};
    switch (capability) {
        case 'activateMotor':
            var newAngle = request.body.angle;
            var newSpeed = request.body.speed;
            var newStrength = request.body.strength;
            responseJson['@context'] = hostServerPort + '/context/MotorValue';
            responseJson['@type'] = 'vocab:MotorValue';
            setValueToObject(nameObject, 'activated', 'true');
            setValueToObject(nameObject, 'angle', newAngle);
            setValueToObject(nameObject, 'speed', newSpeed);
            setValueToObject(nameObject, 'strength', newStrength);
            responseJson.angle = getValueFromObject(nameObject, 'angle');
            responseJson.speed = getValueFromObject(nameObject, 'speed');
            responseJson.strength = getValueFromObject(nameObject, 'strength');
            break;
    }
    response.end(JSON.stringify(responseJson));
});


/*---HYDRA---*/

// GET the hydra vocabulary
router.get('/vocab', function(request, response, next) {
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
