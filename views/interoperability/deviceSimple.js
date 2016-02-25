/**
 * Created by Lionel on 25/11/2015.
 */
//View returning a JSON-LD description of a device

(function(module) {
        var Globals = require('./globals');

        module.exports = function (deviceModel) {
        return {
            '@id': deviceModel['@id'],
            'name': deviceModel.name,
            'description': deviceModel.description
        }
    };
})(module);