/**
 * Created by Lionel on 22/11/2015.
 * Controller for a mock of interoperability platform that provides access to the connected devices
 */

var express = require('express'),
    router = express.Router(),
    Globals = require('../models/globals'),
    interoperabilityModel = require('../models/interoperability'),
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

// Sends the collection of known devices
router.get('/platform', function(request, response, next) {
    var platform = interoperabilityModel.platform;
    if (request.accepts('html')) {
        response.render('interoperability/platform', {platform: platform});
    } else {
        jsonldHeaders(request, response, next);
        response.end(JSON.stringify(require("../views/devicesSimple")(platform)));
    }
});

// Sends a collection of interoperability (detailed descriptions)
router.get('/devices', function(request, response, next) {
    var platform = interoperabilityModel.getKnownDeviceCollection();
    if (request.accepts('html')) {
        response.render('interoperability/devicesSimple', {devices: platform.devices});
    } else {
        jsonldHeaders(request, response, next);
        response.end(JSON.stringify((require("../views/devicesSimple")(platform))));
    }
});

// Retrieves info about a particular device
router.get('/devices/:deviceId', function(request, response, next) {
    //Search device by name, then by id, then provide an empty device
    var device = interoperabilityModel.getDeviceInfos(request.params["deviceId"]) || interoperabilityModel.findDeviceById(request.params["deviceId"]);
    if(device) {
        if (request.accepts('html')) {
            response.render('interoperability/device', {device: device});
        } else {
            jsonldHeaders(request, response, next);
            response.end(JSON.stringify(device));
        }
    } else {
        response.sendStatus(404);
    }
});

// Sends a collection of interoperability (detailed descriptions)
router.get('/connected-devices', function(request, response, next) {
    var platform = interoperabilityModel.getConnectedDeviceCollection();
    if (request.accepts('html')) {
        response.render('interoperability/devicesSimple', {devices: platform.devices});
    } else {
        jsonldHeaders(request, response, next);
        response.end(JSON.stringify((require("../views/devicesSimple")(platform))));
    }
});

// Retrieves info about a particular device
router.get('/connected-devices/:deviceId', function(request, response) {
    if(interoperabilityModel.isConnected(request.params["deviceId"])) {
        response.redirect("../device/" + request.params["deviceId"]);
    } else {
        response.sendStatus(404);
    }
});

// Add a new device to the currently connected device list
router.put('/devices/:deviceId', function(request, response) {
    if(interoperabilityModel.isConnected(request.params["deviceId"])) {
        response.sendStatus(405);
    } else {
        interoperabilityModel.addDevice(request.params["deviceId"]);
        response.sendStatus(201);
    }
});

// Add a new device to the currently connected device list
//TODO: do something more if a graph is posted to the device
router.post('/devices/:deviceId', function(request, response) {
    if(interoperabilityModel.isConnected(request.params["deviceId"])) {
        response.sendStatus(405);
    } else {
        interoperabilityModel.addDevice(request.params["deviceId"]);
        response.sendStatus(201);
    }
});

// Remove an device from the currently connected device list
router.delete('/devices/:deviceId', function(request, response) {
    if(interoperabilityModel.isConnected(request.params["deviceId"])) {
        interoperabilityModel.removeDevice(request.params["deviceId"]);
        response.sendStatus(204);
    } else {
        response.sendStatus(405);
    }
});

/*-- device capability invocation --*/

router.get('/devices/:deviceId/:capabilityId', function(request, response, next) {
    var device = interoperabilityModel.findDeviceById(request.params["deviceId"]);
    try {
        var result = device.invokeCapability(request.params["capabilityId"], "get", request.query);
        jsonldHeaders(request, response, next);
        response.end(JSON.stringify(result));
    } catch(error) {
        if(typeof(error) === "number") {
            response.sendStatus(error);
        } else {
            response.sendStatus(500);
        }
    }
});

router.put('/devices/:deviceId/:capabilityId', function(request, response, next) {
    var device = interoperabilityModel.findDeviceById(request.params["deviceId"]);
    console.log("body: " + request.body);
    try {
        var result = device.invokeCapability(request.params["capabilityId"], "put", request.body);
        jsonldHeaders(request, response, next);
        response.end(JSON.stringify(result));
    } catch(error) {
        if(typeof(error) === "number") {
            response.sendStatus(error);
        } else {
            response.sendStatus(500);
        }
    }
});

router.post('/devices/:deviceId/:capabilityId', function(request, response, next) {
    var device = interoperabilityModel.findDeviceById(request.params["deviceId"]);
    console.log("body: " + request.body);
    try {
        var result = device.invokeCapability(request.params["capabilityId"], "post", request.body);
        jsonldHeaders(request, response, next);
        response.end(JSON.stringify(result));
    } catch(error) {
        if(typeof(error) === "number") {
            response.sendStatus(error);
        } else {
            response.sendStatus(500);
        }
    }
});

router.delete('/devices/:deviceId/:capabilityId', function(request, response, next) {
    var device = interoperabilityModel.findDeviceById(request.params["deviceId"]);
    try {
        //It seems that passing parameters in a delete request is not restful (see http://stackoverflow.com/questions/2539394/rest-http-delete-and-parameters)
        //TODO: improve the argument passing model to address sub-resources of the capabilities. ...Or just use post to delete sub-resources.
        var result = device.invokeCapability(request.params["capabilityId"], "delete", request.body);
        jsonldHeaders(request, response, next);
        response.end(JSON.stringify(result));
    } catch(error) {
        if(typeof(error) === "number") {
            response.sendStatus(error);
        } else {
            response.sendStatus(500);
        }
    }
});

/*---HYDRA---*/

// GET the hydra vocabulary
router.get('/vocab', function(request, response, next) {
    jsonldHeaders(request, response, next);
    response.end(interoperabilityModel.getHydraVocabulary());
});

router.get('/vocab/:vocabId', function(request, response, next) {
    jsonldHeaders(request, response, next);
    response.end(interoperabilityModel.getHydraVocabulary(request.params["vocabId"]));
});

// GET the hydra context
router.get('/context', function(request, response, next) {
    jsonldHeaders(request, response, next);
    //TODO: find what should be returned here
    response.end("{}");
});

router.get('/context/:contextId', function(request, response, next) {
    var result = interoperabilityModel.getHydraContext(request.params["contextId"]);
    if(result) {
        jsonldHeaders(request, response, next);
        response.end(result);
    } else {
        response.sendStatus(404);
    }
});

module.exports = router;