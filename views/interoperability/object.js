/**
 * Created by Lionel on 25/11/2015.
 */
//View returning a JSON-LD description of an object

(function(module) {
        var Globals = require('./globals');

        module.exports = function (objectModel) {
        return {
            '@context': Globals.vocabularies.interoperability + 'context/CimaObject',
            '@id': Globals.vocabularies.interoperability + objectModel.id,
            '@type': 'vocab:CimaObject',
            'name': objectModel.name,
            'description': objectModel.description,
            'capabilities': objectModel.capabilities,
            'values': objectModel.realObjectInfo
        }
    };
})(module);