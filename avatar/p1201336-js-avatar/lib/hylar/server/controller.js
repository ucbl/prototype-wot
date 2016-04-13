/**
 * Created by Spadon on 02/10/2014.
 */

var fs = require('fs'),
    path = require('path'),
    request = require('request'),
    mime = require('mime-types');

var Hylar = require('../Hylar');

var appDir = path.dirname(require.main.filename),
    ontoDir = appDir + '/ontologies',
    port = 3000,
    parsedPort;

process.argv.forEach(function(value, index) {
    if ((value == '-od') || (value == '--ontology-directory')) {
        ontoDir = path.resolve(process.argv[index + 1]);
    }
});

process.argv.forEach(function(value, index) {
    if((value=='-p') || (value=='--port')) {
        parsedPort = parseInt(process.argv[index+1]);
        if(parsedPort !== NaN && parsedPort > 0) {
            port = parsedPort;
        }
    }
});

module.exports = {

    /**
     * Server configuration
     */
    configuration: {
        appDir: appDir,
        ontoDir: ontoDir,
        port: port
    },

    /**
     * OWL File content to text
     * @param req
     * @param res
     * @param next
     */
    getOntology: function(req, res, next) {
        var initialTime = req.param('time'),
            receivedReqTime = new Date().getTime(),
            filename = req.param('filename'),
            absolutePathToFile = ontoDir + '/' + filename,
            extension = path.extname(absolutePathToFile),
            contentType = mime.contentType(extension);

        if(contentType) {
            req.mimeType = contentType.replace(/;.*/g, '');
        } else {
            req.mimeType = contentType;
        }

        req.requestDelay =  receivedReqTime - initialTime;

        fs.readFile(absolutePathToFile, function(err, data) {
            if(err) {
                res.status(500).send(err.toString());
            } else {
                req.rawOntology = data.toString().replace(/(&)([a-z0-9]+)(;)/gi, '$2:');
                next();
            };
        });
    },

    loadOntology: function(req, res, next) {
        var rawOntology = req.rawOntology,
            mimeType = req.mimeType,
            initialTime = new Date().getTime();

        Hylar.load(rawOntology, mimeType, req.param('reasoningMethod'))
            .then(function() {
                req.processingDelay  = new Date().getTime() - initialTime;
                next();
            });
    },

    sendHylarContents: function(req, res) {
        Hylar.getStorage().then(function(hylarStorage) {
            res.status(200).json({
                data: {
                    storage: hylarStorage,
                    dictionary: Hylar.getDictionary()
                },
                processingDelay: req.processingDelay,
                requestDelay : req.requestDelay,
                serverTime : new Date().getTime()
            });
        });
    },

    /**
     * End-method returning an ontology
     * @param req
     * @param res
     */
    sendOntology: function(req, res) {
        res.header('Content-Type', 'application/xml');
        res.status(200).json({
            data: {
                ontologyTxt: req.rawOntology,
                mimeType: req.mimeType
            },
            requestDelay: req.requestDelay,
            serverTime: new Date().getTime()
        });
    },

    processSPARQL: function(req, res) {
        var initialTime = req.param('time'),
            receivedReqTime = new Date().getTime(),
            requestDelay =  receivedReqTime - initialTime,
            processedTime;

        Hylar.query(req.param('query'), req.param('reasoningMethod'))
            .then(function(results) {
                processedTime = new Date().getTime();

                res.status(200).send({
                    data : results,
                    processingDelay: processedTime - receivedReqTime,
                    requestDelay : requestDelay,
                    serverTime : new Date().getTime()
                });
            });
    },

    list: function(req, res) {
        res.send(fs.readdirSync(ontoDir));
    },

    /**
     * External OWL File content to text
     * @param req
     * @param res
     * @param next
     */
    getExternalOntology: function(req, res, next) {
        var initialTime = 0,
            receivedReqTime = new Date().getTime();

        req.requestDelay =  receivedReqTime - initialTime;
        var url = req.param('url');

        request.get(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                req.rawOntology = body.toString().replace(/(&)([a-z0-9]+)(;)/gi, '$2:');
                next();
            }
        });
    },

    /**
     * Simple HelloWorld
     * @param req
     * @param res
     */
    hello: function(req, res) {
        res.send('hello world');
    },

    /**
     * CORS Middleware
     * @param req
     * @param res
     */
    allowCrossDomain: function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
    },

    /** Current server time */
    time: function(req, res) {
        res.status(200).json({
            ms: new Date().getTime()
        });
    },

    upload: function(req, res) {
        fs.renameSync(req.file.destination + req.file.filename, req.file.destination + req.file.originalname);
        res.json({
            filename: req.file.originalname,
            list: fs.readdirSync(ontoDir)
        });
    }
};
