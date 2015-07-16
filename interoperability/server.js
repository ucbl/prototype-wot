var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var app = express();

// Global variables
var hostServer = 'http://localhost';
var portListen = 3333;
var hostServerPort = hostServer + ':' + portListen;
var hydraVocab = hostServerPort + '/vocab#';
var linkVocab = '<' + hydraVocab + '>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"';
var hydraLocation = __dirname + '/data/hydra.jsonld';

var cimaObjects = [];
loadCimaObjects();
calculateTemperature();

// Configure App and CROS
//app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'json' }))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function(request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    response.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});


// Start the server in the port "portListen"
var server = app.listen(portListen, function () {
	var host = server.address().address;
	var port = server.address().port;
})






/*---HYDRA---*/

// GET the hydra vocabulary 
app.get('/vocab', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/ld+json"});
    fs.readFile(hydraLocation, 'utf8', function (error, data) {
        response.end(data);
    });
    return true;
});

// GET the hydra context
app.get('/context/:context', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/ld+json"});
    var contextLocation = __dirname + '/data/contexts/' + request.params.context + '.jsonld';
    fs.readFile(contextLocation, 'utf8', function (error, data) {
        response.end(data);
    });
    return true;
});
app.get('/context', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/ld+json",
                            "Link": linkVocab});
    response.end("{}");
});

// Entry point and home page
app.get('/', function(request, response, next) {
    if (request.accepts('html')) {
        response.end(objectsToString());
    } else {
        response.writeHead(200, {"Content-Type": "application/ld+json",
                                "Link": linkVocab});
        var responseEntryPoint = {
                                    "@context": hostServerPort + "/context/EntryPoint",
                                    "@id": hostServerPort + "/",
                                    "@type": "EntryPoint",
                                    "cima": hostServerPort + "/cima/"
                                };
        response.end(JSON.stringify(responseEntryPoint));
    }
});








/*---WEB SERVICE---*/

// GET the information of a functionality
app.get('/cima', function(request, response, next) {
    if (request.accepts('html')) {
        response.end(objectsToString());
    } else {
        var cimaResponse = {};
        cimaResponse['@id'] = hostServerPort + request.originalUrl;
        cimaResponse['@context'] = hostServerPort + '/context/Collection';
        cimaResponse['@type'] = 'hydra:Collection';
        cimaResponse.cimaObjects = [];
        for (i in cimaObjects) {
            var cimaObject = {};
            cimaObject['@id'] = cimaObjects[i]['@id'];
            cimaObject['@type'] = 'vocab:CimaObject';
            cimaResponse.cimaObjects.push(cimaObject);            
        }
        response.writeHead(200, {"Content-Type": "application/ld+json",
                                "Link": linkVocab});
        response.end(JSON.stringify(cimaResponse));
    }
});
app.get('/cima/:nameObject', function(request, response, next) {
    var nameObject = request.params.nameObject;
    if (request.accepts('html')) {
        response.end(objectToString(findObject(nameObject)));
    } else {
        var cimaResponse = {};
        var cimaObject = findObject(nameObject);
        cimaResponse['@id'] = hostServerPort + request.originalUrl;
        cimaResponse['@context'] = hostServerPort + '/context/CimaObject';
        cimaResponse['@type'] = 'vocab:CimaObject';
        if (cimaObject && cimaObject.id) {        
            cimaResponse.id = cimaObject.id;
            cimaResponse.name = cimaObject.name;
            cimaResponse.description = cimaObject.description;
            cimaResponse.capabilities = cimaObject.capabilities;
        }
        response.writeHead(200, {"Content-Type": "application/ld+json",
                                "Link": linkVocab});
        response.end(JSON.stringify(cimaResponse));
    }
});
app.get('/cima-list', function(request, response, next) {
    response.end(objectsToStringSimple());
});

// GET and PUT operations on the real objects
app.get('/cima/:nameObject/:capability', function(request, response, next) {
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
app.put('/cima/:nameObject/:capability', function(request, response, next) {
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
app.post('/cima/:nameObject/:capability', function(request, response, next) {
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


// GET, POST, PUT by default
app.all('/*', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/ld+json",
                            "Link": linkVocab});
    response.end("{}");
});




// EXTRA FUNCTIONS
function loadCimaObjects() {
    var dataLocation = __dirname + '/data/objects/';
    var files = fs.readdirSync(dataLocation);
    for (i in files) {
        if (files[i]!='' && files[i].indexOf('.jsonld')>0) {
            var dataLocationFile = __dirname + '/data/objects/' + files[i];
            // Read the JSON-LD file that contains all the information
            dataJson = JSON.parse(fs.readFileSync(dataLocationFile, 'utf8'));
            var capabilities = [];
            if (dataJson.object && dataJson.object.capabilities) {
                for (var i=0; i<dataJson.object.capabilities.length; i++) {
                    capabilities.push((dataJson.object.capabilities[i])['@id']); 
                }
            }
            var cimaObject = {};
            cimaObject['@id'] = hostServerPort + '/cima/' + dataJson.id;
            cimaObject['@context'] = hostServerPort + '/context/CimaObject';
            cimaObject['@type'] = 'vocab:CimaObject';
            cimaObject.id = dataJson.id;
            cimaObject.name = dataJson.name;
            cimaObject.description = dataJson.description;
            cimaObject.capabilities = dataJson.capabilities;
            cimaObject.realObjectInfo = dataJson.realObjectInfo;
            cimaObjects.push(cimaObject);
        }
    }
}

function objectsToString() {
    var string = '';
    for (i in cimaObjects) {
        string += objectToString(cimaObjects[i]);
    }
    return '<div class="objects">'
                    + string
                    +'<div class="clearer"></div>'
                +'</div>';
}

function objectsToStringSimple() {
    var string = '';
    for (i in cimaObjects) {
        string += objectToStringSimple(cimaObjects[i]);
    }
    return '<div class="objectsSimple">'
                    + string
                    +'<div class="clearer"></div>'
                +'</div>';
}

function findObject(nameObject) {
    for (i in cimaObjects) {
        if (cimaObjects[i].id == nameObject) {
            return cimaObjects[i];
        }
    }
}

function objectToString(object) {
    var realObjectInfoHtml = '';
    for (i in object.realObjectInfo) {
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
}

function objectToStringSimple(object) {
    var realObjectInfoHtml = '';
    return '<div class="objectSimple">'
                +'<div class="objectName objectActivate" rel="'+object['@id']+'">'+object.name+'</div>'
            +'</div>';
}

function setValueToObject(nameObject, nameAttribute, value) {
    var object = findObject(nameObject);
    if (object && object.realObjectInfo) {
        object.realObjectInfo[nameAttribute] = value;
    }
}

function getValueFromObject(nameObject, nameAttribute) {
    var object = findObject(nameObject);
    if (object && object.realObjectInfo && object.realObjectInfo[nameAttribute]) {
        return object.realObjectInfo[nameAttribute];
    }
    return null;
}

function calculateTemperature() {
    // Calculate the temperature checking the different objects (Just a test)
    var temperature = 0;
    temperature -= getValueFromObject('cooler-swirlwind-2443', 'value') * 1;
    temperature -= getValueFromObject('coolerheater-swirlwind-2665', 'valueDecreaser') * 1;
    temperature += getValueFromObject('coolerheater-swirlwind-2665', 'valueIncreaser') * 1;
    temperature += getValueFromObject('heater-tesco-2336', 'value') * 1;
    setValueToObject('sensor-ge-2442', 'temperature', temperature);
    return temperature;
}

function parseHtml(content) {
    var templateLocationFile = __dirname + '/site/index.html';
    var template = fs.readFileSync(templateLocationFile, 'utf8');
    return template.replace('#CONTENT#', content);
}