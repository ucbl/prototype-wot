/**
 * Rather complex capability that handles a list of phone apps.
 * GET returns a given app of the entire list
 * PUT creates a new app
 * POST creates or modifies a app
 * DELETE removes a app from the list
 */
(function(module) {
    //List of passed apps
    var apps = [];

    module.exports = {
        //Returns a particular app if its id is provided, an array of references to all apps otherwise
        "get": function (values, params) {
            if(params["id"]) {
                values.status = apps[parseInt(params["id"])];
            } else {
                var results = [];
                for(var i in apps) {
                    results.push(this["@id"] + "?id=" + i);
                }
                values.status = {"apps": results};
            }
            return values.status;
        },
        //Modifies a app if its 'id' and 'app' are provided in args
        //Adds a new app to the list if only 'app' is given
        "post": function (values, params) {
            if(params && params['id'] && params['app'] && !isNaN(params.id) && parseInt(params.id) >= 0 && parseInt(params.id) < apps.length) {
                apps[parseInt(params.id)] = params.app;
                console.log("App " + params.id + " modified.");
                //Not an error
                throw 204;
            } else if(params && params['app']) {
                apps.push(params.app);
                return {"id": apps.length -1};
            } else {
                throw 400;
            }
        },
        //Creates a new app and adds it to the list
        //status should be started, stopped, etc.
        "put": function (values, params) {
            if(!params) {
                throw 400;
            }
            if(params['name'] && params['status']) {
                apps[params.name] = params.status;
                console.log("Added new app: " + JSON.stringify(apps[params.name]));
                //TODO: Should return "created" instead of a value
                return apps[params['name']];
            }
        },
        //Nullify the content of a app (instead of removing it)
        "delete": function (values, params) {
            if(params && params['id'] && !isNaN(params.id) && parseInt(params.id) >= 0 && parseInt(params.id) < apps.length) {
                apps[params.id] = null;
                //Not an error
                throw 204;
            }
            throw 400;
        }
    };
})(module);