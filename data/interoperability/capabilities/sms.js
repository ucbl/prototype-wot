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
            if(params["id"]) {
                values.status = smss[parseInt(params["id"])];
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
            if(params && params['id'] && params['sms'] && !isNaN(params.id) && parseInt(params.id) >= 0 && parseInt(params.id) < smss.length) {
                smss[parseInt(params.id)] = params.sms;
                console.log("SMS " + params.id + " modified.");
                //Not an error
                throw 204;
            } else if(params && params['sms']) {
                smss.push(params.sms);
                return {"id": smss.length -1};
            } else {
                throw 400;
            }
        },
        //Creates a new sms and adds it to the list
        "put": function (values, params) {
            if(!params) {
                throw 400;
            }
            var sms = {};
            var ok = 0;
            for (var i in params) {
                if (i == 'number') {
                    sms.number = params.number;
                    sms.sent = new Date();
                    ok++;
                } else if (i == 'content') {
                    sms.content = params.end;
                    ok++;
                }
            }
            if(ok == 2) {
                smss.push(sms);
                console.log("Added new sms: " + JSON.stringify(sms));
                //TODO: Should return "created" instead of a value
                return {"id": smss.length -1};
            }
            //Not an error (not modified)
            throw 304;
        },
        //Nullify the content of a sms (instead of removing it)
        "delete": function (values, params) {
            if(params && params['id'] && !isNaN(params.id) && parseInt(params.id) >= 0 && parseInt(params.id) < smss.length) {
                smss[params.id] = null;
                //Not an error
                throw 204;
            }
            throw 400;
        }
    };
})(module);