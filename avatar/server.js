var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var fs = require('fs');
var jsonld = require('jsonld');
var N3Store = require('n3').Store;
var http = require('http');
var requestModule = require('request');
var app = express();
var Avatar = require('./avatar/avatar.js');

// Global variables
functionalitiesRegistry = [];
avatars = [];

// Global variables
var hostServer = 'http://localhost';
var portListen = 3000;
var hostFunctionalities = 'http://localhost:3232/functionality/';
var hostServerPort = hostServer + ':' + portListen;

// Configure App and CROS
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


avatar = new Avatar('http://localhost:3333/cima/cooler-swirlwind-2443');

setTimeout(function(){
	console.log('DONE');
	console.log(avatar.collaborativeFunctionalitiesManager);
}, 2000);
/*
var avatar = new Avatar('http://localhost:3333/cima/sensor-ge-2442');
var urlFunctionality = hostFunctionalities + 'temperatureSense';
setTimeout(function(){
	console.log('DONE');
	avatar.informationFunctionality(urlFunctionality);
}, 2000);

/*--- INITIALIZE THE AVATARS ---*/
/*

//avatar = new Avatar('http://localhost:3333/cima/cooler-swirlwind-2443');
avatar1 = new Avatar('http://localhost:3333/cima/coolerheater-swirlwind-2665');
avatar2 = new Avatar('http://localhost:3333/cima/heater-tesco-2336');
avatar3 = new Avatar('http://localhost:3333/cima/sensor-ge-2442');
avatar4 = new Avatar('http://localhost:3333/cima/window-ikea-2555');
avatar5 = new Avatar('http://localhost:3333/cima/phone-samsung-2554');
avatars.push(avatar1);
avatars.push(avatar2);
avatars.push(avatar3);
avatars.push(avatar4);
avatars.push(avatar5);
setTimeout(function(){
	console.log('DONE');
	var optionsExecute = {method: "PUT",
							options: {value: 333},
							callback: function(response){}};
	avatars[0].executeFunctionality('http://localhost:3232/functionality/temperatureDecreasess', optionsExecute);
	
	var optionsExecute = {method: "PUT",
							options: {value: 222},
							callback: function(response){}};
	avatars[1].executeFunctionality('http://localhost:3232/functionality/temperatureIncrease', optionsExecute);
	var optionsExecute = {method: "PUT",
							options: {value: 222},
							callback: function(response){}};
	avatars[1].executeFunctionality('http://localhost:3232/functionality/openWindow', optionsExecute);
	//avatars[0].executeFunctionality('http://localhost:3232/functionality/openWindow');
    //console.log(avatars[0].collaborativeFunctionalitiesManager);
    console.log(avatars[0].id);
    console.log(avatars[0].collaborativeFunctionalitiesManager.functionalitiesConnections);
    console.log(avatars[1].id);
    console.log(avatars[1].collaborativeFunctionalitiesManager.functionalitiesConnections);
    console.log(avatars[2].id);
    console.log(avatars[2].collaborativeFunctionalitiesManager.functionalitiesConnections);
    console.log(avatars[3].id);
    console.log(avatars[3].collaborativeFunctionalitiesManager.functionalitiesConnections);
    //console.log(33);
    //console.log(33);
    //console.log(avatar.applianceCommunicationManager);
	//console.log(avatar3);
	//console.log(avatar2);
    //console.log(avatars);
    //console.log(functionalitiesRegistry);
    //avatars[0].applianceCommunicationManager.viewParent();
}, 2000);
//ava1.show();
//ava1.id = '33';
//ava1.show();
//ava2.show();


*/

// PUT to expose the functionalities of an avatar
// We add them to our application, more speficially to our listFunctionalitites
app.put('/expose-functionalities', function(request, response, next) {
	functionalitiesExposed = {'idAvatar' : request.body.idAvatar,
							'functionalities' : request.body.functionalities,
							'functionalitiesIncomplete' : request.body.functionalitiesIncomplete};
	var itemExists = false;
	for (i in functionalitiesRegistry) {
		if (functionalitiesRegistry[i].idAvatar == functionalitiesExposed.idAvatar) {
			functionalitiesRegistry[i] = functionalitiesExposed;
			itemExists = true;
		}
	}
	if (!itemExists) {
		functionalitiesRegistry.push(functionalitiesExposed);
	}
	console.log(333);
	console.log(functionalitiesRegistry);
	response.send(functionalitiesRegistry);
});

// PUT to broadcast the functionalities of an Avatar
app.put('/broadcast-functionalities', function(request, response, next) {
	var infoAvatar = {'idAvatar' : request.body.idAvatar,
					'functionalities' : request.body.functionalities};
	var responseFunctionalities = [];
	for (i in avatars) {
		if (avatars[i].id != infoAvatar.idAvatar) {
			// Broadcast the functionalities of the received avatar
			avatars[i].chargeFunctionalities(infoAvatar);
			// Load the functionalities of this avatar
			var functionalitiesAvatar = {};
			functionalitiesAvatar.idAvatar = avatars[i].id;
			functionalitiesAvatar.functionalities = avatars[i].broadcastFunctionalities();
			responseFunctionalities.push(functionalitiesAvatar);
		}
	}
	response.send(responseFunctionalities);
});


// WEB SERVICE FOR THE AVATARS
// GET list of avatars that exist in our application
app.get('/avatars', function(request, response, next) {
	response.send(avatars);
});
// PUT to create an avatar
app.put('/avatars', function(request, response, next) {
	var idAvatar = request.body.idAvatar;
	var responseCreated = {created : false};
	if (idAvatar) {
		avatarExists = findAvatar(idAvatar);
		if (!avatarExists.id) {
			newAvatar = new Avatar(idAvatar);
			if (newAvatar) {
				avatars.push(newAvatar);
				responseCreated.created = true;
			}
		}
	}
	response.send(responseCreated);
});
// GET list of avatars that exist in our application in an HTML format
app.get('/avatars-html', function(request, response, next) {
	response.send(avatarsToHtml());
});
// GET a simple Avatar
app.get('/avatar/:idAvatar', function(request, response, next) {
	var idAvatar = request.params.idAvatar;
	var avatar = findAvatar(idAvatar);
	response.send(avatar);
});
// Find information on how to execute a capability
app.get('/avatar/:idAvatar/:idFunctionality', function(request, response, next) {
	var idAvatar = request.params.idAvatar;
	var idFunctionality = request.params.idFunctionality;
	var avatar = findAvatar(idAvatar);
	var functionality = hostFunctionalities + idFunctionality;
	var responseFunctionality = avatar.informationFunctionality(functionality);
	if (isArray(responseFunctionality)) {
		// This object executed the functionality
		for (i in responseFunctionality) {
			responseFunctionality[i].urlExecution = hostServerPort + '/avatar/' + idAvatar + '/' + idFunctionality;
		}
		response.send(responseFunctionality);
	} else {
		// Another object executed the functionality
		responseFunctionality.then(function(responsePromise){
			var responseJSON = JSON.parse(responsePromise);
			responseJSON.urlExecution = hostServerPort + '/avatar/' + responseJSON.idAvatar + '/' + idFunctionality;
			response.send(responseJSON);
		});
	}
});
// Execute a capability in other avatar
app.put('/avatar/:idAvatar/:idFunctionality', function(request, response, next) {
	var idAvatar = request.params.idAvatar;
	var idFunctionality = request.params.idFunctionality;
	var avatar = findAvatar(idAvatar);
	var functionality = hostFunctionalities + idFunctionality;
	var optionsExecute = request.body;
	var promiseExecution = avatar.executeFunctionality(functionality, optionsExecute);
	if (promiseExecution) {
		promiseExecution.then(function(responsePromise) {
			response.send(responsePromise);
		});
	} else {
		response.send({});
	}
});

// GET, POST, PUT by default
app.all('/*', function(request, response, next) {
    response.end("");
});





// EXTRA FUNCTIONS
function findAvatar(idAvatar) {
	for (i in avatars) {
		if (avatars[i].id == idAvatar || avatars[i].urlCimaObject == idAvatar) {
			return avatars[i];
		}
	}
	return {};
}

function avatarsToHtml() {
	var string = '';
    for (i in avatars) {
        string += avatarToString(avatars[i]);
    }
    return '<div class="avatarsList">'
                    + string
                    +'<div class="clearer"></div>'
                +'</div>';
}


function avatarToString(avatar) {
	// Local Functionalities
	local = avatar.collaborativeFunctionalitiesManager.getFunctionalitiesFromLocalFunctionalities();
	localHtml = '';
	for (i in local) {
		var linkFunctionality = avatar.hostId + '/' + avatar.idFunctionality(local[i]);
		localHtml += '<div class="functionality functionalityLocal" rel="'+local[i]+'">'
							+'<div class="functionalityIns">'
								+'<div class="functionalityDocumentation">Doc</div>'
								+'<div class="functionalityExecute" rel="'+linkFunctionality+'">Exec</div>'
								+'<div class="functionalityAction">'
									+linkFunctionality
								+'</div>'
								+'<div class="clearer"></div>'
							+'</div>'
						+'</div>';
	}
	// Found Functionalities
	found = avatar.collaborativeFunctionalitiesManager.getFunctionalitiesFromFunctionalitiesRepository();
	foundHtml = '';
	for (i in found) {
		var linkFunctionality = avatar.hostId + '/' + avatar.idFunctionality(found[i]);
		foundHtml += '<div class="functionality functionalityFound" rel="'+found[i]+'">'
							+'<div class="functionalityIns">'
								+'<div class="functionalityDocumentation">Doc</div>'
								+'<div class="functionalityExecute" rel="'+linkFunctionality+'">Exec</div>'
								+'<div class="functionalityAction">'
									+linkFunctionality
								+'</div>'
								+'<div class="clearer"></div>'
							+'</div>'
						+'</div>';
	}
	// Functionalities from Other Avatars
	other = avatar.collaborativeFunctionalitiesManager.getFunctionalitiesFromOtherAvatars();
	otherHtml = '';
	for (i in other) {
		var linkFunctionality = avatar.hostId + '/' + avatar.idFunctionality(other[i]);
		otherHtml += '<div class="functionality functionalityOther" rel="'+other[i]+'">'
							+'<div class="functionalityIns">'
								+'<div class="functionalityDocumentation">Doc</div>'
								+'<div class="functionalityExecute" rel="'+linkFunctionality+'">Exec</div>'
								+'<div class="functionalityAction">'
									+linkFunctionality
								+'</div>'
								+'<div class="clearer"></div>'
							+'</div>'
						+'</div>';
	}
    return '<div class="avatar">'
                +'<div class="avatarIns">'
                    +'<div class="avatarName">'+avatar.name+'</div>'
                    +'<div class="avatarDescription">'+avatar.description+'</div>'
                    +'<div class="avatarId" rel="'+avatar.hostId+'">'
                        +avatar.hostId
                    +'</div>'
                    +'<div class="exposedFunctionalities">'
                    	+'<div class="exposedFunctionalitiesSection">'
	                    	+'<h2>Functionalities in this avatar</h2>'
	                    	+localHtml
                    	+'</div>'
                    	+'<div class="exposedFunctionalitiesSection">'
	                    	+'<h2>Functionalities found in the repository</h2>'
	                    	+foundHtml
                    	+'</div>'
                    	+'<div class="exposedFunctionalitiesSection">'
	                    	+'<h2>Functionalities in other avatars</h2>'
	                    	+otherHtml
                    	+'</div>'
                    +'</div>'
                +'</div>'
            +'</div>';
}

function isArray(variable) {
	return (Object.prototype.toString.call(variable) === '[object Array]');
}