(function(module) {

    module.exports = {
        "post": function (values, params) {
            //TODO: implement a different behavior if necessary
            return this.put(values, params);
        },
        "put": function (values, params) {
            if(!params) {
                return new Error(400);
            }
            var changed = false;
            for (var i in params) {
                if (i == 'speed') {
                    values.speed = params.speed;
                    changed = true;
                } else if (i == 'angle') {
                    values.angle = params.angle;
                    changed = true;
                } else if (i == 'strength') {
                    values.strength = params.strength;
                    changed = true;
                } else {
                    //Unrecognized parameter
                    return new Error(400);
                }
            }
            if(changed) {
                console.log("Changed motor values to: " + JSON.stringify(values));
                return values;
            }
            //Not really an error (not modified)
            return new Error(304);
        }
    };
})(module);