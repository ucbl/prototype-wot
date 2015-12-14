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

        if(typeof(data) === "string") {
            console.log("typeof = string");
            for(var key in variables) {
                while (data.indexOf(key) > -1) {
                    data = data.replace(key, variables[key]);
                }
            }
        } else if(typeof(data) === "object") {
            console.log("typeof = object");
            for(var i in data) {
                data[i] = require("./jsonTemplateEngine")(data[i]);
            }
        }
        return data;
    };
})(module);