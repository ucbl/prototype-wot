/**
 * Created by Lionel on 27/11/2015.
 * ADD Vary header to state that requested content type is discriminant
 */

module.exports = function (request, response, next) {
    response.vary('Accept');
    next();
};
