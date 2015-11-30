(function(module) {

    module.exports = {
        "get": function (object) {
            responseJson.latitude = object.getValue('latitude');
            responseJson.longitude = object.getValue('longitude');
        },
        "post": function (values, params) {
        },
        "put": function (values, params) {
        },
        "delete": function (values, params) {
        }
    };
})(module);