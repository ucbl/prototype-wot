/**
 * Created by Lionel on 06/04/2016.
 * Controller for a mock of interoperability platform gateway. Simply redirects requests to the interoperability platform
 */

var express = require('express'),
    router = express.Router(),
    jsonParser = require('body-parser').json(),
    Globals = require('../models/globals'),
    interoperabilityModel = require('../models/interoperability'),
    jsonldHeaders = require('../middleware/jsonldHeaders');

/*---WEB SERVICE---*/

/**
 * -- Entry point management --
 */

// Entry point and home page
router.all('/*', function(request, response, next) {
    response.redirect("/interoperability");
});

module.exports = router;