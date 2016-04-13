#!/usr/bin/env node

var express = require('express'),
    app = express(),

    path = require('path'),
    bodyParser = require('body-parser'),
    multer  = require('multer');

var Controller = require('./controller'),
    Utils = require('../core/Utils');

var ontoDir = Controller.configuration.ontoDir,
    port = Controller.configuration.port,
    upload = multer({ dest: ontoDir });

process.on('uncaughtException', function(err) {
    console.error('[HyLAR] Fatal error!');
    throw err;
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
console.notify('Setting up routes...');


// Server utils
app.all('*', Controller.allowCrossDomain);   // Cross domain allowed
app.get('/', Controller.hello);              // Hello world
app.get('/time', Controller.time);

// OWL ontology parsing, getting, classifying
app.get('/ontology/:filename', Controller.getOntology, Controller.sendOntology);
app.get('/classify', Controller.getOntology, Controller.loadOntology, Controller.sendHylarContents);

//SPARQL query processing
app.get('/query', Controller.processSPARQL);

//Ontology listing
app.get('/ontology', Controller.list);

//File uploading
app.post('/ontology', upload.single('file'), Controller.upload);

console.notify('Done.');
console.notify('Exposing server to port ' + port + '...');

// Launching server
app.listen(port);
console.notify('Done.');
console.notify('HyLAR is running.');


