(function(module) {

    module.exports = {
        "get": function (values, params) {
            if(params[name]) {
                return values[params.name];
            }
            throw new Error("Not Found");
        },
        "post": function (values, params) {
        },
        "put": function (values, params) {
        },
        "delete": function (values, params) {
        }
    };
})(module);