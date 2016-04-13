/**
 * Created by Lionel on 17/11/2015.
 */

(function(exports) {

//App configuration
    exports.config = {
        'port': process.env.PORT || 3000
    };

//Check if base URI has been updated (once in the app lifetime)
    exports.baseUriUpdated = false;

//Vocabulary URIs and namespaces
    var vocabularies = {
        //Set default base URIs
        'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        //TODO: separate into several base URIs -> interoperability, asawoo-base, code-repository...
        'base': 'http://asawoo.liris.cnrs.fr/',

        //Define server URIs
        'setServerUris': function() {
            //Interoperability layer
            this.interoperability = this.base + 'interoperability/';
            //Avatar platform
            this.asawoo = this.base + 'asawoo/';
            //Ontology repository
            this.ontology = this.base + 'ontology/';
            //Functionality code repository
            this.code = this.base + 'code-repository/';
        },

        //Define all other URIs depending on the base one
        'setOtherUris': function () {
            this.nsType = this.rdf + 'type';
            this.hydraVocab = this.ontology + 'vocab#';
            this.interoperabilityVocab = this.ontology + 'vocabs/interoperability#';
            this.ontologyVocab = this.ontology + 'vocabs/ontology#';
            this.asawooVocab = this.ontology + 'vocabs/asawoo#';
            this.nsName = this.base + 'name';
            this.nsDescription = this.base + 'description';
            this.appliance = this.ontology + 'appliance/';
            this.capability = this.ontology + 'capability/';
            this.functionality = this.ontology + 'functionality/';
            this.linkVocab = '<' + this.hydraVocab + '>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"';
            exports.vocabularies = this;
        },

        //Define a mechanism for late binding of the base Hydra resources URIs to the server URI.
        'updateBaseUri': function (value) {
            this.base = value;
            this.setServerUris();
            this.setOtherUris();
            exports.baseUriUpdated = true;
            console.log("base URI updated: " + this.base);
        }
    };
    vocabularies.setServerUris();
    vocabularies.setOtherUris();
})(exports);
