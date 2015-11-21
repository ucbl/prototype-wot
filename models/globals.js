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
        'base': 'http://asawoo.liris.cnrs.fr/',
        //Define all other URIs depending on the base one
        'setOtherUris': function () {
            this.nsType = this.rdf + 'type';
            this.hydraVocab = this.base + '/vocab#';
            this.nsName = this.base + 'name';
            this.nsDescription = this.base + 'description';
            this.capability = this.base + 'capability/';
            this.functionality = this.base + 'functionality/';
            this.isImplementedBy = this.base + 'isImplementedBy';
            this.isComposedOf = this.base + 'isComposedOf';
            this.linkVocab = '<' + this.hydraVocab + '>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"';
            exports.vocabularies = this;
        },
        //Define a mechanism for late binding of the base Hydra resources URIs to the server URI.
        'updateBaseUri': function (value) {
            this.base = value;
            this.setOtherUris();
            exports.baseUriUpdated = true;
        }
    };
    vocabularies.setOtherUris();
})(exports);
