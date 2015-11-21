var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    Globals = require('./models/globals');

//Templating engine
app.set('views', __dirname + '/views');
app.engine('jade', require('jade').__express);
app.set('view engine', 'jade');

//CORS configuration
app.use(function(request, response, next) {
    if(request.get('Origin')) {
        response.header("Access-Control-Allow-Origin", "*");
        response.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
        response.header("Access-Control-Allow-Headers", "X-Requested-With");
    }
    next();
});

//Static content
app.use(express.static(__dirname + '/public'));

//Generated content
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(require('./controllers'));

app.listen(Globals.config.port, function() {
  console.log('Listening on port ' + Globals.config.port)
});