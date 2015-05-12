var rp = require('request-promise');
var syncRequest = require('sync-request');

temperatureRegulation(execArguments);

function temperatureRegulation(execArguments) {
    var desiredTemperature = execArguments.desiredTemperature || 20;
    var temperatureSense = execArguments.functionalityTemperatureSense;
    var temperatureIncrease = execArguments.functionalityTemperatureIncrease;
    var temperatureDecrease = execArguments.functionalityTemperatureDecrease;
    // Check the temperature to cool or heat the place 
    rp(temperatureSense)
    .then(function(responseTemperatureSense){
        responseTemperatureSense = JSON.parse(responseTemperatureSense);
        if (responseTemperatureSense.response.value > desiredTemperature) {
            // Cool the place 
            var functionCool = function(initValueCooler) {
                var rpOptions = {uri : temperatureDecrease,
                                method : 'PUT',
                                form : {value: initValueCooler}};
                rp(rpOptions)
                .then(function(responseDecrease){
                    responseDecrease = JSON.parse(responseDecrease);
                    responseDecrease = responseDecrease.response.value;
                    // Check the temperature again 
                     rp(temperatureSense)
                    .then(function(responseTemperatureSense){
                        responseTemperatureSense = JSON.parse(responseTemperatureSense);
                        responseTemperatureSense = responseTemperatureSense.response.value;
                        if (responseTemperatureSense != desiredTemperature) {
                            functionCool(responseDecrease*1 + 1);
                        } else {
                            return false;
                        }
                    });
                });
            }
            functionCool(1);
        } else {            
            // Heat the place 
            var functionHeat = function(initValueHeater) {
                var rpOptions = {uri : temperatureIncrease,
                                method : 'PUT',
                                form : {value: initValueHeater}};
                rp(rpOptions)
                .then(function(responseIncrease){
                    responseIncrease = JSON.parse(responseIncrease);
                    responseIncrease = responseIncrease.response.value;
                    // Check the temperature again 
                     rp(temperatureSense)
                    .then(function(responseTemperatureSense){
                        responseTemperatureSense = JSON.parse(responseTemperatureSense);
                        responseTemperatureSense = responseTemperatureSense.response.value;
                        if (responseTemperatureSense != desiredTemperature) {
                            functionHeat(responseIncrease*1 + 1);
                        } else {
                            return false;
                        }
                    });
                });
            }
            functionHeat(1);
        }
    });
}