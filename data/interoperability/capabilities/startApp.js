(function(module) {
    var app = {
        name: null,
        status: null
    };

    module.exports = {
        "get": function (values, params) {
            if(params[name]) {
                return values[params.name];
            }
            throw new Error("Not Found");
        },
        "post": function (values, params) {
            //TODO: see if something else should be done
            this.put(values, params);
        },
        "put": function (values, params) {

        }
    };
})(module);