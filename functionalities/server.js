var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var fs = require('fs');
var jsonld = require('jsonld');
var N3Store = require('n3').Store;
var http = require('http');
var requestModule = require('request');
var rp = require('request-promise');
var app = express();
var Avatar = require('./avatar/avatar.js');

// Global variables
functionalitiesRegistry = [];
avatars = [];

// Global variables
var hostServer = 'http://localhost';
var portListen = 3000;
var hostFunctionalities = 'http://localhost:3232/functionality/';
var hostFunctionalitiesComposedOf = 'http://localhost:3232/functionality-composed-of/';
var hostServerPort = hostServer + ':' + portListen;
var hydraVocab = hostServerPort + '/vocab#';
var linkVocab = '<' + hydraVocab + '>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"';
var hydraLocation = __dirname + '/data/hydra.jsonld';

// Configure App and CROS
app.use(bodyParser.json({ type: 'json' }));
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


//avatars.push(new Avatar('http://localhost:3333/cima/coolerheater-swirlwind-2665'));
//avatars.push(new Avatar('http://localhost:3333/cima/heater-tesco-2336'));
//avatars.push(new Avatar('http://localhost:3333/cima/sensor-ge-2442'));
//avatars.push(new Avatar('http://localhost:3333/cima/motor-ge-3343'));
//avatars.push(new Avatar('http://localhost:3333/cima/window-ikea-2555'));
//avatars.push(new Avatar('http://localhost:3333/cima/phone-samsung-2554'));


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
                                    "avatars": hostServerPort + "/avatars/"
                                };
        response.end(JSON.stringify(responseEntryPoint));
    }
});









/*---SERVICE---*/

// PUT to expose the functionalities of an avatar
// We add them to our application, more speficially to our listFunctionalitites
app.put('/expose-functionalities', function(request, response, next) {
	functionalitiesExposed = {'idAvatar' : request.body.idAvatar,
							'functionalities' : request.body.functionalities,
							'functionalitiesIncomplete' : request.body.functionalitiesIncomplete};
	// Add the functionalities to the registry
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
	// Find all the composed functionalities in the environement
	if (!functionalitiesRegistry.executableComposedFunctionalities) {
		functionalitiesRegistry.executableComposedFunctionalities = [];
	}
	var allComposedFunctionalities = [];
	for (i in functionalitiesRegistry) {
		for (j in functionalitiesRegistry[i].functionalitiesIncomplete) {
			var itemExists = false;
			for (k in allComposedFunctionalities) {
				if (allComposedFunctionalities[k].id == functionalitiesRegistry[i].functionalitiesIncomplete[j].id) {
					itemExists = true;
				}
			}
			if (!itemExists) {
				allComposedFunctionalities.push(functionalitiesRegistry[i].functionalitiesIncomplete[j]);
			}
		}
	}
	// Find all the simple functionalities in the environement
	var allSimpleFunctionalities = [];
	for (i in functionalitiesRegistry) {
		for (j in functionalitiesRegistry[i].functionalities) {
			allSimpleFunctionalities.push(functionalitiesRegistry[i].functionalities[j]);
		}
	}
	allSimpleFunctionalities = uniqueArray(allSimpleFunctionalities);
	// Check if there are composed functionalities that can be executed
	for (i in allComposedFunctionalities) {
		var itemsNeeded = 0;
		for (j in allComposedFunctionalities[i].isComposedOf) {
			for (k in allSimpleFunctionalities) {
				if (allComposedFunctionalities[i].isComposedOf[j] == allSimpleFunctionalities[k]) {
					itemsNeeded++;
				}
			}
		}
		if (itemsNeeded == allComposedFunctionalities[i].isComposedOf.length) {
			functionalitiesRegistry.executableComposedFunctionalities.push(allComposedFunctionalities[i].id);
		}
	}
	// Tell to all the avatars concerned that they can execute the composed functionalities
	for (i in functionalitiesRegistry.executableComposedFunctionalities) {
		for (j in avatars) {
			var avatarIncompleteFunctionalities = avatars[j].collaborativeFunctionalitiesManager.getFunctionalitiesIncompleteFromFunctionalitiesRepository();
			for (k in avatarIncompleteFunctionalities) {
				if (avatarIncompleteFunctionalities[k].id == functionalitiesRegistry.executableComposedFunctionalities[i]) {
					avatars[j].collaborativeFunctionalitiesManager.addFunctionalityComposedWithOtherAvatars(avatarIncompleteFunctionalities[k].id);
				}
			}
		}
	}
	response.send(functionalitiesRegistry);
});

// GET the exposed functionalities in the server
app.get('/exposed-functionalities', function(request, response, next) {
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
	var responseJson = {};
	responseJson['@id'] = hostServerPort + '/avatars';
	responseJson['@context'] = hostServerPort + '/context/Collection';
	responseJson['@type'] = 'vocab:EntryPoint/avatars';
	responseJson.avatars = [];
	for (i in avatars) {
		responseJson.avatars.push(avatars[i].toJsonHydra());
	}
	response.writeHead(200, {"Content-Type": "application/ld+json",
                                "Link": linkVocab});
	response.end(JSON.stringify(responseJson));
});
// PUT to create an avatar
app.put('/avatars', function(request, response, next) {
	var urlCima = request.body.urlCima;
	var responseCreated = {};
	if (urlCima) {
		avatar = findAvatar(urlCima);
		if (!avatar.id) {
			avatar = new Avatar(urlCima);
			if (avatar) {
				avatars.push(avatar);
			}
		}
		responseCreated = avatar.toJsonHydra();
	}
	response.writeHead(200, {"Content-Type": "application/ld+json",
                                "Link": linkVocab});
	response.end(JSON.stringify(responseCreated));
});
// GET a simple Avatar
app.get('/avatar/:idAvatar', function(request, response, next) {
	var idAvatar = request.params.idAvatar;
	var avatar = findAvatar(idAvatar);
	response.writeHead(200, {"Content-Type": "application/ld+json",
                                "Link": linkVocab});
	response.end(JSON.stringify(avatar.toJsonHydra()));
});
// Find information on how to execute functionalities of an avatar and execute them if needed
app.get('/avatar/:idAvatar/:idFunctionality', function(request, response, next) {
	var idAvatar = request.params.idAvatar;
	var idFunctionality = request.params.idFunctionality;
	var avatar = findAvatar(idAvatar);
	var functionality = hostFunctionalities + idFunctionality;
	var functionalityHydra = avatar.toJsonFunctionalityHydra(functionality);
	response.writeHead(200, {"Content-Type": "application/ld+json",
                                "Link": linkVocab});
	// If the functionality is a GET then execute it
	if (functionalityHydra && functionalityHydra.supportedOperation[0] && functionalityHydra.supportedOperation[0].method=="GET") {
		functionalityHydra.response = avatar.executeFunctionality(functionality);
		response.end(JSON.stringify(functionalityHydra));
	} else {
		response.end(JSON.stringify(functionalityHydra));
	}
});
// Execute a PUT functionality on a avatar
app.put('/avatar/:idAvatar/:idFunctionality', function(request, response, next) {
	var idAvatar = request.params.idAvatar;
	var idFunctionality = request.params.idFunctionality;
	var avatar = findAvatar(idAvatar);
	var functionality = hostFunctionalities + idFunctionality;
	var functionalityHydra = avatar.toJsonFunctionalityHydra(functionality);
	var optionsExecute = request.body;
	response.writeHead(200, {"Content-Type": "application/ld+json",
                                "Link": linkVocab});
	// If the functionality is a PUT then execute it
	if (functionalityHydra && functionalityHydra.supportedOperation[0] && functionalityHydra.supportedOperation[0].method=="PUT") {
		functionalityHydra.response = avatar.executeFunctionality(functionality, optionsExecute);
		response.end(JSON.stringify(functionalityHydra));
	} else {
		response.end(JSON.stringify(functionalityHydra));
	}
});
// Execute a POST functionality on a avatar
app.post('/avatar/:idAvatar/:idFunctionality', function(request, response, next) {
	var idAvatar = request.params.idAvatar;
	var idFunctionality = request.params.idFunctionality;
	var avatar = findAvatar(idAvatar);
	var functionality = hostFunctionalities + idFunctionality;
	var functionalityHydra = avatar.toJsonFunctionalityHydra(functionality);
	var optionsExecute = request.body;
	response.writeHead(200, {"Content-Type": "application/ld+json",
                                "Link": linkVocab});
	// If the functionality is a POST then execute it
	if (functionalityHydra && functionalityHydra.supportedOperation[0] && functionalityHydra.supportedOperation[0].method=="POST") {
		// Load the avatars if needed
		for (i in functionalityHydra.supportedOperation[0].expects.supportedProperty) {
			if (functionalityHydra.supportedOperation[0].expects.supportedProperty[i].property['@type']=='vocab:Functionality') {
				var idFunctionality = avatar.idFunctionality(functionalityHydra.supportedOperation[0].expects.supportedProperty[i].property['@id']);
				var functionalityIns = hostFunctionalities + idFunctionality;
				for (j in functionalitiesRegistry) {
					for (k in functionalitiesRegistry[j].functionalities) {
						if (functionalitiesRegistry[j].functionalities[k] == functionalityIns) {
							var labelIns = functionalityHydra.supportedOperation[0].expects.supportedProperty[i].property.label;
							optionsExecute[labelIns] = hostServerPort + '/avatar/' + functionalitiesRegistry[j].idAvatar + '/' + idFunctionality;
						}
					}
				}
			}
		}
		// Execute the functionality
		console.log(optionsExecute);
		functionalityHydra.response = avatar.executeFunctionality(functionality, optionsExecute);
		response.end(JSON.stringify(functionalityHydra));
	} else {
		response.end(JSON.stringify(functionalityHydra));
	}
});

// GET list of avatars that exist in our application in an HTML format
app.get('/avatars-html', function(request, response, next) {
	response.send(avatarsToHtml());
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

function findLinker(linkers, functionality) {
	for (i in linkers) {
		if (linkers[i].functionality == functionality) {
			return linkers[i];
		}
	}
	return {};
}

function findAvatarsExecutingFunctionality(functionalities) {
	var registryLinksItems = registryLinks();
	var responseFunctionalities = [];
	var responseExecution = {};
	for (i in functionalities) {
		var responseFunctionality = {};
		responseFunctionality.functionality = functionalities[i];
		responseFunctionality.avatars = [];
		for (j in registryLinksItems) {
			if (functionalities[i] == registryLinksItems[j].functionality) {
				responseFunctionality.avatars.push(registryLinksItems[j].idAvatar);
			}
		}
		responseFunctionalities.push(responseFunctionality);
	}
	responseExecution.possible = true;
	responseExecution.functionalities = responseFunctionalities;
	for (k in responseFunctionalities) {
		if (responseFunctionalities[k].avatars.length == 0) {
			responseExecution.possible = false;
		}
	}
	return responseExecution;
}

function registryLinks() {
	var links = [];
	for (i in functionalitiesRegistry) {
		for (j in functionalitiesRegistry[i].functionalities) {
			var functionalityLink = {};
			functionalityLink.idAvatar = functionalitiesRegistry[i].idAvatar;
			functionalityLink.functionality = functionalitiesRegistry[i].functionalities[j];
			links.push(functionalityLink);
		}
	}
	return links;
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
	localHtml = '';
	if (avatar.collaborativeFunctionalitiesManager) {	
		local = avatar.collaborativeFunctionalitiesManager.getFunctionalitiesFromLocalFunctionalities();
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
	}
	// Composed Functionalities
	composedHtml = '';
	if (avatar.collaborativeFunctionalitiesManager) {
		composed = avatar.collaborativeFunctionalitiesManager.getFunctionalitiesComposedWithOtherAvatars();
		for (i in composed) {
			var linkFunctionality = avatar.hostId + '/' + avatar.idFunctionality(composed[i]);
			composedHtml += '<div class="functionality functionalityComposed" rel="'+composed[i]+'">'
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
	}
	// Incomplete Functionalities
	incompleteHtml = '';
	if (avatar.collaborativeFunctionalitiesManager) {
		incomplete = avatar.collaborativeFunctionalitiesManager.getFunctionalitiesIncompleteFromFunctionalitiesRepositoryArray();
		for (i in incomplete) {
			var linkFunctionality = avatar.hostId + '/' + avatar.idFunctionality(incomplete[i]);
			incompleteHtml += '<div class="functionality functionalityIncomplete" rel="'+incomplete[i]+'">'
								+'<div class="functionalityIns">'
									+'<div class="functionalityDocumentation">Doc</div>'
									+'<div class="functionalityAction">'
										+linkFunctionality
									+'</div>'
									+'<div class="clearer"></div>'
								+'</div>'
							+'</div>';
		}
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
	                    	+'<h2>Composed functionalities that can be used with other avatars</h2>'
	                    	+composedHtml
                    	+'</div>'
                    	+'<div class="exposedFunctionalitiesSection">'
	                    	+'<h2>Incomplete functionalities found in the repository</h2>'
	                    	+incompleteHtml
                    	+'</div>'
                    +'</div>'
                +'</div>'
            +'</div>';
}

function uniqueArray(array, placeholder, index) {
	if (array && array.length > 0) {	
		placeholder = array.length;
		while (index = --placeholder)
			while (index--)
				array[placeholder] !== array[index] || array.splice(index,1);
	}
	return array
}