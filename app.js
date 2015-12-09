var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    sassMiddleware = require('node-sass-middleware'),
    Globals = require('./models/globals');

/**
 *  Templating engine
 */
app.set('views', __dirname + '/views');
app.engine('jade', require('jade').__express);
app.set('view engine', 'jade');

/**
 * Middleware functions
 */
//Late initialization of global variables
app.all('*', require('./middleware/initVariables'));

//Add CORS headers
app.use(require('./middleware/corsHeaders'));

//Add Vary header
app.use(require('./middleware/varyHeader'));

//Generate CSS from SASS
app.use('/css/stylesheets', sassMiddleware({
    src: __dirname + '/css-preprocessing/sass',
    dest: __dirname + '/public/css/stylesheets',
    debug: false,
    outputStyle: 'expanded'
}));

/**
 * Serve content
 */
//Static content
app.use(express.static(__dirname + '/public'));

//Generated content
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended: true}));
app.use(require('./controllers'));

/**
 * Start server
 */
app.listen(Globals.config.port, function() {
  console.log('Listening on port ' + Globals.config.port)
});