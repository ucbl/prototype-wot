/**
 * Capability that handles a list of apps and takes apps.
 * GET returns the status of a given app or the entire list
 * PUT creates a new app
 * POST creates or modifies a app
 * DELETE removes a app from the list
 */
(function(module) {
    //List of apps taken
    var apps = {};

    module.exports = {
        //Returns a particular app if its name is provided, an array of references to all apps otherwise
        "get": function (values, params) {
            if(params['name']) {
                values.status = apps[params.name];
            } else {
                var results = [];
                for(var i in apps) {
                    results.push(this["@id"] + "?name=" + i);
                }
                values.status = {"apps": results};
            }
            return values.status;
        },
        //Modifies a app if its 'id' and 'app' are provided in args
        //Adds a new app to the list if only 'app' is given
        "post": function (values, params) {
            if(params && params['name'] && params['status']) {
                apps[params.name] = params.status;
                console.log("App " + params.name + " modified.");
                //Not an error
                throw new Error(204);
            } else if(params & params['app'] && params.app['name']) {
                apps[params.app['name']] = params.app;
                return apps.length -1;
            } else {
                throw new Error(400);
            }
        },
        //Creates a new app and adds it to the list
        //status should be started, stopped, etc.
        "put": function (values, params) {
            if(!params) {
                return new Error(400);
            }
            if(params['name'] && params['status']) {
                apps[params.name] = params.status;
                console.log("Added new app: " + JSON.stringify(apps[params.name]));
                //TODO: Should return "created" instead of a value
                return apps[params['name']];
            } else {
                //Unrecognized parameter
                return new Error(400);
            }
        },
        "delete": function (values, params) {
            if(params && params['name']) {
                apps.remove(params.name);
                //Not an error
                return new Error(204);
            }
            return new Error(400);
        }
    };
})(module);