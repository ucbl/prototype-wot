var express = require('express');
var router = express.Router();
var fs = require('fs');
var jsonld = require('jsonld');
var N3Store = require('n3').Store;
var http = require('http');
var requestModule = require('request');

// The list of functionalities in the server
functionalitiesMashup = [];

// Config variables
var nsCimaObject = 'http://localhost:3333/vocab#CimaObject';
var urlCimaObjects = 'http://localhost:3333/cima';
var urlFunctionalitiesRepository = 'http://localhost:3232/';
var urlFunctionalitiesRepositoryMashup = urlFunctionalitiesRepository + 'mashup';


// SERVICES
// HomePage
router.get('/', function(request, response, next) {
	response.render('index', {title: 'Avatar Architecture'});
});

// Get the list of all connected objects from the CIMA server
router.get('/cima-info', function(request, response, next) {
	http.get(urlCimaObjects, function(responseHttp) {
		responseHttp.on('data', function (data) {
			var tripleStore = new N3Store();
			jsonld.toRDF(JSON.parse(data), function (error, triples) {
				// Get the list of all objects
				for (var graphName in triples) {
					triples[graphName].forEach(function (triple) {
						tripleStore.addTriple(triple.subject.value, triple.predicate.value, triple.object.value);
					});
				}
				var listObjects = tripleStore.find(null, null, nsCimaObject);
				var responseService = [];
				// For each object get it's related information
				for (i in listObjects) {
					http.get(listObjects[i].subject, function(responseHttpObject) {
						responseHttpObject.on('data', function (dataObject) {
							responseService.push(JSON.parse(dataObject));
							// Respond when all the objects are loaded
							if (responseService.length==listObjects.length) {
								response.end(JSON.stringify(responseService));
							}
						});
					}).on('error', function(e) {
						console.log("Error: " + e.message);
						response.end("[]");
					});
				}
			});
		});
	}).on('error', function(e) {
		console.log("Error: " + e.message);
		response.end("[]");
	});
});

// POST to expose the functionalities of an avatar
// We add them to our application, more speficially to our listFunctionalitites
router.post('/expose-functionalities', function(request, response, next) {
	functionalityMashup = {'idAvatar' : request.body.idAvatar,
							'functionalities' : request.body.functionalities};
	var itemExists = false;
	for (i in functionalitiesMashup) {
		if (functionalitiesMashup[i].idAvatar == functionalityMashup.idAvatar) {
			functionalitiesMashup[i] = functionalityMashup;
			itemExists = true;
		}
	}
	if (!itemExists) {
		functionalitiesMashup.push(functionalityMashup);
	}
	response.send(functionalitiesMashup);
	return true;
});

// GET list of functionalities that exist in our application (variable: functionalitiesMashup)
router.get('/functionalities-server', function(request, response, next) {
	response.send(functionalitiesMashup);
	return true;
});

// GET the list of all functionalities that we can mashup from a repository
router.get('/functionalities-mashup', function(request, response, next) {
	var functionalities = [];
	for (i in functionalitiesMashup) {
		functionalities = functionalities.concat(functionalitiesMashup[i].functionalities);
	}
	requestModule.post({url:urlFunctionalitiesRepositoryMashup,
						form: functionalities},
						function (reqError, reqHttpResponse, reqBody) {
							if (reqError) {
								console.log('Error:' + reqError);
								response.end('');
								return false;
							}
							response.end(reqBody);
						});
	return true;
});

// GET an external service (we can use it as a proxy)
router.get('/load-external/:urlExternal', function(request, response, next) {
	http.get(request.params.urlExternal, function(responseHttp) {
		responseHttp.on('data', function (data) {
			response.send(data);
			return true;
		});
	}).on('error', function(e) {
		response.end("");
		return false;
	});
});


module.exports = router;