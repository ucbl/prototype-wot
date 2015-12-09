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
            if(params['id']) {
                values.status = this.calls[params.id];
            } else {
                var results = [];
                for(var i in this.calls) {
                    results.push(this["@id"] + "?id=" + i);
                }
                values.status = {"calls": results};
            }
            return values.status;
        },
        //Modifies a call if its 'id' and 'call' are provided in args
        //Adds a new call to the list if only 'call' is given
        "post": function (values, params) {
            if(params & params['id'] && params['call'] && params.id >= 0 && params.id < this.calls.length) {
                this.calls[params.id] = params.call;
                console.log("Call " + params.id + " modified.");
                //Not an error
                throw new Error(204);
            } else if(params & params['call']) {
                this.calls.add(params.call);
                return this.calls.length -1;
            } else {
                throw new Error(400);
            }
        },
        //Creates a new call and adds it to the list
        "put": function (values, params) {
            if(!params) {
                return new Error(400);
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
                    return new Error(400);
                }
            }
            if(call['number']) {
                this.calls.add(call);
                console.log("Added new call: " + JSON.stringify(call));
                //TODO: Should return "created" instead of a value
                return this.calls.length -1;
            }
            //Not an error (not modified)
            return new Error(304);

        },
        "delete": function (values, params) {
            if(params && params['id'] && typeof(params) === 'number' && params.id >= 0 && params.id < this.calls.length) {
                this.calls.remove(params.id);
                //Not an error
                return new Error(204);
            }
            return new Error(400);
        }
    };
})(module);