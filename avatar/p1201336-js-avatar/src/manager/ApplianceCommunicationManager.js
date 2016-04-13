/**
 * Created by jordan on 26/01/2016
 */

'use strict';

/**
 * This class is the bridge between the device (accessed through the interoperability platform)
 * and the avatar.
 */
class ApplianceCommunicationManager {

    constructor() {
        this.deviceUri = null;
		this.wsclient = null;
    }

    /**
     * Initialisation of the manager
     */
    init(deviceUri, wsclient) {
        this.deviceUri = deviceUri;
		this.wsclient = wsclient;
        return this;
    }

	/**
	 * Get the device description from the interoperability platform
	 */
	getCapabilityList() {
		return this.wsclient.sendHttpRequest({"url": this.deviceUri}).then((deviceDescription) => {
			console.log("getCapabilityList: " + deviceDescription);
			return JSON.parse(deviceDescription)["capabilities"];
		}).catch((error) => {
			throw error;
		});
	}

    /**
     * Get full Hydra description of a given capability
     */
    getCapabilityDescription(capability) {
 		return this.wsclient.sendHttpRequest({"url": capability}).then((capabilityDescription) => {
			console.log("getCapabilityDescription: " + capabilityDescription);
			return capabilityDescription;
		}).catch((error) => {
			throw error;
		});
    }

    /**
     * Invoke a capability
     *
     * @param args
     */
    invokeCapability(args) {
        throw 'invokeCapability(): not implemented yet';
    }

    /**
     * Get a contextual value of a device
     *
     * @param args
     */
    getContextValue(args) {
        throw 'getContextValue(): not implemented yet';
    }
}

module.exports = ApplianceCommunicationManager;
