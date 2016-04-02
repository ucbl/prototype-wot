/**
 * Created by Lionel on 29/11/2015.
 * A template engine that transforms JSON into JSON...
 * ...By replacing certain strings with global variable values
 */

(function (module) {
    var Globals = require("../models/globals");

    module.exports = function(data) {
        if(data) {
            var variables = {
                "__interoperability__": Globals.vocabularies.interoperability,
                "__ontology__": Globals.vocabularies.ontology,
                "__code__": Globals.vocabularies.code,
                "__asawoo__": Globals.vocabularies.asawoo,
                "__capability__": Globals.vocabularies.capability,
                "__functionality__": Globals.vocabularies.functionality
            };

            if (typeof(data) === "string") {
                for (var key in variables) {
                    while (data.indexOf(key) > -1) {
                        data = data.replace(key, variables[key]);
                    }
                }
            } else if (typeof(data) === "object") {
                for (var i in data) {
                    data[i] = require("./jsonTemplateEngine")(data[i]);
                }
            }
        }
        return data;
    };
})(module);