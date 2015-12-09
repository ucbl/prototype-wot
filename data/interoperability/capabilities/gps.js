(function(module) {
    var calculateCoordinates = function () {
        return {
            'latitude': 0.1234,
            'longitude': -0.5678
        };
    };

    module.exports = {
        "get": function (values, params) {
            var coords = calculateCoordinates();
            values.latitude =  coords.latitude;
            values.longitude =  coords.longitude;
            return values;
        }
    };
})(module);