'use strict';

//Node Modules
const request = require('request'),
    fs = require('fs');

//Infrastructure Modules
const Globals = require('../globals'),
    Directory = require('./functionalityDirectory.js');
var functionalityDirectory = new Directory();

const helper = require('../helper/global.js');
const Avatar = require('../../js-avatar');

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
        console.log("Call getUpdate on " + interopPlatformUrl);

        request({
            "url": interopPlatformUrl,
            "headers": {"Accept": "application/json"}
        }, function(data){
            //data && console.log(data);
            if(data) {
                var jsonDevices = JSON.parse(data)['devices'];
                if(jsonDevices) {
                    jsonDevices.forEach((obj, key) => {
                        if (this.deviceList.has(obj.id) == true) {
                            //console.log("obj exist "+obj.id);
                            this.updateDevice(obj.id,obj.capabilities)
                        } else {
                            //new device
                            this.deviceList.add(obj.id);
                            console.log("Adding device "+obj.id);
                            //console.log(obj.capabilities);
                            //TODO
                            //create new avatar
                            var avatar = Avatar.buildAvatar(obj.capabilities, {
                                name: obj.id,
                                http_port: this.getNewPortAvatar()
                            });
                            this.avatars_serialized.push(avatar.toJson());
                            io.emit('avatars_updated', this.avatars_serialized);
                            //self.avatarList.add(obj.id,avatar);
                        }
                    });
                }
                this.showDeviceList();
            } else {
                console.log("No Response from CIMA");
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
    	console.log("===>deviceList");
		for (let key of this.deviceList.values()) 
		    console.log(key);
    }

    getDeviceList ()    { return this.deviceList;}

    getAvatarList ()    { return this.avatarList;}

    //returns a free port between 4000 and 5000
    getNewPortAvatar() {
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