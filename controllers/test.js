//This file contains a mock of an interoperability platform that is supposed to provide access to the connected objects

var express = require('express'),
    router = express.Router();

// Entry point and home page
router.get('/', function(request, response) {
        response.end("test");
});
