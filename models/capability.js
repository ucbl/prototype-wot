/**
 * Created by Lionel on 23/11/2015.
 * Convenience functions that handle HTTP requests and send them to appropriate capability methods.
 * If the methods are not implemented in a capability, this means that this capability is unable to fulfill the method.
 * It then returns a 405 (method not allowed) code.
 */

(function(module) {
    var fs = require('fs'),
        Globals = require('../models/globals'),
        objectModel = require('./device');

    module.exports = {
        'get': function(values, args) {
            if (this['calculateValues']) {
                return this.calculateValues(values, args);
            }
            return new Error(405);
        },
        'post': function(values, args) {
            if (this['handleValues']) {
                return this.handleValues(values, args);
            }
            return new Error(405);
        },
        'put': function(values, args) {
            if (this['createOrUpdateValues']) {
                return this.createOrUpdateValues(values, args);
            }
            return new Error(405);
        },
        'delete': function(values, args) {
            if (this['removeValues']) {
                return this.removeValues(values, args);
            }
            return new Error(405);
        }
    };
})(module);