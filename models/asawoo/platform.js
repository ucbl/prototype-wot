/**
 * Created by Lionel on 11/04/2016.
 */
(function(module) {

    var fs = require('fs'),
        Globals = require('./../globals'),
        infraController = require('./infrastructureController'),
        cloneHelper = require('../../helpers/cloneHelper'),
        templateEngine = require("../../helpers/jsonTemplateEngine");

    //local variable to retrieve data stored in files
    var fileLocations = {
        'hydraVocabDir': __dirname + '/../data/interoperability/vocabs/',
        "hydraVocabBaseFile": __dirname + '/../data/interoperability/vocabs/interoperability.jsonld',
        'contextFileDir': __dirname + '/../data/interoperability/contexts/',
        'deviceFileDir': __dirname + '/../data/interoperability/devices/'
    };

    var infrastructureController = new infraController();

    //Map of avatarInfo objects, representing the avatars known by the platform
     var avatarInfos = new Map();

    module.exports = {

        //Uri of the interoperability layer vocabulary
        "getHydraVocabUri": function() {
            return Globals.vocabularies.ontology + 'vocabs/asawoo#';
        },

        /**
         * Service model
         */

        //Get all avatars
        "getAllAvatars": function() {
            var result = [];
            for(var key in avatarInfos) {
                result.push(avatarInfos.get(key));
            }
            return result;
        },

        //Get an avatar
        "getAvatar": function(avatarId) {
            if(avatarInfos.has(avatarId) || avatarInfos.has(Globals.vocabularies.asawoo + "avatars/" + avatarId)) {
                return avatarInfos.get(avatarId)?avatarInfos.get(avatarId):avatarInfos.get(Globals.vocabularies.asawoo + "avatars/" + avatarId);
            }
            return null;
        },
        /**
         * Adds an avatar to the list:
         * by using its @id property or its id property if no @id
         * returns the id used or throws an error
         */
        "addAvatar": function(avatar) {
            if(avatar) {
                if (avatar["@id"]) {
                    avatarInfos.set(avatar["@id"], avatar);
                    return avatar["@id"];
                } else if (avatar["id"]) {
                    avatarInfos.set(avatar["id"], avatar);
                    return avatar["id"];
                }
            }
            throw "Error in adding avatar to the list: no object or object incorrectly structured: " + JSON.stringify(avatar);
        },
        /**
         * Removes an avatar from the list:
         * by using its @id property or its id property if no @id
         * returns the id used or throws an error
         */
        "removeAvatar": function(avatar) {
            if(avatar) {
                if (avatar["@id"]) {
                    avatarInfos.remove(avatar["@id"]);
                    return avatar["@id"];
                } else if (avatar["id"]) {
                    avatarInfos.remove(avatar["id"]);
                    return avatar["id"];
                }
            }
            throw "Error in removing avatar to the list: no object or object incorrectly structured: " + JSON.stringify(avatar);
        },
        //TODO

        /**
         * Hydra description model
         */

        //Returns the Hydra vocabulary corresponding to a particular object or defaults to the interoperability platform vocab
        "getHydraVocabulary": function(fileName) {
            return templateEngine(fs.readFileSync(fileName ? fileLocations.hydraVocabDir + fileName + ".jsonld" : fileLocations.hydraVocabBaseFile, 'utf8'));
        },

        //Returns the context corresponding to a given id or throws an error
        'getContext': function(contextId) {
            return templateEngine(fs.readFileSync(fileLocations.contextFileDir + contextId + '.jsonld', 'utf8'));
        }
    };
})(module);