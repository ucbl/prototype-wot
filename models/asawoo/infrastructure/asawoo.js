/**
 * Created by Lionel on 15/12/2015.
 * Model for the WoT platform (that controls and runs device avatars)
 */
(function(module) {

    var fs = require('fs'),
        Globals = require('../../globals'),
        avatarModel = require('./../avatar/avatar'),
        cloneHelper = require('../../../helpers/cloneHelper'),
        templateEngine = require("../../../helpers/jsonTemplateEngine");


    //local variable to retrieve data stored in files
    var fileLocations = {
        'hydraVocabDir': __dirname + '/../../data/asawoo/vocabs/',
        "hydraVocabBaseFile": __dirname + '/../../data/asawoo/vocabs/asawoo.jsonld',
        'contextFileDir': __dirname + '/../../data/asawoo/contexts/',
        'avatarFileDir': __dirname + '/../../data/asawoo/avatars/'
    };

    module.exports = {
        // Global variables
        "functionalitiesRegistry": [],
        "avatars": [],

        //Uri of the interoperability layer vocabulary
        "getHydraVocabUri": function () {
            return Globals.vocabularies.asawoo + 'vocab#';
        },

        /**
         * Hydra description model
         */
        // Entrypoint
        "entryPoint": {
            "@context": Globals.vocabularies.asawoo + "context/EntryPoint",
            "@id": Globals.vocabularies.asawoo,
            "@type": "EntryPoint",
            "avatars": Globals.vocabularies.asawoo + "avatars"
        },

        //Returns the Hydra vocabulary corresponding to a particular object or defaults to the interoperability platform vocab
        "getHydraVocabulary": function(fileName)  {
            return templateEngine(fs.readFileSync(fileName ? fileLocations.hydraVocabDir + fileName + ".jsonld" : fileLocations.hydraVocabBaseFile, 'utf8'));
        },

        'getHydraContext': function(contextId) {
            try {
                return templateEngine(fs.readFileSync(fileLocations.contextFileDir + contextId + '.jsonld', 'utf8'));
            } catch (error) {
                return null;
            }
        },

        "updateFunctionalities": function () {
            // Find all the composed functionalities in the environement
            //if (!this.functionalitiesRegistry.executableComposedFunctionalities) {
            this.functionalitiesRegistry.executableComposedFunctionalities = [];
            //}
            var allComposedFunctionalities = [];
            for (i in this.functionalitiesRegistry) {
                for (j in this.functionalitiesRegistry[i].functionalitiesIncomplete) {
                    var itemExists = false;
                    for (k in allComposedFunctionalities) {
                        if (allComposedFunctionalities[k].id == this.functionalitiesRegistry[i].functionalitiesIncomplete[j].id) {
                            itemExists = true;
                        }
                    }
                    if (!itemExists) {
                        allComposedFunctionalities.push(this.functionalitiesRegistry[i].functionalitiesIncomplete[j]);
                    }
                }
            }
            // Find all the simple functionalities in the environement
            var allSimpleFunctionalities = [];
            for (i in this.functionalitiesRegistry) {
                for (j in this.functionalitiesRegistry[i].functionalities) {
                    allSimpleFunctionalities.push(this.functionalitiesRegistry[i].functionalities[j]);
                }
            }
            allSimpleFunctionalities = require("../../../helpers/removeDuplicatesFromArray") (allSimpleFunctionalities);
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
                    this.functionalitiesRegistry.executableComposedFunctionalities.push(allComposedFunctionalities[i].id);
                }
            }
            // Tell to all the avatars concerned that they can execute the composed functionalities
            for (j in this.avatars) {
                this.avatars[j].collaborativeFunctionalitiesManager.deleteFunctionalityComposedWithOtherAvatars();
            }
            for (i in this.functionalitiesRegistry.executableComposedFunctionalities) {
                for (j in this.avatars) {
                    var avatarIncompleteFunctionalities = this.avatars[j].collaborativeFunctionalitiesManager.getFunctionalitiesIncompleteFromFunctionalitiesRepository();
                    for (k in avatarIncompleteFunctionalities) {
                        if (avatarIncompleteFunctionalities[k].id == this.functionalitiesRegistry.executableComposedFunctionalities[i]) {
                            this.avatars[j].collaborativeFunctionalitiesManager.addFunctionalityComposedWithOtherAvatars(avatarIncompleteFunctionalities[k].id);
                        }
                    }
                }
            }
        },

        "createAvatar": function(avatarDesc) {
            return avatarDesc?new avatarModel(avatarDesc):null;
        },

        "findAvatar": function (avatarId) {
            for (var i in this.avatars) {
                if (this.avatars[i].id == avatarId || this.avatars[i].urlCimaObject == avatarId) {
                    return this.avatars[i];
                }
            }
            return {};
        },

        "findLinker": function (linkers, functionality) {
            for (i in linkers) {
                if (linkers[i].functionality == functionality) {
                    return linkers[i];
                }
            }
            return {};
        },

        "findAvatarsExecutingFunctionality": function (functionalities) {
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
        },

        "registryLinks": function () {
            var links = [];
            for (i in this.functionalitiesRegistry) {
                for (j in this.functionalitiesRegistry[i].functionalities) {
                    var functionalityLink = {};
                    functionalityLink.avatarId = this.functionalitiesRegistry[i].avatarId;
                    functionalityLink.functionality = this.functionalitiesRegistry[i].functionalities[j];
                    links.push(functionalityLink);
                }
            }
            return links;
        }

    };
})(module);