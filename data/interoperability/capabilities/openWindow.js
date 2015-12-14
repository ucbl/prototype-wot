(function(module) {

    module.exports = {
        "post": function (values, params) {
            return this.put(values, params);
        },
        "put": function (values) {
            values = {
                "status": "open"
            };
            console.log("Opened window.");
            return {
                "@context": "__interoperability__context/WindowStatus",
                "WindowStatus": values
            };
        }
    };
})(module);