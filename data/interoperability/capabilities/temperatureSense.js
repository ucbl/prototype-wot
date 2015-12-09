(function(module) {
	var calculateTemperature = function () {
//TODO: interact with environment to return a variable temperature value.
/*
            // Calculate the temperature checking the different interoperability (Just a test)
            var temperature = 0;
            temperature -= this.getValueFromObject('cooler-swirlwind-2443', 'value') * 1;
            temperature -= this.getValueFromObject('coolerheater-swirlwind-2665', 'valueDecreaser') * 1;
            temperature += this.getValueFromObject('coolerheater-swirlwind-2665', 'valueIncreaser') * 1;
            temperature += this.getValueFromObject('heater-tesco-2336', 'value') * 1;
            this.setValueToObject('sensor-ge-2442', 'temperature', temperature);
*/
            return {
                "value": 19.2,
                "type": "celsius"
            };
        }

    module.exports = {
        "get": function (values, params) {
			    values.temperature = calculateTemperature();
                return values.temperature;
        }
    };
})(module);