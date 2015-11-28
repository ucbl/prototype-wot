var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    sassMiddleware = require('node-sass-middleware'),
    Globals = require('./models/globals'),
    interoperabilityModel = require('./models/interoperability'),
    ontologyModel = require('./models/ontology');

/**
 *  Templating engine
 */
app.set('views', __dirname + '/views');
app.engine('jade', require('jade').__express);
app.set('view engine', 'jade');

/**
 * Middleware functions
 */
//Late initialization function - put here all that requires to know the server URI
app.all('*', function(req, res, next) {
    if(!Globals.baseUriUpdated) {
        //Set up the server URI in the global variables
        Globals.vocabularies.updateBaseUri('http://' + req.hostname + (Globals.config.port !== 80?(':' + Globals.config.port):'') + '/');

        //Initiate the object discovery and construct their URIs
        ontologyModel.loadOntology({verbose: false});
        interoperabilityModel.loadObjects({verbose: false});
    }
    next();
});

//Add CORS headers
app.use(require('./middleware/corsHeaders'));

//Add Vary header
app.use(require('./middleware/varyHeader'));

//Generate CSS from SASS
app.use('/css/stylesheets', sassMiddleware({
    src: __dirname + '/public/interoperability-public/css/sass',
    dest: __dirname + '/public/css/stylesheets',
    debug: true,
    outputStyle: 'expanded',
    error: function() {console.log("SASS Error.");}
}));

/**
 * Serve content
 */
//Static content
app.use(express.static(__dirname + '/public'));

//Generated content
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(require('./controllers'));

/**
 * Start server
 */
app.listen(Globals.config.port, function() {
  console.log('Listening on port ' + Globals.config.port)
});