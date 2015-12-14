/**
 * Created by Lionel on 29/11/2015.
 * A template engine that transforms JSON into JSON...
 * ...By replacing certain strings with global variable values
 */

(function (module) {
    var Globals = require("../models/globals");

    module.exports = function(data) {
        var variables = {
            "__interoperability__": Globals.vocabularies.interoperability,
            "__capability__": Globals.vocabularies.capability
        };

        for(var key in variables) {
            if(typeof(data) === "string") {
                while (data.indexOf(key) > -1) {
                    data = data.replace(key, variables[key]);
                }
            } else if(typeof(data) === "object") {
                for(var i in data) {
                    while (data[i].indexOf(key) > -1) {
                        data[i] = data[i].replace(key, variables[key]);
                    }
                }
            }
        }
        return data;
    };
})(module);