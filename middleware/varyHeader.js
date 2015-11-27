/**
 * Created by Lionel on 27/11/2015.
 * ADD Vary header to state that requested content type is discriminant
 */

(function(module) {

    module.exports = function (request, response, next) {
        response.vary('Accept');
        next();
    };
})(module);