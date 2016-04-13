(function(module) {
    var calculateCoordinates = function () {
        return {
            'latitude': 0.1234,
            'longitude': -0.5678
        };
    };

    module.exports = {
        "get": function (values, params) {
            var position = calculateCoordinates();
            values.latitude =  position.latitude;
            values.longitude =  position.longitude;
            return {
                "@context": "__interoperability__context/Position",
                "position": position
            };
        }
    };
})(module);