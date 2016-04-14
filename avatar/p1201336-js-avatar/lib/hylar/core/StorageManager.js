/**
 * Created by pc on 20/11/2015.
 */

var ParsingInterface = require('./ParsingInterface');
var Prefixes = require('./Prefixes');

var rdfstore = new require('../rdfstore/src/store');
var q = require('q');

/**
 * Interface used for triple storage.
 * Relies on antonio garrote's rdfstore.js
 */

function StorageManager() {
    //
}

    /**
     * Initializes the triplestore.
     * Register owl, rdfs and rdfs prefixes.
     * @returns {*}
     */
StorageManager.prototype.init = function() {
    var deferred = q.defer(),
        that = this;
    rdfstore.create(function(err, store) {
        if(err) {
            deferred.reject(err);
        } else {
            that.storage = store;
            that.storage.setPrefix('owl', Prefixes.OWL);
            that.storage.setPrefix('rdf', Prefixes.RDF);
            that.storage.setPrefix('rdfs', Prefixes.RDFS);
            deferred.resolve();
        }
    });
    return deferred.promise;
};

    /**
     * Suitable function to load rdf/xml ontologies
     * using rdf-ext parser.
     * @param data
     * @returns {*|Promise}
     */
StorageManager.prototype.loadRdfXml = function(data) {
        var that = this;

        return ParsingInterface.rdfXmlToTurtle(data)
        .then(function(ttl) {
            return that.load(ttl, 'text/turtle');
        }, function(error) {
            console.error(error);
            throw error;
        })
};

/**
 * Launches a query against the triplestore.
 * @param query
 * @returns {*}
 */
StorageManager.prototype.query = function(query) {
    var deferred = q.defer();

    this.storage.execute(query, function (err, r) {
        if(err) {
            deferred.reject(err);
        } else {
            deferred.resolve(r);
        }
    });
    return deferred.promise;
};

/**
 * Loads an ontology in the store.
 * @param data Raw ontology (str)
 * @param format Ontology mimetype
 * @returns {*}
 */
StorageManager.prototype.load = function(data, format) {
    var deferred = q.defer();

    this.storage.load(format, data, function (err, r) {
        console.notify(r + ' triples loaded.');
        if(err) {
            deferred.reject(err);
        } else {
            deferred.resolve(r);
        }
    });
    return deferred.promise;
};

/**
 * Empties the entire store.
 * @returns {*}
 */
StorageManager.prototype.clear = function()  {
    return this.query('DELETE { ?a ?b ?c } WHERE { ?a ?b ?c }');
};

/**
 * Launches an insert query against
 * the triplestore.
 * @param ttl Triples to insert, in turtle.
 * @returns {*}
 */
StorageManager.prototype.insert = function(ttl) {
    return this.query('INSERT DATA { ' + ttl + ' }');
};

/**
 * Launches a delete query against
 * the triplestore.
 * @param ttl Triples to insert, in turtle.
 * @returns {*}
 */
StorageManager.prototype.delete = function(ttl) {
    return this.query('DELETE DATA { ' + ttl + ' }');
};

/**
 * Returns the content of the store,
 * for export purposes.
 * @returns {*}
 */
StorageManager.prototype.getContent = function() {
    return this.query('CONSTRUCT { ?a ?b ?c } WHERE { ?a ?b ?c }');
};

/**
 * Loads content in the store,
 * for import purposes.
 * @param ttl Triples to import, in turtle.
 * @returns {*|Promise}
 */
StorageManager.prototype.createStoreWith = function(ttl) {
    return this.clear().then(function() {
        return this.insert(ttl)
    });
};

module.exports = StorageManager;