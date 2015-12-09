/**
 * Rather complex capability that handles a list of phone smss.
 * GET returns a given sms of the entire list
 * PUT creates a new sms
 * POST creates or modifies a sms
 * DELETE removes a sms from the list
 */
(function(module) {
    //List of passed smss
    var smss = [];

    module.exports = {
        //Returns a particular sms if its id is provided, an array of references to all smss otherwise
        "get": function (values, params) {
            if(params['id']) {
                values.status = smss[params.id];
            } else {
                var results = [];
                for(var i in smss) {
                    results.push(this["@id"] + "?id=" + i);
                }
                values.status = {"smss": results};
            }
            return values.status;
        },
        //Modifies a sms if its 'id' and 'sms' are provided in args
        //Adds a new sms to the list if only 'sms' is given
        "post": function (values, params) {
            if(params & params['id'] && params['sms'] && params.id >= 0 && params.id < smss.length) {
                smss[params.id] = params.sms;
                console.log("SMS " + params.id + " modified.");
                //Not an error
                throw new Error(204);
            } else if(params & params['sms']) {
                smss.add(params.sms);
                return smss.length -1;
            } else {
                throw new Error(400);
            }
        },
        //Creates a new sms and adds it to the list
        "put": function (values, params) {
            if(!params) {
                return new Error(400);
            }
            var sms = {};
            var ok = 0;
            for (var i in params) {
                if (i == 'number') {
                    sms.number = params.number;
                    sms.start = new Date();
                    ok++;
                } else if (i == 'content') {
                    sms.content = params.content;
                    ok++;
                } else {
                    //Unrecognized parameter
                    return new Error(400);
                }
            }
            if(ok == 2) {
                smss.add(sms);
                console.log("Added new sms: " + JSON.stringify(sms));
                //TODO: Should return "created" instead of a value
                return smss.length -1;
            }
            //Not an error (not modified)
            return new Error(304);

        },
        "delete": function (values, params) {
            if(params && params['id'] && typeof(params) === 'number' && params.id >= 0 && params.id < smss.length) {
                smss.remove(params.id);
                //Not an error
                return new Error(204);
            }
            return new Error(400);
        }
    };
})(module);