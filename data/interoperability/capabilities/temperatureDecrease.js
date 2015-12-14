(function(module) {
    module.exports = {
        //Returns the current state of the actuator
        "get": function (values) {
            //Init
            if(!values.state) {
                values.state = "0";
            }
            return values.state;
        },
        //Used to pass a state to the actuator
        "post": function (values, params) {
            if(params && typeof(params) === "number" && parseInt(params) >= 0) {
                values.state = parseInt(params);
                return values.state;
            }
            throw 400;
        }
    };
})(module);