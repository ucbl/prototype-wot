/**
 * Created by Lionel on 23/11/2015.
 */

(function(module) {
    var fs = require('fs'),
        Globals = require('../models/globals'),
        objectModel = require('../models/object');

    module.exports = {
        //TODO: this is a first try. Use Hydra description & code repo to achieve that.
        //Unused yet...
        'get': function(capabilityId) {
            var result = {"@id": capabilityId};
            switch (capability) {
                case 'gps':
                    result['@context'] = Globals.vocabularies.base + '/context/Position';
                    result['@type'] = 'vocab:Position';
                    result.latitude = objectModel.getValueFromObject(nameObject, 'latitude');
                    result.longitude = objectModel.getValueFromObject(nameObject, 'longitude');
                    break;
                case 'temperatureSense':
                    result['@context'] = hostServerPort + '/context/Temperature';
                    result['@type'] = 'vocab:Temperature';
                    result.value = this.calculateTemperature();
                    result.type = objectModel.getValueFromObject(nameObject, 'type');
                    break;
                case 'informationMotor':
                    result['@context'] = hostServerPort + '/context/MotorValue';
                    result['@type'] = 'vocab:MotorValue';
                    result.angle = objectModel.getValueFromObject(nameObject, 'angle');
                    result.speed = objectModel.getValueFromObject(nameObject, 'speed');
                    result.strength = objectModel.getValueFromObject(nameObject, 'strength');
                    break;
            }
            return result;
        },

        //TODO: move this to code-repository
        'calculateTemperature': function () {
            // Calculate the temperature checking the different interoperability (Just a test)
            var temperature = 0;
            temperature -= this.getValueFromObject('cooler-swirlwind-2443', 'value') * 1;
            temperature -= this.getValueFromObject('coolerheater-swirlwind-2665', 'valueDecreaser') * 1;
            temperature += this.getValueFromObject('coolerheater-swirlwind-2665', 'valueIncreaser') * 1;
            temperature += this.getValueFromObject('heater-tesco-2336', 'value') * 1;
            this.setValueToObject('sensor-ge-2442', 'temperature', temperature);
            return temperature;
        }
    };
})(module);