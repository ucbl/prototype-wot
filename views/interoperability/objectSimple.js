/**
 * Created by Lionel on 25/11/2015.
 */
//View returning a JSON-LD description of an object

(function(module) {
        var Globals = require('./globals');

        module.exports = function (objectModel) {
        return {
            '@id': objectModel['@id'],
            'name': objectModel.name,
            'description': objectModel.description
        }
    };
})(module);