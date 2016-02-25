/**
 * Created by Lionel on 14/12/2015.
 * Controller for the ASAWoO client of the interoperability layer
 * Manages a WoT infrastructure in which avatars are created and respond to functionality service requests
 */

var express = require('express'),
    router = express.Router(),
    jsonParser = require('body-parser').json(),
    Globals = require('../models/globals'),
    asawooModel = require('../models/asawoo/asawoo'),
    jsonldHeaders = require('../middleware/jsonldHeaders');

//TODO: change that
var Avatar = require('../models/avatar/avatar.js');


/*---HYDRA---*/

// GET the hydra vocabulary
router.get('/vocab', function(request, response, next) {
    request.vocabUri = asawooModel.getHydraVocabUri();
    jsonldHeaders(request, response, next);
    response.end(asawooModel.getHydraVocabulary());
});

// GET the hydra context
router.get('/context', function(request, response, next) {
    request.vocabUri = asawooModel.getHydraVocabUri();
    jsonldHeaders(request, response, next);
    response.end("{}");
});

router.get('/context/:contextId', function(request, response, next) {
    var result = asawooModel.getHydraContext(request.params["contextId"]);
    if(result) {
        request.vocabUri = asawooModel.getHydraVocabUri();
        jsonldHeaders(request, response, next);
        response.end(result);
    } else {
        response.sendStatus(404);
    }
});

/*-- Entry point management --*/

// Entry point and home page
router.get('/', function(request, response, next) {
    if (request.accepts('html')) {
        //Send the ASAWoO platform homepage
        response.redirect('/functionalities-public');
    } else {
        request.vocabUri = asawooModel.getHydraVocabUri();
        jsonldHeaders(request, response, next);
        response.end(JSON.stringify(asawooModel.entryPoint));
    }
});


/*---SERVICE---*/

// PUT to expose the functionalities of an avatar
// We add them to our application, more specifically to our listFunctionalitites
router.put('/expose-functionalities', function(request, response, next) {
    var functionalitiesExposed = {'avatarId' : request.body.avatarId,
        'functionalities' : request.body.functionalities,
        'functionalitiesIncomplete' : request.body.functionalitiesIncomplete};
    // Add the functionalities to the registry
    var itemExists = false;
    for (var i in asawooModel.functionalitiesRegistry) {
        if (asawooModel.functionalitiesRegistry[i].avatarId == functionalitiesExposed.avatarId) {
            asawooModel.functionalitiesRegistry[i] = functionalitiesExposed;
            itemExists = true;
        }
    }
    if (!itemExists) {
        asawooModel.functionalitiesRegistry.push(functionalitiesExposed);
    }
    asawooModel.updateFunctionalities();
    response.send(asawooModel.functionalitiesRegistry);
});

// GET the exposed functionalities in the server
router.get('/exposed-functionalities', function(request, response, next) {
    response.send(asawooModel.functionalitiesRegistry);
});

// PUT to broadcast the functionalities of an avatar
router.put('/broadcast-functionalities', function(request, response, next) {
    var infoAvatar = {'avatarId' : request.body.avatarId,
        'functionalities' : request.body.functionalities};
    var responseFunctionalities = [];
    for (var i in asawooModel.avatars) {
        if (asawooModel.avatars[i].id != infoAvatar.avatarId) {
            // Broadcast the functionalities of the received avatar
            asawooModel.avatars[i].chargeFunctionalities(infoAvatar);
            // Load the functionalities of this avatar
            var functionalitiesAvatar = {};
            functionalitiesAvatar.avatarId = asawooModel.avatars[i].id;
            functionalitiesAvatar.functionalities = asawooModel.avatars[i].broadcastFunctionalities();
            responseFunctionalities.push(functionalitiesAvatar);
        }
    }
    response.send(responseFunctionalities);
});


// WEB SERVICE FOR THE AVATARS
// GET list of avatars that exist in our application
router.get('/avatars', function(request, response, next) {
    if (request.accepts('html')) {
        response.render('asawoo/avatars', {avatars: asawooModel.avatars});
    } else {
        request.vocabUri = asawooModel.getHydraVocabUri();
        jsonldHeaders(request, response, next);
        response.end(JSON.stringify(require("../views/asawoo/avatars")(asawooModel.avatars)));
    }
});

// PUT to create an avatar with a given id and a graph representing this avatar in the request body
router.put('/avatars/:avatarId', jsonParser, function(request, response, next) {
    var avatarId = request.params["avatarId"];
    var avatarContent = request.body["avatar"];
    var avatar = null;
    if (avatarId) {
        //TODO: fix potential bug here
        avatar = asawooModel.findAvatar(avatarContent);
    } else if (avatarContent && avatarContent.id) {
        avatar = asawooModel.createAvatar(avatarContent);
    }
    if (avatar) {
        asawooModel.avatars.push(avatar);
    }
    request.vocabUri = asawooModel.getHydraVocabUri();
    jsonldHeaders(request, response, next);
    response.end(JSON.stringify(avatar?avatar.toJsonHydra():{}));
});

// POST to create an avatar for a specified device
router.post('/avatars', jsonParser, function(request, response, next) {
    var avatarContent = request.body["avatar"];
    var avatar = null;
    if (avatarContent) {
        avatar = asawooModel.findAvatar(avatarContent);
        if (!avatar.id) {
            avatar = asawooModel.createAvatar(avatarContent);
        }
        if (avatar) {
            asawooModel.avatars.push(avatar);
        }
    }
    request.vocabUri = asawooModel.getHydraVocabUri();
    jsonldHeaders(request, response, next);
    response.end(JSON.stringify(avatar?avatar.toJsonHydra():{}));
});
// DELETE to delete an avatar
router.delete('/avatars', function(request, response, next) {
    var urlCima = request.body.urlCima;
    if (urlCima) {
        for (var i in asawooModel.avatars) {
            if (asawooModel.avatars[i].urlCimaObject == urlCima) {
                asawooModel.avatars.splice(i, 1);
            }
        }
        for (i in asawooModel.functionalitiesRegistry) {
            var avatarId = urlCima.slice(urlCima.lastIndexOf("/") + 1);
            if (asawooModel.functionalitiesRegistry[i].avatarId == avatarId) {
                asawooModel.functionalitiesRegistry.splice(i, 1);
            }
        }
        asawooModel.updateFunctionalities();
    }
    request.vocabUri = asawooModel.getHydraVocabUri();
    jsonldHeaders(request, response, next);
    response.end('');
});
// GET a simple avatar
router.get('/avatar/:avatarId', function(request, response, next) {
    var avatarId = request.params.avatarId;
    var avatar = asawooModel.findAvatar(avatarId);
    request.vocabUri = asawooModel.getHydraVocabUri();
    jsonldHeaders(request, response, next);
    response.end(JSON.stringify(avatar.toJsonHydra()));
});
// Find information on how to execute functionalities of an avatar and execute them if needed
router.get('/avatar/:avatarId/:functionalityId', function(request, response, next) {
    var avatarId = request.params.avatarId;
    var functionalityId = request.params.functionalityId;
    var avatar = asawooModel.findAvatar(avatarId);
    var functionality = Globals.vocabularies.functionality + functionalityId;
    var functionalityHydra = avatar.toJsonFunctionalityHydra(functionality);
    request.vocabUri = asawooModel.getHydraVocabUri();
    jsonldHeaders(request, response, next);
    // If the functionality is a GET then execute it
    if (functionalityHydra && functionalityHydra.supportedOperation[0] && functionalityHydra.supportedOperation[0].method=="GET") {
        functionalityHydra.response = avatar.executeFunctionality(functionality);
        response.end(JSON.stringify(functionalityHydra));
    } else {
        response.end(JSON.stringify(functionalityHydra));
    }
});
// Execute a PUT functionality on a avatar
router.put('/avatar/:avatarId/:functionalityId', function(request, response, next) {
    var avatarId = request.params.avatarId;
    var functionalityId = request.params.functionalityId;
    var avatar = asawooModel.findAvatar(avatarId);
    var functionality = Globals.vocabularies.functionality + functionalityId;
    var functionalityHydra = avatar.toJsonFunctionalityHydra(functionality);
    var optionsExecute = request.body;
    request.vocabUri = asawooModel.getHydraVocabUri();
    jsonldHeaders(request, response, next);
    // If the functionality is a PUT then execute it
    if (functionalityHydra && functionalityHydra.supportedOperation[0] && functionalityHydra.supportedOperation[0].method=="PUT") {
        functionalityHydra.response = avatar.executeFunctionality(functionality, optionsExecute);
        response.end(JSON.stringify(functionalityHydra));
    } else {
        response.end(JSON.stringify(functionalityHydra));
    }
});
// Execute a POST functionality on a avatar
router.post('/avatar/:avatarId/:functionalityId', function(request, response, next) {
    var avatarId = request.params.avatarId;
    var functionalityId = request.params.functionalityId;
    var avatar = asawooModel.findAvatar(avatarId);
    var functionality = Globals.vocabularies.functionality + functionalityId;
    var functionalityHydra = avatar.toJsonFunctionalityHydra(functionality);
    var optionsExecute = request.body;
    request.vocabUri = asawooModel.getHydraVocabUri();
    jsonldHeaders(request, response, next);
    // If the functionality is a POST then execute it
    if (functionalityHydra && functionalityHydra.supportedOperation[0] && functionalityHydra.supportedOperation[0].method=="POST") {
        // Load the avatars if needed
        for (var i in functionalityHydra.supportedOperation[0].expects.supportedProperty) {
            if (functionalityHydra.supportedOperation[0].expects.supportedProperty[i].property['@type']=='vocab:Functionality') {
                var functionalityId = avatar.functionalityId(functionalityHydra.supportedOperation[0].expects.supportedProperty[i].property['@id']);
                var functionalityIns = Globals.vocabularies.functionality + functionalityId;
                for (var j in asawooModel.functionalitiesRegistry) {
                    for (var k in asawooModel.functionalitiesRegistry[j].functionalities) {
                        if (asawooModel.functionalitiesRegistry[j].functionalities[k] == functionalityIns) {
                            var labelIns = functionalityHydra.supportedOperation[0].expects.supportedProperty[i].property.label;
                            optionsExecute[labelIns] = Globals.vocabularies.asawoo + 'avatar/' + asawooModel.functionalitiesRegistry[j].avatarId + '/' + functionalityId;
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


// EXTRA FUNCTIONS
/*function updateFunctionalities() {
    // Find all the composed functionalities in the environement
    //if (!functionalitiesRegistry.executableComposedFunctionalities) {
    functionalitiesRegistry.executableComposedFunctionalities = [];
    //}
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
    allSimpleFunctionalities = require("../helpers/removeDuplicatesFromArray") (allSimpleFunctionalities);
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
    for (j in avatars) {
        avatars[j].collaborativeFunctionalitiesManager.deleteFunctionalityComposedWithOtherAvatars();
    }
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
}

function findAvatar(avatarId) {
    for (i in avatars) {
        if (avatars[i].id == avatarId || avatars[i].urlCimaObject == avatarId) {
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
                responseFunctionality.avatars.push(registryLinksItems[j].avatarId);
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
            functionalityLink.avatarId = functionalitiesRegistry[i].avatarId;
            functionalityLink.functionality = functionalitiesRegistry[i].functionalities[j];
            links.push(functionalityLink);
        }
    }
    return links;
}*/


/** HTML TEMPLATING FUNCTIONS (to be removed) **/
/*
function avatarsToHtml() {
    var string = '';
    for (var i in asawooModel.avatars) {
        string += avatarToString(asawooModel.avatars[i]);
    }
    return '<div class="avatarsList">'
        + string
        +'<div class="clearer"></div>'
        +'</div>';
}


function avatarToString(avatar) {
    // Local Functionalities
    var localHtml = '';
    if (avatar.collaborativeFunctionalitiesManager) {
        var local = avatar.collaborativeFunctionalitiesManager.getFunctionalitiesFromLocalFunctionalities();
        for (var i in local) {
            var linkFunctionality = avatar.hostId + '/' + avatar.functionalityId(local[i]);
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
    var composedHtml = '';
    if (avatar.collaborativeFunctionalitiesManager) {
        var composed = avatar.collaborativeFunctionalitiesManager.getFunctionalitiesComposedWithOtherAvatars();
        for (i in composed) {
            linkFunctionality = avatar.hostId + '/' + avatar.functionalityId(composed[i]);
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
    var incompleteHtml = '';
    if (avatar.collaborativeFunctionalitiesManager) {
        var incomplete = avatar.collaborativeFunctionalitiesManager.getFunctionalitiesIncompleteFromFunctionalitiesRepositoryArray();
        for (i in incomplete) {
            linkFunctionality = avatar.hostId + '/' + avatar.functionalityId(incomplete[i]);
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
}*/
