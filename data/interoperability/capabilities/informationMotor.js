(function(module) {
    module.exports = {
        "get": function (values) {
            return {
                "@context": "__interoperability__context/MotorValue",
                "WindowStatus": values
            };
        }
    };
})(module);