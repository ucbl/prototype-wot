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
      	this.avatarList = new Map();
        this.avatars_serialized = [];
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
                    jsonDevices.forEach((obj, key) => {
                        if (this.deviceList.has(obj.id) == true) {
                            console.log("Device exists " + obj.id);
                            this.updateDevice(obj.id,obj.capabilities)
                        } else {
                            //new device
                            this.deviceList.add(obj.id);
                            console.log("Adding device " + obj.id);
                            //console.log(obj.capabilities);
                            //TODO
                            //create new avatar
                            var avatar = Avatar.buildAvatar(obj.capabilities, {
                                name: obj.id,
                                http_port: this.getAvailablePort()
                            });
                            this.avatars_serialized.push(avatar.toJson());
                            //io.emit('avatars_updated', this.avatars_serialized);
                            //self.avatarList.add(obj.id,avatar);
                        }
                    });
                }
                this.showDeviceList();
            } else {
                console.error("Error loading connected devices list from " + interopPlatformUrl);
            }
        });
    }

    updateDevice(device, capabilityList) {
    	console.log("Update device "+ device);
        //TODO
    	var avatar = this.avatarList.get(device);
    	//avatar.updateDevice(capabilityList);
        //io.emit('functionalities_updated', directories.functionality);
    	//return avatar;
    }

    showDeviceList() {
    	//console.log("Call showDeviceList");
		for (let key of this.deviceList.values()) 
		    console.log("Device[" + key + "]: " + this.deviceList[key]);
    }

    getDeviceList ()    { return this.deviceList;}

    getAvatarList ()    { return this.avatarList;}

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