'use strict';

//Node Modules
const request = require('request'),
    fs = require('fs');

//Infrastructure Modules
const Globals = require('../globals'),
    Directory = require('./functionalityDirectory.js');
var functionalityDirectory = new Directory();

//const helper = require('../helper/global.js');
const Avatar = require('../../avatar/p1201336-js-avatar'),
    AvatarInfo = require('./avatarInfo');

class InfrastructureController {
    constructor() {
      	//console.log('call InfrastructureController constructor!');
      	this.deviceList = new Set();
      	//this.avatarList = new Map();
        this.avatars = new Map();
        this.portArray = [];
    }

    getUpdate() {
        //
        var interopPlatformUrl = 'http://localhost:3000/interoperability/' /*Globals.vocabularies.interoperability*/ + "connected-devices",
            promises = [];
    	//var deviceList = this.deviceList;
        //console.log("Call getUpdate on " + interopPlatformUrl);

        return new Promise((resolve, reject) => {
            request({
                "url": interopPlatformUrl,
                "headers": {"Accept": "application/ld+json"}
            }, (error, response, body) => {
                //data && console.log(data);
                if(!error && response.statusCode == 200) {
                    var jsonDevices = JSON.parse(body)['connectedDevices'];
                    if(jsonDevices) {
                        for (let device of jsonDevices) {
                            if (this.deviceList.has(device) == true) {
                                console.log("Device exists: " + device);
                                //TODO send an HTTP request to tell the avatar to update its capabilities
                                //var avatarUri = this.avatars.get(device).uri;
                            } else {
                                //Add new device
                                //console.log("Adding device " + device);
                                this.deviceList.add(device);
                                //Create new avatar
                                var avatarInfo = new AvatarInfo(device.replace(Globals.vocabularies.interoperability + "devices", ""), device, this.getAvailablePort(), device.replace(Globals.vocabularies.interoperability + "devices", Globals.vocabularies.asawoo + "avatars"))
                                promises.push(Avatar.buildAvatar(avatarInfo).then((avatar) => {
                                     console.log("Build avatar returned " + avatar);
                                    //Store a JSON serialization of the avatar (not the object itself)
                                    this.avatars.set(device, avatar);
                                }).catch((error) => {
                                    console.error(error);
                                }));
                            }
                        }
                    }
                    this.showDeviceList();
                    resolve(Promise.all(promises));
                } else {
                    console.error("Error loading connected devices list from " + interopPlatformUrl);
                    reject();
                }
            });
        });
    }

    showDeviceList() {
    	console.log("\n\nConnected device list:");
		for (let key of this.deviceList.values()) 
		    console.log("Device: " + key);
    }

    //returns a free port between 4000 and 5000
    getAvailablePort() {
        var port = Math.floor(Math.random() * (5000 - 4000 + 1)) + 4000;
        while(this.portArray.indexOf(port)>0){
            port = Math.floor(Math.random() * (5000 - 4000 + 1)) + 4000;
        }
        console.log("port :"+port);
        this.portArray.push(port);
        return port;  
    }
}
module.exports = InfrastructureController;