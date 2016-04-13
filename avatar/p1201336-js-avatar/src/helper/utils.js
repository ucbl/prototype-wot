'use strict';

const os = require('os');

module.exports = {

    getLocalIp: () => {

        let local_ip = null;
        let interfaces = os.networkInterfaces();

        // Pick up the first IPv4 (which is not loopback)
        for (let name in interfaces) {
            for (let addr of interfaces[name]) {
                if (!addr.internal && addr.family == 'IPv4') {
                    local_ip = addr.address;
                }
            }
        }

        // If no IPv4 founded, pick loopback
        if (!local_ip) {
            local_ip = '127.0.0.1';
            //throw 'The local IP can\'t be determined';
        }

        return local_ip;
    }
};