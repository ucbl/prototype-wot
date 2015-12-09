(function(module) {

    module.exports = {
        "post": function (values, params) {
            return this.put(values, params);
        },
        "put": function (values) {
            values = {
                "status": "closed"
            };
            console.log("Closed window.");
            return values;
        }
    };
})(module);