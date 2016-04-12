'use strict';

//Node Modules
const request = require('request'),
    fs = require('fs');

//Infrastructure Modules
const Globals = require('../globals'),
    Directory = require('./functionalityDirectory.js');
var functionalityDirectory = new Directory();

//const helper = require('../helper/global.js');
const Avatar = require('../../../../avatar/p1201336-js-avatar');

class InfrastructureController {
    constructor() {
      	//console.log('call InfrastructureController constructor!');
      	this.deviceList = new Set();
      	//this.avatarList = new Map();
        this.avatars = new Map();
        this.portArray = [];
    }

    getUpdate() {
        var interopPlatformUrl = Globals.vocabularies.interoperability + "connected-devices";
    	//var deviceList = this.deviceList;
        //console.log("Call getUpdate on " + interopPlatformUrl);

        request({
            "url": interopPlatformUrl,
            "headers": {"Accept": "application/ld+json"}
        }, (error, response, body) => {
            //data && console.log(data);
            if(!error && response.statusCode == 200) {
                var jsonDevices = JSON.parse(body)['connectedDevices'];
                /*
                 {
                 "@context":"http://192.168.56.102:3000/interoperability/context/ConnectedDeviceRefs",
                 "@type":"vocab:ConnectedDeviceRefs",
                 "@id":"http://192.168.56.102:3000/interoperability/connected-devices",
                 "connectedDevices":["http://192.168.56.102:3000/interoperability/devices/sensor-ge-2442"]}

                 */
                if(jsonDevices) {
                    jsonDevices.forEach((device) => {
                        if (this.deviceList.has(device) == true) {
                            console.log("Device exists " + device);
                            var avatarUri = this.avatars.get(device).uri;
                            //TODO send an HTTP request to tell the avatar to update its capabilities
                        } else {
                            //Add new device
                            console.log("Adding device " + device);
                            this.deviceList.add(device);

                            //Create new avatar
                            var avatar = Avatar.buildAvatar({
                                name: device,
                                http_port: this.getAvailablePort()
                            });
                            //Stores a JSON serialization of the avatar (not the object itself)
                            this.avatars.put(device, avatar);

                            //io.emit('avatars_updated', this.avatars);
                            //self.avatarList.add(device["@id"],avatar);
                        }
                    });
                }
                this.showDeviceList();
            } else {
                console.error("Error loading connected devices list from " + interopPlatformUrl);
            }
        });
    }

/*
    updateDevice(device, capabilityList) {
    	console.log("Update device "+ device);
        //TODO
    	var avatar = this.avatarList.get(device);
    	//avatar.updateDevice(capabilityList);
        //io.emit('functionalities_updated', directories.functionality);
    	//return avatar;
    }
*/

    showDeviceList() {
    	//console.log("Call showDeviceList");
		for (let key of this.deviceList.values()) 
		    console.log("Device[" + key + "]: " + this.deviceList[key]);
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