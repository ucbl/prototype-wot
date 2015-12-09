/**
 * Rather complex capability that handles a list of phone calls.
 * GET returns a given call of the entire list
 * PUT creates a new call
 * POST creates or modifies a call
 * DELETE removes a call from the list
 */
(function(module) {
    //List of passed calls
    var calls = [];

    module.exports = {
        //Returns a particular call if its id is provided, an array of references to all calls otherwise
        "get": function (values, params) {
            if(params["id"]) {
                values.status = calls[parseInt(params["id"])];
            } else {
                var results = [];
                for(var i in calls) {
                    results.push(this["@id"] + "?id=" + i);
                }
                values.status = {"calls": results};
            }
            return values.status;
        },
        //Modifies a call if its 'id' and 'call' are provided in args
        //Adds a new call to the list if only 'call' is given
        "post": function (values, params) {
            console.log(!isNaN(params.id));
            console.log(parseInt(params.id) >= 0);
            console.log(parseInt(params.id) < calls.length);
            if(params && params['id'] && params['call'] && !isNaN(params.id) && parseInt(params.id) >= 0 && parseInt(params.id) < calls.length) {
                calls[parseInt(params.id)] = params.call;
                console.log("Call " + params.id + " modified.");
                //Not an error
                throw 204;
            } else if(params && params['call']) {
                calls.push(params.call);
                return {"id": calls.length -1};
            } else {
                throw 400;
            }
        },
        //Creates a new call and adds it to the list
        "put": function (values, params) {
            if(!params) {
                throw 400;
            }
            var call = {};
            for (var i in params) {
                if (i == 'number') {
                    call.number = params.number;
                    call.start = new Date();
                } else if (i == 'end') {
                    call.end = params.end;
                } else {
                    //Unrecognized parameter
                    throw 400;
                }
            }
            if(call['number']) {
                calls.push(call);
                console.log("Added new call: " + JSON.stringify(call));
                //TODO: Should return "created" instead of a value
                return {"id": calls.length -1};
            }
            //Not an error (not modified)
            throw 304;
        },
        "delete": function (values, params) {
            if(params && params['id'] && !isNaN(params.id) && parseInt(params.id) >= 0 && parseInt(params.id) < calls.length) {
                calls.remove(params.id);
                //Not an error
                throw 204;
            }
            throw 400;
        }
    };
})(module);