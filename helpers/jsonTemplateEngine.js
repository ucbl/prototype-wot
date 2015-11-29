/**
 * Created by Lionel on 29/11/2015.
 * A template engine that transforms JSON into JSON...
 * ...By replacing certain strings with global variable values
 */

(function (module) {
    var Globals = require("../models/globals");

    var variables = {
        "__interoperability__": Globals.vocabularies.interoperability,
        "__capability__": Globals.vocabularies.capability
    };

    module.exports = function(data) {
        for(var key in variables) {
            while (data.indexOf(key) > -1) {
                data = data.replace(key, variables[key]);
            }
        }
        return data;
    };
})(module);