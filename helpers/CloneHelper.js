/**
 * Created by Lionel on 26/11/2015.
 */
//Simple function that clones the properties of an object into another one.
//Used for adding methods to JSON objects retrieved from JSON-LD files.

(function(module) {
    module.exports = function(o1, o2) {
        for (var i in o1) {
            o2[i] = o1[i];
        }
    };
})(module);