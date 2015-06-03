var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var jsonld = require('jsonld');
var N3Store = require('n3').Store;
var rdfstore = require('rdfstore');
var app = express();


rdfstore.create(function(err, store) {

    jsonld = {
      "@context": 
      {  
         "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
         "xsd": "http://www.w3.org/2001/XMLSchema#",
         "name": "http://xmlns.com/foaf/0.1/name",
         "age": {"@id": "http://xmlns.com/foaf/0.1/age", "@type": "xsd:integer" },
         "homepage": {"@id": "http://xmlns.com/foaf/0.1/homepage", "@type": "xsd:anyURI" },
         "ex": "http://example.org/people/"
      },
      "@graph": [
        {
            "@id": "ex:john_smith",
            "name": "John Smith",
            "age": "41",
            "homepage": "http://example.org/home/"
        },
        {
            "@id": "ex:charles",
            "name": "Charles",
            "age": "44",
            "homepage": "http://example.org/charles/"
        }
      ]
    };

    store.setPrefix("ex", "http://example.org/people/");

    store.load("application/ld+json", jsonld, "ex:test", function(success, results) {
      store.graph("", function(graph){
            console.log(graph);
        });
    /*
        store.node("ex:charles", "ex:test", function(success, graph) {
         console.log(graph);
        });
    */
    });

});