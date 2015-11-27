/**
 * Created by Lionel on 27/11/2015.
 * CORS configuration
 */

(function(module) {
    module.exports = function (request, response, next) {
        if (request.get('Origin')) {
            response.header("Access-Control-Allow-Origin", "*");
            response.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
            response.header("Access-Control-Allow-Headers", "X-Requested-With");
        }
        next();
    };
})(module);